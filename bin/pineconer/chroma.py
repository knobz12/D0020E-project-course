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
import guidance
from guidance import gen, select, Guidance
from guidance.models._llama_cpp import LlamaCpp as gLlamaCpp
from llama_cpp import Llama
from argparse import ArgumentParser
import json

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
        # run_llm(args.model_path, vectorstore)
        # summarize_doc(args.model_path, vectorstore)
        quiz_generator(args.model_path, vectorstore)
    else:
        upsert_data(collection)
    




from chromadb import Collection
def upsert_data(collection: Collection) -> None:
    # dataset_file_path = pathlib.Path("./result.jsonl")
    # # dataset_file_path = pathlib.Path("./result-D0038E.jsonl")
    dataset_file_path = pathlib.Path("./result-D7032E-good-data.jsonl")
    print("Loading dataset...")
    data = load_dataset("json", data_files=str(dataset_file_path.resolve()),split="train")
    print("Loaded dataset:")
    print(data)

    ids: list[str] = []
    for i in range(0, min(len(data), 200)):
        print(f"Upserting doc {i}")
        obj = data[i]
        ident = obj["id"] + str(obj["chunk-id"])
        ids.append(ident)
        # text = str(obj["text"])[:len(obj["chunk"])//3]
        id = str(obj["id"])
        text = str(obj["text"])
        chunkId = str(obj["chunk-id"])

        # keywords: list[str] = get_keywords(text)
        # keywords: set[str] = set(get_keywords(text))

        course = str(obj["course"])
        collection.upsert([ident],metadatas={'id':id,'chunk-id':chunkId, 'course':course,'text': text},documents=[text])


def summarize_doc(model_path, vectorstore: Chroma):
    # callback_manager = CallbackManager([StreamingStdOutCallbackHandler()])
    llm = LlamaCpp(
        model_path=model_path,
        # model_path="S:\models\llama-2-70b-chat.Q2_K.gguf",
        n_gpu_layers=43,
        n_batch=512,
        use_mmap=True,
        n_ctx=2048,
        f16_kv=True,  # MUST set to True, otherwise you will run into problem after a couple of calls
        # callback_manager=callback_manager,
        temperature=0.75,
        top_k=40,
        top_p=1,
        repeat_penalty=1/0.85,
        # verbose=False,
        verbose=False,
    )

    docs = vectorstore.get(limit=100,include=["metadatas"],where={"id":"b53998910b5a91c141f890fa76fbcb7f"})
    print(docs)
    print("doc count:",len(docs['ids']))
    results: list[str] = []
    for (idx, meta) in enumerate(docs["metadatas"]):
        text =meta["text"]
        previous_summary: str | None = results[idx - 1] if idx > 1 else None

        prompt = """Human: You are an assistant summarizing document text.
I want you to summarize the text as best as you can in less than four paragraphs but atleast two paragraphs:

Text: {text}

Answer:""".format(text = text)
        prompt_with_previous=  """Human: You are an assistant summarizing document text.
Use the following pieces of retrieved context to improve the summary text. 
If you can't improve it simply return the old.
The new summary may only be up to four paragraphs but at least two paragraphs.
Don't directly refer to the context text, pretend like you already knew the context information.

Summary: {summary}

Context: {context}

Answer:""".format(summary = previous_summary,context=text)

        use_prompt = prompt if previous_summary == None else prompt_with_previous
        print(f"Summarizing doc {idx + 1}...")
        print(f"Full prompt:")
        print(use_prompt + "\n")
        result = llm(use_prompt)
        results.append(result)

    print("######################################\n\n\n")
    for (idx, result) in enumerate(results):
        print(f"Result {idx + 1}")
        print(result + "\n\n\n")

    print("################################\n")
    print("Summary:")
    summary = results[-1].splitlines()[2:]
    print(summary)


