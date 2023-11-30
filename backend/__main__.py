#from webserver.app  import start_app
#from modules.ai.quizer import quiz_test

from modules.files.chunks import Chunkerizer

if __name__ == "__main__":
    #start_app()
    #quiz_test()


    path: str = "./backend/tests/sample_files/courses/D7032E/2022_D7032E-04-Qualitative_attributes1.pptx"

    tup = Chunkerizer.text_and_image_text_from_file(path)
    print(tup[1])
    
