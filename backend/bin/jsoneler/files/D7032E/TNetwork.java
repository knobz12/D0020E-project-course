package se.ltu.softwareengineering.communication.network;

import org.junit.jupiter.api.Assertions;
import org.junit.Test;
import se.ltu.softwareengineering.communication.message.Message;
import se.ltu.softwareengineering.communication.message.MessageFactory;
import se.ltu.softwareengineering.exception.KoTException;
import se.ltu.softwareengineering.exception.KoTIOException;
import se.ltu.softwareengineering.exception.KoTNetworkException;
import se.ltu.softwareengineering.tool.Randomizer;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class TNetwork {
    @Test
    public void connectSingleClient() throws KoTNetworkException, InterruptedException, KoTIOException {
        // Taking a port between 1337 & 11336 to avoid port collusion with other test methods
        int port = Randomizer.nextInt(10000) + 1337;
        Server server = new Server(port);

        ExecutorService executor = Executors.newSingleThreadExecutor();
        executor.execute(() -> Assertions.assertDoesNotThrow(() -> {
            server.waitForConnections(1);
            server.disconnectAllClients();
            server.disconnect();
        }));

        String message = Client.connect("localhost", port).readMessage().getMessage();

        executor.shutdown();
        executor.awaitTermination(10, TimeUnit.SECONDS);

        assertEquals("You are now connected to the server.", message);
    }

    @Test
    public void connectMultipleClients() throws KoTNetworkException, InterruptedException, KoTIOException {
        // Taking a port between 1337 & 11336 to avoid port collusion with other test methods
        int port = Randomizer.nextInt(10000) + 1337;
        int clientsNumber = 4;

        Server server = new Server(port);

        ExecutorService executor = Executors.newSingleThreadExecutor();
        executor.execute(() -> Assertions.assertDoesNotThrow(() -> {
            server.waitForConnections(clientsNumber);
            server.disconnectAllClients();
            server.disconnect();
        }));

        for (int i = 0; i < clientsNumber; i++) {
            String message = Client.connect("localhost", port).readMessage().getMessage();
            assertEquals("You are now connected to the server.", message);
        }

        executor.shutdown();
        executor.awaitTermination(10, TimeUnit.SECONDS);
    }

    @Test
    public void receiveMessageFromSingleClient() throws KoTException, InterruptedException {
        // Taking a port between 1337 & 11336 to avoid port collusion with other test methods
        int port = Randomizer.nextInt(10000) + 1337;
        final String expectedMessage = "Connected!";

        final Server server = new Server(port);

        ExecutorService executor = Executors.newSingleThreadExecutor();
        executor.execute(() -> Assertions.assertDoesNotThrow(() -> {
            server.waitForConnections(1);
        }));

        Message message = MessageFactory.createMessage(expectedMessage, null, 0);
        final Client client = Client.connect("localhost", port);

        client.sendMessage(message);

        executor.shutdown();
        executor.awaitTermination(10, TimeUnit.SECONDS);

        String receivedMessage = server.readMessage(server.getClients().get(0)).getMessage();

        server.disconnectAllClients();
        server.disconnect();

        assertEquals(expectedMessage, receivedMessage);
    }
}
