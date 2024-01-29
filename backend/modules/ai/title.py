
from modules.ai.utils.llm import *
from modules.ai.utils.vectorstore import *

from guidance import gen

from modules.files.chunks import *


from modules.ai.utils.llm import create_llm, create_llm_index, create_llm_index_query_engine
import gc
import modules

def create_title(context: str) -> str:
    from threading import Semaphore
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

def create_title_index(context: str) -> str:
    llm = create_llm_index()
    documents = [Document(text=context)]
    index = VectorStoreIndex.from_documents(documents)
    query_engine = index.as_query_engine()
    response = query_engine.query("Generate a short concise title based on the context nothing more nothing less. It should be no longer than 10 words.")
    del llm
    gc.collect()
    return str(response)


def title_test():
    print(create_title("What is the Layered Architecture Pattern, and how does it promote maintainability and scalability in software design?")) 

