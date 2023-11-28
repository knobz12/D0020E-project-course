import chromadb
from chromadb.config import Settings
from guidance.models._llama_cpp import LlamaCpp
from langchain.embeddings.sentence_transformer import SentenceTransformerEmbeddings
from langchain.vectorstores.chroma import Chroma
from modules.ai.utils.args import get_args

vectorstore: Chroma | None = None

def create_vectorstore() -> LlamaCpp:
    """Create instance of LLaMA 2 model with LlamaCpp API"""
    if vectorstore != None:
        return vectorstore

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
    return Chroma(embedding_function=embedding_function,client=client,collection_name=collection_name)
