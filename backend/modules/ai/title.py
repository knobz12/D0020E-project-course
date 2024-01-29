
from modules.ai.utils.llm import *
from modules.ai.utils.vectorstore import *

from guidance import gen

from modules.files.chunks import *





def create_title(context: str) -> str:
    llm = create_llm_guidance()

    result = llm + f"""\
    Generate a short concise title based on the context nothing more nothing less. Context: {context}. Title: {gen("title", stop='"')}
    """
    title = result["title"]

    # print(title)
    return title




def title_test():
    print(create_title("What is the Layered Architecture Pattern, and how does it promote maintainability and scalability in software design?")) 

