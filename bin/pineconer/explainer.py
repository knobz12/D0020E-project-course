"""
Creating more detailed explanations from text documents
"""

def explainer():
    llm = LlamaCpp(
        model_path=model_path,
        # model_path="S:\models\llama-2-70b-chat.Q2_K.gguf",
        n_gpu_layers=43,
        n_batch=512,
        use_mmap=True,
        n_ctx=2048,
        f16_kv=True,  # MUST set to True, otherwise you will run into problem after a couple of calls
        # callback_manager=callback_manager,
        temperature=0.75,
        top_k=40,
        top_p=1,
        repeat_penalty=1/0.85,
        # verbose=False,
        verbose=True,
    )

    docs = vectorstore.get(limit=100,include=["metadatas"],where={"id":"b53998910b5a91c141f890fa76fbcb7f"})
    print(docs)
    print("doc count:",len(docs['ids']))
    results: list[str] = []
    for (idx, meta) in enumerate(docs["metadatas"]):
        text =meta["text"]
        previous_summary: str | None = results[idx - 1] if idx > 1 else None

        prompt = """Human: You are an assistant summarizing document text.
I want you to summarize the text as best as you can in less than four paragraphs but atleast two paragraphs:

Text: {text}

Answer:""".format(text = text)
        prompt_with_previous=  """Human: You are an assistant summarizing document text.
Use the following pieces of retrieved context to improve the summary text. 
If you can't improve it simply return the old.
The new summary may only be up to four paragraphs but at least two paragraphs.
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

    print("######################################\n\n\n")
    for (idx, result) in enumerate(results):
        print(f"Result {idx + 1}")
        print(result + "\n\n\n")

    print("################################\n")
    print("Summary:")
    summary = results[-1].splitlines()[2:]
    print(summary)

if __name__ == "__main__":
   explainer()