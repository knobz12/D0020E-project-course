package se.ltu.softwareengineering.game.state;

import se.ltu.softwareengineering.communication.message.Message;
import se.ltu.softwareengineering.communication.message.MessageFactory;
import se.ltu.softwareengineering.concept.*;
import se.ltu.softwareengineering.concept.card.Card;
import se.ltu.softwareengineering.concept.card.EvolutionCard;
import se.ltu.softwareengineering.concept.card.StoreCard;
import se.ltu.softwareengineering.exception.KoTIOException;
import se.ltu.softwareengineering.exception.KoTIOUncheckedException;
import se.ltu.softwareengineering.game.GameConstantRules;
import se.ltu.softwareengineering.game.KoTWinnerException;
import se.ltu.softwareengineering.game.action.CommonAction;
import se.ltu.softwareengineering.player.Player;
import se.ltu.softwareengineering.tool.Dice;
import se.ltu.softwareengineering.tool.Resource;
import se.ltu.softwareengineering.tool.ResourceLoader;

import java.util.*;
import java.util.stream.Collectors;

import static se.ltu.softwareengineering.game.GameConstantRules.*;

/**
 * Current state of the game. Contains all of the information needed to play the game.
 */
public class GameState {
    private Deck deck;

    /**
     * List of monsters that are in the game.
     * Its order represent the turn order.
     */
    private List<MonsterState> monsters;

    /**
     * Indicate which player plays which monster.
     */
    private Map<Monster, Player> players;

    /**
     * Indicate the evolution cards linked to a monster.
     */
    private Map<Monster, List<EvolutionCard>> evolutionCards;

    private MonsterState monsterInTokyo;

    private List<EffectProviderState> currentEffects = new ArrayList<>();

    public GameState(List<StoreCard> deck,
                     List<MonsterState> monsters,
                     Map<Monster, Player> players,
                     Map<Monster, List<EvolutionCard>> evolutionCards,
                     MonsterState monsterInTokyo) {
        this.deck = new Deck(deck, CARDS_IN_STORE);
        this.monsters = new ArrayList<>(monsters);
        this.players = new HashMap<>(players);
        this.evolutionCards = new HashMap<>(evolutionCards);
        this.monsterInTokyo = monsterInTokyo;
    }

    // region Getters
    public List<MonsterState> getMonsters() {
        return monsters;
    }

    public MonsterState getMonster(int position) {
        return monsters.get(position);
    }

    public Player getPlayer(Monster monster) {
        return players.get(monster);
    }

    public Collection<Player> getPlayers() {
        return players.values();
    }
    // endregion

    // region Store
    public List<StoreCard> getStore() {
        return deck.getStore();
    }

    public boolean isStoreEmpty() {
        return deck.getStore().isEmpty();
    }

    public void resetStore(MonsterState monster) {
        int energyToReset = ENERGY_TO_RESET + monster.getAlteration(AlterationType.EnergyToReset);
        monster.addEnergy(-energyToReset);
        deck.resetStore();
    }

    public StoreCard buyCard(MonsterState monster, int position) {
        int cardCostAlteration = monster.getAlteration(AlterationType.CardCost);
        StoreCard card = deck.takeCard(position);

        int cardCost = card.getCost() + cardCostAlteration;
        monster.addEnergy(-cardCost);

        return card;
    }
    // endregion

    // region Evolution cards
    private EvolutionCard getFirstEvolutionCard(Monster monster) {
        List<EvolutionCard> evolutionCardsForMonster = evolutionCards.getOrDefault(monster, new ArrayList<>());
        if (evolutionCardsForMonster.isEmpty()) return null;

        return evolutionCards
                .get(monster)
                .get(0);
    }

    public EvolutionCard removeFirstEvolutionCard(Monster monster) {
        EvolutionCard card = getFirstEvolutionCard(monster);
        if (card != null) {
            evolutionCards.get(monster).remove(0);
        }
        return card;
    }
    //endregion

    // region Tokyo
    public boolean isTokyoFree() {
        return monsterInTokyo == null;
    }

