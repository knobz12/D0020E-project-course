from flask import Flask
import flask_login
from flask_cors import CORS


class User(flask_login.UserMixin):
    pass

#app.run()
#context = ('server.crt', 'server.key')

app = Flask(__name__)
app.secret_key = 'knobz'
CORS(app, resources={r"/*": {"origins": "*"}})

# guid = create_llm_guidance()

login_manager = flask_login.LoginManager()
login_manager.init_app(app)
from flask import g

import webserver.routes

def start_app():
    app.run(debug=True, port=3030,)
