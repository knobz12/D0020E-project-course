#Cuatom error

class NotSupportedFiletype(Exception):
    def __init__(self, message = "Type not currently supported. We are working on a fix in later versions."):
        super().__init__(message)

#Reader functions

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
    
    def ConvertToImage(self, file):
        pass
