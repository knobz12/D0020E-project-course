import chromadb
from langchain.embeddings.sentence_transformer import SentenceTransformerEmbeddings
from langchain.vectorstores.chroma import Chroma
from datasets import load_dataset
from chromadb.config import Settings
from langchain.prompts import ChatPromptTemplate
from langchain.llms.llamacpp import LlamaCpp
from langchain.callbacks.manager import CallbackManager
from langchain.callbacks import StreamingStdOutCallbackHandler
from langchain.prompts.prompt import Prompt
from langchain.schema.runnable import RunnablePassthrough
from langchain.schema.output_parser import StrOutputParser
import time
import pathlib
import os

from argparse import ArgumentParser

def main():
    parser = ArgumentParser()
    parser.add_argument("--model-path", help="The path to the llama-cpp supported LLM model")
    args = parser.parse_args()

    model_path: str = ""
    if args.model_path != None:
        path = args.model_path
        model_path = str(pathlib.Path(path).resolve())
        exists = os.path.exists(model_path)
        if not exists:
            raise FileNotFoundError("Model does not exist at path: "+ model_path)

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
    # Upsert the result.jsonl data
    if args.model_path != None:
        # Run RAG with the dataset
        run_llm(args.model_path, vectorstore)
    else:
        upsert_data(collection)
    




def upsert_data(collection) -> None:
    # dataset_file_path = pathlib.Path("./result.jsonl")
    dataset_file_path = pathlib.Path("./result-D0038E.jsonl")
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


# from langchain.vectorstores.chroma import Chroma
def run_llm(model_path, vectorstore: Chroma):
    callback_manager = CallbackManager([StreamingStdOutCallbackHandler()])
    llm = LlamaCpp(
        model_path=model_path,
        # model_path="S:\models\llama-2-70b-chat.Q2_K.gguf",
        n_gpu_layers=43,
        n_batch=256,
        use_mmap=True,
        n_ctx=2048,
        f16_kv=True,  # MUST set to True, otherwise you will run into problem after a couple of calls
        callback_manager=callback_manager,
        # verbose=True,
    )
    llm.client.verbose = False

# You will be talking to a student taking the course D7032E. Use the following pieces of retrieved context to answer the question. 

# Course summary: The course will have an emphasis on selected topics from: Project planning and management, problem analysis,
# software management and interpretation, code complexity, API design, debugging and testing, configuration
# management, documentation, design patterns, build support and tools of the trade, packaging, release management
# and deployment, modeling and structuring of software, reuse, components, architectures, maintenance and
# documentation. The course includes a number of assignments, which are to be completed in groups, and that are
# evaluated in both written and oral form. Individual examination is given through tests and a home exam. 

#     prompt_str = """Human: You are an assistant for question-answering tasks.
# You will be talking to a student taking the AI course D0038E. Use the following pieces of retrieved context to answer the question. 
# If you don't know the answer, just say that you don't know. 
# Use ten sentences maximum and keep the answer concise. 
# Don't directly refer to the context text, pretend like you already knew the context information.

# Question: {question}

# Context: {context}

# Answer:"""

#     prompt_str = """Human: You are an assistant for question-answering tasks.
# If you don't know the answer, just say that you don't know. 
# Use ten sentences maximum and keep the answer concise. 
# Don't directly refer to the context text, pretend like you already knew the context information.

# Question: {question}

# Answer:"""

    # retriever = vectorstore.as_retriever(
    #     # search_type="similarity_score_threshold",
    #     # search_kwargs={'score_threshold': 0.5,'k':2}
    #     search_kwargs={'k':2, 'filter':{'course':'D0038E'}}
    # )

    prompt_str = """Human: You are an assistant for question-answering tasks.
You will be talking to a student taking the AI course D0038E. Use the following pieces of retrieved context to answer the question. 
If you don't know the answer, just say that you don't know. 
Use ten sentences maximum and keep the answer concise. 
Don't directly refer to the context text, pretend like you already knew the context information.

Question: {question}

Context: {context}

Answer:"""


    questions: list[str] = [
        "In lab 6 do we use boosting?",
        "Explain what we are doing in lab 6 task 1.",
        # "What is the course about?",
        # "Are there any SPRINT's?",
        # "Are you an AI model?"
        # "How many hidden units does P2NN have and how were they selected?",
        # "For SMLP, what were the test errors?"
    ]

    import langchain
    langchain.debug = False

    for question in questions:
        docs = vectorstore.similarity_search(question,filter={'course':'D0038E'})
        context = ""
        for doc in docs:
            context += doc.page_content
        resulting_prompt = prompt_str.format(question = question, context = context)
        print(f"############## Start")
        print(f"Question: {question}\n")

        print(f"Answer: ",end="")
        llm(resulting_prompt+"\n")
        print("\n")
        print(f"############## Finished\n\n")




if __name__ == "__main__":
    main()