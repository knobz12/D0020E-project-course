package se.ltu.softwareengineering.io;

import org.junit.Test;
import org.junit.jupiter.api.Assertions;
import se.ltu.softwareengineering.communication.message.Choice;
import se.ltu.softwareengineering.communication.message.Message;
import se.ltu.softwareengineering.communication.message.MessageFactory;
import se.ltu.softwareengineering.communication.network.Client;
import se.ltu.softwareengineering.communication.network.Server;
import se.ltu.softwareengineering.exception.KoTException;
import se.ltu.softwareengineering.exception.KoTIOException;
import se.ltu.softwareengineering.exception.KoTNetworkException;

import java.util.Arrays;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class TRemote {
    @Test
    public void sendMessageToRemote() throws KoTNetworkException, InterruptedException, KoTIOException {
        int port = 1337;
        Server server = new Server(port);

        ExecutorService executor = Executors.newSingleThreadExecutor();
        executor.execute(() -> Assertions.assertDoesNotThrow(() -> {
            Client newClient = server.waitForConnections(1).get(0);

            Output remote = new Remote(newClient);
            Message message = MessageFactory.createMessage(
                    "Testing this awesome interface",
                    null,
                    0
            );
            remote.displayMessage(message);

            server.disconnectAllClients();
            server.disconnect();
        }));

        Client client = Client.connect("localhost", port);

        String welcomeMessage = client.readMessage().getMessage();
        String testMessage = client.readMessage().getMessage();

        executor.shutdown();
        executor.awaitTermination(10, TimeUnit.SECONDS);

        assertEquals("You are now connected to the server.", welcomeMessage);
        assertEquals("Testing this awesome interface", testMessage);
    }

    @Test
    public void receiveMessageFromRemote() throws KoTException, InterruptedException {
        int port = 1337;
        final String expectedMessage = "1,2";

        final Server server = new Server(port);

        ExecutorService executor = Executors.newSingleThreadExecutor();
        executor.execute(() -> Assertions.assertDoesNotThrow(() -> {
            Client newClient = server.waitForConnections(1).get(0);
            Input remote = new Remote(newClient);
            String receivedMessage = remote.getInput();
            assertEquals(expectedMessage, receivedMessage);
        }));

        Message message = MessageFactory.createMessage(null, Arrays.asList(
                new Choice("1", "choice 1"),
                new Choice("2", "choice 2")
        ), 0);
        Client client = Client.connect("localhost", port);

        client.sendMessage(message);

        executor.shutdown();
        executor.awaitTermination(10, TimeUnit.SECONDS);

        server.disconnectAllClients();
        server.disconnect();
    }

}
