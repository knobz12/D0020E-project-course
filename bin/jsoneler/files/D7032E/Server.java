package se.ltu.softwareengineering.communication.network;

import se.ltu.softwareengineering.communication.message.Message;
import se.ltu.softwareengineering.communication.message.MessageFactory;
import se.ltu.softwareengineering.exception.KoTException;
import se.ltu.softwareengineering.exception.KoTIOException;
import se.ltu.softwareengineering.exception.KoTNetworkException;
import se.ltu.softwareengineering.tool.ResourceLoader;
import se.ltu.softwareengineering.tool.Resource;

import java.io.IOException;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.ArrayList;
import java.util.List;

/**
 * A network server which clients can be connected to.
 * Provide a messages receiving and sending interface.
 */
public class Server {
    private final ServerSocket serverSocket;
    private final List<Client> clients = new ArrayList<>();

    /**
     * Create a new server that listen on the given port
     *
     * @param port Port to listen on
     * @throws KoTNetworkException When the port hasn't been opened
     */
    public Server(int port) throws KoTNetworkException {
        try {
            serverSocket = new ServerSocket(port);
        } catch (IOException e) {
            throw new KoTNetworkException(ResourceLoader.getString(Resource.Error, "unableToOpenPort", port), e);
        }
    }

    /**
     * Return the list of currently connected clients
     *
     * @return List of currently connected clients
     */
    public List<Client> getClients() {
        return clients;
    }

    /**
     * @param number Number of new clients the server should wait for.
     * @return List of currently connected clients
     * @throws KoTNetworkException When a connection hasn't been opened
     * @throws KoTIOException      When the connection message hasn't been sent
     */
    public List<Client> waitForConnections(int number) throws KoTNetworkException, KoTIOException {
        for (int i = 0; i < number; ++i) {
            manageNewConnection(i);
            System.out.println(
                    ResourceLoader.getString(Resource.Game, "newConnection", i+1, number)
            );
        }
        return clients;
    }

    /**
     * Close the server socket and disconnect every client.
     *
     * @throws KoTNetworkException When the server or a client can't be correctly disconnected
     */
    public void disconnect() throws KoTNetworkException {
        try {
            serverSocket.close();
        } catch (IOException e) {
            throw new KoTNetworkException(ResourceLoader.getString(Resource.Error, "cantDisconnectServer"), e);
        }
        disconnectAllClients();
    }

    /**
     * Disconnect every client and clear the currently connected clients list.
     *
     * @throws KoTNetworkException When a client can't be correctly disconnected
     */
    public void disconnectAllClients() throws KoTNetworkException {
        try {
            for (Client client : clients) {
                client.disconnect();
            }
        } catch (KoTIOException e) {
            throw new KoTNetworkException(ResourceLoader.getString(Resource.Error, "cantDisconnectClient"), e);
        }
        clients.clear();
    }

    /**
     * Disconnect a given client. Remove it from the currently connected clients list.
     *
     * @param client Client to disconnect
     * @throws KoTNetworkException When the client can't be correctly disconnected
     */
    public void disconnectClient(Client client) throws KoTNetworkException {
        try {
            client.disconnect();
        } catch (KoTIOException e) {
            throw new KoTNetworkException(ResourceLoader.getString(Resource.Error, "cantDisconnectClient"), e);
        }
        clients.remove(client);
    }

    /**
     * Wait for a new connection, create a new client over this connection
     * and add it to the currently connected clients list.
     * <br>
     * Send a message to the client on a successful connection.
     *
     * @param position Ordinal of the connection
     * @throws KoTNetworkException When the connection can't be opened
     * @throws KoTIOException When the connection message can't be sent
     */
    private void manageNewConnection(int position) throws KoTNetworkException, KoTIOException {
        Client newClient;
        try {
            Socket socket = serverSocket.accept();
            newClient = Client.connect(socket);
            clients.add(newClient);
        } catch (IOException e) {
            throw new KoTNetworkException(ResourceLoader.getString(Resource.Error, "unableToOpenConnection", position), e);
        }

        sendConnectionMessage(newClient);
    }

    /**
     * Send a message to a client stating the connection has correctly been set.
     *
     * @param client Client which the message should be sent to
     * @throws KoTIOException When the message can't be sent
     */
    private void sendConnectionMessage(Client client) throws KoTIOException {
        final String text = ResourceLoader.getString(Resource.Game, "connectionEstablished");
        client.sendMessage(MessageFactory.createMessage(text, null, 0));
    }

    /**
     * Read a message from a currently connected client.
     * @param client Client to read the message from
     * @return Message that has been sent by the client
     * @throws KoTException When the client is not currently connected or no message can be read
     */
    public Message readMessage(Client client) throws KoTException {
        if (!clients.contains(client)) {
            throw new KoTException(ResourceLoader.getString(Resource.Error, "unknownClient"));
        }
        return client.readMessage();
    }
}
