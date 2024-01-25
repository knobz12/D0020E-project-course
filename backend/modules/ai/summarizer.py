"""
Creating summary of document(s) in the database

# Improvements:
* Improve output format. Maybe JSON using the guidance library

# Optional
* Argument for document id in database to create summary for
"""
from langchain.vectorstores import Chroma
import chromadb
from chromadb.utils import embedding_functions
from chromadb.config import Settings
from modules.ai.utils.llm import create_llm, create_llm_index, retrieve_document
from modules.ai.utils.vectorstore import  create_vectorstore
from llama_index.vector_stores import ChromaVectorStore, VectorStoreQuery
from llama_index import (
    LLMPredictor,
    ServiceContext,
    StorageContext,
    PromptTemplate,
    set_global_service_context,
    SimpleDirectoryReader,
    VectorStoreIndex,
    SummaryIndex
)
from llama_index.retrievers import (
    BaseRetriever,
    VectorIndexRetriever,
)
from llama_index import download_loader
from llama_index.extractors import BaseExtractor
from llama_index.prompts import PromptTemplate

from typing import Generator
import gc
import sys, os

def summarize_doc_old(id: str) -> str:
    llm = create_llm()
    vectorstore = create_vectorstore()

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


def summarize_doc_stream(id: str) -> Generator[str, str, None]:
    llm = create_llm()
    vectorstore = create_vectorstore()

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



def summarize_doc_stream_old(id: str) -> Generator[str, str, None]:
    "3603efdbd280746971c65b7146a5f998"
    print(id)
    part_of_old_prompt = "The most important part is to add 'END' when ending the summary and 'START' when starting summary."
    prompt = """I want you to summarize the text as best as you can.
    The summary has to be at least two paragraphs long and no longer than four paragraphs long
    Dont Ever talk about improving the summary
    Don't directly refer to the context text, pretend like you already knew the context information.
    Don't write the user prompt or the system prompt.
    """
    extra_prompt="Write the answer in Swedish."

    prompt = """I want you to create a quiz on the text as best as you can.
    Pick out six keywords that are important to the text and create a unique question for each.
    Each question should have only 4 answers and only one should be correct.
    Put the answers in a random order for each question without making more than 4 answers.
    Write the output in JSON format and mark the correct answer on each question."""
    llm = create_llm_index(api_key="", openai=False)

    service_context = ServiceContext.from_defaults(
    chunk_size=1024,
    llm=llm,
    embed_model='local:sentence-transformers/all-MiniLM-L6-v2',
    )
    
    set_global_service_context(service_context)

    documents = retrieve_document(id)


    node_parser = service_context.node_parser
    nodes = node_parser.get_nodes_from_documents(documents)
    storage_context = StorageContext.from_defaults()
    storage_context.docstore.add_documents(nodes)
    
    index = VectorStoreIndex(nodes, storage_context=storage_context)
    query_engine = index.as_query_engine(streaming=True, similarity_top_k=5)
    streaming_response = query_engine.query(prompt)

    for textchunk in streaming_response.response_gen:
        yield textchunk
    gc.collect()

if __name__ == "__main__":
    summarize_doc_stream()