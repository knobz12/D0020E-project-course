from bs4 import BeautifulSoup
from modules.ai.summarizer import summarize_doc_stream
from modules.files.chunks import Chunkerizer
from webserver.app import app

from modules.ai.utils.llm import create_llm_guidance
from modules.files.hash_and_json.HashFunction import TextToHash
from modules.ai.utils.vectorstore import create_collection

from flask import Response, request, make_response, send_from_directory
from flask_caching import Cache

cache = Cache(app,config={"CACHE_TYPE":"SimpleCache"})

@app.route("/static/<path:path>")
def static_serve(path: str):
    res = app.send_static_file(path)
    res.headers.set("cache-control","max-age: 60")
    return res

@app.route("/")
def home_page():
    return app.send_static_file("index.html")

@app.after_request
def add_cache_header(response: Response):
    url = request.url
    set_cache = url.endswith(".html") or url.endswith(".css")or url.endswith(".js") or url.endswith(".woff2")
    if set_cache:
        response.headers.set("cache-control","max-age: 60")

    return response

@app.route("/quiz")
def quiz_page():
    return app.send_static_file("quiz.html")

@app.route("/api/quiz", methods=["POST"])
def quiz():
    if 'file' not in request.files:
        return make_response("Missing file", 406)
    
    print("File:", request.files["file"].name)
    file_bytes: bytes = request.files["file"].read()
    file_str: str = file_bytes.decode("utf-8")

    soup = BeautifulSoup(file_str, features="html.parser")
    html_text = soup.get_text()
    hasher = TextToHash() 
    (file_hash, _) = hasher.ConvertToHash(html_text)
    collection = create_collection()
    docs = collection.get(where={"id":file_hash})

    if len(docs['ids']) > 0:
        from typing import Generator
        from modules.ai.utils.llm import create_llm

        def quiz_gen() -> Generator[str,None,None]:
            summary = ""
            for part in summarize_doc_stream(file_hash):
                summary += part
                print(part, end="")
                
            print("\n\n")
            # summary = "The text discusses several software engineering concepts related to architecture patterns and design principles that promote maintainability, scalability, resilience, and flexibility in developing applications. These include separating functions into distinct layers or components, using the Model-View-Controller (MVC) pattern for web application development, adopting microservices and event-driven architectures, utilizing lightweight mechanisms for communication between services, designing self-contained services, and creating reusable components that can be easily integrated into applications. These approaches allow developers to focus on implementing functionality in each component or layer without worrying about the details of other components or layers, making it easier to test, maintain, and scale individual components separately from the rest of the application. Additionally, these architecture patterns promote resilience by allowing individual components or services to fail independently without affecting the overall system. Overall, these concepts help ensure that applications are more flexible, adaptable, and scalable as new technologies emerge over time."
            llm = create_llm()
            prompt = f"""\
<|system|>
The user will provide you with a summary of a document.
Generate a quiz consisting of 5 quiz questions each with 4 answers, there can only be one correct answer.
Prefix the answers with ✅ and the wrong answers with ❌.
The quiz questions and answers must only be about topics in the document text and nothing else.
You MUST use the user given summary for the quiz questions and answers.
Seperate the questions with newlines.
<|user|>
{summary}
<|assistant|>
"""
            print("Prompt:")
            print(prompt+"\n\n")
            for chunk in llm.stream(prompt):
                yield chunk
        return app.response_class(quiz_gen(), mimetype='text/plain')

    c = Chunkerizer()
    chunks = c.make_chunk(html_text,512)
    print("chunks length",len(chunks))
    upload_chunks(file_hash,chunks)

    # print("chunks:",chunks)
    return app.response_class(summarize_doc_stream(file_hash), mimetype='text/plain')



def upload_chunks(file_hash: str, chunks: list[str]):
    collection = create_collection()
    ids: list[str] = []
    metadatas: list[dict] = []
    documents: list[str] = []

    for (i, data) in enumerate(chunks):
        print(f"Creating chunk {i}")
        doc_id = file_hash + str(i)
        ids.append(doc_id)
        doc = {
            "id":file_hash,
            "chunk-id": str(i),
            "course": "D7032E",
            "text":data,
        }
        metadatas.append(doc)
        documents.append(data)

    print(len(ids))
    for i in range(0,len(ids)):
        print(ids[i])
        print(metadatas[i])
        print()

    print(f"Uploading {len(ids)} doc chunks")
    collection.upsert(ids, metadatas=metadatas,documents=documents)

@app.route("/api/summary", methods=["POST"])
def summary():
    if 'file' not in request.files:
        return make_response("Missing file", 406)
    
    print("File:", request.files["file"].name)
    file_bytes: bytes = request.files["file"].read()
    file_str: str = file_bytes.decode("utf-8")

    soup = BeautifulSoup(file_str, features="html.parser")
    html_text = soup.get_text()
    hasher = TextToHash() 
    (file_hash, _) = hasher.ConvertToHash(html_text)
    collection = create_collection()
    docs = collection.get(where={"id":file_hash})

    if len(docs['ids']) > 0:
        return app.response_class(summarize_doc_stream(file_hash), mimetype='text/plain')

    c = Chunkerizer()
    chunks = c.make_chunk(html_text,512)
    print("chunks length",len(chunks))
    upload_chunks(file_hash,chunks)

    # print("chunks:",chunks)
    return app.response_class(summarize_doc_stream(file_hash), mimetype='text/plain')

@app.route("/api/explanation", methods=["POST"])
def explanation():
    guid = create_llm_guidance()
    pass