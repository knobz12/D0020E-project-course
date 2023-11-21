import textwrap
import magic
from file_reader.PdfReader import PDFToText
from file_reader.PptxReader import PPTXToText
from file_reader.DocxReader import DocxToText
from file_reader.HtmlReader import HtmlToText



class NotSupportedFiletype(Exception):
    def __init__(self, message = "Type not currently supported. We are working on a fix in later versions."):
        super().__init__(message)


class chunkerizer():
    def __init__(self):
        self.PDFReader = PDFToText()
        self.PPTXReader = PPTXToText()
        self.htmlReader = HtmlToText()
    def make_chunk(self, text: str, chunk_size: int) -> list[str]:
        return textwrap.wrap(text, chunk_size)

    def check_mimetype_convert_to_text(self, input_file: str):
        input_file = input_file
        try:
            fileformat = magic.from_file(input_file, mime = True)
            match fileformat:
                case "image/png":
                    import pytesseract
                    from PIL import Image
                    filetype = "png"
                    image = Image.open(input_file)
                    extracted_text = pytesseract.image_to_string(image)
                case "":
                    filetype = "jpeg"

                case "application/pdf":
                    filetype = "pdf"
                    # extracted_text = self.PDFReader.ConvertToText(input_file)
                    extracted_text = self.PDFReader.ConvertToImage(input_file)

                case "text/plain":
                    filetype = "html"
                    extracted_text = self.htmlReader.ConvertToText(input_file)
                    
                    

                # TODO: Fix this
                case "application/zip" | "application/vnd.openxmlformats-officedocument.presentationml.presentation":
                    filetype = "ppt"
                    extracted_text = self.PPTXReader.ConvertToText(input_file)
                case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                    filetype = "docx"
                    instance = DocxToText(input_file)
                    instance = DocxToText(input_file)
                    extracted_text = instance.ConvertToText()
                    extracted_image_text = instance.ConvertImageToText()

                case _:
                    raise NotSupportedFiletype
                    
            return filetype, extracted_text
            
        except Exception as error:
            print(type(error).__name__, "-", error)
            return None
        
        

import os
import pathlib
import sys

files_dir = pathlib.Path("./bin/jsoneler/files")

def get_course_codes() -> list[str]:
    # path = files_folder.resolve()
    dirs = os.listdir(files_dir.resolve())
    folders: list[str] = []
    for folder in dirs:
        folders.append(folder)
    return folders

def get_course_files(code: str) -> list[str]:
    code_dir = pathlib.Path(files_dir, code)
    files = os.listdir(code_dir)
    return files

def get_file_hash(text: str) -> str:
    from hash_and_json.HashFunction import TextToHash
    (hash, _) =  TextToHash().ConvertToHash(text)
    return hash

def create_json_chunks(filehash: str, text_chunks: list[str], course: str) -> list[str]:
    import json
    jsons: list[str] = []
    for (idx, chunk) in enumerate(text_chunks):
        if len(chunk) < 64:
            continue
        obj = {
            "id":filehash,
            "chunk-id":idx,
            "course": course,
            "text": chunk,
        }
        result = json.dumps(obj,indent=0).replace("\n","")
        jsons.append(result)
    return jsons

def create_jsonls():
    courses = get_course_codes()
    print("Courses:",courses)
    jsonls: list[str] = []

    for course in courses[0:1]:
        code_dir = pathlib.Path(files_dir, course)
        files = get_course_files(course)
        # for file in files:
        for file in files:
            c = chunkerizer()
            filepath = pathlib.Path(code_dir, file).resolve()
            print(filepath)
            result = c.check_mimetype_convert_to_text(str(filepath))

            if result == None:
                continue

            (_, text) = result

            chunks = c.make_chunk(text, 512)
            file_hash = get_file_hash(text)

            if file_hash == None:
                continue

            jsonl = create_json_chunks(file_hash, chunks, course)
            jsonls.extend(jsonl)
    return jsonls

if __name__ == "__main__":
    jsonls = create_jsonls()
    result_text = ""
    for jsonl in jsonls:
        result_text += jsonl + "\n"

    with open(pathlib.Path("./result.jsonl"), "w") as f:
        f.write(result_text)
    
    f.close()

    # c = chunkerizer()
    # x = c.check_mimetype_convert_to_text("./tests/sample_files/Test_ppts/D0020E_Sustainability.pptx")
    # x = c.check_mimetype_convert_to_text("tests\sample_files\Test_htmls\Architectural Design Patterns.html")
    # if x is not None:
    #     print(x[0],x[1])