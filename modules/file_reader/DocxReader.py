import file_reader.docx3txt as docx3txt

class DocxToText():
    def __init__(self, file_path: str):
        self.text, self.image_text = docx3txt.process(file_path)

    def ConvertToText(self) -> str:
        return self.text
    
    def ConvertImageToText(self) -> str:
        return self.image_text

d = DocxToText("tests/sample_files/Test_docx/AIPR_Lab1-1.docx")
d.ConvertToText()