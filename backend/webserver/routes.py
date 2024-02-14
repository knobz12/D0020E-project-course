# from modules.ai.summarizer import summarize_doc_stream_old
from modules.ai.utils.args import get_args
from modules.ai.summarizer import summarize_doc_stream_index, summarize_doc_stream_old
from modules.ai.assignment import assignment_doc_stream
from modules.files.chunks import Chunkerizer
from modules.ai.quizer import create_quiz
from modules.ai.flashcards import create_flashcards
from modules.ai.explainer import create_explaination
from modules.ai.title import create_title, create_title_index
from webserver.app import app
import os
from uuid import uuid4
import json
import datetime
from jose.jwe import decrypt

from modules.ai.utils.llm import create_llm_guidance, create_llm_index
from modules.ai.utils.vectorstore import create_collection
from llama_index import VectorStoreIndex, ServiceContext
from llama_index.vector_stores import ChromaVectorStore
from llama_index.vector_stores import ChromaVectorStore
from llama_index.memory import ChatMemoryBuffer
from llama_index.agent.react import ReActAgent
from llama_index.tools import QueryEngineTool, ToolMetadata

from flask import Response, request, make_response
from flask_caching import Cache
from flask_cors import cross_origin

import psycopg_pool
import jwt
from threading import Semaphore

import time

# To assure the LLM only works on one prompt at a time
sem = Semaphore()
import modules
modules.sem = sem

args = get_args()

cache = Cache(app,config={"CACHE_TYPE":"SimpleCache"})


conninfo = f'dbname=db user=user password=pass host={args.db_host} port=5432'
connection_pool: psycopg_pool.ConnectionPool = psycopg_pool.ConnectionPool(conninfo, open=True)


@app.route("/api/health")
def health():
    return make_response("Healthy", 200)

def get_user_id() -> str | None:
    token = request.cookies.get("aisb.session-token")
    print("User token:",token)

    if token == None:
        return None

    token = token.replace("'","\"")
    token = jwt.decode(token, "123",algorithms=["HS256"])

    #encrypted_token = jwe.encrypt('Secret message', 'Token secret', algorithm='dir', encryption='A128GCM')
    #decrypted_token = jwe.decrypt(token 'asecret128bitkey')
    print("Token str:",token)
    if not "userId" in token:
        return None

    user_id = token["userId"]
    return user_id

def get_course_id_from_name(name: str) -> str:
    
    course_id = None
    with connection_pool.connection() as conn:
        cur = conn.cursor()
        cur.execute("SELECT id FROM courses WHERE name=%s",(name,))
        courses = cur.fetchall()
        course_id = courses[0][0]
    return course_id

def get_user_openai_enabled(user_id: str) -> tuple[bool, str] | None:
    """
    Returns tuple where first element is if OpenAI is enabled and second argument is their OpenAI API key.
    Returns null if user not found or invalid API key.
    """
    users = None
    with connection_pool.connection() as conn:
        cur = conn.cursor()
        cur.execute("SELECT enabled, api_key FROM open_ai WHERE user_id=%s",(user_id,))
        users = cur.fetchall()

    print(users)
    if len(users) != 1:
        return None

    val: tuple[bool, str | None] = users[0]

    if val[1] == None:
        return val

    SECRET = os.getenv("JWE_SECRET")
    PEPPER = os.getenv("JWE_PEPPER")
    print("SECRET:",SECRET)
    print("PEPPER:",PEPPER)

    if SECRET == None or PEPPER == None:
        raise Exception("Missing JWE_SECRET or JWE_PEPPER env")

    key = ""
    try: 
        plain = str(decrypt(val[1],SECRET))
        key = plain.replace(PEPPER, "")
    except:
        return None
    result = (val[0], key)
    print(result)

    return result

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

    def get_file_hash() -> str | Response:
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

    if not isinstance(file_hash, str):
        return file_hash

    course_id = get_course_id_from_name(course)
    return (file_hash, course_id)

