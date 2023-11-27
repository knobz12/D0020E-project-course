from flask import Flask, render_template
import flask_login

class User(flask_login.UserMixin):
    pass

#app.run()
#context = ('server.crt', 'server.key')

app = Flask(__name__)
app.secret_key = 'knobz'


login_manager = flask_login.LoginManager()
login_manager.init_app(app)
import routes
app.run(debug=True, port=3030)
