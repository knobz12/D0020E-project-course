package se.ltu.softwareengineering.player;

import se.ltu.softwareengineering.communication.message.Choice;
import se.ltu.softwareengineering.communication.message.Message;
import se.ltu.softwareengineering.exception.KoTException;
import se.ltu.softwareengineering.exception.KoTIOException;
import se.ltu.softwareengineering.io.Input;
import se.ltu.softwareengineering.io.Output;

import java.util.List;
import java.util.function.Function;

/**
 * Basic interface to interact with a player, whether he/she is a human, a computer, local or remote.
 */
public abstract class Player {
    Input input;
    Output output;

    Player(Input input, Output output) {
        this.input = input;
        this.output = output;
    }

    <T extends Input & Output> Player(T ioObject) {
        this(ioObject, ioObject);
    }


    /**
     * Ask for the player to choose an action, based on choices offered by the message.
     *
     * @param message Message the player should react to
     * @return Choices picked by the player. Can be empty if there was no choice or the player hasn't selected any.
     * @throws KoTIOException When there's an error on reading the choices
     */
    public List<Choice> chooseAction(Message message) throws KoTIOException {
        return chooseAction(message, c -> true);
    }

    /**
     * Ask for the player to choose an action, based on choices offered by the message.
     * A choice can be validated or rejected by a function.
     *
     * @param message        Message the player should react to
     * @param validateChoice Provide a way to validate or reject a choice
     * @return Choices picked by the player. Can be empty if there was no choice or the player hasn't selected any.
     * @throws KoTIOException When there's an error on reading the choices
     */
    public abstract List<Choice> chooseAction(Message message, Function<Choice, Boolean> validateChoice) throws KoTIOException;

    /**
     * Display a message to the player without waiting for a reply.
     *
     * @param message Message to display
     * @throws KoTIOException When there's an error printing the message
     */
    public abstract void displayMessage(Message message) throws KoTIOException;

    public abstract void displayError(KoTException e) throws KoTIOException;
}