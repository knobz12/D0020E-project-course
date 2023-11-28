package se.ltu.softwareengineering.communication.message;

import java.util.List;

class ClosedQuestion extends Question {
    ClosedQuestion(String question, List<Choice> choices, int maxChoices) {
        super(question, choices, maxChoices);
    }
}
