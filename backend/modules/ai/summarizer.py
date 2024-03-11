"""
Creating summary of document(s) in the database

# Improvements:
* Improve output format. Maybe JSON using the guidance library

# Optional
* Argument for document id in database to create summary for
"""
from modules.ai.utils.llm import create_llm
from modules.ai.utils.vectorstore import  create_collection 

import modules
from typing import Generator
import gc
import sys, os

def summarize_doc(id: str) -> str:
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


def summarize_doc_stream(id: list[str]) -> Generator[str, str, None]:
    llm = create_llm()
    vectorstore = create_collection()

    
    results: list[str] = []
    texts = ""
    previous_summary = ""
    loops = 0
    for i in range(len(id)):
        docs = vectorstore.get(limit=100,include=["metadatas"],where={"id":id[i]})
        for (idx, meta) in enumerate(docs["metadatas"]):
            if(loops > 1):
                #print(".i.                       ")
                #print(results)
                #print("--------------")
                #print(loops)
                previous_summary: str | None = results[loops-1] if (loops > 1 ) else None
                #print("previus summary ============"+previous_summary)
            text = meta["text"]

            prompt = """Human: You are an assistant summarizing document text.
I want you to summarize the text as best as you can in less than four paragraphs but atleast two paragraphs and when only include the summaraztion and nothing else:

Text: {text}

Answer:""".format(text = text)

            prompt_with_previous=  """Human: You are an assistant summarizing document text.
Use the following context to add to the summary if it is about something very different just summarize it alone and combine them
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
            if (idx == len(docs['metadatas']) - 1) & (i == len(id) - 1):
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
