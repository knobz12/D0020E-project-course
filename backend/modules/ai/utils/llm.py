import os
"""
with open("/home/knobz/Documents/D0020E/D0020E-project-course/backendV2/secret.txt", "r") as file:
    api_key = file.read()
    print(api_key)
os.environ["OPENAI_API_KEY"] = api_key"""

from llama_index.llms import LlamaCPP, OpenAI
from llama_index.llms.llama_utils import messages_to_prompt, completion_to_prompt
from llama_index.node_parser import SimpleNodeParser
from llama_index.langchain_helpers.text_splitter import TokenTextSplitter
from llama_index.evaluation import DatasetGenerator, RelevancyEvaluator
from llama_index.vector_stores import ChromaVectorStore, VectorStoreQuery
from llama_index.query_engine import RetrieverQueryEngine
#import torch Only to force cuda
#device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
from llama_index import (
    LLMPredictor,
    ServiceContext,
    StorageContext,
    set_global_service_context,
    SimpleDirectoryReader,
    VectorStoreIndex,
    Document
)
from llama_index.vector_stores.types import (
    MetadataFilter,
    MetadataFilters,
    FilterOperator,
)


from modules.ai.utils.args import get_args
from guidance.models import LlamaCpp
from llama_cpp import Llama
from langchain.llms.llamacpp import LlamaCpp as LangLlamaCpp
from modules.ai.utils.vectorstore import create_chroma_client
from chromadb.config import Settings
import os, gc, sys, chromadb


""" from llama_index.llms import * """

# llm: LangLlamaCpp = None
guid: LlamaCpp = None
# llmi: LlamaCPP = None
openai: str = None

def create_llm_guidance() -> LlamaCpp:
    """Create instance of LLaMA 2 model for use with guidance"""

    global guid
    if guid != None:
        return guid

    print("Creating llm instance")
    args = get_args()
    llm = LlamaCpp(
        model=args.model_path,
        n_gpu_layers=args.gpu_layers,
        n_batch=512,
        use_mmap=True,
        n_ctx=2048,
        f16_kv=True,  # MUST set to True, otherwise you will run into problem after a couple of calls
        temperature=0,
        top_k=40,
        top_p=0.1,
        repeat_penalty=1.176,
        verbose=True,
        seed=-1
    )
    guid = llm

    return llm


def create_llm() -> LangLlamaCpp:
    """Create instance of LLaMA 2 model with LlamaCpp API"""
    # global llm

    # if llm != None:
    #     return llm

    args = get_args()
    llm = LangLlamaCpp(
        model_path=args.model_path,
        n_gpu_layers=args.gpu_layers,
        n_batch=512,
        use_mmap=True,
        n_ctx=2048,
        f16_kv=True,  # MUST set to True, otherwise you will run into problem after a couple of calls
        max_tokens=1000,
        temperature=0,
        top_k=40,
        top_p=1,
        repeat_penalty=1/0.85,
        verbose=True,
    )

    return llm

service_context = None

def create_service_context():
    global service_context
    if service_context != None:
        return service_context

def create_llm_index(api_key=None, **kwargs) -> LlamaCPP | OpenAI:
    # global llmi
    global openai

    # if 'openai' in kwargs:
    #     openai_kwarg = kwargs.get("openai")
    #     if openai_kwarg != openai:
    #         if openai is not None:
    #             del llmi
    #             gc.collect()
    #         openai = openai_kwarg
        
    #     print(openai is True)
    # if llmi != None:
    #     return llmi
    
    # if openai is True:
    #     llmi = OpenAI(model="gpt-3.5-turbo", temperature=0, api_key=api_key)
        
    # else:
    args = get_args()
    print("Loading model from path:",args.model_path)
    llmi = LlamaCPP(
        model_path=args.model_path,
        max_new_tokens=2000,
        context_window=10000,
        generate_kwargs={},
        model_kwargs={"n_gpu_layers": args.gpu_layers, "use_mmap": True, "f16_kv": True},
        verbose=True
    )

    # service_context = ServiceContext.from_defaults(
    #     chunk_size=1024,
    #     llm = llmi,
    #     embed_model="local:sentence-transformers/all-MiniLM-L6-v2"
    # )
    # set_global_service_context(service_context)
    return llmi

def create_llm_index_query_engine(id, llmi):
    service_context = ServiceContext.from_defaults(
        chunk_size=1024,
        llm=llmi,
        embed_model='local:sentence-transformers/all-MiniLM-L6-v2',
    )
    
    # set_global_service_context(service_context)

    filters = MetadataFilters(
    filters=[
        MetadataFilter(
            key="id", operator=FilterOperator.EQ, value=id, limit=100
        ),
    ]
)
    remote_db = chromadb.HttpClient(host="localhost",settings=Settings(allow_reset=True))
    collection = remote_db.get_or_create_collection("llama-2-papers")
    
    vector_store = ChromaVectorStore(chroma_collection=collection)
    index = VectorStoreIndex.from_vector_store(vector_store=vector_store,service_context=service_context)
    retriever = index.as_retriever(filters=filters)
    query_engine = RetrieverQueryEngine.from_args(retriever, streaming=False, similarity_top_k=3,service_context=service_context)

    return query_engine