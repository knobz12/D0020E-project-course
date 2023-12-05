"""
Creating quizes based on document(s)

# Improvements:
* Amount of quiz answers per question
"""

import json
from modules.ai.utils.llm import create_llm_guidance
from modules.ai.utils.vectorstore import create_vectorstore

import guidance
from guidance import select, gen

import textwrap
import regex

def calculate_questions_per_doc(total_docs: int, total_questions: int, doc_index: int):
    """
    Calculate the number of questions to generate for a specific document.

    Parameters:
    - total_docs (int): Total number of documents.
    - total_questions (int): Total number of questions to generate.
    - doc_index (int): Index of the current document (0-based).

    Returns:
    - int: Number of questions to generate for the specified document.
    """
    # Ensure that the inputs are valid
    if total_docs <= 0 or total_questions <= 0 or doc_index < 0 or doc_index >= total_docs:
        raise ValueError("Invalid input parameters")

    # Calculate the base number of questions for each document
    base_questions_per_doc = total_questions // total_docs

    # Calculate the remaining questions after distributing the base questions
    remaining_questions = total_questions % total_docs

    # Calculate the actual number of questions for the current document
    questions_for_current_doc = base_questions_per_doc + (1 if doc_index < remaining_questions else 0)

    return questions_for_current_doc

@guidance()
def determineQuestionBias(lm, question: str):
    lm += f"""I want you to determine if a question for a quiz is factual or opinion based.
    For example a question about your opinion about something would be opinion based and a question about a fact is factual.

    Question: {question}

    Answer: {select(options=["factual", "opinion"])}"""
    return lm


@guidance()
def questionJSONGenerator(lm, question: str, answer_count: int):

    def gen_answer() -> str:
        answer: str = f"""\
        {{
            "answer": "{gen("answer", stop='"')}",
            "isAnswer": "{select(options=['true', 'false'], name='isAnswer')}"
        }}"""
        return answer

    answers: str = ""
    for i in range(0, answer_count):
        if (i != answer_count - 1):
            answers += gen_answer() + ",\n"
        else:
            answers += gen_answer() + "\n"


    res = f"""\
    The following is a quiz question in JSON format.
    Generate answers. Only ONE of the answers can be true, and the others shall be false.
    The incorrect answers must be different from each other but still related to the topic.

    {{
        "question": "{question}",
        "answers": [
            {answers}
        ]
    }}"""

    lm += res 
    
    return lm



@guidance()
def question_generator(lm, ):
    pass



def create_quiz_from_questions(guid, questions: list[str], answer_count: int) -> str:
    json_output: str = """\
    {
        "questions": [\n"""

    for (idx, question) in enumerate(questions):
        print(f"Generating quiz {idx}")
        quizJson = str(guid + questionJSONGenerator(question, answer_count))
        res = str(guid + determineQuestionBias(question))
        factual = res.__contains__("Answer: factual")
        f = "factual" if factual == True else "opinion"
        print(f"Question {idx + 1}: {f}")

        pattern = regex.compile(r'{(?:[^{}]|(?R))*}')
        jsonn = pattern.findall(quizJson)[0]
        val = json.loads(jsonn)
        res = str(json.dumps(val, indent=4))
        res = textwrap.indent(res, 12 * ' ')

        if (idx != len(questions) - 1):
            json_output += res + ",\n"
        else:
            json_output += res + "\n"



    json_output += """\
        ]
    }
    """


    return json_output


def create_quiz_from_questions_stream(guid, questions: list[str], answer_count: int) -> str:
    yield """\
    {
        "questions": [\n"""

    for (idx, question) in enumerate(questions):
        print(f"Generating quiz {idx}")
        quizJson = str(guid + questionJSONGenerator(question, answer_count))

        res = str(guid + determineQuestionBias(question))
        factual = res.__contains__("Answer: factual")
        f = "factual" if factual == True else "opinion"
        print(f"Question {idx + 1}: {f}")

        pattern = regex.compile(r'{(?:[^{}]|(?R))*}')
        jsonn = pattern.findall(quizJson)[0]
        val = json.loads(jsonn)
        res = str(json.dumps(val, indent=4))
        res = textwrap.indent(res, 12 * ' ')

        if (idx != len(questions) - 1):
            yield res + ",\n"
        else:
            yield res + "\n"



    yield """\
        ]
    }
    """

