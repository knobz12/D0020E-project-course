import os
with open("/home/knobz/Documents/D0020E/D0020E-project-course/backendV2/secret.txt", "r") as file:
    api_key = file.read()
    print(api_key)
os.environ["OPENAI_API_KEY"] = api_key

from llama_index.llms import LlamaCPP, OpenAI
from llama_index.llms.llama_utils import messages_to_prompt, completion_to_prompt
from llama_index.node_parser import SimpleNodeParser
from llama_index.langchain_helpers.text_splitter import TokenTextSplitter
from llama_index.evaluation import DatasetGenerator, RelevancyEvaluator
#import torch Only to force cuda
#device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
from llama_index import (
    LLMPredictor,
    ServiceContext,
    StorageContext,
    set_global_service_context,
    SimpleDirectoryReader,
    VectorStoreIndex,
)


from modules.ai.utils.args import get_args
from guidance.models._llama_cpp import LlamaCpp
from llama_cpp import Llama
from langchain.llms.llamacpp import LlamaCpp as LangLlamaCpp

from llama_index.llms import *

llm: LangLlamaCpp = None
guid: LlamaCpp = None

llmi: LlamaCPP = None

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
    global llm

    if llm != None:
        return llm

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

def create_llm_index(api_key=None, openai=False) -> LlamaCPP | OpenAI:
    global llm
    if llm != None:
        return llm

    if openai:
        llmi = OpenAI(model="gpt-3.5-turbo", temperature=0, api_key=api_key)
        return llmi

    args = get_args()
    llm = LlamaCPP(
        model_path=args.model_path,
        max_new_tokens=2000,
        context_window=10000,
        generate_kwargs={},
        model_kwargs={"n_gpu_layers": args.gpu_layers, "use_mmap": True, "f16_kv": True},

        messages_to_prompt=messages_to_prompt,
        completion_to_prompt=completion_to_prompt,
        verbose=False
    )
    return llm
    
    """Create instance of LLaMA 2 model with LlamaCpp API"""
#service_context = ServiceContext.from_defaults(
#    chunk_size=512,
#    llm=llm,
#    embed_model='local'
#    )
#set_global_service_context(service_context)

#documents = SimpleDirectoryReader("/home/knobz/Documents/D0020E/D0020E-project-course/backend/tests/sample_files/Test_htmls").load_data()


"""data_generator = DatasetGenerator.from_documents(documents=documents, service_context=service_context)
eval_questions = data_generator.generate_questions_from_nodes()
print(eval_questions)"""

#index = VectorStoreIndex.from_documents(documents)
#query_engine = index.as_query_engine(streaming=True,similarity_top_k=3, service_context=service_context)
#query_engine = index.as_query_engine(streaming=True,similarity_top_k=3)
#response_stream = query_engine.query("Your job is to make quizzes. Make 5 quiz questions about the documents. Each question should have only 4 answer choices each and each new question can't have answers from previous questions, only new answers.Only one answer for each question should be correct. Mark which answers are correct and which answers are false. Give the output in json format.", LLMPredictor=test_llm)
#response_stream = query_engine.query("Pick out 10 keywords that are important across the documents. For each keyword write a short explaination. Give the output in json format")
#response_stream = query_engine.query("Vem sköt olof palme?")
#print(response_stream)
#response_stream.print_response_stream()
