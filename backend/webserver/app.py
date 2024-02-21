from flask import Flask
from flask_cors import CORS
from modules.ai.utils.args import get_args

app = Flask(__name__)
app.secret_key = 'knobz'
import os
os.environ["TOKENIZERS_PARALLELISM"] = "false"

import webserver.routes

CORS(app, supports_credentials=True, resources={r"/*": {"origins": "*"}})
def start_app():
    print("Starting app")

    args = get_args()
    if args.prod != None:
        import socket
        hostname = socket.gethostname()
        print(f"Running bjoern server at http://{hostname}:3030")
        app.run(debug=True,host=hostname, port=3030, threaded=False)
    else:
        app.run(debug=True,host="localhost", port=3030, threaded=False)