@app.route("/api/quiz", methods=["POST"])
def quiz():
    sem.acquire(timeout=1000)
    params = get_route_parameters()
    if not isinstance(params, tuple):
        return params
    (file_hash, course_id) = params

    user_id = get_user_id()
    if user_id == None:
        return app.response_class("Sign in", mimetype='text/plain',status=401)

    query = request.args.get("questions")
    questions = 3

    if query != None:
        questions = int(query)

    before = time.time()
    quiz = create_quiz(file_hash, questions)
    duration = time.time() - before
    print(quiz)
    print("Inserting quiz")
    quiz_id = str(uuid4())


    with connection_pool.connection() as conn:
        print("Found user:", user_id)
        print("Saving quiz")
        cur = conn.cursor()
        updated_at = datetime.datetime.today().strftime('%Y-%m-%d %H:%M:%S')
        print("Updated at:", updated_at)
        cur.execute("INSERT INTO prompts (id, updated_at, type, title, content, user_id, course_id, prompt_creation_time) VALUES (%s, %s, %s, %s, %s, %s, %s, %s);", (quiz_id, updated_at, "QUIZ", f"Quiz {updated_at}", quiz, user_id, course_id, duration))
    sem.release()
    return app.response_class(quiz, mimetype='application/json',status=200)


@app.route("/api/flashcards", methods=["POST"])
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

    with connection_pool.connection() as conn:
        sem.acquire(timeout=1000)
        before = time.time()
        flashcards = create_flashcards(file_hash, flashcards_count)
        duration = time.time() - before
        print(duration)
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
            cur.execute("INSERT INTO prompts (id, updated_at, type, title, content, user_id, course_id, prompt_creation_time) VALUES (%s, %s, %s, %s, %s, %s, %s, %s);", (content_id, updated_at, "FLASHCARDS", f"Flashcards {updated_at}", flashcards, user_id, course_id, duration))


    return app.response_class(flashcards, mimetype='application/json',status=200)

modules.user_id = None
modules.user_canceled = False

@app.route("/api/cancel", methods=["POST"])
def cancel():
    user_id = get_user_id()

    print("Checking user id before cancel", user_id)
    if user_id == None:
        return make_response("Log in first", 401)

    if user_id != modules.user_id:
        return make_response("You can't cancel others request", 401)
    # session_token =request.cookies.get("aisb.session-token")
    # print(session_token)

    # user_id = request.args.get("user_id")
    # print("User id:",user_id)
    modules.user_canceled = True
    return make_response("Great success", 200)
    

@app.route("/api/summary", methods=["POST"])
def summary():
    params = get_route_parameters()

    if not isinstance(params, tuple):
        return params

    (file_hash, course_id) = params
    user_id = get_user_id()
    if user_id == None:
        return make_response("Log in first", 401)

    def stream():
        summary = ""
        sem.acquire(timeout=1000)
        # for chunk in summarize_doc_stream_old(file_hash):
        print("CHUNKING")
        before = time.time()
        for chunk in summarize_doc_stream_old(file_hash):
            yield chunk
            summary += chunk
        duration = time.time() - before
        sem.release()

        if user_id == None:
            return

        with connection_pool.connection() as conn:
            cur = conn.cursor()
            updated_at = datetime.datetime.today().strftime('%Y-%m-%d %H:%M:%S')
            print("Updated at:", updated_at)
            cur.execute("INSERT INTO prompts (id, updated_at, type, title, content, user_id, course_id, prompt_creation_time) VALUES (%s, %s, %s, %s, %s, %s, %s, %s);", (str(uuid4()), updated_at, "SUMMARY", f"Summary {updated_at}", json.dumps({"text":summary}), user_id, course_id, duration))

        

    return app.response_class(stream(), mimetype='text/plain')