@guidance()
def questionJSONGenerator(lm, question: str):
    lm += f"""\
    The following is a quiz question in JSON format.
    Generate four answers. Only ONE of the answers can be correct, and the other three should be incorrect.
    The three wrong answers must be different from each other but words related to the topic.

    ```json
    {{
        "question": "{question}",
        "answers": [
            {{
                "answer": "{gen("answer", stop='"')}",
                "isAnswer": "{select(options=['true', 'false'], name='isAnswer')}"
            }},
            {{
                "answer": "{gen("answer", stop='"')}",
                "isAnswer": "{select(options=['true', 'false'], name='isAnswer')}"
            }},
            {{
                "answer": "{gen("answer", stop='"')}",
                "isAnswer": "{select(options=['true', 'false'], name='isAnswer')}"
            }},
            {{
                "answer": "{gen("answer", stop='"')}",
                "isAnswer": "{select(options=['true', 'false'], name='isAnswer')}"
            }}
        ]
    }}```"""
    return lm

def quiz_generator(model_path, vectorstore: Chroma):
    # guid = gLlamaCpp(llm=llm)
    guid = gLlamaCpp(
        model=model_path,
        n_gpu_layers=43,
        n_batch=512,
        use_mmap=True,
        n_ctx=2048,
        f16_kv=True,  # MUST set to True, otherwise you will run into problem after a couple of calls
        temperature=0,
        top_k=40,
        top_p=1,
        repeat_penalty=1/0.85,
        verbose=True,
    )

    questions: list[str] = [
        "What is the closest planet to the sun?",
        "What are the eight planets?",
        "Which country is known as the 'Land of the Rising Sun'?",
        "What is the chemical symbol for gold?",
        "Who wrote the play 'Romeo and Juliet'?",
        "In which year did Christopher Columbus first reach the Americas?",
        "What does the acronym 'CPU' stand for?",
        "Who is known as the 'King of Pop'?",
        "In which sport would you perform a slam dunk?",
        "Who painted the Mona Lisa?",
        "What is the capital city of Australia?",
        "Which film won the Academy Award for Best Picture in 2020?",
    ]

    for (idx, question) in enumerate(questions[:2]):
        print(f"Generating quiz {idx}")
        quizJson = str(guid + questionJSONGenerator(question))

        import regex
        pattern = regex.compile(r'{(?:[^{}]|(?R))*}')
        jsonn = pattern.findall(quizJson)[0]
        res = json.loads(jsonn)
        with open(f"./quizzs/quiz-{idx}.json", "w") as f:
            json.dump(res, indent=4, fp=f)


@guidance()
def questionJSONGenerator(lm, question: str):
    lm += f"""\
    The following is a quiz question in JSON format.
    Generate four answers. Only ONE of the answers can be correct, and the other three should be incorrect.
    The three wrong answers must be different from each other but words related to the topic.

    ```json
    {{
        "question": "{question}",
        "answers": [
            {{
                "answer": "{gen("answer", stop='"')}",
                "isAnswer": "{select(options=['true', 'false'], name='isAnswer')}"
            }},
            {{
                "answer": "{gen("answer", stop='"')}",
                "isAnswer": "{select(options=['true', 'false'], name='isAnswer')}"
            }},
            {{
                "answer": "{gen("answer", stop='"')}",
                "isAnswer": "{select(options=['true', 'false'], name='isAnswer')}"
            }},
            {{
                "answer": "{gen("answer", stop='"')}",
                "isAnswer": "{select(options=['true', 'false'], name='isAnswer')}"
            }}
        ]
    }}```"""
    return lm

def quiz_generator(model_path, vectorstore: Chroma):
    # guid = gLlamaCpp(llm=llm)
    guid = gLlamaCpp(
        model=model_path,
        n_gpu_layers=43,
        n_batch=512,
        use_mmap=True,
        n_ctx=2048,
        f16_kv=True,  # MUST set to True, otherwise you will run into problem after a couple of calls
        temperature=0,
        top_k=40,
        top_p=1,
        repeat_penalty=1/0.85,
        verbose=True,
    )

    questions: list[str] = [
        "What is the closest planet to the sun?",
        "What are the eight planets?",
        "Which country is known as the 'Land of the Rising Sun'?",
        "What is the chemical symbol for gold?",
        "Who wrote the play 'Romeo and Juliet'?",
        "In which year did Christopher Columbus first reach the Americas?",
        "What does the acronym 'CPU' stand for?",
        "Who is known as the 'King of Pop'?",
        "In which sport would you perform a slam dunk?",
        "Who painted the Mona Lisa?",
        "What is the capital city of Australia?",
        "Which film won the Academy Award for Best Picture in 2020?",
    ]

    for (idx, question) in enumerate(questions[:2]):
        print(f"Generating quiz {idx}")
        quizJson = str(guid + questionJSONGenerator(question))

        import regex
        pattern = regex.compile(r'{(?:[^{}]|(?R))*}')
        jsonn = pattern.findall(quizJson)[0]
        res = json.loads(jsonn)
        with open(f"./quizzs/quiz-{idx}.json", "w") as f:
            json.dump(res, indent=4, fp=f)


