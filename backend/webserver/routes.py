from bs4 import BeautifulSoup
from modules.ai.summarizer import summarize_doc_stream
from modules.files.chunks import Chunkerizer
from modules.ai.quizer import create_quiz
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


from werkzeug.datastructures import FileStorage
from chromadb import GetResult
from modules.files.correct_chunks import TextSplit
def upsert_file(file: FileStorage) -> tuple[str, GetResult] | None:
    file_bytes: bytes = file.read()
    res = Chunkerizer.text_and_image_text_from_file_bytes(file_bytes, file.filename)

    if res == None:
        print("Chunky returned None")
        return None
    (_, text, __) = res

    hasher = TextToHash() 
    (file_hash, _) = hasher.ConvertToHash(text)
    collection = create_collection()
    docs = collection.get(where={"id":file_hash})

    if len(docs['ids']) > 0:
        return (file_hash, docs)

    # chunks = Chunkerizer.make_chunk(text,512)
    chunks = TextSplit(text, 512)
    print("chunks length",len(chunks))
    upload_chunks(file_hash,chunks)
    return (file_hash, collection.get(where={"id":file_hash}))

@app.route("/api/quiz", methods=["POST"])
def quiz():
    if 'file' not in request.files:
        return make_response("Missing file", 406)
    
    file = request.files["file"]
    result = upsert_file(file)

    if result == None:
        return make_response("Bad file format", 406)
    
    questions = int(request.args.get("questions"))
    print(f"Creating {questions} questions")
    (file_hash, _) = result

    return app.response_class(create_quiz(file_hash, questions), mimetype='text/plain')

@app.route("/api/summary", methods=["POST"])
def summary():
    if 'file' not in request.files:
        return make_response("Missing file", 406)
    
    file = request.files["file"]

    result = upsert_file(file)
    if result == None:
        return make_response("Bad file format", 406)

    (file_hash, _) = result

    return app.response_class(summarize_doc_stream(file_hash), mimetype='text/plain')

@app.route("/api/explanation", methods=["POST"])
def explanation():
    guid = create_llm_guidance()
    pass