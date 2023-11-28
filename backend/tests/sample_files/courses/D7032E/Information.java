package se.ltu.softwareengineering.communication.message;

import java.util.ArrayList;
import java.util.List;

/**
 * Simple information element, containing a message
 */
public class Information implements Message{
    private String message;

    Information(String message) {
        this.message = message;
    }

    @Override
    public String getMessage() {
        return message;
    }

    @Override
    public List<Choice> getChoices() {
        return new ArrayList<>(0);
    }

    @Override
    public int getMaxChoices() {
        return 0;
    }

    @Override
    public boolean equals(Object o) {
        if (!(o instanceof Information)) {
            return false;
        }

        return this.equals((Message)o);
    }

    @Override
    public String toString() {
        return "Information{" +
                "message='" + message + '\'' +
                '}';
    }
}
