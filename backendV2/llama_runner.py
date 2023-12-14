from llama_index.llms import LlamaCPP
from llama_index.llms.llama_utils import messages_to_prompt, completion_to_prompt
from llama_index.node_parser import SimpleNodeParser
from llama_index.langchain_helpers.text_splitter import TokenTextSplitter
import torch
from llama_index import (
    LLMPredictor,
    ServiceContext,
    StorageContext,
    set_global_service_context,
    SimpleDirectoryReader,
    VectorStoreIndex,
)
from llama_index.evaluation import DatasetGenerator, RelevancyEvaluator

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

llm = LlamaCPP(
    # You can pass in the URL to a GGML model to download it automatically
    model_path="/home/knobz/Documents/D0020E/D0020E-project-course/backend/models/default_.Q5_K_M.gguf",
    # optionally, you can set the path to a pre-downloaded model instead of model_url
    temperature=0,
    max_new_tokens=2000,
    # llama2 has a context window of 4096 tokens, but we set it lower to allow for some wiggle room
    context_window=10000,
    # kwargs to pass to __call__()
    generate_kwargs={},
    # kwargs to pass to __init__()
    # set to at least 1 to use GPU
    model_kwargs={"n_gpu_layers": 25, "use_mmap": True, "f16_kv": True},
    # transform inputs into Llama2 format
    messages_to_prompt=messages_to_prompt,
    completion_to_prompt=completion_to_prompt,
    verbose=True
)

#llm_predictor = LLMPredictor(llm=llm)

service_context = ServiceContext.from_defaults(
    chunk_size=512,
    llm=llm,
    #llm_predictor=llm_predictor,
    embed_model='local'
)
"""
service_context = ServiceContext.from_defaults(
    chunk_size=512,
    llm="local"
)"""
set_global_service_context(service_context)

documents = SimpleDirectoryReader("/home/knobz/Documents/D0020E/D0020E-project-course/backend/tests/sample_files/Test_pdfs").load_data()


"""data_generator = DatasetGenerator.from_documents(documents=documents, service_context=service_context)
eval_questions = data_generator.generate_questions_from_nodes()
print(eval_questions)"""

index = VectorStoreIndex.from_documents(documents)
query_engine = index.as_query_engine(streaming=True,similarity_top_k=3)
response_stream = query_engine.query("Your job is to make quizzes. Make 5 quiz questions about the documents. Each question should have only 4 answer choices each and each new question can't have answers from previous questions, only new answers.Only one answer for each question should be correct. Mark which answers are correct and which answers are false. Give the output in json format.")
response_stream.print_response_stream()