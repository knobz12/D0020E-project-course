package se.ltu.softwareengineering.io;

import se.ltu.softwareengineering.communication.message.Choice;
import se.ltu.softwareengineering.communication.message.Message;
import se.ltu.softwareengineering.communication.message.MessageFactory;
import se.ltu.softwareengineering.communication.network.Client;
import se.ltu.softwareengineering.exception.KoTException;
import se.ltu.softwareengineering.exception.KoTIOException;
import se.ltu.softwareengineering.tool.Resource;
import se.ltu.softwareengineering.tool.ResourceLoader;

import java.util.Collections;
import java.util.stream.Collectors;

public class Remote implements Input, Output {
    private Client client;

    public Remote(Client client) {
        this.client = client;
    }

    @Override
    public String getInput() throws KoTIOException {
        Message message = client.readMessage();
        return message
                .getChoices()
                .stream()
                .map(Choice::getShortcut)
                .collect(Collectors.joining(
                        ResourceLoader.getString(Resource.Choice, "choicesSeparator")
                ));
    }

    @Override
    public void displayMessage(Message message) throws KoTIOException {
        client.sendMessage(message);
    }

    @Override
    public void displayError(KoTException e) throws KoTIOException {
        Message message = MessageFactory.createMessage(
                ResourceLoader.getString(
                        Resource.Error,
                        "errorOccured",
                        e.getMessage()
                ),
                Collections.emptyList(),
                0
        );
        client.sendMessage(message);
    }
}
