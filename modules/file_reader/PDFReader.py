import PyPDF2

class PDFToText():
    def __init__(self):
        pass

    def ConvertToText(self, file):
        extracted_text = ""
        with open(file, 'rb') as PDF:
            pdfReader = PyPDF2.PdfReader(PDF)
            for i in range(len(pdfReader.pages)):
                pageObj = pdfReader.pages[i]
                extracted_text = extracted_text + " " + pageObj.extract_text()
        return extracted_text
    
    def ConvertImageToText(self, file):
        pass

    def ConvertToImage(self, file):
        extracted_text = ""
        with open(file, 'rb') as PDF:
            pdfReader = PyPDF2.PdfReader(PDF)
            for i in range(len(pdfReader.pages)):
                pageObj = pdfReader.pages[i]
                for image in pageObj.images:
                    import io
                    import pytesseract
                    from PIL import Image

                    img = Image.open(io.BytesIO(image.data))
                    img.save(f"./{image.name}")
                    scan = pytesseract.image_to_string(img)
                    print(f"Scan of {image.name} ({len(scan)}):",scan)
                    if len(scan) > 0:
                        extracted_text += scan + "\n\n"
        return extracted_text