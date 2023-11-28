from bs4 import BeautifulSoup
import codecs

class HtmlToText():
    def __init__(self):
        pass

    def ConvertToText(self, filepath):
        html = codecs.open(filepath)
        soup = BeautifulSoup(html, features="html.parser")
        text = soup.get_text()
        return text
    
   