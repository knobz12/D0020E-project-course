from flask import Flask
import flask_login
from flask_cors import CORS
import os

app = Flask(__name__)
app.secret_key = 'knobz'

import webserver.routes

# @app.route("/api/health")
# def health():
#     from flask import make_response
#     return make_response("Healthy", 200)

CORS(app, supports_credentials=True, resources={r"/*": {"origins": "*"}})
def start_app():
    print("Starting app")
    from modules.ai.utils.args import get_args
    import torch
    cuda = torch.cuda.is_available()
    print("Cuda available:",cuda)
    dev = torch.cuda.current_device()
    print("Cuda device number:",dev)
    name = torch.cuda.get_device_name(dev)
    print("Cuda device name:",name)
    args = get_args()
    import socket
    hostname = socket.gethostname()
    if args.prod != None:
        import bjoern
        print(f"Running bjoern server at http://{hostname}:3030")
        socket = bjoern.listen(
            app, hostname, 3030
        )
        bjoern.run()
    else:
        app.run(debug=True,host=hostname, port=3030, threaded=True)

# if __name__ == "__main__":
#     import bjoern
#     print("Running bjoern at http://127.0.0.1:3030")
#     bjoern.run(app, "127.0.0.1",3030)