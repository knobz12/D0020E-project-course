package se.ltu.softwareengineering.communication.message;

import java.util.List;

/**
 * Simple reply element, containing a list of choices that have been picked
 */

public class Reply implements Message{
    private List<Choice> choices;

    Reply(List<Choice> choices) {
        this.choices = choices;
    }

    @Override
    public String getMessage() {
        return "";
    }

    @Override
    public List<Choice> getChoices() {
        return choices;
    }

    @Override
    public int getMaxChoices() {
        return choices.size();
    }

    @Override
    public boolean equals(Object o) {
        if (!(o instanceof Reply)) {
            return false;
        }

        return this.equals((Message)o);
    }

    @Override
    public String toString() {
        return "Reply{" +
                "choices=" + choices +
                '}';
    }
}
