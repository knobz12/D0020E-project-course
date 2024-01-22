import json
from modules.ai.utils.llm import create_llm_guidance, create_llm_index
from modules.ai.utils.vectorstore import *

import guidance
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
    #doc_id = "b53998910b5a91c141f890fa76fbcb7f"
    vectorstore = create_vectorstore()

    docs = vectorstore.get(limit=100,include=["metadatas"],where={"id":id})
    #docs = vectorstore.get(limit=100,include=["metadatas"],where={"id":id})
    qsts_cunt = calculate_questions_per_doc(len(docs["metadatas"]), amount, id)
    documents = docs["metadatas"]
    print(documents)
    return
    llm = create_llm_index()
    if isinstance(llm, LlamaCPP):
        service_context = ServiceContext.from_defaults(
            chunk_size=512,
            llm=llm,
            embed_model='local'
            )
    elif isinstance(llm, OpenAI):
        service_context = ServiceContext.from_defaults(
            chunk_size=512,
            llm=llm,
            )
        
    set_global_service_context(service_context)

    index = VectorStoreIndex.from_documents(documents)
    query_engine = index.as_query_engine(similarity_top_k=3, service_context=service_context)
    response_stream1 = query_engine.query(f"Pick out {str(amount)} keywords that are important across the document. For each keyword write a short explaination. Give the output in json format.")
    if custom_keywords != []:
        response_stream2 = query_engine.query(f"These are some keywords that needs to be explained: {custom_keywords}. For each keyword write a short explaination. Give the output in json format.")
    
    return json.dumps(f"{response_stream1}\n{response_stream2}")