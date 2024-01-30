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
    prompt = f"Pick out {str(amount)} keywords that are important across the document. For each keyword write a short explaination. Give the output in json format.""Pick out {str(amount)} keywords that are important across the document. For each keyword write a short explaination. Give the output in json format."
    
    llm = create_llm_index(api_key="", openai=False)
    query_engine = create_llm_index_query_engine(id, llm)
    response_stream1 = query_engine.query(prompt)
    if custom_keywords != []:
        prompt1 = f"These are some keywords that needs to be explained: {custom_keywords}. For each keyword write a short explaination. Give the output in json format."
        response_stream2 = query_engine.query(prompt1)
    else:
        response_stream2 = {}
    return json.dumps(f"{response_stream1}\n{response_stream2}")