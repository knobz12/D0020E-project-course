from modules.ai.summarizer import summarize_doc_stream
from modules.ai.assignment import assignment_doc_stream
from modules.files.chunks import Chunkerizer
from modules.ai.quizer import create_quiz
from modules.ai.flashcards import create_flashcards
from modules.ai.explainerV2 import create_explaination
from modules.ai.title import create_title
from webserver.app import app
import os
from uuid import uuid4
import json
import datetime


from flask import Response, request, make_response, send_from_directory
from flask_caching import Cache
from flask_cors import cross_origin

import psycopg2
import jwt
from threading import Semaphore

# To assure the LLM only works on one prompt at a time
sem = Semaphore()

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

from flask import Response

def get_route_parameters() -> tuple[str, str] | Response:
    """
    Returns tuple where first element is file_hash (file id) and course id.
    Otherwise returns a response error which in return can be returned from a route return.
    """
    course_query = request.args.get("course")
    if course_query == None:
        return make_response("Missing required course parameter", 400)

    course = course_query
    file_id = request.form.get("file_id")

    if 'file' not in request.files and file_id == None:
        return make_response("Missing file and file id.", 406)

    def get_file_hash():
        if file_id != None:
            return file_id

        if 'file' not in request.files:
            return make_response("Missing file", 406)
        
        file = request.files["file"]
        file_size = file.seek(0, os.SEEK_END)
        file.seek(0)
        print("File size:",file_size)

        if file_size <= 0:
            return make_response("Cannot send empty file! 😡", 406)

        file_hash = Chunkerizer.upload_chunks_from_file_bytes(file.read(), file.filename, course)
        if file_hash == None:
            return make_response("Bad file format", 406)
        return file_hash
    
    file_hash = get_file_hash()
    course_id = get_course_id_from_name(course)
    return (file_hash, course_id)

@app.route("/api/quiz", methods=["POST"])
@cross_origin
def quiz():
    params = get_route_parameters()
    if not isinstance(params, tuple):
        return params
    (file_hash, course_id) = params

    query = request.args.get("questions")
    questions = 3

    if query != None:
        questions = int(query)

    conn = psycopg2.connect(database="db",user="user",password="pass",host="127.0.0.1",port=5432)
    sem.acquire(timeout=1000)
    quiz = create_quiz(file_hash, questions)
    sem.release()

    print(quiz)
    print("Inserting quiz")
    user_id = get_user_id()
    quiz_id = str(uuid4())
    if user_id:
        print("Found user:", user_id)
        print("Saving quiz")
        cur = conn.cursor()
        updated_at = datetime.datetime.today().strftime('%Y-%m-%d %H:%M:%S')
        print("Updated at:", updated_at)
        cur.execute("INSERT INTO prompts (id, updated_at, type, title, content, user_id, course_id) VALUES (%s, %s, %s, %s, %s, %s, %s);", (quiz_id, updated_at, "QUIZ", f"Quiz {updated_at}", quiz, user_id, course_id))
        conn.commit()

    conn.close()

    return app.response_class(quiz, mimetype='application/json',status=200)


@app.route("/api/flashcards", methods=["POST"])
@cross_origin()
def flashcards():
    params = get_route_parameters()
    if not isinstance(params, tuple):
        return params
    (file_hash, course_id) = params
    
    user_id = get_user_id()
    
    query = request.args.get("questions")
    flashcards_count = 3

    if query != None:
        flashcards_count = int(query)

    print(f"Creating {flashcards_count} flashcards")

    conn = psycopg2.connect(database="db",user="user",password="pass",host="127.0.0.1",port=5432)
    sem.acquire(timeout=1000)
    flashcards = create_flashcards(file_hash, flashcards_count)
    sem.release()

    print(flashcards)
    print("Inserting flashcards")
    user_id = get_user_id()
    content_id = str(uuid4())
    if user_id:
        print("Found user:", user_id)
        print("Saving flashcards")
        cur = conn.cursor()
        updated_at = datetime.datetime.today().strftime('%Y-%m-%d %H:%M:%S')
        print("Updated at:", updated_at)
        cur.execute("INSERT INTO prompts (id, updated_at, type, title, content, user_id, course_id) VALUES (%s, %s, %s, %s, %s, %s, %s);", (content_id, updated_at, "FLASHCARDS", f"Flashcards {updated_at}", flashcards, user_id, course_id))
        conn.commit()

    conn.close()

    return app.response_class(flashcards, mimetype='application/json',status=200)