    public void freeTokyo() throws KoTIOException {
        if (checkEffects(TriggeringAction.LeaveTokyo)) {
            Message leaveTokyoMessage = MessageFactory.createMessage(
                    ResourceLoader.getString(
                            Resource.Game,
                            "tokyoLeft",
                            monsterInTokyo.getMonster().getName()
                    )
            );
            sendMessageToEverybody(leaveTokyoMessage);
            monsterInTokyo = null;
        }
    }

    public boolean isInTokyo(MonsterState monster) {
        return Objects.equals(monster, monsterInTokyo);
    }

    public MonsterState getMonsterInTokyo() {
        return monsterInTokyo;
    }

    public void invadeTokyo(MonsterState monster) throws KoTIOException {
        if (checkEffects(TriggeringAction.InvadeTokyo)) {
            Message invadeTokyoMessage = MessageFactory.createMessage(
                    ResourceLoader.getString(
                            Resource.Game,
                            "invadeTokyo",
                            monster.getMonster().getName()
                    )
            );
            sendMessageToEverybody(invadeTokyoMessage);
            monsterInTokyo = monster;

            if (checkEffects(TriggeringAction.GainStars)) {
                addStars(monster, GameConstantRules.STARS_WHEN_INVADING_TOKYO);
            }
        }
    }
    // endregion

    // region Effects
    private List<EffectProviderState> getCurrentEffects() {
        return currentEffects;
    }

    /**
     * Register a continuous spell.
     *
     * @param effectProviderState Provider of the effect
     */
    public void registerSpell(EffectProviderState effectProviderState) {
        currentEffects.add(effectProviderState);
    }

    /**
     * Unregister an effect provider from every monster that has registered this card before.
     *
     * @param provider Card that provides no more effect
     */
    public void unregisterEffect(EffectProvider provider) {
        List<EffectProviderState> currentEffectsStates = currentEffects
                .stream()
                .filter(state -> Objects.equals(state.getProvider(), provider))
                .collect(Collectors.toList());
        currentEffects.removeAll(currentEffectsStates);
        monsters.forEach(monster -> monster.unregisterAlteration(provider));
    }

    public int dealDamages(MonsterState attacker, MonsterState defender, int value) {
        int armor = defender.getArmor();
        int realDamages = Math.max(0, value - armor);

        try {
            if (realDamages > 0 && checkEffects(TriggeringAction.DealDamages)) {
                Message damagesMessage = MessageFactory.createMessage(
                        ResourceLoader.getString(
                                Resource.Game,
                                "dealDamages",
                                attacker.getMonster().getName(),
                                realDamages,
                                defender.getMonster().getName()
                        )
                );
                sendMessageToEverybody(damagesMessage);
                defender.addHealth(-realDamages);

                Message healtLeftMessage = MessageFactory.createMessage(
                        ResourceLoader.getString(
                                Resource.Game,
                                "remainingHp",
                                defender.getMonster().getName(),
                                defender.getCurrentHealth()
                        )
                );
                sendMessageToEverybody(healtLeftMessage);
            } else {
                Message message = MessageFactory.createMessage(
                        ResourceLoader.getString(
                                Resource.Game,
                                "noDamage",
                                attacker.getMonster().getName(),
                                defender.getMonster().getName()
                        )
                );
                sendMessageToEverybody(message);
            }
        } catch (KoTIOException e) {
            throw new KoTIOUncheckedException(e);
        }

        isGameWon();
        return realDamages;
    }

    public void addStars(MonsterState target, int value) {
        try {
            if (checkEffects(TriggeringAction.GainStars)) {
                Message earnStar = MessageFactory.createMessage(
                        ResourceLoader.getString(
                                Resource.Game,
                                "earnStar",
                                target.getMonster().getName(),
                                value,
                                target.getMonster().getName(),
                                target.getStars()
                        )
                );
                sendMessageToEverybody(earnStar);
                target.addStars(value);
            }
        } catch (KoTIOException e) {
            throw new KoTIOUncheckedException(e);
        }

        isGameWon();
    }

