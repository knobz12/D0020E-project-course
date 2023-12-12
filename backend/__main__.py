def app():
    from webserver.app  import start_app
    start_app()

def playground():
    from modules.ai.playground import run_llm
    run_llm()

def quiz():
    from modules.ai.quizer import quiz_test
    quiz_test()

def chunky():
    from modules.files.chunks import Chunkerizer
    path: str = "C://dev//projects//python//D0020E-project-course//backend//tests//sample_files//courses//D7032E//Application.pdf"
    path: str = "C://dev//projects//python//D0020E-project-course//backend//tests//sample_files//courses//D7032E//QualityAttributes.pdf"
    path: str = "C://dev//projects//python//D0020E-project-course//backend//tests//sample_files//courses//D7032E//2022_D7032E-04-Qualitative_attributes1.pptx"

    path: str = "./backend/tests/sample_files/Test_txt/Image15.txt"

    Chunkerizer.text_extraction_test()

    tup = Chunkerizer.text_and_image_text_from_file(path)
    print(tup[1])
    tup = Chunkerizer.text_and_image_text_from_file(path)
    print(tup[1])

if __name__ == "__main__":
    app()
    # playground()
    # quiz()
    # chunky()

    
