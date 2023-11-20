import docx3txt
import pathlib

class DocxReaderInstance():
    text: str
    image_text: str

    def __init__(self, file_path: str):
        (text, image_text) = docx3txt.process(file_path)
        self.text = text
        self.image_text = image_text

    def ConvertToText(self):
        return self.text
    
    def ConvertImageToText(self):
        return self.image_text