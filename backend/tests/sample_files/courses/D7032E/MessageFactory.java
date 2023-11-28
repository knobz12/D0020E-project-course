package se.ltu.softwareengineering.communication.message;

import java.util.List;

/**
 * Factory that creates Message objects, picking the right class by inferring its type from the parameters.
 */
public abstract class MessageFactory {
    /**
     * Create a Message object whose type depends on the parameters
     *
     * @param text       Body of the message
     * @param choices    Available choices
     * @param maxChoices Maximum number of choices that can be picked
     * @return <ul>
     * <li>
     * An Information if choices is null and maxChoices != -1,
     * </li>
     * <li>
     * an OpenQuestion if text is not null and maxChoices == -1,
     * </li>
     * <li>
     * a ClosedQuestion if text is not null and choices is not empty
     * </li>
     * <li>
     * a Reply otherwise.
     * </li>
     * </ul>
     */
    public static Message createMessage(String text, List<Choice> choices, int maxChoices) {
        if (maxChoices < -1) {
            return null;
        }

        if (choices == null && maxChoices != -1) {
            return new Information(text);
        }

        if (text != null && maxChoices == -1) {
            return new OpenQuestion(text);
        }

        if (text != null && !choices.isEmpty()) {
            return new ClosedQuestion(text, choices, maxChoices);
        }

        return new Reply(choices);
    }

    /**
     * Create a Message containing a single text.
     *
     * @param text Body of the message
     * @return An Information object containing the message
     */
    public static Message createMessage(String text) {
        return createMessage(text, null, 0);
    }

    /**
     * Create a message containing only choices.
     *
     * @param choices Choices that has been picked
     * @return A Reply object containing the choices
     */
    public static Message createMessage(List<Choice> choices) {
        return createMessage(null, choices, 0);
    }
}
