from bs4 import BeautifulSoup
from modules.ai.summarizer import summarize_doc_stream
from modules.files.chunks import Chunkerizer
from modules.ai.quizer import create_quiz
from webserver.app import app
import os
from uuid import uuid4
import json
import datetime

from modules.ai.utils.llm import create_llm_guidance
from modules.files.hash_and_json.HashFunction import TextToHash
from modules.ai.utils.vectorstore import create_collection

from flask import Response, request, make_response, send_from_directory
from flask_caching import Cache

from werkzeug.datastructures import FileStorage
from chromadb import GetResult
import psycopg2
import jwt


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


def get_user_id() -> str | None:
    token = request.cookies.get("aisb.session-token")
    token = token.replace("'","\"")

    if token == None:
        return None

    token = jwt.decode(token, "123",algorithms=["HS256"])

    #encrypted_token = jwe.encrypt('Secret message', 'Token secret', algorithm='dir', encryption='A128GCM')
    #decrypted_token = jwe.decrypt(token 'asecret128bitkey')
    print("Token str:",token)
    if not "userId" in token:
        return None

    user_id = token["userId"]
    return user_id

def get_course_id_from_name(name: str) -> str:
    conn = psycopg2.connect(database="db",user="user",password="pass",host="127.0.0.1",port=5432)
    cur = conn.cursor()
    cur.execute("SELECT id FROM courses WHERE name=%s",(name,))
    courses = cur.fetchall()
    course_id = courses[0][0]
    conn.close()
    return course_id

@app.route("/api/quiz", methods=["POST"])
def quiz():
    if 'file' not in request.files:
        return make_response("Missing file", 406)
    
    file = request.files["file"]
    file_size = file.seek(0, os.SEEK_END)
    file.seek(0)
    print("File size:",file_size)

    if file_size <= 0:
        return make_response("Cannot send empty file! 😡", 406)

    course_query = request.args.get("course")
    if course_query == None:
        return make_response("Missing required course parameter", 400)

    course = course_query

    file_hash = Chunkerizer.upload_chunks_from_file_bytes(file.read(), file.name, course)
    if file_hash == None:
        return make_response("Bad file format", 406)
    
    query = request.args.get("questions")
    questions = 3

    if query != None:
        questions = int(query)

    print(f"Creating {questions} questions")


    conn = psycopg2.connect(database="db",user="user",password="pass",host="127.0.0.1",port=5432)
    course_id = get_course_id_from_name(course)
    quiz = create_quiz(file_hash, questions)

    print(quiz)
    print("Inserting quiz")
    user_id = get_user_id()
    if user_id:
        print("Found user:", user_id)
        print("Saving quiz")
        cur = conn.cursor()
        updated_at = datetime.datetime.today().strftime('%Y-%m-%d %H:%M:%S')
        print("Updated at:", updated_at)
        cur.execute("INSERT INTO quiz_prompts (id, updated_at, title, content, user_id, course_id) VALUES (%s, %s, %s, %s, %s, %s);", (str(uuid4()), updated_at, f"Quiz {updated_at}", json.dumps(quiz), user_id, course_id))
        conn.commit()

    conn.close()

    return app.response_class(quiz, mimetype='application/json',status=200)


@app.route("/api/summary", methods=["POST"])
def summary():
    if 'file' not in request.files:
        return make_response("Missing file", 406)
    
    file = request.files["file"]
    file_size = file.seek(0, os.SEEK_END)
    file.seek(0)
    print("File size:",file_size)

    if file_size <= 0:
        return make_response("Cannot send empty file! 😡", 406)

    course_query = request.args.get("course")
    if course_query == None:
        return make_response("Missing required course parameter", 400)

    course = course_query


    file_hash = Chunkerizer.upload_chunks_from_file_bytes(file.read(), file.name, course)
    if file_hash == None:
        return make_response("Bad file format", 406)

    course_id = get_course_id_from_name(course)
    user_id = get_user_id()

    def stream():
        summary = ""
        for chunk in summarize_doc_stream(file_hash):
            yield chunk
            summary += chunk

        if user_id == None:
            return

        conn = psycopg2.connect(database="db",user="user",password="pass",host="127.0.0.1",port=5432)
        cur = conn.cursor()
        updated_at = datetime.datetime.today().strftime('%Y-%m-%d %H:%M:%S')
        print("Updated at:", updated_at)
        cur.execute("INSERT INTO summary_prompts (id, updated_at, title, content, user_id, course_id) VALUES (%s, %s, %s, %s, %s, %s);", (str(uuid4()), updated_at, f"Summary {updated_at}", summary, user_id, course_id))
        conn.commit()
        conn.close()

        

    return app.response_class(stream(), mimetype='text/plain')


@app.route("/api/explanation", methods=["POST"])
def explanation():
    guid = create_llm_guidance()
    pass