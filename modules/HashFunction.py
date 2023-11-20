import hashlib

class TextToHash():
    def __init__(self) -> None:
        pass

    def ConvertToHash(self, input):
        hash = hashlib.md5()
        hash.update(f"{input}".encode('UTF-8'))
        return hash.hexdigest(), input