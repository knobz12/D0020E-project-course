import textwrap
import magic

class NotSupportedFiletype(Exception):
    def __init__(self, message = "Type not currently supported. We are working on a fix in later versions."):
        super().__init__(message)


class chunkerizer():

    def __init__(self):
        pass

    def make_chunk(self, input_file):
        
        #Some 
        textwrap.wrap(x, 1024)
    def some_png_function(self, input_file):
        pass
    def some_pdf_function(self, input_file):
        pass
    def some_ppt_function(self, input_file):
        pass
    
    
    def check_mimetype(self, input_file):
        try:
            fileformat = magic.from_file(input_file, mime = True)
            match fileformat:
                case "image/png":
                    filetype = "png"
                case "":
                    filetype = "jpeg"
                case "application/pdf":
                    filetype = "pdf"
                #case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
                #    filetype = "ppt"
            if 'filetype' not in locals():
                raise NotSupportedFiletype
        except Exception as error:
            return error
        return filetype



if __name__ == "__main__":
    c = chunkerizer()
    x = c.check_mimetype("Test_ppts/D0020E_Sustainability.pptx")
    print(x)