from flask import Flask, render_template

app = Flask(__name__)

@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"
@app.route('/hello/<name>')
def hello(name):
    return f"<p>Goodbye world {name} killed you</p>"#render_template('hello.html', name=name)

if __name__ == "__main__":
    #app.run()
    #context = ('server.crt', 'server.key')
    app.run(debug=True, host="0.0.0.0" ,port=3030)