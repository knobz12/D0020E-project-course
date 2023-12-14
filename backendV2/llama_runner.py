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
    model_path="E:/models/zephyr-7b-beta.Q6_K.gguf",
    # optionally, you can set the path to a pre-downloaded model instead of model_url
    temperature=0,
    max_new_tokens=512,
    # llama2 has a context window of 4096 tokens, but we set it lower to allow for some wiggle room
    context_window=10000,
    # kwargs to pass to __call__()
    generate_kwargs={},
    # kwargs to pass to __init__()
    # set to at least 1 to use GPU
    model_kwargs={"n_gpu_layers": 33, "use_mmap": True, "f16_kv": True},
    # transform inputs into Llama2 format
    messages_to_prompt=messages_to_prompt,
    completion_to_prompt=completion_to_prompt,
    verbose=True
)

llm_predictor = LLMPredictor(llm=llm)

service_context = ServiceContext.from_defaults(
    chunk_size=512,
    llm=llm,
    # llm_predictor=llm_predictor,
    embed_model='local'
)
"""service_context = ServiceContext.from_defaults(
    chunk_size=512,
    llm="local"
)"""
set_global_service_context(service_context)

documents = SimpleDirectoryReader("./backend/tests/sample_files/Test_pdfs").load_data()
# print(documents)
# print(len(documents))
# print(documents[0])
# exit(0)

import fasttext
from huggingface_hub import hf_hub_download

model_path = hf_hub_download(repo_id="facebook/fasttext-language-identification", filename="model.bin")
model = fasttext.load_model(model_path)
good_labels = ["__label__swe_Latn", "__label__eng_Latn"]
from llama_index import Document
goods: list[Document] = []

for doc in documents:
    # print(doc)
    # print(type(doc))
    orig_text: str = doc.text
    text:str = doc.text
    text = text.replace("\n", "")
    if len(text) < 50:
        continue

    print("Checking:", text)
    prediction = model.predict(text, k=3)
    for pred in prediction:
        if good_labels.__contains__(pred[0]):
            goods.append(doc)
            print("Adding text")
            break

    print(prediction)
# model.predict("Hello, world!")
print("Using:",goods)
# exit(0)
#index = VectorStoreIndex.from_documents(documents)

qst = ("The questions should be regular quiz type questions where the question is about the theory. Don't make questions about files or properties of files.")
data_generator = DatasetGenerator.from_documents(question_gen_query=qst, documents=goods[0:5], service_context=service_context)
eval_questions = data_generator.generate_questions_from_nodes()
print(eval_questions)

#query_engine = index.as_query_engine(streaming=True, similarity_top_k=3)
#response_stream = query_engine.query("Your job is to make quizzes. Make 20 questions about Architectural Design Patterns. Each question should have only 4 answer choices each and each new question can't have answers from previous questions, only new answers. EVERY QUESTION HAS TO HAVE UNIQUE ANSWERS ONLY!!! Only one answer for each question should be correct. Mark which answers are correct and which answers are false. Give the output in json format.")
#response_stream.print_response_stream()