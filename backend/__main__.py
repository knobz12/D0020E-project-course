#from webserver.app  import start_app
#from modules.ai.quizer import quiz_test

from modules.files.chunks import chunkerizer

if __name__ == "__main__":
    #start_app()
    #quiz_test()


    chunk = chunkerizer()
    path: str = "./backend/tests/sample_files/Test_pdfs/L01 Intro 2023 v02.pdf"
    f = open(path, "rb")
    bytes = f.read()
    f.close()


    tup = chunk.check_mimetype(bytes)
    print(tup[1])
    
