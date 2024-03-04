import os, io, glob, pathlib, hashlib
import textwrap, magic, pptx, PyPDF2, pytesseract

from PIL import Image
from bs4 import BeautifulSoup

from modules.ai.utils.vectorstore import create_collection

import modules.files.docx3txt as docx3txt

files_dir = pathlib.Path("./bin/jsoneler/files")

class NotSupportedFiletype(Exception):
    def __init__(self, message = "Type not currently supported. We are working on a fix in later versions."):
        super().__init__(message)

# TODO(Johan) kanske göra så text_and_image_text_from_file_bytes inte returnerar filetype
class Chunkerizer:
    

    def upload_chunks_from_file(filepath: str, course_name: str) -> str:
        filename = os.path.basename(filepath)
        with open(filepath, "rb") as f:
            return Chunkerizer.upload_chunks_from_file_bytes(f.read(), filename, course_name)

    def upload_chunks_from_file_bytes(buf: bytes, filename: str, course_name: str) -> str:

        result = Chunkerizer.text_and_image_text_from_file_bytes(buf, False, filename)
        if result == None:
            return None
        (type, text, image_text) = result

        hash_in = hashlib.md5()
        hash_in.update(f"{text}".encode('UTF-8'))
        file_hash = hash_in.hexdigest()

        chunks = Chunkerizer.make_chunk(text, 512)

        collection = create_collection()

        ids: list[str] = []
        metadatas: list[dict] = []
        documents: list[str] = []

        for (i, data) in enumerate(chunks):
            print(f"Creating chunk {i}")
            doc_id = file_hash + str(i)
            ids.append(doc_id)
            doc = {
                "id":file_hash,
                "chunk-id": str(i),
                "filename": filename,
                "course": course_name,
                "text":data,
            }
            metadatas.append(doc)
            documents.append(data)

        print(len(ids))
        for i in range(0,len(ids)):
            print(ids[i])
            print(metadatas[i])
            print()

        print(f"Uploading {len(ids)} doc chunks")
        collection.upsert(ids, metadatas=metadatas,documents=documents)

        return file_hash
    def make_chunk(text: str = "This is a cool text", chunksize: int = 512) -> list[str]:
        output_text = []
        split_text = text.split()
        length = len(split_text)

        if length < chunksize:
            output_text = [" ".join(split_text)]
        else:
            for i in range(1,length//chunksize + 1):
                output_text.append(" ".join(split_text[(i-1)*chunksize:i*chunksize]))
            output_text.append(" ".join(split_text[i*chunksize:]))

        return output_text

    def text_and_image_text_from_file(filepath: str, image_txt_from_complex_types: bool) -> tuple[str, str, str] | None:
        filename = os.path.basename(filepath)
        with open(filepath, "rb") as f:
            return Chunkerizer.text_and_image_text_from_file_bytes(f.read(), image_txt_from_complex_types, filename)

    def text_and_image_text_from_file_bytes(buf: bytes, image_txt_from_complex_types: bool, filename: str = "") -> tuple[str, str, str] | None:        
        def parse_html(buf: bytes) -> str:
            soup = BeautifulSoup(buf, features="html.parser")
            return soup.get_text()



        def is_programming_lang(mime_type: str) -> bool:
            return mime_type == "text/x-c++" or mime_type == "text/x-python" or mime_type == "text/x-java"

        file_extenstion = filename[filename.rfind(".") + 1:] 


        extracted_text = ""
        extracted_image_text = ""
        try:
            mime_type = magic.from_buffer(buf[0:512], mime = True)
            #print(mime_type)
            filetype = mime_type[mime_type.find("/") + 1:]

            if mime_type.startswith("image"):
                img = Image.open(io.BytesIO(buf))
                extracted_text = pytesseract.image_to_string(img)
                extracted_image_text = extracted_text
            elif mime_type == "application/json":
                mime_type = "text/plain" 

            elif mime_type == "application/pdf": 

                io_buf = io.BytesIO(buf)
                pdf = PyPDF2.PdfReader(io_buf)
                
                image_list = []

                for page in pdf.pages:
                    extracted_text += page.extract_text()
                    if image_txt_from_complex_types:
                        for img in page.images:
                            if img not in image_list:
                                image_list.append(img)

                if image_txt_from_complex_types:
                    for img_obj in image_list:
                        io_buf = io.BytesIO(img_obj.data)
                        img = Image.open(io_buf)
                        extracted_image_text += pytesseract.image_to_string(img)
                
            elif mime_type == "application/x-empty":
                pass
            elif is_programming_lang(mime_type):
                extracted_text = bytes.decode(buf, "utf-8", errors = "ignore")
            elif mime_type == "text/plain":
                if file_extenstion == "html":
                    extracted_text = parse_html(buf)
                    filetype = "html"
                elif file_extenstion == "json":
                    extracted_text = bytes.decode(buf, "utf-8", errors = "ignore")
                    filetype = "json"
                elif file_extenstion == "jsonl":
                    extracted_text = bytes.decode(buf, "utf-8", errors = "ignore")
                    filetype = "jsonl"
                else:
                    extracted_text = bytes.decode(buf, "utf-8", errors = "ignore")
            elif mime_type == "text/html":
                extracted_text = parse_html(buf)
            elif mime_type == "text/xml":
                soup = BeautifulSoup(buf, 'xml')
                extracted_text = soup.get_text()
            elif mime_type == "application/zip" or mime_type == "application/vnd.openxmlformats-officedocument.presentationml.presentation":
                if file_extenstion == "zip":
                    # TODO(Johan) support zip correctly
                    raise NotSupportedFiletype

                filetype = "ppt"

                io_buf = io.BytesIO(buf)
                powerpoint = pptx.Presentation(io_buf)

                for slide in powerpoint.slides:
                    for shape in slide.shapes:
                        if hasattr(shape, "text"):
                            extracted_text = extracted_text + " " + shape.text
                        elif(image_txt_from_complex_types and hasattr(shape, "image")):
                            io_buf = io.BytesIO(shape.image.blob)
                            img = Image.open(io_buf)
                            if img.format == "WMF" or img.format == "EMF":
                                continue
                            extracted_image_text += pytesseract.image_to_string(img)
                            img.close()
            elif mime_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                filetype = "docx"
                io_buf = io.BytesIO(buf)
                (extracted_text, extracted_image_text) = docx3txt.process(io_buf)
            else:
                raise NotSupportedFiletype

                    
            return filetype, extracted_text, extracted_image_text
            
        except Exception as error:
            print(type(error).__name__, "-", error)
            return None
        
    def text_extraction_test():
        #path_list = ["./backend/tests\sample_files\courses\D7032E\evolutionCards.json"]
        #path_list = ["./backend/tests/sample_files/Test_txt/t.txt"]
        path_list = glob.glob("./backend/tests/**/*.*", recursive = True)
        try:
            for path in path_list: 
                print(f"###### testing {path}")
                Chunkerizer.text_and_image_text_from_file(path, True)
        except Exception as error:
            pass
        