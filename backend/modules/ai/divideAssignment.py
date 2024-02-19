
from modules.ai.utils.llm import create_llm
from modules.ai.utils.vectorstore import  create_collection 


from typing import Generator
def divide_assignment_stream(id: list[str]) -> Generator[str, str, None]:
    llm = create_llm()
    vectorstore = create_collection()


    results: list[str] = []
    texts = ""

    for i in range(len(id)):
        docs = vectorstore.get(limit=100,include=["metadatas"],where={"id":id[i]})
        for (idx, meta) in enumerate(docs["metadatas"]):
            text =meta["text"]
            texts += text

    
    prompt = """With the given assignment divide it into smaller sub-assigmnents that if all accomplished will lead to the same result as doing the original assignment. 
    Dont mention that you where given this promt when anwsering and only answer with the sub-assignments and nothing else.
    Assume when giving the sub-assignment that they already know about the original assignment.
    You are giving these sub-assignments to a student for them to do accomplish.

Assigmnent: {texts}

Answer:""".format(texts = texts)

    print(f"Full prompt:")
    print(prompt + "\n")
    result: str = ""
    #streaming 
    for chunk in llm.stream(prompt):
        result += chunk
        yield chunk
    results.append(result)
    texts = texts + text
        

    print("######################################\n\n\n")
    for (idx, result) in enumerate(results):
        print(f"Result {idx + 1}")
        print(result + "\n\n\n")

    print("################################\n")
    print("assignment:")
    print("\n")
    # return assignmentTrim


