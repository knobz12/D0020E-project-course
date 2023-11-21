package se.ltu.softwareengineering.game.phase;

import se.ltu.softwareengineering.communication.message.Choice;
import se.ltu.softwareengineering.communication.message.Message;
import se.ltu.softwareengineering.communication.message.MessageFactory;
import se.ltu.softwareengineering.concept.*;
import se.ltu.softwareengineering.concept.card.Card;
import se.ltu.softwareengineering.concept.card.CardType;
import se.ltu.softwareengineering.exception.FunctionException;
import se.ltu.softwareengineering.exception.KoTException;
import se.ltu.softwareengineering.exception.KoTIOException;
import se.ltu.softwareengineering.game.action.CommonAction;
import se.ltu.softwareengineering.game.state.GameState;
import se.ltu.softwareengineering.game.state.EffectProviderState;
import se.ltu.softwareengineering.game.state.MonsterState;
import se.ltu.softwareengineering.player.Player;
import se.ltu.softwareengineering.tool.Resource;
import se.ltu.softwareengineering.tool.ResourceLoader;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

/**
 * Phase of the game.
 * Inheriting classes define a graph wherein the navigation is defined by the current game state.
 */
public abstract class Phase {
    final GameState gameState;

    Phase(GameState gameState) {
        this.gameState = gameState;
    }

    /**
     * Compute and return the next phase to play given the current game state.
     *
     * @param gameState Current game state
     * @return The next phase to play.
     */
    abstract Phase computeNextPhase(GameState gameState);

    /**
     * Play the phase and return the next phase to play.
     *
     * @return The next phase to play
     * @throws KoTIOException When there is a problem while communicating with the players.
     */
    public abstract Phase playPhase() throws KoTIOException;

    /**
     * Do some initialisation of the phase. Usually it checks whether a player wants to play a card.
     *
     * @throws KoTIOException When there is a problem while communicating with the players.
     */
    abstract void initPhase() throws KoTIOException;

    /**
     * Check current effects that are applied on the game.
     *
     * @param gameState        Current game state
     * @param triggeringAction Action that will be executed after the effects have been checked.
     * @return Whether the action should be executed or not
     * @throws KoTIOException When there is a problem while communicating with the players.
     */
    boolean checkEffects(GameState gameState, TriggeringAction triggeringAction) throws KoTIOException {
        return gameState.checkEffects(triggeringAction);
    }

    /**
     * Send a message to every players. Do not wait for reply.
     *
     * @param message Message to send
     * @throws KoTIOException When there is a problem while communicating with the players.
     */
    void sendMessageToEverybody(Message message) throws KoTIOException {
        gameState.sendMessageToEverybody(message);
    }

    /**
     * Send a message to the current player. Do not wait for reply.
     *
     * @param message Message to send
     * @throws KoTIOException When there is a problem while communicating with the players.
     */
    void sendMessageToCurrentMonster(Message message) throws KoTIOException {
        sendMessage(message, gameState.getMonster(0));
    }

    /**
     * Send a message to a player. Do not wait for reply.
     *
     * @param message Message to send
     * @throws KoTIOException When there is a problem while communicating with the players.
     */
    private void sendMessage(Message message, MonsterState recipient) throws KoTIOException {
        gameState.sendMessage(message, recipient);
    }

    /**
     * Ask the current player to make a choice.
     *
     * @param message Choice to make
     * @throws KoTIOException When there is a problem while communicating with the players.
     */
    List<Choice> askCurrentMonster(Message message) throws KoTIOException {
        return ask(message, gameState.getMonster(0));
    }

    /**
     * Ask a player to make a choice.
     *
     * @param message Choice to make
     * @throws KoTIOException When there is a problem while communicating with the players.
     */
    List<Choice> ask(Message message, MonsterState monster) throws KoTIOException {
        return gameState.getPlayer(monster.getMonster()).chooseAction(message);
    }

    /**
     * Display stats of every monster to current monster.
     *
     * @throws KoTIOException When there is a problem while communicating with the players.
     */
    void displayStats() throws KoTIOException {
        gameState.displayStats();
    }

    public abstract String getPhaseName();

    /**
     * Ask a player whether he/she wants to play one or more cards. Play them.
     *
     * @param monster Monster linked to the player that should be asked
     * @throws KoTIOException When there is a problem while communicating with the players.
     */
    void askToPlayCards(MonsterState monster) throws KoTIOException {
        List<Card> unrevealedCards = monster.getUnrevealedCards();
        if (unrevealedCards.isEmpty()) return;

        String cards = unrevealedCards.stream()
                .map(card -> card.getName() + " : " + card.getType() + " : " + card.getDescription())
                .collect(Collectors.joining(System.lineSeparator()));

        List<Choice> choices = IntStream
                .range(0, unrevealedCards.size())
                .boxed()
                .map(i -> new Choice(
                        String.valueOf(i + 1),
                        unrevealedCards.get(i).getDescription()
                ))
                .collect(Collectors.toList());
        choices.add(new Choice(
                ResourceLoader.getString(
                        Resource.Game,
                        "cancel"
                ),
                ResourceLoader.getString(
                        Resource.Game,
                        "cancel"
                )
        ));

        Message message = MessageFactory.createMessage(
                ResourceLoader.getString(
                        Resource.Game,
                        "youOwnUnrevealedCards",
                        cards
                ),
                choices,
                choices.size()
        );

        List<Choice> chosenCards = gameState
                .getPlayer(monster.getMonster())
                .chooseAction(message);

        for (Choice chosenCard : chosenCards) {
            String cancelShortcut = ResourceLoader.getString(
                    Resource.Game,
                    "cancel"
            );
            if (cancelShortcut.equalsIgnoreCase(chosenCard.getShortcut())) {
                return;
            }

            int index = Integer.valueOf(chosenCard.getShortcut()) - 1;
            Card card = unrevealedCards.get(index);
            playCard(monster, card);
        }
    }

    private void playSpell(MonsterState monster, Card card, Spell spell) throws KoTIOException {
        Effect effect = spell.getEffect();
        CommonAction action = CommonAction.valueOf(effect.name());
        for (Target target : spell.getTargets()) {
            action.execute(gameState, new EffectProviderState(monster, card), spell.getValue(), target);
        }
    }

    void playCard(MonsterState monster, Card card) throws KoTIOException {
        Message playedCardMessage = MessageFactory.createMessage(
                ResourceLoader.getString(
                        Resource.Game,
                        "playCard",
                        monster.getMonster().getName(),
                        card.getName()
                )
        );
        sendMessageToEverybody(playedCardMessage);

        if (CardType.Keep.equals(card.getType())) {
            monster.revealCard(card);
        } else {
//            monster.removeCard(card); //FIXME
        }
        for (Spell spell : card.getEffects()) {
            playSpell(monster, card, spell);
        }

        displayStats();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Phase phase = (Phase) o;
        return Objects.equals(gameState, phase.gameState);
    }

    @Override
    public int hashCode() {
        return Objects.hash(gameState);
    }
}
