from webserver.app import app

from modules.ai.utils.llm import create_llm_guidance
from modules.ai.quizer import create_quiz_stream

@app.route("/api/quiz", methods=["POST"])
def quiz():
    guid = create_llm_guidance()
    return app.response_class(create_quiz_stream(guid, [
        "What is the capital city of France?",
        "How many planets are there in our solar system?",
        "When did World War II end?",
    ], 3), mimetype='application/json')

@app.route("/api/summary", methods=["POST"])
def quiz():
    guid = create_llm_guidance()
    pass

@app.route("/api/explanation", methods=["POST"])
def quiz():
    guid = create_llm_guidance()
    pass