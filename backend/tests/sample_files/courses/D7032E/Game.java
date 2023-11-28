package se.ltu.softwareengineering.game;

import se.ltu.softwareengineering.communication.message.Message;
import se.ltu.softwareengineering.communication.message.MessageFactory;
import se.ltu.softwareengineering.concept.Monster;
import se.ltu.softwareengineering.concept.card.EvolutionCard;
import se.ltu.softwareengineering.concept.card.StoreCard;
import se.ltu.softwareengineering.exception.KoTException;
import se.ltu.softwareengineering.exception.KoTIOException;
import se.ltu.softwareengineering.game.phase.Phase;
import se.ltu.softwareengineering.game.phase.Phase01Initialization;
import se.ltu.softwareengineering.game.state.DefaultGameState;
import se.ltu.softwareengineering.game.state.MonsterState;
import se.ltu.softwareengineering.player.Player;
import se.ltu.softwareengineering.tool.Resource;
import se.ltu.softwareengineering.tool.ResourceLoader;

import java.util.Set;

public class Game {
    // Should contain everything a game needs:
    //  - Players
    //  - Monsters
    //  - Game loop
    private DefaultGameState defaultGameState;

    public Game(Set<Player> players, Set<Monster> monsters, Set<EvolutionCard> evolutionCards, Set<StoreCard> storeCards) {
        defaultGameState = new DefaultGameState(players, monsters, evolutionCards, storeCards);
    }

    public void playGame() {
        Phase init = new Phase01Initialization(defaultGameState);
        Phase nextPhase;
        try {
            nextPhase = init.playPhase();
        } catch (KoTIOException e) {
            KoTException message = new KoTException(ResourceLoader.getString(Resource.Error, "cantInitialize"), e);
            sendErrorMessage(message);
            return;
        }

        while (nextPhase != null) {
            try {
                nextPhase = nextPhase.playPhase();
            } catch (KoTIOException e) {
                KoTException message = new KoTException(
                        ResourceLoader.getString(Resource.Error, "cantPlayPhase", nextPhase.getPhaseName()),
                        e
                );
                sendErrorMessage(message);
                e.printStackTrace();
            } catch (KoTWinnerException e) {
                MonsterState winner = e.getWinner();
                sendWinnerMessage(winner);
                break;
            }
        }

        Message gameOver = MessageFactory.createMessage(ResourceLoader.getString(Resource.Game, "gameOver"));
        for (Player player : defaultGameState.getPlayers()) {
            try {
                player.displayMessage(gameOver);
            } catch (KoTIOException e) {
                sendErrorMessage(e);
            }
        }
    }

    private void sendErrorMessage(KoTException e) {
        for (Player player : defaultGameState.getPlayers()) {
            try {
                player.displayError(e);
            } catch (KoTIOException ex) {
                ex.printStackTrace();
            }
        }
    }

    private void sendWinnerMessage(MonsterState winner) {
        String message;
        if (winner.getStars() >= GameConstantRules.STARS_TO_WIN) {
            message = ResourceLoader.getString(
                    Resource.Game,
                    "winnerByStars",
                    winner.getMonster().getName(),
                    winner.getStars()
            );
        } else {
            message = ResourceLoader.getString(
                    Resource.Game,
                    "winnerByDeath",
                    winner.getMonster().getName(),
                    winner.getMonster().getName()
            );
        }

        Message victoryMessage = MessageFactory.createMessage(message);

        for (Player player : defaultGameState.getPlayers()) {
            try {
                player.displayMessage(victoryMessage);
            } catch (KoTIOException ex) {
                ex.printStackTrace();
            }
        }
    }
}
