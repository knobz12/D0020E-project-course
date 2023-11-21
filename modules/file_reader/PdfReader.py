import PyPDF2
import io
import pytesseract
from PIL import Image

class PDFToText():
    def __init__(self, file:str):
        self.pdfReader = PyPDF2.PdfReader(file)
        self.extracted_text = ""

    def ConvertToText(self):
        for i in range(len(self.pdfReader.pages)):
            pageObj = self.pdfReader.pages[i]
            extracted_text = extracted_text + " " + pageObj.extract_text()
        return extracted_text
    
    def ConvertImageToText(self):
        for i in range(len(self.pdfReader.pages)):
            pageObj = self.pdfReader.pages[i]
            for image in pageObj.images:
                img = Image.open(io.BytesIO(image.data))
                img.save(f"./{image.name}")
                scan = pytesseract.image_to_string(img)
                print(f"Scan of {image.name} ({len(scan)}):",scan)
                if len(scan) > 0:
                    extracted_text += scan + "\n\n"
        return extracted_text