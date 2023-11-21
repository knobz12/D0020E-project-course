package se.ltu.softwareengineering;

import se.ltu.softwareengineering.communication.message.Choice;
import se.ltu.softwareengineering.communication.message.Information;
import se.ltu.softwareengineering.communication.message.Message;
import se.ltu.softwareengineering.communication.message.MessageFactory;
import se.ltu.softwareengineering.communication.network.Client;
import se.ltu.softwareengineering.communication.network.Server;
import se.ltu.softwareengineering.concept.Monster;
import se.ltu.softwareengineering.concept.card.EvolutionCard;
import se.ltu.softwareengineering.concept.card.StoreCard;
import se.ltu.softwareengineering.exception.KoTException;
import se.ltu.softwareengineering.exception.KoTIOException;
import se.ltu.softwareengineering.exception.KoTNetworkException;
import se.ltu.softwareengineering.game.ConceptLoader;
import se.ltu.softwareengineering.game.Game;
import se.ltu.softwareengineering.io.Console;
import se.ltu.softwareengineering.io.Input;
import se.ltu.softwareengineering.io.Output;
import se.ltu.softwareengineering.io.Remote;
import se.ltu.softwareengineering.player.HumanPlayer;
import se.ltu.softwareengineering.player.Player;
import se.ltu.softwareengineering.tool.Resource;
import se.ltu.softwareengineering.tool.ResourceLoader;

import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

public class KingTokyoPowerUp {
    public static void main(String[] args) {
        Console console = new Console();
        Player localPlayer = new HumanPlayer(console);
        startNewGame(localPlayer);
    }

    private static void startNewGame(Player localPlayer) {
        try {
            Message welcomeMessage = MessageFactory.createMessage(
                    ResourceLoader.getString(
                            Resource.Game,
                            "welcomeMessage",
                            ResourceLoader.getString(
                                    Resource.Game,
                                    "name"
                            )
                    )
            );

            localPlayer.displayMessage(welcomeMessage);

            Choice serverChoice = new Choice(
                    "1",
                    ResourceLoader.getString(
                            Resource.Game,
                            "hostChoice"
                    )
            );
            Choice clientChoice = new Choice(
                    "2",
                    ResourceLoader.getString(
                            Resource.Game,
                            "connectChoice"
                    )
            );
            Message askClientOrServerMessage = MessageFactory.createMessage(
                    ResourceLoader.getString(
                            Resource.Game,
                            "serverClientChoice"
                    ),
                    Arrays.asList(
                            serverChoice,
                            clientChoice
                    ),
                    1
            );

            Choice choice = localPlayer.chooseAction(askClientOrServerMessage).get(0);
            if (serverChoice.equals(choice)) {
                final Server server = hostServer(localPlayer);
                Set<Player> players = server.getClients()
                        .stream()
                        .map(Remote::new)
                        .map(HumanPlayer::new)
                        .collect(Collectors.toSet());

                startGame(players);
            } else {
                Client server = connectToServer(localPlayer);
                Console console = new Console();
                startClientGameLoop(server, console, console);
            }
        } catch (KoTIOException | KoTNetworkException e) {
            displayError(localPlayer, e);
        }
    }

    private static Server hostServer(Player localPlayer) throws KoTNetworkException, KoTIOException {
        Message askPort = MessageFactory.createMessage(
                ResourceLoader.getString(Resource.Game, "selectServerPort"),
                null,
                -1
        );

        Choice choice = localPlayer.chooseAction(askPort, c -> parseInt(c.getShortcut()) != null).get(0);

        //noinspection ConstantConditions
        int port = parseInt(choice.getShortcut());

        int playersNumber = askPlayersNumber(localPlayer);

        Server server = new Server(port);
        server.waitForConnections(playersNumber);

        return server;
    }

    private static Client connectToServer(Player localPlayer) throws KoTIOException, KoTNetworkException {
        Message askHost = MessageFactory.createMessage(
                ResourceLoader.getString(Resource.Game, "selectHost"),
                null,
                -1
        );
        Choice hostChoice = localPlayer.chooseAction(askHost).get(0);
        String host = hostChoice.getShortcut();

        Message askPort = MessageFactory.createMessage(
                ResourceLoader.getString(Resource.Game, "selectClientPort"),
                null,
                -1
        );

        Choice portChoice = localPlayer.chooseAction(askPort, c -> parseInt(c.getShortcut()) != null).get(0);
        //noinspection ConstantConditions
        int port = parseInt(portChoice.getShortcut());

        return Client.connect(host, port);
    }

    private static int askPlayersNumber(Player localPlayer) throws KoTIOException {
        Message askPlayersNumberMessage = MessageFactory.createMessage(
                ResourceLoader.getString(Resource.Game, "playersNumber"),
                null,
                -1
        );
        Choice choice = localPlayer.chooseAction(askPlayersNumberMessage, KingTokyoPowerUp::validatePlayerNumber).get(0);
        //noinspection ConstantConditions
        return parseInt(choice.getShortcut());
    }

    private static void displayError(Player player, KoTException e) {
        try {
            player.displayError(e);
        } catch (KoTIOException ex) {
            ex.printStackTrace();
        }
    }

    private static Integer parseInt(String text) {
        try {
            return Integer.parseInt(text);
        } catch (NumberFormatException ignored) {
            return null;
        }
    }

    private static boolean validatePlayerNumber(Choice choice) {
        Integer number = parseInt(choice.getShortcut());
        return number != null && number > 1;
    }

    private static void startGame(Set<Player> players) {
        final Set<Monster> monsters;
        final Set<StoreCard> storeCards;
        final Set<EvolutionCard> evolutionCards;

        try {
            monsters = ConceptLoader.loadMonsters();
            storeCards = ConceptLoader.loadStoreCards();
            evolutionCards = ConceptLoader.loadEvolutionCards();
        } catch (KoTIOException e) {
            KoTException exception = new KoTException(ResourceLoader.getString(Resource.Error, "cantLoadResources"), e);
            for (Player player : players) {
                try {
                    player.displayError(exception);
                } catch (KoTIOException ex) {
                    ex.printStackTrace();
                }
            }
            return;
        }

        Game game = new Game(players, monsters, evolutionCards, storeCards);
        game.playGame();
    }

    private static void startClientGameLoop(Client server, Input input, Output output) throws KoTIOException {
        Player player = new HumanPlayer(input, output);
        while (true) {
            Message gameOver = MessageFactory.createMessage(
                    ResourceLoader.getString(Resource.Game, "gameOver")
            );

            Message message = server.readMessage();
            if (message.equals(gameOver)) {
                output.displayMessage(gameOver);
                break;
            }

            if (message instanceof Information) {
                player.displayMessage(message);
            } else {
                List<Choice> choices = player.chooseAction(message);
                Message reply = MessageFactory.createMessage(choices);
                server.sendMessage(reply);
            }
        }
    }
}
