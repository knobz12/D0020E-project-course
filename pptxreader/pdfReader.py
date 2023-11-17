import PyPDF2
 
# creating a pdf file object
pdfFileObj = open('L01 Intro 2023 v02.pdf', 'rb')
 
# creating a pdf reader object
pdfReader = PyPDF2.PdfReader(pdfFileObj)
 
# printing number of pages in pdf file
print(len(pdfReader.pages))
x = ""
 
# creating a page object
for i in range(len(pdfReader.pages)):
    pageObj = pdfReader.pages[i]
    x = x + " " + pageObj.extract_text()
 
# extracting text from page



with open("L01 Intro 2023 v02.txt", "w") as f:
    f.write(x)
 
# closing the pdf file object
pdfFileObj.close()