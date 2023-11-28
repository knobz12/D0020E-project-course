package se.ltu.softwareengineering.io;

import se.ltu.softwareengineering.communication.message.Choice;
import se.ltu.softwareengineering.communication.message.Message;
import se.ltu.softwareengineering.exception.KoTException;
import se.ltu.softwareengineering.exception.KoTIOException;
import se.ltu.softwareengineering.tool.Resource;
import se.ltu.softwareengineering.tool.ResourceLoader;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Basic output interface. Provide a way to display messages to a user.
 * Can be used to print to console or display on a GUI.
 */
public interface Output {
    /**
     * Display standard message through the interface.
     *
     * @param message Message to display
     * @throws KoTIOException When there's an error on writing the message
     */
    void displayMessage(Message message) throws KoTIOException;

    /**
     * Display en exception through the interface.
     *
     * @param e Exception to display.
     * @throws KoTIOException When there's an error on writing the error
     */
    void displayError(KoTException e) throws KoTIOException;

    default String getMessageAsString(Message message) {
        final StringBuilder displayedMessage = new StringBuilder();

        final String description = message.getMessage();
        displayedMessage.append(description);

        final List<Choice> choices = message.getChoices();
        if (choices != null) {
            if (displayedMessage.length() != 0) displayedMessage.append(System.lineSeparator());
            displayedMessage.append(
                    choices
                            .stream()
                            .map(choice -> "\t" + choice.getShortcut() + ": " + choice.getDescription())
                            .collect(Collectors.joining(System.lineSeparator()))
            );
        }

        final int maxChoices = message.getMaxChoices();
        String choiceMessage;
        if (maxChoices != 0) {
            if (displayedMessage.length() != 0) displayedMessage.append(System.lineSeparator());
            if (maxChoices == -1) {
                choiceMessage = ResourceLoader.getString(Resource.Choice, "openChoice");
            } else if (maxChoices == 1) {
                choiceMessage = ResourceLoader.getString(Resource.Choice, "singleChoice");
            } else {
                choiceMessage = ResourceLoader.getString(Resource.Choice, "multipleChoices", maxChoices, ResourceLoader.getString(Resource.Choice, "choicesSeparator"));
            }
            displayedMessage.append(choiceMessage);
        }

        return displayedMessage.toString();
    }
}