@guidance()
def newQuestionJSONGenerator(lm, context: str, answer_count: int, qsts: list[str]):

    def gen_answer(idx: int) -> str:
        answer: str = f"""\
        {{
            "answer": "{gen(f"answer{idx}", stop='"')}",
            "isAnswer": "{select(options=['true', 'false'], name=f'isAnswer{idx}')}"
        }}"""
        return answer

    qst_str = "\n".join(qsts)
    res = f"""\
    The following is a quiz question in JSON format.
    Generate answers based on the provided context. Only ONE of the answers can be true, and the others shall be false.
    The incorrect answers must be different from each other but still related to the topic.
    The new question MUST NOT be similar to one of the already existing questions provided below.

    Existing questions: {qst_str}

    Context: {context}

    {{
        "question": "{gen("question",stop='"')}",
        "answers": ["""

    # answers: str = ""
    for i in range(0, answer_count):
        if (i != answer_count - 1):
            res += gen_answer(i) + ",\n"
        else:
            res += gen_answer(i) + "\n"

        res += f"""]
    }}"""
    lm += res 
    
    return lm

from typing import Generator
def create_quiz(id: str, questions: int) -> Generator[str, str, None]:
    glmm = create_llm_guidance()
    vectorstore = create_vectorstore()

    docs = vectorstore.get(limit=100,include=["metadatas"],where={"id":id})
    print(docs)
    qsts_list: list[str] = []

    for (i, doc) in enumerate(docs["metadatas"]):
        qsts_cunt = calculate_questions_per_doc(len(docs["metadatas"]), questions, i)
        print(f"Creating {qsts_cunt} for doc {i}")

        for i in range(0, qsts_cunt):
            print(f"Question {i}")
            result = glmm + newQuestionJSONGenerator(doc["text"], 4, qsts_list)
            question: str = result["question"]
            qsts_list.append(question)
            print(question, end="\n\n")
            print(str(result))
            answers: list[tuple[str, bool]] = []
            for i in range(0,4):
                answer = (result[f"answer{i}"], True if result[f"isAnswer{i}"] == "true" else False)
                answers.append(answer)

            res= [question]
            for answer in answers:
                symbol = "✅" if answer[1] == True else "💀"
                res.append(f"{symbol} {answer[0]}: {answer[1]}")
            complete = "\n".join(res)
            yield complete + "\n\n"

def quiz_test():
    print(create_quiz("b53998910b5a91c141f890fa76fbcb7f")) 

    # doc_amnt = 6
    # qsts = 11
    # for i in range(0, doc_amnt):
    #     print(f"Idx: {i}, qsts: {calculate_questions_per_doc(doc_amnt, qsts, i)}")

    # questions: list[str] = [
    #     # Opinion based
    #     "What is your favorite book of all time, and why?",
    #     "Do you believe that social media has a positive or negative impact on society?",
    #     "In your opinion, what is the most important quality in a leader?",
    #     "Should governments prioritize environmental conservation over economic development, or vice versa?",
    #     "Is it better to pursue a college education or start working right after high school?",

    #     # Fact question
    #     "What is the capital city of France?",
    #     "How many planets are there in our solar system?",
    #     "When did World War II end?",
    #     "What is the chemical symbol for gold?",
    #     "How many continents are there in the world?",

    #     # "Who is the best tech CEO of all time?",
    #     # "What is the closest planet to the sun?",
    #     # "What are the eight planets?",
    #     # "Which country is known as the 'Land of the Rising Sun'?",
    #     # "What is the chemical symbol for gold?",
    #     # "Who wrote the play 'Romeo and Juliet'?",
    #     # "In which year did Christopher Columbus first reach the Americas?",
    #     # "What does the acronym 'CPU' stand for?",
    #     # "Who is known as the 'King of Pop'?",
    #     # "In which sport would you perform a slam dunk?",
    #     # "Who painted the Mona Lisa?",
    #     # "What is the capital city of Australia?",
    #     # "Which film won the Academy Award for Best Picture in 2020?",
    # ]


if __name__ == "__main__":
    quiz_test()