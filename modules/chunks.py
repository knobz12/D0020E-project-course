import textwrap
from PDFReader import PDFToText
from PPTXReader import PPTXToText
from HashFunction import TextToHash
import time


class NotSupportedFiletype(Exception):
    def __init__(self, message = "Type not currently supported. We are working on a fix in later versions."):
        super().__init__(message)


class chunkerizer():
    def __init__(self):
        self.PDFReader = PDFToText()
        self.PPTXReader = PPTXToText()

    def make_chunk(self, input_file):
        chunks = textwrap.wrap(input_file, 1024)

    def check_mimetype_convert_to_text(self, input_file):
        input_file = input_file
        try:
            fileformat = magic.from_file(input_file, mime = True)
            match fileformat:
                case "image/png":
                    filetype = "png"

                case "":
                    filetype = "jpeg"

                case "application/pdf":
                    filetype = "pdf"
                    extracted_text = self.PDFReader.ConvertToText(input_file)

                case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
                    filetype = "ppt"
                    extracted_text = self.PPTXReader.ConvertToText(input_file)

            if 'filetype' not in locals():
                raise NotSupportedFiletype
            else:
                return filetype, extracted_text
            
        except Exception as error:
            print(type(error).__name__, "-", error)
            return None
        
        



if __name__ == "__main__":
    c = chunkerizer()
    x = c.check_mimetype_convert_to_text("./tests/sample_files/Test_ppts/D0020E_Sustainability.pptx")
    if x is not None:
        print(x[0],x[1])