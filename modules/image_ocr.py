from PIL import Image
import pytesseract

def image_path_to_text(filepath: str):
    image = Image.open(filepath)
    return pytesseract.image_to_string(image)

def image_to_text(image: Image):
    return pytesseract.image_to_string(image)