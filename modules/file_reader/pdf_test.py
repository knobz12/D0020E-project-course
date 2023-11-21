import sys, pathlib, fitz, PIL

class PDFToText():
    def __init__(self, file:str):
        self.doc = fitz.open("tests/sample_files/Test_pdfs/Image15.pdf") # open document
            
    def ConvertToText(self, ):
        text = chr(12).join([page.get_text() for page in self.doc])
        return text.encode("utf-8")
    
    def ConvertImageToText(self, file):
        count = 0
        for page in self.doc:
            for image in page.get_images():
                if image[1] == 0:
                    with fitz.Pixmap(self.doc, image[0]) as pix:
                        pix.pil_tobytes(format="WEBP", optimize=True, dpi=(150, 150))

                    """
                    with fitz.Pixmap(doc, image[0]) as pix:
                    #pix.pil_save(f"tests/sample_files/Test_images/{image[7]}.png")
                        pix.pdfocr_save(f"tests/sample_files/Test_pdfs/{image[7]}.pdf", compress=True, language="eng", tessdata="tests/tessdata")"""

"""Pixmap.pil_tobytes()"""