import json

class FillJson():
    def __init__(self) -> None:
        self.template = {}

    def open_json_from_file(self, file):
        with open(file, "r") as file:
            json_file = json.loads(file.read())
        self.template = json_file


    def write_json_to_file(self):
        with open("Test_json/best.json", "w") as f:
            f.write(json.dumps(self.template))

    def return_json_keys(self):
        keys = []
        for values in self.template.keys():
            keys.append(values)
        return keys


    def return_json(self):
        return json.dumps(self.template)