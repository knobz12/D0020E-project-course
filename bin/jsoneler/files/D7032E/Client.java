package se.ltu.softwareengineering.communication.network;

import se.ltu.softwareengineering.communication.message.Message;
import se.ltu.softwareengineering.exception.KoTIOException;
import se.ltu.softwareengineering.exception.KoTNetworkException;
import se.ltu.softwareengineering.tool.ResourceLoader;
import se.ltu.softwareengineering.tool.Resource;

import java.io.*;
import java.net.Socket;

/**
 * A network client providing a messages sending and receiving interface.
 * Can be connected to a socket or any ObjectOutputStream and ObjectInputStream.
 */
public class Client {
    private final ObjectOutputStream output;
    private final ObjectInputStream input;

    public Client(ObjectInputStream input, ObjectOutputStream output) {
        this.output = output;
        this.input = input;
    }

    /**
     * Create a socket from the parameter and connect a new Client object to this socket.
     *
     * @param host Remote hostname
     * @param port Remote port
     * @return Client object connected to a remote
     * @throws KoTNetworkException When the connection hasn't been established
     */
    public static Client connect(String host, int port) throws KoTNetworkException {
        Socket socket;
        try {
            socket = new Socket(host, port);
        } catch (IOException e) {
            throw new KoTNetworkException(ResourceLoader.getString(Resource.Error, "unableToConnectToHostPort", host, port), e);
        }
        return connect(socket);
    }

    /**
     * Connect a new Client object to a socket.
     *
     * @param socket Socket to connect to the client
     * @return Client object connected to a remote
     * @throws KoTNetworkException When the connection hasn't been established
     */
    public static Client connect(Socket socket) throws KoTNetworkException {
        try {
            ObjectOutputStream output = new ObjectOutputStream(socket.getOutputStream());
            ObjectInputStream input = new ObjectInputStream(socket.getInputStream());

            return new Client(input, output);
        } catch (IOException e) {
            throw new KoTNetworkException(ResourceLoader.getString(Resource.Error, "unableToConnect"), e);
        }
    }

    /**
     * Send a message as an object to the remote. Enable the remote to read and instantiate the Message object directly.
     *
     * @param message Message to send
     * @throws KoTIOException When the message hasn't been sent
     */
    public void sendMessage(Message message) throws KoTIOException {
        try {
            output.writeObject(message);
        } catch (IOException e) {
            throw new KoTIOException(ResourceLoader.getString(Resource.Error, "cantSendMessage"), e);
        }
    }

    /**
     * Wait until a Message object has been received from the remote.
     * Then instantiate this message as an object and return it.
     *
     * @return Instantiated Message object
     * @throws KoTIOException When the message hasn't been read
     */
    public Message readMessage() throws KoTIOException {
        try {
            return (Message) input.readObject();
        } catch (IOException e) {
            throw new KoTIOException(ResourceLoader.getString(Resource.Error, "cantReadMessage"), e);
        } catch (ClassNotFoundException e) {
            // Server and client should share the same classes.
            // A not found class means this class does not belong to the project.
            throw new RuntimeException(e);
        }
    }

    /**
     * Disconnect the client from the remote.
     * @throws KoTIOException When one of the stream hasn't been correctly closed.
     */
    public void disconnect() throws KoTIOException {
        try {
            if (output != null) {
                output.close();
            }
            if (input != null) {
                input.close();
            }
        } catch (IOException e) {
            throw new KoTIOException(e);
        }
    }
}