@app.route("/api/assignment", methods=["POST"])
def assignment():
    params = get_route_parameters()
    if not isinstance(params, tuple):
        return params
    (file_hash, course_id) = params
    user_id = get_user_id()

    def stream():
        assignment = ""
        sem.acquire(timeout=1000)
        before = time.time()
        for chunk in assignment_doc_stream(file_hash):
            yield chunk
            assignment += chunk
        duration = time.time() - before
        sem.release()

        if user_id == None:
            return

        with connection_pool.connection() as conn:
            cur = conn.cursor()
            updated_at = datetime.datetime.today().strftime('%Y-%m-%d %H:%M:%S')
            print("Updated at:", updated_at)
            cur.execute("INSERT INTO prompts (id, updated_at, type, title, content, user_id, course_id, prompt_creation_time) VALUES (%s, %s, %s, %s, %s, %s, %s, %s);", (str(uuid4()), updated_at, "ASSIGNMENT", f"Assignment {updated_at}", json.dumps({"text":assignment}), user_id, course_id, duration))

        

    return app.response_class(stream(), mimetype='text/plain')

@app.route("/api/generate_title", methods=["POST"])
def generate_title():
    user_id = get_user_id()
    if user_id == None:
        return make_response("You must be logged in.", 401)

    prompt_id = request.args.get("prompt_id")

    if prompt_id == None:
        return make_response("Missing prompt id", 400)

    with connection_pool.connection() as conn:
        cur = conn.cursor()

        cur.execute("SELECT content FROM prompts WHERE id=%s;", (prompt_id,))

        prompt = cur.fetchone()
        if prompt == None:
            return make_response(f"Could not find prompt with id {prompt_id}", 400)



        content: str = (str(prompt[0]))[0:1024]
        title: str = create_title(content)
        # title: str = create_title_index(content) + " " + str(datetime.datetime.today().strftime('%Y-%m-%d %H:%M:%S'))

        cur.execute("UPDATE prompts SET title=%s WHERE id=%s;", (title, prompt_id))

        

    return make_response(title, 200)

@app.route("/api/explainer", methods=["POST"])
def explanation():
    params = get_route_parameters()
    if not isinstance(params, tuple):
        return params
    (file_hash, course_id) = params

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

    duration = None
    try:
        sem.acquire(timeout=1000)
        before = time.time()
        explanation = create_explaination(file_hash, amount, custom_keywords)
        duration = time.time() - before
        sem.release()
    except:
        explanation = ""
    
    print(explanation)
    print("Inserting explaination")
    user_id = get_user_id()
    if user_id:
        print("Found user:", user_id)
        print("Saving explainations")
    
        with connection_pool.connection() as conn:
            cur = conn.cursor()
            updated_at = datetime.datetime.today().strftime('%Y-%m-%d %H:%M:%S')
            print("Updated at:", updated_at)
            cur.execute("INSERT INTO prompts (id, updated_at, type, title, content, user_id, course_id, prompt_creation_time) VALUES (%s, %s, %s, %s, %s, %s, %s, %s);", (str(uuid4()), updated_at, "EXPLAINER", f"Explaination {updated_at}", explanation, user_id, course_id, duration))

        

    return app.response_class(explanation, mimetype='application/json',status=200)

@app.route("/api/chat-old", methods=["GET", "POST"])
def chat_old():
    # user_id = get_user_id()

    # if user_id == None: return make_response(401, "You must be logged in to chat.")

    print(request.args)
    message = request.args.get("message")
    history = request.args.get("history")
    import json
    from typing import List
    from llama_index.core.llms.types import ChatMessage,MessageRole

    from typing import TypedDict

    class UserHistory(TypedDict):
        user: str
        message: str

    j: List[UserHistory] = json.loads(history)
    hist: List[ChatMessage] = []
    for m in j:
        role = MessageRole.USER if m["user"] == "user" else MessageRole.ASSISTANT
        hist.append(ChatMessage(role=role,content=m["message"]))

    if message == None or message == "":
        return make_response(400, "Cannot send an empty message.")

    print(f"Creating response message for {message}")
    sem.acquire(timeout=1000)
    llm = create_llm_index()
    service_context = ServiceContext.from_defaults(
        chunk_size=512,
        chunk_overlap=5,
        callback_manager=None,
        context_window=2048,
        llm=llm,
        embed_model='local:sentence-transformers/all-MiniLM-L6-v2',
    )
    collection = create_collection()
    chroma_vector_store = ChromaVectorStore.from_collection(collection=collection)
    index = VectorStoreIndex.from_vector_store(vector_store=chroma_vector_store,service_context=service_context)
    memory = ChatMemoryBuffer.from_defaults(token_limit=1500)
    memory.set(hist)
    chat = index.as_chat_engine(
        chat_mode="react",
        memory=memory,
        hist=hist,
        system_prompt=(
            "You are AI Studybuddy assistant able to have normal interactions."
            "You help students with questions about the course D7032E."
        )
    )
    print(f"Sending message to chatbot:\n{message}\n")



    print("HISTORY:",hist)
    def stream():
        response = chat.stream_chat(message,hist)

        stri = ""
        for s in response.response_gen:
            yield s
            print(s)
            stri += s

        print(response.source_nodes)
        # for _ in range(0, 4): print("")
        # print(response)
        # for _ in range(0, 4): print("")
        # print(s)

        sem.release()

        

    return app.response_class(stream(), mimetype='text/plain',headers={"transfer-encoding":"chunked"})
    # return app.response_class(response.response, mimetype='plain/text',status=200)

