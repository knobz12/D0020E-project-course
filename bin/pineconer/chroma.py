# import os
# import pathlib
# from torch import cuda
# from langchain.embeddings.huggingface import HuggingFaceEmbeddings
# from langchain.vectorstores import Pinecone
# import pinecone
from langchain.embeddings.sentence_transformer import SentenceTransformerEmbeddings
from langchain.vectorstores.chroma import Chroma
from datasets import load_dataset
import chromadb
from chromadb.config import Settings

collection_name = "llama-2-papers"
client = chromadb.HttpClient(settings=Settings(allow_reset=True))

print("Creating embedding function")
embedding_function = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")

collection: chromadb.Collection
try:
    collection = client.get_collection(collection_name)
except Exception:
    print(f"Creating missing collection '{collection_name}'...")
    collection = client.create_collection(collection_name)

# Chroma.from_texts
print(collection)
print("Document count:", collection.count())
vectorstore = Chroma(embedding_function=embedding_function,client=client,collection_name=collection_name)
# result = db.similarity_search("CNN when switching GTX gpu")
# print(result)

def upsert_data() -> None:
    import pathlib
    dataset_file_path = pathlib.Path("./result.jsonl")
    print("Loading dataset...")
    data = load_dataset("json", data_files=str(dataset_file_path.resolve()),split="train")
    print("Loaded dataset:")
    print(data)

    ids: list[str] = []
    for i in range(0, min(len(data), 100)):
        print(f"Upserting doc {i}")
        obj = data[i]
        ident = obj["id"] + str(obj["chunk-id"])
        ids.append(ident)
        # text = str(obj["text"])[:len(obj["chunk"])//3]
        text = str(obj["text"])
        course = str(obj["course"])
        collection.add([ident],metadatas={'course':course,'text': text},documents=[text])

def run_llm():
    from langchain import hub
    prompt = hub.pull("rlm/rag-prompt")
    print(prompt)
    from langchain.llms.llamacpp import LlamaCpp
    from langchain.callbacks.manager import CallbackManager
    from langchain.callbacks import StreamingStdOutCallbackHandler
    # callback_manager = CallbackManager([StreamingStdOutCallbackHandler()])

    llm = LlamaCpp(
        model_path="S:\models\llama-2-13b-chat.Q3_K_M.gguf",
        # model_path="S:\models\llama-2-70b-chat.Q2_K.gguf",
        n_gpu_layers=43,
        n_batch=256,
        use_mmap=True,
        n_ctx=2048,
        f16_kv=True,  # MUST set to True, otherwise you will run into problem after a couple of calls
        # callback_manager=callback_manager,
        verbose=True,
    )

    prompt_str = """Human: You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. 
    If you don't know the answer, just say that you don't know. 
    Use three sentences maximum and keep the answer concise. 
    Don't directly refer to the context text, pretend like you already knew the context information.
    Question: {question}
    Context: {context}
    Answer:"""

    retriever = vectorstore.as_retriever(search_kwargs={'k': 2})
    # import langchain
    # langchain.debug = True
    from langchain import hub
    from langchain.prompts.prompt import Prompt
    from langchain.schema.runnable import RunnablePassthrough
    from langchain.schema.output_parser import StrOutputParser
    prompt = hub.pull("rlm/rag-prompt")

    from langchain.prompts import ChatPromptTemplate
    prompt = ChatPromptTemplate.from_template(prompt_str)

    # print(retriever.get_relevant_documents("CNN when switching GTX gpu"))
    rag_chain = (
        {"context": retriever, "question": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )

    questions: list[str] = [
        "How many workshops will ther be?",
        "What will the projects be about?"
        # "How many hidden units does P2NN have and how were they selected?",
        # "For SMLP, what were the test errors?"
    ]

    import time
    for (idx, question) in enumerate(questions):
        # for chunk in rag_chain.stream("CNN when switching GTX gpu"):
        print(f"Asking question {idx}")
        for chunk in rag_chain.stream(question):
            print(chunk, end="")
            time.sleep(0.1)
        print("\n")
        print(f"Done with question {idx}")
        time.sleep(1)

    time.sleep(10)
        # llm.
    # rag_chain.strea

# Upsert the result.jsonl data
upsert_data()

# Run RAG with the dataset
# run_llm()