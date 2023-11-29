#from webserver.app  import start_app
#from modules.ai.quizer import quiz_test

from modules.files.chunks import Chunkerizer

if __name__ == "__main__":
    #start_app()
    #quiz_test()


    path: str = "./backend/tests/sample_files/Test_pdfs/L01 Intro 2023 v02.pdf"

    tup = Chunkerizer.text_and_image_text_from_file(path)
    print(tup[1])
    
