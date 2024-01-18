
from langchain.vectorstores import Chroma
from modules.ai.utils.llm import create_llm
from modules.ai.utils.vectorstore import  create_vectorstore


from typing import Generator
def assignment_doc_stream(id: str) -> Generator[str, str, None]:
    llm = create_llm()
    vectorstore = create_vectorstore()

    docs = vectorstore.get(limit=100,include=["metadatas"],where={"id":id})
    print(docs)
    print("doc count:",len(docs['ids']))
    results: list[str] = []
    texts = ""
    for (idx, meta) in enumerate(docs["metadatas"]):
        text =meta["text"]
        previous_assignment: str | None = results[idx - 1] if idx > 1 else None

        prompt = """ create2 an completely original assignment using the given context and add small bit of text att the end saying the amount of hours the assignment will take. Make it an assignment tha someone could do in one day of work

Text: {text}

Answer:""".format(text = text)

        prompt_with_previous=  """ improve the assignment using the information given. If its not possible to improve then repeat the assignment word for word


assignment: {assignment}

Context: {context}

Answer:""".format(assignment = previous_assignment,context=text)

        use_prompt = prompt if previous_assignment == None else prompt_with_previous
        print(f" doc {idx + 1}...")
        print(f"Full prompt:")
        print(use_prompt + "\n")
        result: str = ""

        # Start streaming the final assignment only
        if idx == len(docs['metadatas']) - 1:
            for chunk in llm.stream(use_prompt):
                result += chunk
                yield chunk
        else:
            result = llm(use_prompt)
        results.append(result)
        texts = texts + text
        

    print("######################################\n\n\n")
    for (idx, result) in enumerate(results):
        print(f"Result {idx + 1}")
        print(result + "\n\n\n")

    print("################################\n")
    print("assignment:")
    assignment = results[-1]
    print("\n")
    assignmentTrim = assignment[results[-1].find(start:='START')+len(start):assignment.find('END')]
    print(assignmentTrim)
    print("\n")
    print("Original text:")
    print(texts)
    # return assignmentTrim