@app.route("/api/summary", methods=["POST"])
@cross_origin()
def summary():
    params = get_route_parameters()
    if not isinstance(params, tuple):
        return params
    (file_hash, course_id) = params
    user_id = get_user_id()

    def stream():
        summary = ""
        sem.acquire(timeout=1000)
        for chunk in summarize_doc_stream(file_hash):
            yield chunk
            summary += chunk
        sem.release()

        if user_id == None:
            return

        conn = psycopg2.connect(database="db",user="user",password="pass",host="127.0.0.1",port=5432)
        cur = conn.cursor()
        updated_at = datetime.datetime.today().strftime('%Y-%m-%d %H:%M:%S')
        print("Updated at:", updated_at)
        cur.execute("INSERT INTO prompts (id, updated_at, type, title, content, user_id, course_id) VALUES (%s, %s, %s, %s, %s, %s, %s);", (str(uuid4()), updated_at, "SUMMARY", f"Summary {updated_at}", json.dumps({"text":summary}), user_id, course_id))
        conn.commit()
        conn.close()

        

    return app.response_class(stream(), mimetype='text/plain')


@app.route("/api/assignment", methods=["POST"])
@cross_origin()
def assignment():
    params = get_route_parameters()
    if not isinstance(params, tuple):
        return params
    (file_hash, course_id) = params
    user_id = get_user_id()

    def stream():
        assignment = ""
        sem.acquire(timeout=1000)
        for chunk in assignment_doc_stream(file_hash):
            yield chunk
            assignment += chunk
        sem.release()

        if user_id == None:
            return

        conn = psycopg2.connect(database="db",user="user",password="pass",host="127.0.0.1",port=5432)
        cur = conn.cursor()
        updated_at = datetime.datetime.today().strftime('%Y-%m-%d %H:%M:%S')
        print("Updated at:", updated_at)
        cur.execute("INSERT INTO prompts (id, updated_at, type, title, content, user_id, course_id) VALUES (%s, %s, %s, %s, %s, %s, %s);", (str(uuid4()), updated_at, "ASSIGNMENT", f"Assignment {updated_at}", json.dumps({"text":assignment}), user_id, course_id))
        conn.commit()
        conn.close()

        

    return app.response_class(stream(), mimetype='text/plain')

@app.route("/api/generate_title", methods=["POST"])
@cross_origin()
def generate_title():
    prompt_id = request.args.get("prompt_id")

    if prompt_id == None:
        return make_response("Missing prompt id", 400)




    conn = psycopg2.connect(database="db",user="user",password="pass",host="127.0.0.1",port=5432)
    cur = conn.cursor()

    cur.execute("SELECT content FROM prompts WHERE id=%s;", (prompt_id,))

    prompt = cur.fetchone()
    if prompt == None:
        conn.close()
        return make_response(f"Could not find prompt with id {prompt_id}", 400)



    content: str = (str(prompt[0]))[0:4096]
    title: str = create_title(content)

    cur.execute("UPDATE prompts SET title=%s WHERE id=%s;", (title, prompt_id))
    conn.commit()
    conn.close()

        

    return make_response(title, 200)

@app.route("/api/explainer", methods=["POST"])
@cross_origin()
def explanation():
    params = get_route_parameters()
    if not isinstance(params, tuple):
        return params
    (file_hash, course_id) = params


    if 'file' not in request.files:
        return make_response("Missing file", 406)
    
    file = request.files["file"]
    file_size = file.seek(0, os.SEEK_END)
    file.seek(0)
    print("File size:",file_size)

    if file_size <= 0:
        return make_response("Cannot send empty file! 😡", 406)

    course = request.args.get("course")
    if course == None:
        return make_response("Missing required course parameter", 400)

    course_id = get_course_id_from_name(course)
    user_id = get_user_id()

    query = [request.args.get("amount"), request.args.get("keywords")]
    print(request.args)
    amount = 10

    if query[0] != None:
        amount = int(query[0])
    custom_keywords = []
    if query[1] != None:
        custom_keywords = query[1].split(",")

    print(f"Creating {amount} keywords and explaining additional ones that are: {custom_keywords}")


    try:
        sem.acquire(timeout=1000)
        explanation = create_explaination(file_hash, amount, custom_keywords)
        sem.release()
    except:
        explanation = ""
    
    print(explanation)
    print("Inserting explaination")
    user_id = get_user_id()
    if user_id:
        print("Found user:", user_id)
        print("Saving explainations")
    
        """conn = psycopg2.connect(database="db",user="user",password="pass",host="127.0.0.1",port=5432)
        cur = conn.cursor()
        updated_at = datetime.datetime.today().strftime('%Y-%m-%d %H:%M:%S')
        print("Updated at:", updated_at)
        cur.execute("INSERT INTO prompts (id, updated_at, type, title, content, user_id, course_id) VALUES (%s, %s, %s, %s, %s, %s, %s);", (str(uuid4()), updated_at, "SUMMARY", f"Summary {updated_at}", json.dumps({"text":summary}), user_id, course_id))
        conn.commit()
        conn.close()"""

        

    return app.response_class(explanation, mimetype='application/json',status=200)