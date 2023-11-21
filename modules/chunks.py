import textwrap
import magic
from file_reader.PDFReader import PDFToText
from file_reader.PPTXReader import PPTXToText
from file_reader.DocxReader import DocxReaderInstance
from file_reader.htmlReader import htmlReaderInstance


class NotSupportedFiletype(Exception):
    def __init__(self, message = "Type not currently supported. We are working on a fix in later versions."):
        super().__init__(message)


class chunkerizer():
    def __init__(self):
        self.PDFReader = PDFToText()
        self.PPTXReader = PPTXToText()
        self.htmlReader = htmlReaderInstance()
    def make_chunk(self, input_file):
        chunks = textwrap.wrap(input_file, 1024)

    def check_mimetype_convert_to_text(self, input_file):
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
                    extracted_text = self.PDFReader.ConvertToText(input_file)

                case "text/plain":
                    filetype = "html"
                    extracted_text = self.htmlReader.ConvertToText(input_file)
                    
                    

                case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
                    filetype = "ppt"
                    extracted_text = self.PPTXReader.ConvertToText(input_file)
                case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                    filetype = "docx"
                    instance = DocxReaderInstance(input_file)
                    extracted_text = instance.ConvertToText()
                    extracted_image_text = instance.ConvertImageToText()

                case _:
                    raise NotSupportedFiletype
                    
            return filetype, extracted_text
            
        except Exception as error:
            print(type(error).__name__, "-", error)
            return None
        
        



if __name__ == "__main__":
    c = chunkerizer()
    # x = c.check_mimetype_convert_to_text("./tests/sample_files/Test_ppts/D0020E_Sustainability.pptx")
    x = c.check_mimetype_convert_to_text("tests\sample_files\Test_htmls\Architectural Design Patterns.html")
    if x is not None:
        print(x[0],x[1])