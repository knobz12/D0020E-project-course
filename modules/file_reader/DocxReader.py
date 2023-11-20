import docx3txt
import pathlib

class DocxReaderInstance():
    def __init__(self, file_path: str):
        (text, image_text) = docx3txt.process(file_path)
        self.text = text
        self.image_text = image_text

    def ConvertToText(self) -> str:
        return self.text
    
    def ConvertImageToText(self) -> str:
        return self.image_text