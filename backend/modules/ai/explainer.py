from typing import Any
from modules.ai.utils.llm import create_llm
from modules.ai.utils.llm import create_llm_guidance
from modules.ai.utils.vectorstore import  create_collection
import json
from modules.ai.utils.llm import create_llm_guidance
from modules.ai.utils.vectorstore import *
import guidance
from guidance import  gen
from modules.files.chunks import *
from typing import List


def calculate_questions_per_doc(total_docs: int, total_questions: int, doc_index: int):
    """
    Calculate the number of questions to generate for a specific document.

    Parameters:
    - total_docs (int): Total number of documents.
    - total_questions (int): Total number of questions to generate.
    - doc_index (int): Index of the current document (0-based).

    Returns:
    - int: Number of questions to generate for the specified document.
    """
    # Ensure that the inputs are valid
    if total_docs <= 0 or total_questions <= 0 or doc_index < 0 or doc_index >= total_docs:
        raise ValueError("Invalid input parameters")

    # Calculate the base number of questions for each document
    base_questions_per_doc = total_questions // total_docs

    # Calculate the remaining questions after distributing the base questions
    remaining_questions = total_questions % total_docs

    # Calculate the actual number of questions for the current document
    questions_for_current_doc = base_questions_per_doc + (1 if doc_index < remaining_questions else 0)

    return questions_for_current_doc

@guidance()
def generate_keywords(lm, context: str, explanation_count: int):
    string_test = "frog"
    def gen_keyword(idx: int):
        Keyword: str = f"""\
keyword: "{gen(f"keyword{idx}",stop='"')}"
explanation: "{gen(f"explanation{idx}", stop='"')}"
"""
        return Keyword
    
    KeywordsStr: str = ""
    for i in range(0, explanation_count):
        KeywordsStr += gen_keyword(i) + "\n"

    print(KeywordsStr)


    res = f"""\

Context: {context}

The following is a keyword.
Generate an explanation based on the provided context but you are allowed to use othe infromation. the explanation for each corresponding keyword must be true. keep the explanation concise.

Keyword: 

{KeywordsStr}

    """

    print("this is important   "+res)
    lm += res 
    return lm

def explain_word(id: list[str], keyword:str, docsArray: list[str]) -> str:
    llm = create_llm()

    print("---------------------")
    print(docsArray)
    print("---------------------")
    
    results: list[str] = []
    for docs in docsArray:
        for (idx, meta) in enumerate(docs["metadatas"]):
            text =meta["text"]
            previous_explanation: str | None = results[idx - 1] if idx > 1 else None
    
            prompt = """Human: You are an assistant explaining a keyword
I want you to explain the word as best as you can and keep it short and concise using the given context:

Context: {text}

keyword:{keyword}

Answer:""".format(text = text,keyword = keyword)
        
            prompt_with_previous=  """Human: You are an assistant explaning a keyword.
Use the following pieces of retrieved context to improve the explanation. 
If you can't improve it simply return the old.
keep it short and concise.
Don't directly refer to the context text, pretend like you already knew the context information.

Explanation: {explanation}

Context: {context}

Answer:""".format(explanation = previous_explanation,context=text)

            use_prompt = prompt if previous_explanation == None else prompt_with_previous
            result = llm(use_prompt)
            results.append(result)
    
    print("######################################\n\n\n")
    for (idx, result) in enumerate(results):
        print(f"Result {idx + 1}")
        print(result + "\n\n\n")

    print("################################\n")
    explanation = results[-1].splitlines()[2:]
    return results

def create_explaination(id: list[str], amount: int, custom_keywords: list = []) -> str:
    gllm = create_llm_guidance()
    vectorstore = create_collection()

    
    
    """  for i in range(1,len(id)):
    docs.update(vectorstore.get(limit=100,include=["metadatas"],where={"id":id[i]})) """
    print("------------------------------------")
    #print(docs)
    print("------------------------------------")

    obj = {}
    obj["keywords"] = []
    docsArray = []
    for k in range(len(id)):
        docs = vectorstore.get(limit=100,include=["metadatas"],where={"id":id[k]})
        docsArray.append(docs)
        for (i, doc) in enumerate(docs["metadatas"]):
            qsts_count = calculate_questions_per_doc(len(docs["metadatas"]), amount, i)
            result = gllm + generate_keywords(doc["text"], qsts_count)

            for j in range(0, (amount)):
                keyword: str = result[f"keyword{j}"]
                explanation: str = result[f"explanation{j}"]
                obj["keywords"].append({"keyword" : keyword, "explanation": explanation})
    


    for i in range(0, len(custom_keywords)):
        #print(explain_word(id,custom_keywords[i]))
        obj["keywords"].append({"keyword" : custom_keywords[i], "explanation": explain_word(id, custom_keywords[i], docsArray)})
        
    print("__________________________________________________________________________")
   

    json_result: str = json.dumps(obj)
    print(json_result)
    return json_result


