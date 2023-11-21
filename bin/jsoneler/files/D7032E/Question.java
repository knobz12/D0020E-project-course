package se.ltu.softwareengineering.communication.message;

import java.util.List;

/**
 * Simple question element, containing a message, choices to be picked and a maximum number of choices
 */
public abstract class Question implements Message {
    private final String question;
    private final List<Choice> choices;
    private final int maxChoices;

    Question(String question, List<Choice> choices, int maxChoices) {
        this.question = question;
        this.choices = choices;
        this.maxChoices = maxChoices;
    }

    @Override
    public List<Choice> getChoices() {
        return choices;
    }

    @Override
    public int getMaxChoices() {
        return maxChoices;
    }

    @Override
    public String getMessage() {
        return question;
    }

    @Override
    public boolean equals(Object o) {
        if (!(o instanceof Question)) {
            return false;
        }

        return this.equals((Message) o);
    }

    @Override
    public String toString() {
        return "Question{" +
                "question='" + question + '\'' +
                ", choices=" + choices +
                ", maxChoices=" + maxChoices +
                '}';
    }
}
