from flask import Flask
from flask_cors import CORS
from modules.ai.utils.args import get_args
import torch

app = Flask(__name__)
app.secret_key = 'knobz'

import webserver.routes

CORS(app, supports_credentials=True, resources={r"/*": {"origins": "*"}})
def start_app():
    print("Starting app")
    cuda = torch.cuda.is_available()
    dev = torch.cuda.current_device()
    name = torch.cuda.get_device_name(dev)
    print(f"Cuda available: {cuda}, device: {dev}, name: {name}")
    args = get_args()

    if args.prod != None:
        import socket
        hostname = socket.gethostname()
        import bjoern
        print(f"Running bjoern server at http://{hostname}:3030")
        socket = bjoern.listen(
            app, hostname, 3030
        )
        bjoern.run()
    else:
        app.run(debug=True,host="localhost", port=3030, threaded=True)