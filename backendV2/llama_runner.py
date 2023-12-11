from llama_cpp import Llama, ChatCompletionMessage
from llama_index.llms import LlamaCPP
from llama_index.llms.llama_utils import messages_to_prompt, completion_to_prompt
from llama_index.node_parser import SimpleNodeParser
from llama_index.langchain_helpers.text_splitter import TokenTextSplitter
from llama_index import (
    GPTVectorStoreIndex,
    LLMPredictor,
    ServiceContext,
    StorageContext,
    set_global_service_context,
    SimpleDirectoryReader,
    VectorStoreIndex,
    get_response_synthesizer,
)

llm = LlamaCPP(
    # You can pass in the URL to a GGML model to download it automatically
    model_path="/home/knobz/Documents/D0020E/D0020E-project-course/backend/models/default_.Q5_K_M.gguf",
    # optionally, you can set the path to a pre-downloaded model instead of model_url
    temperature=0.1,
    max_new_tokens=256,
    # llama2 has a context window of 4096 tokens, but we set it lower to allow for some wiggle room
    context_window=3900,
    # kwargs to pass to __call__()
    generate_kwargs={},
    # kwargs to pass to __init__()
    # set to at least 1 to use GPU
    model_kwargs={"n_gpu_layers": 20},
    # transform inputs into Llama2 format
    messages_to_prompt=messages_to_prompt,
    completion_to_prompt=completion_to_prompt,
    verbose=True
)

llm_predictor = LLMPredictor(llm=llm)

service_context = ServiceContext.from_defaults(
    chunk_size=1024,
    llm_predictor=llm_predictor,
    embed_model='local'
)
set_global_service_context(service_context)

documents = SimpleDirectoryReader("/home/knobz/Documents/D0020E/D0020E-project-course/backend/tests/sample_files/Test_pdfs").load_data()
index = VectorStoreIndex.from_documents(documents)
query_engine = index.as_query_engine(streaming=True, similarity_top_k=3)
response_stream = query_engine.query("Make 5 questions about Architectural Design Patterns")
response_stream.print_response_stream()