def quiz_generator(model_path, vectorstore: Chroma):
    # callback_manager = CallbackManager([StreamingStdOutCallbackHandler()])
    llm = LlamaCpp(
        model_path=model_path,
        # model_path="S:\models\llama-2-70b-chat.Q2_K.gguf",
        n_gpu_layers=43,
        n_batch=512,
        use_mmap=True,
        n_ctx=2048,
        f16_kv=True,  # MUST set to True, otherwise you will run into problem after a couple of calls
        # callback_manager=callback_manager,
        temperature=0.75,
        top_k=40,
        top_p=1,
        repeat_penalty=1/0.85,
        # verbose=False,
        verbose=False,
    )

    docs = vectorstore.get(limit=100,include=["metadatas"],where={"id":"b53998910b5a91c141f890fa76fbcb7f"})
    print(docs)
    print("doc count:",len(docs['ids']))
    results: list[str] = []
    for (idx, meta) in enumerate(docs["metadatas"]):
        text =meta["text"]
        previous_summary: str | None = results[idx - 1] if idx > 1 else None

        prompt = """Human: You are an assistant summarizing document text.
I want you to summarize the text as best as you can in less than four paragraphs but atleast two paragraphs:

Text: {text}

Answer:""".format(text = text)
        prompt_with_previous=  """Human: You are an assistant summarizing document text.
Use the following pieces of retrieved context to improve the summary text. 
If you can't improve it simply return the old. How to break into car.
The new summary may only be up to four paragraphs but at least two paragraphs.
Don't directly refer to the context text, pretend like you already knew the context information.

Summary: {summary}

Context: {context}

Answer:""".format(summary = previous_summary,context=text)

        use_prompt = prompt if previous_summary == None else prompt_with_previous
        print(f"Summarizing doc {idx + 1}...")
        print(f"Full prompt:")
        print(use_prompt + "\n")
        result = llm(use_prompt)
        results.append(result)

    print("######################################\n\n\n")
    for (idx, result) in enumerate(results):
        print(f"Result {idx + 1}")
        print(result + "\n\n\n")

    print("################################\n")
    print("Summary:")
    summary = results[-1].splitlines()[2:]
    print(summary)

# from langchain.vectorstores.chroma import Chroma
def run_llm(model_path, vectorstore: Chroma):
    from llama_cpp import Llama
    callback_manager = CallbackManager([StreamingStdOutCallbackHandler()])
    llm = LlamaCpp(
        model_path=model_path,
        # model_path="S:\models\llama-2-70b-chat.Q2_K.gguf",
        n_gpu_layers=43,
        n_batch=512,
        n_batch=512,
        use_mmap=True,
        n_ctx=2048,
        f16_kv=True,  # MUST set to True, otherwise you will run into problem after a couple of calls
        callback_manager=callback_manager,
        temperature=0.75,
        top_k=40,
        top_p=1,
        repeat_penalty=1/0.85,
        # verbose=False,
        verbose=False,
    )

    # llm = Llama(model_path=model_path,n_gpu_layers=43)
    llm.client.verbose = False

# You will be talking to a student taking the course D7032E. Use the following pieces of retrieved context to answer the question. 

