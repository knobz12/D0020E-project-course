import chromadb
from chromadb import Collection, ClientAPI
from chromadb.config import Settings
from guidance.models import LlamaCpp
from langchain.embeddings.sentence_transformer import SentenceTransformerEmbeddings
# from langchain_community.vectorstores.chroma import Chroma

collection_name = "llama-2-papers"

client: ClientAPI | None = None
collection: Collection | None = None
# vectorstore: Chroma | None = None

def create_chroma_client() -> ClientAPI:
    """Create chromadb client"""
    global client
    if client != None:
        print("✅ Using cached client")
        return client

    #client = chromadb.Client(settings=Settings(allow_reset=True))
    #client = chromadb.PersistentClient("./chroma_data", settings=Settings(allow_reset=True))
    client = chromadb.HttpClient(host="localhost",settings=Settings(allow_reset=True))

    return client

def create_collection() -> Collection:
    """Create chromadb collection client"""
    global collection
    if collection != None:
        print("✅ Using cached collection")
        return collection

    client = create_chroma_client()

    try:
        collection = client.get_collection(collection_name)
    except Exception:
        print(f"Creating missing collection '{collection_name}'...")
        collection = client.create_collection(collection_name)
    
    return collection

# def create_vectorstore() -> Collection:
#     """Create vectorchain version of vectorstore with chromadb"""
#     global vectorstore
#     if vectorstore != None:
#         print("✅ Using vectorstore")
#         return vectorstore

#     client = create_chroma_client()
#     print("Creating embedding function")
#     embedding_function = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")

#     return Chroma(embedding_function=embedding_function,client=client,collection_name=collection_name)
