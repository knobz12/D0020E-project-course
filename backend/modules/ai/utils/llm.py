import os

from modules.ai.utils.args import get_args
from guidance.models import LlamaCpp
from llama_cpp import Llama
from langchain.llms.llamacpp import LlamaCpp as LangLlamaCpp
from modules.ai.utils.vectorstore import create_chroma_client
from chromadb.config import Settings
import os, gc, sys, chromadb


""" from llama_index.llms import * """

# llm: LangLlamaCpp = None
guid: LlamaCpp | None = None
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
        n_ctx=args.ctx_size,
        f16_kv=True,  # MUST set to True, otherwise you will run into problem after a couple of calls
        max_tokens=args.max_tokens,
        temperature=args.temperature,
        top_k=40,
        top_p=1,
        repeat_penalty=1/0.85,
        verbose=args.verbose,
    )

    return llm

service_context = None

def create_service_context():
    global service_context
    if service_context != None:
        return service_context