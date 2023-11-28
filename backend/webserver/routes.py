import flask
import flask_login
from webserver.app import app, login_manager, User


#Mock database (proof of concept)
users = {"gmail": {'password': 'secret'}}



@login_manager.user_loader
def user_loader(email):
    if email not in users:
        return

    user = User()
    user.id = email
    return user


@login_manager.request_loader
def request_loader(request):
    email = request.form.get('email')
    if email not in users:
        return

    user = User()
    user.id = email
    return user

from modules.ai.utils.llm import create_llm_guidance
from modules.ai.quizer import create_quiz_stream

@app.route("/api/quiz", methods=["POST"])
def quiz():
    guid = create_llm_guidance()
    # return "123"
    return app.response_class(create_quiz_stream(guid, [
        "What is the capital city of France?",
        "How many planets are there in our solar system?",
        "When did World War II end?",
    ], 3), mimetype='application/json')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if flask.request.method == 'GET':
        return '''
               <form action='login' method='POST'>
                <input type='text' name='email' id='email' placeholder='email'/>
                <input type='password' name='password' id='password' placeholder='password'/>
                <input type='submit' name='submit'/>
               </form>
               '''

    email = flask.request.form['email']
    if email in users and flask.request.form['password'] == users[email]['password']:
        user = User()
        user.id = email
        flask_login.login_user(user)
        return flask.redirect(flask.url_for('protected'))

    return 'Bad login'


@app.route('/protected')
@flask_login.login_required
def protected():
    return 'Logged in as: ' + flask_login.current_user.id

@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"

@app.route('/hello/<name>')
@flask_login.login_required
def hello(name):
    return f"<p>Goodbye world {name} killed you</p>"#render_template('hello.html', name=name)

@app.route('/hello/this/<name>')
def hello_this(name):
    return f"<p>Goodbye world {name} killed you</p>"#render_template('hello.html', name=name)