from PIL import Image
import os
import numpy as np

filename = 'Untitled.png'
os.system("./tesseract Untitled.png - -l eng")

#print(text)