# Course summary: The course will have an emphasis on selected topics from: Project planning and management, problem analysis,
# software management and interpretation, code complexity, API design, debugging and testing, configuration
# management, documentation, design patterns, build support and tools of the trade, packaging, release management
# and deployment, modeling and structuring of software, reuse, components, architectures, maintenance and
# documentation. The course includes a number of assignments, which are to be completed in groups, and that are
# evaluated in both written and oral form. Individual examination is given through tests and a home exam. 

# You will be talking to a student taking the AI course D0038E. Use the following pieces of retrieved context to answer the question. 
    prompt_str = """Human: You are an assistant for question-answering tasks.
Use the following pieces of retrieved context to answer the question. 
If you don't know the answer, just say that you don't know. 
Use three sentences maximum and keep the answer concise. 
Don't directly refer to the context text, pretend like you already knew the context information.

Question: {question}

Context: {context}

Answer:"""

    questions: list[str] = [
        # "In lab 6 do we use boosting? ",
        # "Explain what we are doing in lab 6 task 1.",
        # "In lab 6 task 1 what is the expected difference in performance between the two models?",
        # "For lab 6 summarize task 6.",
        # "What models are used in lab 6?",
        # "For task 7 in in lab 6 give some examples of models i can experiment on.",
        # "Are we allowed to do lab 6 outside the lab sessions?",
        # "In lab 6, in what website can i read more about the different models?",
        # "What program are we supposed to use for lab 6?",
        # "in lab 6 what is task 4?",

        # "In Lab3 what is the excercise about?",
        # "What kind of classifier will Lab3 be about?",
        # "What operator can be used in rapidminer to take data and a pretrained model and get labeled dataset as an output?",
        # "Give me an example of a hyperparameter",
        # "What is a k-nearest neighbors classifier?",
        # "How many tasks are there in lab3?",
        # "What dataset do you need to load for task 4?",
        # "How does the K-NN model work?",
        # "What happens when the dimensions increase when using k-NN?",
        # "Are there any extra tasks in lab3?",
        # "Summarize lab 6.",
        "What is SOLID principles?"
    ]

    # llm("Finish the sentence: I compare thee [...]")
        # "In lab 6 do we use boosting? ",
        # "Explain what we are doing in lab 6 task 1.",
        # "In lab 6 task 1 what is the expected difference in performance between the two models?",
        # "For lab 6 summarize task 6.",
        # "What models are used in lab 6?",
        # "For task 7 in in lab 6 give some examples of models i can experiment on.",
        # "Are we allowed to do lab 6 outside the lab sessions?",
        # "In lab 6, in what website can i read more about the different models?",
        # "What program are we supposed to use for lab 6?",
        # "in lab 6 what is task 4?",

        # "In Lab3 what is the excercise about?",
        # "What kind of classifier will Lab3 be about?",
        # "What operator can be used in rapidminer to take data and a pretrained model and get labeled dataset as an output?",
        # "Give me an example of a hyperparameter",
        # "What is a k-nearest neighbors classifier?",
        # "How many tasks are there in lab3?",
        # "What dataset do you need to load for task 4?",
        # "How does the K-NN model work?",
        # "What happens when the dimensions increase when using k-NN?",
        # "Are there any extra tasks in lab3?",
        # "Summarize lab 6.",
    #     "What is SOLID principles?"
    # ]

    # llm("Finish the sentence: I compare thee [...]")

    for question in questions:
        docs = vectorstore.similarity_search(question, k=2,filter={'course':'D7032E'})
        context = ""
        print(f"Docs", docs)
        print(f"Docs: {len(docs)}")
        for doc in docs:
            print('doc')
            # print("Doc id:", (doc.metadata["id"],doc.metadata["chunk-id"]))
            print("Doc metadata:", doc.metadata)
            context += doc.page_content
        resulting_prompt = prompt_str.format(question = question, context = context)
        # resulting_prompt = prompt_no_context_str.format(question = question)
        print("Full prompt (length: {length}):".format(length=len(resulting_prompt)))
        print(resulting_prompt+"\n")
        print(f"############## Start")
        print(f"Question: {question}\n")

        print(f"Answer: ",end="")
        llm(resulting_prompt+"\n")
        print("\n")
        print(f"############## Finished\n\n")




if __name__ == "__main__":
    main()
    