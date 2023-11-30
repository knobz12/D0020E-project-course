from webserver.app  import start_app
from modules.ai.playground import run_llm

from modules.files.chunks import Chunkerizer

if __name__ == "__main__":
    start_app()
    # run_llm()
    # quiz_test()

    # path: str = "C:\\dev\\projects\\python\\D0020E-project-course\\backend\\tests\\sample_files\\courses\\D7032E\\Application.pdf"
    # path: str = "C:\\dev\\projects\\python\\D0020E-project-course\\backend\\tests\\sample_files\\courses\\D7032E\\QualityAttributes.pdf"
    # path: str = "C:\\dev\\projects\\python\\D0020E-project-course\\backend\\tests\\sample_files\\courses\\D7032E\\2022_D7032E-04-Qualitative_attributes1.pptx"

    path: str = "C:/Users/jsbol/Desktop/powerpoint zip/sustain/ppt/media/image21.tiff"

    tup = Chunkerizer.text_and_image_text_from_file(path)
    print(tup[1])
    # tup = Chunkerizer.text_and_image_text_from_file(path)
    # print(tup[1])
    