    public void addEnergy(MonsterState target, int value) {
        try {
            if (checkEffects(TriggeringAction.GainEnergy)) {
                Message earnEnery = MessageFactory.createMessage(
                        ResourceLoader.getString(
                                Resource.Game,
                                "earnEnergy",
                                target.getMonster().getName(),
                                value,
                                target.getMonster().getName(),
                                target.getEnergy()
                        )
                );
                sendMessageToEverybody(earnEnery);
                target.addEnergy(value);
            }
        } catch (KoTIOException e) {
            throw new KoTIOUncheckedException(e);
        }

        isGameWon();
    }

    public void addHearts(MonsterState target, int value) {
        try {
            if (checkEffects(TriggeringAction.GainHealth)) {
                int lostHps = target.computeLostHps();
                int realValue = Math.min(value, lostHps);

                Message recoverHealth = MessageFactory.createMessage(
                        ResourceLoader.getString(
                                Resource.Game,
                                "recoverHealth",
                                target.getMonster().getName(),
                                realValue,
                                target.getMonster().getName(),
                                target.getCurrentHealth()
                        )
                );
                sendMessageToEverybody(recoverHealth);
                target.addHealth(realValue);
            }
        } catch (KoTIOException e) {
            throw new KoTIOUncheckedException(e);
        }

        isGameWon();
    }

    /**
     * Check current effects that are applied on the game.
     *
     * @param triggeringAction Action that will be executed after the effects have been checked.
     * @return Whether the action should be executed or not
     * @throws KoTIOException When there is a problem while communicating with the players.
     */
    public boolean checkEffects(TriggeringAction triggeringAction) throws KoTIOException {
        List<EffectProviderState> currentEffects = getCurrentEffects();
        Map<EffectProviderState, Spell> triggeredEffects = new HashMap<>();
        for (EffectProviderState currentEffect : currentEffects) {
            for (Spell spell : currentEffect.getProvider().getEffects()) {
                if (isTriggered(spell.getTriggeringActions(), triggeringAction)) {
                    triggeredEffects.put(currentEffect, spell);
                }
            }
        }

        boolean shouldContinue = true;
        for (EffectProviderState effectProviderState : triggeredEffects.keySet()) {
            Spell spell = triggeredEffects.get(effectProviderState);
            Message message = MessageFactory.createMessage(
                    ResourceLoader.getString(
                            Resource.Game,
                            "triggeredEffect",
                            effectProviderState.getProvider().getName())
            );
            sendMessageToEverybody(message);
            for (Target target : spell.getTargets()) {
                shouldContinue = shouldContinue &&
                        CommonAction
                                .findAction(spell.getEffect())
                                .execute(this,
                                        effectProviderState,
                                        spell.getValue(),
                                        target);
            }
        }

        return shouldContinue;
    }

    private boolean isTriggered(List<TriggeringAction> spellTriggeringActions, TriggeringAction triggeringAction) {
        return spellTriggeringActions.contains(triggeringAction);
    }

    /**
     * Compute a stringified representation of the statistics of a monster.
     *
     * @param monster Monster whose the stringified representation of the statistics should be computed
     * @return The computed String
     */
    private String getStats(MonsterState monster, boolean showUnrevealedCards) {
        StringBuilder builder = new StringBuilder();
        builder.append(
                ResourceLoader.getString(
                        Resource.Game,
                        "stats",
                        monster.getMonster().getName(),
                        monster.getCurrentHealth(),
                        monster.getMaxHealth(),
                        monster.getStars(),
                        monster.getEnergy()
                )
        );

        List<Card> revealedCards = monster.getRevealedCards();
        List<Card> unrevealedCards = monster.getUnrevealedCards();

        if (!revealedCards.isEmpty()) {
            String cards = revealedCards.stream()
                    .map(card -> card.getName() + " : " + card.getType() + " : " + card.getDescription())
                    .collect(Collectors.joining(System.lineSeparator()));
            builder
                    .append(System.lineSeparator())
                    .append(
                            ResourceLoader.getString(Resource.Game,
                                    "revealedCards",
                                    monster.getMonster().getName(),
                                    cards
                            )
                    );
        }
        if (!unrevealedCards.isEmpty()) {
            if (showUnrevealedCards) {
                String cards = unrevealedCards.stream()
                        .map(card -> "\t" + card.getName() + " : " + card.getType() + " : " + card.getDescription())
                        .collect(Collectors.joining(System.lineSeparator()));
                builder
                        .append(System.lineSeparator())
                        .append(
                                ResourceLoader.getString(
                                        Resource.Game,
                                        "unrevealedCards",
                                        monster.getMonster().getName(),
                                        cards
                                )
                        );
            } else {
                builder
                        .append(System.lineSeparator())
                        .append(
                                ResourceLoader.getString(
                                        Resource.Game,
                                        "otherOwnsUnrevealedCards",
                                        monster.getMonster().getName(),
                                        unrevealedCards.size()
                                )
                        );
            }
        }

        return builder.toString();
    }

