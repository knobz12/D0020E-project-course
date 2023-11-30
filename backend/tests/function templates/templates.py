#Cuatom error

class NotSupportedFiletype(Exception):
    def __init__(self, message = "Type not currently supported. We are working on a fix in later versions."):
        super().__init__(message)
