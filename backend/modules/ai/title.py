import gc
import modules
from threading import Semaphore
from guidance import gen

#from modules.files.chunks import *
from modules.ai.utils.llm import create_llm, create_llm_guidance


def create_title(context: str) -> str:
    sem: Semaphore = modules.sem
    llm = create_llm_guidance()

    context = context[0:1024]

    sem.acquire(timeout=1000)
    result = llm + f"""\
Generate a short concise title based on the context nothing more nothing less.\n\nContext: {context[:1024]} \n\nTitle: {gen("title",max_tokens=256)}
"""
    title = result["title"]
    sem.release()

    # print(title)
    return title

def title_test():
    print(create_title("What is the Layered Architecture Pattern, and how does it promote maintainability and scalability in software design?")) 

