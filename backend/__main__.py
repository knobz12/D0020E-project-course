from webserver.app  import start_app
from modules.ai.playground import run_llm

from modules.files.chunks import Chunkerizer

from modules.ai.quizer import quiz_test
from modules.ai.explainer import explain_test

if __name__ == "__main__":
    start_app()
    # run_llm()
    #quiz_test()
    #explain_test()
    #Chunkerizer.text_extraction_test()

    
