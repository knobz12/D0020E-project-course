from webserver.app import app

from modules.ai.utils.llm import create_llm_guidance
from modules.ai.quizer import create_quiz_stream

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

    guid = create_llm_guidance()
    return app.response_class(create_quiz_stream(guid, [
        "What is the capital city of France?",
        "How many planets are there in our solar system?",
        "When did World War II end?",
    ], 3), mimetype='application/json')

@app.route("/api/summary", methods=["POST"])
def summary():
    ### EXPLANATION
    # Generate questions from chunks
    # Generate quiz from chunks

    # 1. Get hash of file
    # 2. Check if file is in vector database.
    # 3. Generate summary from chunks

    if 'file' not in request.files:
        return make_response("Missing file", 406)
    
    print(request.files["file"])
    filebytes = request.files["file"].read()
    print("File:", filebytes)

    guid = create_llm_guidance()
    return app.response_class(create_quiz_stream(guid, [
        "What is the capital city of France?",
        "How many planets are there in our solar system?",
        "When did World War II end?",
    ], 3), mimetype='application/json')

@app.route("/api/explanation", methods=["POST"])
def explanation():
    guid = create_llm_guidance()
    pass