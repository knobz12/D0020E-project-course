def app():
    from webserver.app  import start_app
    start_app()
    
def quiz():
    from modules.ai.quizer import quiz_test
    quiz_test()

def title():
    from modules.ai.title import title_test
    title_test()

def chunky():
    from modules.files.chunks import Chunkerizer
    Chunkerizer.text_extraction_test()


def flashcards():
    from modules.ai.flashcards import flashcard_test
    flashcard_test()

if __name__ == "__main__":
    from modules.ai.utils.args import init_args
    init_args()
    app()
    # flashcards()
    # quiz()
    # title()
    # chunky()
    # test
