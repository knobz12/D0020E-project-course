import json
import time


with open("Test_json/test.json", "r") as f:
    x = json.loads(f.read())


with open("Test_json/best.json", "w") as f:
    f.write(json.dumps(x))