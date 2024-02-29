import json
from modules.ai.utils.llm import create_llm_guidance
from modules.ai.utils.vectorstore import *

import guidance
from guidance import select, gen

from modules.files.chunks import *



from pydantic import BaseModel
from typing import List

from llama_index.program import GuidancePydanticProgram


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
def generate_flashcard(lm, context: str, flashcard_count: int):

    def gen_question(idx: int):
        question: str = f"""\
Question: "{gen(f"question{idx}",stop='"')}"
Answer: "{gen(f"answer{idx}", stop='"')}"
"""
        return question

    flashcards: str = ""
    for i in range(0, flashcard_count):
        flashcards += gen_question(i) + "\n"

        
    # print("Flashcards:\n", flashcards)



    res = f"""\
The following is flashcards questions.
Generate answers based on the provided context. the answer for each corresponding question must be true. keep the answers concise.
The questions MUST be different to one another.

Context: {context}

Flashcards:

{flashcards}
    """

    # print(res)
    lm += res 
    return lm


class Data(BaseModel):
    data: list[tuple[str, str]]


def create_flashcards(id: list[str], questions: int):
    gllm = create_llm_guidance()
    vectorstore = create_collection()



    obj = {}
    obj["questions"] = []

    for k in range(len(id)):
        docs = vectorstore.get(limit=100,include=["metadatas"],where={"id":id[k]})

        for (i, doc) in enumerate(docs["metadatas"]):
            qsts_count = calculate_questions_per_doc(len(docs["metadatas"]), questions, i)
            result = gllm + generate_flashcard(doc["text"], qsts_count)
            # print(result)

            for j in range(0, questions):
                question: str = result[f"question{j}"]
                answer: str = result[f"answer{j}"]
                if(question != None):
                    obj["questions"].append({"question" : question, "answer": answer})



    json_result: str = json.dumps(obj)
    return json_result



def flashcard_test():
    file_hash = Chunkerizer.upload_chunks_from_file("backend/tests/sample_files/Test_htmls/Architectural Design Patterns.html", "D0072E")
    print(create_flashcards(file_hash, 3)) 