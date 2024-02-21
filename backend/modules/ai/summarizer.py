"""
Creating summary of document(s) in the database

# Improvements:
* Improve output format. Maybe JSON using the guidance library

# Optional
* Argument for document id in database to create summary for
"""
import chromadb
from chromadb.utils import embedding_functions
from chromadb.config import Settings
from modules.ai.utils.llm import create_llm, create_llm_index, create_llm_index_query_engine
from modules.ai.utils.vectorstore import  create_collection 
from llama_index.vector_stores import ChromaVectorStore, VectorStoreQuery
from llama_index.vector_stores.types import (
    MetadataFilter,
    MetadataFilters,
    FilterOperator,
)
from llama_index import (
    LLMPredictor,
    ServiceContext,
    StorageContext,
    PromptTemplate,
    set_global_service_context,
    SimpleDirectoryReader,
    VectorStoreIndex,
    SummaryIndex,
    Document
)
from llama_index.query_engine import RetrieverQueryEngine
from llama_index.retrievers import (
    BaseRetriever,
    VectorIndexRetriever,
)
from llama_index import download_loader
from llama_index.extractors import BaseExtractor
from llama_index.prompts import PromptTemplate

import modules
from typing import Generator
import gc
import sys, os

def summarize_doc_old(id: str) -> str:
    llm = create_llm()
    vectorstore = create_collection()

    docs = vectorstore.get(limit=100,include=["metadatas"],where={"id":id})
    print(docs)
    print("doc count:",len(docs['ids']))
    results: list[str] = []
    texts = ""
    for (idx, meta) in enumerate(docs["metadatas"]):
        text =meta["text"]
        previous_summary: str | None = results[idx - 1] if idx > 1 else None

        prompt = """Human: You are an assistant summarizing document text.
I want you to summarize the text as best as you can in less than four paragraphs but atleast two paragraphs and when only include the summaraztion and nothing else:
Also end the summary with by adding "END" and start with "START"

Text: {text}

Answer:""".format(text = text)

        prompt_with_previous=  """Human: You are an assistant summarizing document text.
Use the following pieces of retrieved context to add to the summary text. 
If you can't add to it simply return the old.
The most important part is to add "END" when ending the summary and "START" when starting summary.
The new summary has to be at least two paragraphs.
Dont Ever talk about improving the summary
Don't directly refer to the context text, pretend like you already knew the context information.
summarize_doc_stream_index

Summary: {summary}

Context: {context}

Answer:""".format(summary = previous_summary,context=text)

        use_prompt = prompt if previous_summary == None else prompt_with_previous
        print(f"Summarizing doc {idx + 1}...")
        print(f"Full prompt:")
        print(use_prompt + "\n")
        result = llm(use_prompt)
        results.append(result)
        texts = texts + text
        

    print("######################################\n\n\n")
    for (idx, result) in enumerate(results):
        print(f"Result {idx + 1}")
        print(result + "\n\n\n")

    print("################################\n")
    print("Summary:")
    summary = results[-1]
    print("\n")
    summaryTrim = summary[results[-1].find(start:='START')+len(start):summary.find('END')]
    print(summaryTrim)
    print("\n")
    print("Original text:")
    print(texts)
    return summaryTrim


def summarize_doc_stream_old(id: str) -> Generator[str, str, None]:
    llm = create_llm()
    vectorstore = create_collection()

    docs = vectorstore.get(limit=100,include=["metadatas"],where={"id":id[0]})
    print(docs)
    print("doc count:",len(docs['ids']))
    results: list[str] = []
    texts = ""
    for (idx, meta) in enumerate(docs["metadatas"]):
        text =meta["text"]
        previous_summary: str | None = results[idx - 1] if idx > 1 else None

        prompt = """Human: You are an assistant summarizing document text.
I want you to summarize the text as best as you can in less than four paragraphs but atleast two paragraphs and when only include the summaraztion and nothing else:

Text: {text}

Answer:""".format(text = text)

        prompt_with_previous=  """Human: You are an assistant summarizing document text.
Use the following pieces of retrieved context to add to the summary text. 
If you can't add to it simply return the old.
The new summary has to be at least two paragraphs long but never longer than three paragraphs of text.
Dont Ever talk about improving the summary.
Don't directly refer to the context text, pretend like you already knew the context information.


Summary: {summary}

Context: {context}

Answer:""".format(summary = previous_summary,context=text)

        use_prompt = prompt if previous_summary == None else prompt_with_previous
        print(f"Summarizing doc {idx + 1}...")
        print(f"Full prompt:")
        print(use_prompt + "\n")
        result: str = ""

        # Start streaming the final summary only
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
    print("Summary:")
    summary = results[-1]
    print("\n")
    summaryTrim = summary[results[-1].find(start:='START')+len(start):summary.find('END')]
    print(summaryTrim)
    print("\n")
    print("Original text:")
    print(texts)
    # return summaryTrim

def get_user_canceled():
    return modules.user_canceled

def set_user_canceled(value: bool):
    modules.user_canceled = value

def summarize_doc_stream_index(id: str) -> Generator[str, str, None]:
    # part_of_old_prompt = "The most important part is to add 'END' when ending the summary and 'START' when starting summary."
    prompt = """I want you to summarize the text as best as you can.
    The summary has to be at least two paragraphs long and no longer than four paragraphs long
    Dont Ever talk about improving the summary
    Don't directly refer to the context text, pretend like you already knew the context information.
    Don't write the user prompt or the system prompt.
    """
    if get_user_canceled() == True:
        gc.collect()
        set_user_canceled(False)
        raise GeneratorExit("Lol")

    llm = create_llm_index(api_key="", openai=False)
    query_engine = create_llm_index_query_engine(id, llm)
    streaming_response = query_engine.query(prompt)

    # chunks = 0
    from time import sleep
    for textchunk in streaming_response.response_gen:
        # sleep(0.1)
        # if chunks > 10:
        if get_user_canceled() == True:
            print("USER CANCELED REQUEST")
            llm = None
            query_engine = None
            gc.collect()
            set_user_canceled(False)
            raise GeneratorExit("Lol")
        # chunks += 1
        yield textchunk
    llm = None
    query_engine = None
    gc.collect()

if __name__ == "__main__":
    summarize_doc_stream_old()