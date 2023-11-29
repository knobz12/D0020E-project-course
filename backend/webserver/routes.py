from bs4 import BeautifulSoup
from modules.ai.summarizer import summarize_doc_stream
from modules.files.chunks import chunkerizer
from webserver.app import app

from modules.ai.utils.llm import create_llm_guidance
# from modules.ai.quizer import create_quiz_stream
from modules.files.hash_and_json.HashFunction import TextToHash
from modules.ai.utils.vectorstore import create_collection

from flask import request, make_response

@app.route("/api/quiz", methods=["POST"])
def quiz():
    if 'file' not in request.files:
        return make_response("Missing file", 406)
    
    print(request.files["file"])
    filebytes = request.files["file"].read()
    print("File:", filebytes)

    ### QUIZ
    # Generate questions from chunks
    # Generate quiz from chunks

    ### SUMMARY
    # Generate quiz from chunks

    ### EXPLANATION
    # Generate questions from chunks
    # Generate quiz from chunks

    # 1. Get hash of file
    # 2. Check if file is in vector database.
    # If exists
    # 3. Generate quiz from existing file chunks
    # else
    # 3. Generate chunks from quiz and upsert
    # 4. Generate quiz from chunks

    return make_response("hel",200)

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

    c = chunkerizer()
    chunks = c.make_chunk(html_text,512)
    print("chunks length",len(chunks))
    upload_chunks(file_hash,chunks)

    # print("chunks:",chunks)
    return app.response_class(summarize_doc_stream(file_hash), mimetype='text/plain')

@app.route("/api/explanation", methods=["POST"])
def explanation():
    guid = create_llm_guidance()
    pass