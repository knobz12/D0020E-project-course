"""
Creating quizes based on document(s)

# Improvements:
* Amount of quiz answers per question
* Function for creating string encoded JSON array of multiple quiz questions with answers
"""

import json
from utils.llm import create_llm_guidance
from utils.guider import questionJSONGenerator, determineQuestionBias

def quiz_generator():
    guid = create_llm_guidance()

    questions: list[str] = [
        # Opinion based
        "What is your favorite book of all time, and why?",
        "Do you believe that social media has a positive or negative impact on society?",
        "In your opinion, what is the most important quality in a leader?",
        "Should governments prioritize environmental conservation over economic development, or vice versa?",
        "Is it better to pursue a college education or start working right after high school?",

        # Fact question
        "What is the capital city of France?",
        "How many planets are there in our solar system?",
        "When did World War II end?",
        "What is the chemical symbol for gold?",
        "How many continents are there in the world?",

        # "Who is the best tech CEO of all time?",
        # "What is the closest planet to the sun?",
        # "What are the eight planets?",
        # "Which country is known as the 'Land of the Rising Sun'?",
        # "What is the chemical symbol for gold?",
        # "Who wrote the play 'Romeo and Juliet'?",
        # "In which year did Christopher Columbus first reach the Americas?",
        # "What does the acronym 'CPU' stand for?",
        # "Who is known as the 'King of Pop'?",
        # "In which sport would you perform a slam dunk?",
        # "Who painted the Mona Lisa?",
        # "What is the capital city of Australia?",
        # "Which film won the Academy Award for Best Picture in 2020?",
    ]

    for (idx, question) in enumerate(questions[:1]):
        print(f"Generating quiz {idx}")
        quizJson = str(guid + questionJSONGenerator(question))
        res = str(guid + determineQuestionBias(question))
        factual = res.__contains__("Answer: factual")
        f = "factual" if factual == True else "opinion"
        print(f"Question {idx + 1}: {f}")

        import regex
        pattern = regex.compile(r'{(?:[^{}]|(?R))*}')
        jsonn = pattern.findall(quizJson)[0]
        res = json.loads(jsonn)
        with open(f"./quizzs/quiz-{idx}.json", "w") as f:
            json.dump(res, indent=4, fp=f)

if __name__ == "__main__":
    quiz_generator()