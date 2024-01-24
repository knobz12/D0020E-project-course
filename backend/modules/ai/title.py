
import json
from modules.ai.utils.llm import *
from modules.ai.utils.vectorstore import *

import guidance
from guidance import select, gen

from modules.files.chunks import *

from typing import Any, Generator




def create_title(context: str) -> str:
    llm = create_llm()

    result = llm.predict(f"Generate a short concise title based on the context nothing more nothing less. Context: {context}. Title:", stop=["\n\n"])

    result = result.strip()

    if result.startswith("\"") and result.endswith("\""):
        return result[1:-1]

    # print(result)
    return result




def title_test():
    print(create_title("What is the Layered Architecture Pattern, and how does it promote maintainability and scalability in software design?")) 

