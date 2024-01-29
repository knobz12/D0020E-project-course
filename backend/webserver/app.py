from flask import Flask
import flask_login
from flask_cors import CORS
import os

path = os.path.abspath("website/out")
print(path)
app = Flask(__name__, static_folder=path,template_folder=path)
app.secret_key = 'knobz'
import webserver.routes

import webserver.routes
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "*"}})
def start_app():
    app.run(debug=True, port=3030, threaded=True)
