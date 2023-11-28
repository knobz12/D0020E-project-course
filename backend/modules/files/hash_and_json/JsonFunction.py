import json

class FillJson():
    def __init__(self) -> None:
        self.template = {}

    def open_json_from_file(self, file):
        with open(file, "r") as file:
            json_file = json.loads(file.read())
        self.template = json_file

    def return_json_keys(self):
        keys = []
        for values in self.template.keys():
            keys.append(values)
        return keys


    def return_json(self):
        return json.dumps(self.template)