import json
from modules.ai.utils.llm import create_llm_guidance, create_llm_index, create_llm_index_query_engine
from modules.ai.utils.vectorstore import *

import guidance
import gc
from guidance import select, gen

from modules.files.chunks import *

from typing import Any, Generator

from llama_index.llms import LlamaCPP, OpenAI
from llama_index import (
    LLMPredictor,
    ServiceContext,
    StorageContext,
    set_global_service_context,
    SimpleDirectoryReader,
    VectorStoreIndex,
)

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

def create_explaination(id: str, amount: int = 10, custom_keywords: list = []) -> str:
    return json.dumps('{"keywords": [{"keyword": "SOLID", "explanation": [{"The SOLID Principles are a set of design principles that help to create software that is more resilient, maintainable, and scalable. They stand for Single Responsibility, Open-Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion."}, {"keyword": "object-oriented", "explanation": "Object-oriented programming is a programming paradigm that focuses on objects rather than functions or logic. It allows for more complex and modular software designs by encapsulating data and functionality within objects, which can interact with each other through messaging."}]}]}')
    print(id)
    prompt = f"Pick out {str(amount)} keywords that are important across the documents. For each keyword write a short explaination. Give the output in json format."""
    
    llm = create_llm_index(api_key="", openai=False)
    query_engine = create_llm_index_query_engine(id, llm)
    response_stream1 = query_engine.query(prompt)
    "print(response_stream1)"
    if custom_keywords != []:
        prompt1 = f"These are some keywords that needs to be explained: {custom_keywords}. For each keyword write a short explaination. Give the output in json format."
        response_stream2 = f"{query_engine.query(prompt1)}"
    else:
        response_stream2 = {}
    print("###########################################")
    response1 = json.loads(response_stream1.response)
    response2 = json.loads(response_stream1.response)
    print("###########################################")
    response = {**response1, **response2}
    print(response)
    return json.dumps(response)