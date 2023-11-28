package se.ltu.softwareengineering.io;

import se.ltu.softwareengineering.communication.message.Message;
import se.ltu.softwareengineering.exception.KoTException;

import java.util.Scanner;

/**
 * Basic console interface. Read user input and display messages.
 */
public class Console implements Input, Output {
    private Scanner scanner = new Scanner(System.in);

    @Override
    public String getInput() {
        return scanner.nextLine();
    }

    @Override
    public void displayMessage(Message message) {
        String displayedMessage = getMessageAsString(message);
        System.out.println(displayedMessage);
    }

    @Override
    public void displayError(KoTException e) {
        e.printStackTrace();
    }
}

