
from bs4 import BeautifulSoup
import codecs

#path = 'tests\sample_files\Test_htmls\Architectural Design Patterns.html'
#html = codecs.open(path)
#
#soup = BeautifulSoup(html, features="html.parser")
#
#text = soup.get_text()
#
#print(text)


class htmlReaderInstance():
    def __init__(self):
        pass

    def ConvertToText(self, filepath):
        html = codecs.open(filepath)
        soup = BeautifulSoup(html, features="html.parser")
        text = soup.get_text()
        return text
    
   