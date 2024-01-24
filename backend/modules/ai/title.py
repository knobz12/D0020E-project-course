
import json
from modules.ai.utils.llm import *
from modules.ai.utils.vectorstore import *

import guidance
from guidance import select, gen

from modules.files.chunks import *

from typing import Any, Generator




def create_quiz_old(id: str, questions: int) -> str:
    glmm = create_llm_guidance()
    vectorstore = create_vectorstore()

    docs = vectorstore.get(limit=100,include=["metadatas"],where={"id":id})
    # print(docs)


    obj: dict[str, list[dict[str, Any]]] =  {}

    for (i, doc) in enumerate(docs["metadatas"]):
        qsts_cunt = calculate_questions_per_doc(len(docs["metadatas"]), questions, i)
        # print(f"Questions for {i}")
        result = glmm + newQuestionJSONGenerator(doc["text"], 4, qsts_cunt)
        # print(str(result))

        obj["questions"] = []

        for i in range(0, qsts_cunt):
            question: str = result[f"question{i}"]
            obj["questions"].append({"question" : question, "answers": []})

            for j in range(0,4):
                answer: str = result[f"answer{i}-{j}"]
                correct: str = result[f"isAnswer{i}-{j}"]
                obj["questions"][i]["answers"].append({"text": answer, "correct" : False if correct == "False" else True})
    
    result: str = json.dumps(obj)
    return result




def create_title(context: str) -> str:
    llm = create_llm()

    result = llm.predict(f"Generate a short concise title based on the context. Context: {context}. Title:", stop=["\n\n"])

    return result




def title_test():
    print(create_title("design patterns")) 

