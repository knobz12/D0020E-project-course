import sys, pathlib, fitz, PIL

with fitz.open("tests/sample_files/Test_pdfs/Image15.pdf") as doc:  # open document
    text = chr(12).join([page.get_text() for page in doc])
    pathlib.Path("tests/sample_files/Test_txt/Image15"+ ".txt").write_bytes(text.encode("utf-8"))

count = 0
with fitz.open("tests/sample_files/Test_pdfs/L01 Intro 2023 v02.pdf") as doc:  # open document
    for page in doc:
        for image in page.get_images():
            if image[1] == 0:
                with fitz.Pixmap(doc, image[0]) as pix:
                #pix.pil_save(f"tests/sample_files/Test_images/{image[7]}.png")
                    pix.pdfocr_save(f"tests/sample_files/Test_pdfs/{image[7]}.pdf", compress=True, language="eng", tessdata="tests/tessdata")
            

##
"""Pixmap.pil_tobytes()"""