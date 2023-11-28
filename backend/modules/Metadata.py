import os


class MetaData():
    def __init__(self) -> None:
        pass

    def GetModifiedDate(self, file):
        return os.path.getmtime(file)
    
p = MetaData()
print(p.GetModifiedDate("tests/sample_files/Test_txt/t.txt"))