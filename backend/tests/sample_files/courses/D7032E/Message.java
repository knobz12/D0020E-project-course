package se.ltu.softwareengineering.communication.message;

import java.io.Serializable;
import java.util.List;

/**
 * Represents a message that can be transmitted from a point to another.
 * It can have a text, a list of choices and a maximum number of choices.
 * <br>
 * Message objects should be created using the MessageFactory class.
 * It automatically picks the right subclass corresponding to the message.
 */
public interface Message extends Serializable {
    /**
     * Return the body of the message.
     *
     * @return The body of the message or an empty String if the message is a reply.
     */
    String getMessage();

    /**
     * Return every available choice.
     *
     * @return A list of available choices or an empty List if the message is a simple information
     */
    List<Choice> getChoices();

    /**
     * Return the max of choices that can be selected.
     *
     * @return 0 if the message is an information,
     * <br>
     * 1 if a single choice should be picked
     * <br>
     * or another positive integer if more choices are allowed
     */
    int getMaxChoices();

    /**
     * Test whether this message and another one are equals.
     *
     * @param other Other message that equality should be tested against.
     * @return true if both objects are equals, false otherwise
     */
    default boolean equals(Message other) {
        return other != null
                && this.getMessage().equals(other.getMessage())
                && this.getChoices().equals(other.getChoices())
                && this.getMaxChoices() == other.getMaxChoices();
    }

    default boolean isEmpty() {
        return (getMessage() == null || getMessage().isEmpty())
                && (getChoices() == null || getMessage().isEmpty())
                && (getMaxChoices() == 0);
    }
}
