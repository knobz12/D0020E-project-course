
from modules.ai.utils.llm import create_llm
from modules.ai.utils.vectorstore import  create_collection 


from typing import Generator
def assignment_doc_stream(id: list[str]) -> Generator[str, str, None]:
    llm = create_llm()
    vectorstore = create_collection()

    results: list[str] = []
    texts = ""
    previous_assignment = ""

    loops = 0
    for i in range(len(id)):
        docs = vectorstore.get(limit=100,include=["metadatas"],where={"id":id[i]})
        for (idx, meta) in enumerate(docs["metadatas"]):
            if(loops > 1):
                previous_assignment: str | None = results[loops - 1] if loops > 1 else None
            text =meta["text"]

            prompt = """ create an completely original assignment using the given context and add small bit of text att the end saying the amount of hours the assignment will take. Make it an assignment tha someone could do in one day of work

Text: {text}

Answer:""".format(text = text)

            prompt_with_previous=  """ Improve the assignment so that it in some way test a students ability on the information in the given context while also keeping habing it be the same assignment.
            Done mention the the original assignment in you answer and make it an assignment you can complete in a days work. Keep the text somewhat short.


assignment: {assignment}

Context: {context}

Answer:""".format(assignment = previous_assignment,context=text)

            use_prompt = prompt if previous_assignment == None else prompt_with_previous
            print(f" doc {idx + 1}...")
            print(f"Full prompt:")
            print(use_prompt + "\n")
            result: str = ""

            # Start streaming the final assignment only
            if idx == (len(docs['metadatas']) - 1) & (i == len(id) - 1):
                for chunk in llm.stream(use_prompt):
                    result += chunk
                    yield chunk
            else:
                result = llm(use_prompt)
            results.append(result)
            texts = texts + text
            loops += 1
        

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