    /**
     * Display stats of monsters.
     *
     * @throws KoTIOException When there is a problem while communicating with the players.
     */
    public void displayStats() throws KoTIOException {
        for (MonsterState currentMonster : getMonsters()) {
            for (MonsterState monster : getMonsters()) {
                String stats = getStats(monster, monster.equals(currentMonster));
                Message statsMessage = MessageFactory.createMessage(stats);
                sendMessage(statsMessage, currentMonster);
            }
        }
    }

    /**
     * Send a message to every players. Do not wait for reply.
     *
     * @param message Message to send
     * @throws KoTIOException When there is a problem while communicating with the players.
     */
    public void sendMessageToEverybody(Message message) throws KoTIOException {
        for (Player player : players.values()) {
            player.displayMessage(message);
        }
    }

    /**
     * Send a message to a player. Do not wait for reply.
     *
     * @param message Message to send
     * @throws KoTIOException When there is a problem while communicating with the players.
     */
    public void sendMessage(Message message, MonsterState recipient) throws KoTIOException {
        getPlayer(recipient.getMonster()).displayMessage(message);
    }

    public void removeFromGame(MonsterState monster) throws KoTIOException {
        monsters.remove(monster);
        if (isInTokyo(monster)) {
            freeTokyo();
        }
    }
    // endregion

    /**
     * End the turn of the current monster and start the turn of the next one.
     */
    public void nextTurn() {
        final MonsterState formerMonster = monsters.remove(0);
        monsters.add(formerMonster);
    }

    /**
     * Check whether there is a winner.
     *
     * @return null if there is no winner, the winner otherwise.
     */
    private MonsterState findWinner() {
        List<MonsterState> aliveMonsters = monsters
                .stream()
                .filter(monster -> !monster.isDead())
                .collect(Collectors.toList());
        if (aliveMonsters.size() == 1) {
            return aliveMonsters.get(0);
        }

        return monsters
                .stream()
                .filter(monster -> monster.getStars() >= STARS_TO_WIN + monster.getAlteration(AlterationType.StarsToWin))
                .limit(1)
                .findFirst()
                .orElse(null);
    }

    /**
     * Throw a KoTWinnerException if the game is ended. The winner can be accessed in the exception.
     *
     * @throws KoTWinnerException when there is a winner
     */
    public void isGameWon() {
        MonsterState winner = findWinner();
        if (winner != null) {
            throw new KoTWinnerException(winner);
        }
    }

    // region Java boilerplate
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        GameState gameState = (GameState) o;
        return Objects.equals(deck, gameState.deck) &&
                Objects.equals(getMonsters(), gameState.getMonsters()) &&
                Objects.equals(players, gameState.players) &&
                Objects.equals(evolutionCards, gameState.evolutionCards) &&
                Objects.equals(monsterInTokyo, gameState.monsterInTokyo);
    }

    @Override
    public int hashCode() {
        return Objects.hash(deck, getMonsters(), players, evolutionCards, monsterInTokyo);
    }

    @Override
    public String toString() {
        return "GameState{" +
                "deck=" + deck +
                ", monsters=" + monsters +
                ", players=" + players +
                ", evolutionCards=" + evolutionCards +
                ", monsterInTokyo=" + monsterInTokyo +
                '}';
    }
    // endregion
}