@app.route("/api/chat", methods=["GET", "POST"])
def chat():
    # user_id = get_user_id()

    # if user_id == None: return make_response(401, "You must be logged in to chat.")

    print(request.args)
    message = request.args.get("message")
    from typing import List
    from llama_index.core.llms.types import ChatMessage,MessageRole

    def get_history() -> List[ChatMessage]:
        history = request.args.get("history")
        if history == None:
            return []
        import json

        from typing import TypedDict

        class UserHistory(TypedDict):
            user: str
            message: str

        j: List[UserHistory] = json.loads(history)
        hist: List[ChatMessage] | None = get_history()
        for m in j:
            role = MessageRole.USER if m["user"] == "user" else MessageRole.ASSISTANT
            hist.append(ChatMessage(role=role,content=m["message"]))
        return hist
    
    hist = get_history()

    if message == None or message == "":
        return make_response(400, "Cannot send an empty message.")

    print(f"Creating response message for {message}")
    sem.acquire(timeout=1000)
    llm = create_llm_index()
    service_context = ServiceContext.from_defaults(
        # chunk_size=256,
        # chunk_overlap=5,
        callback_manager=None,
        # context_window=1024,
        llm=llm,
        embed_model='local:sentence-transformers/all-MiniLM-L6-v2',
    )
    collection = create_collection()
    chroma_vector_store = ChromaVectorStore.from_collection(collection=collection)
    index = VectorStoreIndex.from_vector_store(vector_store=chroma_vector_store,service_context=service_context)
    course_files_engine = index.as_query_engine(similarity_top_k=1)

    # query_engine_tools = [
    #     QueryEngineTool(
    #         query_engine=course_files_engine,
    #         metadata=ToolMetadata(
    #             name="d7032e_course_files",
    #             description=(
    #                 "Provides course files for the course D7032E which can be used."
    #                 "Use a detailed plain text question as input to the tool."
    #             ),
    #         ),
    #     ),
    # ]
    # agent = ReActAgent.from_tools(
    #     tools=query_engine_tools,
    #     llm=llm,
    #     verbose=True,
    #     # context=service_context,
    #     context=(
    #         "You are AI Studybuddy assistant able to have normal interactions."
    #         "You help students with questions about the course D7032E."
    #     ),
    #     chat_history=hist,
    # )
    memory = ChatMemoryBuffer.from_defaults(chat_history=hist, token_limit=1500)
    memory.set(hist)
    chat = index.as_chat_engine(
        chat_mode="simple",
        memory=memory,
        hist=hist,
        system_prompt=(
            "You are AI Studybuddy assistant able to have normal interactions."
            "You help students with questions about the course D7032E."
        )
    )
    print(f"Sending message to chatbot:\n{message}\n")



    print("HISTORY:",hist)
    def stream():
        response = chat.stream_chat(message,hist)

        stri = ""
        for s in response.response_gen:
            yield s
            print(s)
            stri += s

        # response.
        print(response)
        # llm = None
        # service_context = None
        # agent = None
        # import gc
        # gc.collect()

        sem.release()

        

    return app.response_class(stream(), mimetype='text/plain')
    # return app.response_class(response.response, mimetype='plain/text',status=200)