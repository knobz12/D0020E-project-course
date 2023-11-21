package se.ltu.softwareengineering.io;

import se.ltu.softwareengineering.exception.KoTIOException;

/**
 * Basic input interface. Provide a way for a user to interact with the application.
 */
public interface Input {
    /**
     * Method to get feedback from the user, in anyway it is.
     * Can be used to read from console or from a GUI.
     *
     * @return User's input
     * @throws KoTIOException When there's an error on reading the input
     */
    String getInput() throws KoTIOException;
}
