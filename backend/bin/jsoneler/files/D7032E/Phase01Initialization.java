package se.ltu.softwareengineering.game.phase;

import se.ltu.softwareengineering.communication.message.Message;
import se.ltu.softwareengineering.communication.message.MessageFactory;
import se.ltu.softwareengineering.concept.Monster;
import se.ltu.softwareengineering.concept.card.Card;
import se.ltu.softwareengineering.concept.card.EvolutionCard;
import se.ltu.softwareengineering.concept.card.StoreCard;
import se.ltu.softwareengineering.exception.KoTIOException;
import se.ltu.softwareengineering.game.state.DefaultGameState;
import se.ltu.softwareengineering.game.state.GameState;
import se.ltu.softwareengineering.game.state.MonsterState;
import se.ltu.softwareengineering.player.Player;
import se.ltu.softwareengineering.tool.Randomizer;
import se.ltu.softwareengineering.tool.Resource;
import se.ltu.softwareengineering.tool.ResourceLoader;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

public class Phase01Initialization extends Phase {
    private final DefaultGameState defaultGameState;

    public Phase01Initialization(DefaultGameState defaultGameState) {
        super(null);
        this.defaultGameState = defaultGameState;
    }

    @Override
    public Phase playPhase() throws KoTIOException {
        final List<StoreCard> deck = shuffleDeck(defaultGameState.getStoreCards());
        final Map<Monster, Player> players = assignMonsters(defaultGameState);
        final List<MonsterState> monsters = players
                .keySet()
                .stream()
                .map(this::initializeMonsterState)
                .collect(Collectors.toList());

        final Set<EvolutionCard> defaultEvolutionCards = defaultGameState.getEvolutionCards();
        final Map<Monster, List<EvolutionCard>> evolutionCards = new HashMap<>(players.size());
        for (Monster monster : players.keySet()) {
            Collection<EvolutionCard> evolutionCardsForMonster = getEvolutionCards(defaultEvolutionCards, monster);
            evolutionCards.put(monster, shuffleDeck(evolutionCardsForMonster));
        }

        final GameState gameState = new GameState(
                deck,
                monsters,
                players,
                evolutionCards,
                null
        );

        Message gameStarts = MessageFactory.createMessage(
                ResourceLoader.getString(
                        Resource.Game,
                        "gameStarts"
                )
        );
        gameState.sendMessageToEverybody(gameStarts);

        for (Map.Entry<Monster, Player> entry : players.entrySet()) {
            Message assignedMonster = MessageFactory.createMessage(
                    ResourceLoader.getString(
                            Resource.Game,
                            "assignedMonster",
                            entry.getKey().getName()
                    )
            );
            entry.getValue().displayMessage(assignedMonster);
        }

        return computeNextPhase(gameState);
    }

    @Override
    void initPhase() {

    }

    @Override
    public String getPhaseName() {
        return "Initialization";
    }

    @Override
    Phase computeNextPhase(GameState gameState) {
        return new Phase02BeginTurn(gameState);
    }

    private Map<Monster, Player> assignMonsters(DefaultGameState defaultGameState) {
        Set<Player> players = defaultGameState.getPlayers();
        Set<Monster> monsters = defaultGameState.getMonsters();

        List<Monster> pickedMonsters = Randomizer.pickRandomElements(monsters, players.size());
        List<Player> shuffledPlayers = Randomizer.shuffle(players);

        return IntStream
                .range(0, players.size())
                .boxed()
                .collect(
                        Collectors.toMap(
                                pickedMonsters::get,
                                shuffledPlayers::get,
                                (x, y) -> y,
                                LinkedHashMap::new
                        )
                );
    }

    private <T extends Card> List<T> shuffleDeck(Collection<T> deck) {
        return Randomizer.shuffle(deck);
    }

    private MonsterState initializeMonsterState(Monster monster) {
        return new MonsterState(
                monster
        );
    }

    private Collection<EvolutionCard> getEvolutionCards(Collection<EvolutionCard> cards, Monster monster) {
        return cards
                .stream()
                .filter(c -> c.getMonsterName().equalsIgnoreCase(monster.getName()))
                .collect(Collectors.toList());
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Phase01Initialization that = (Phase01Initialization) o;
        return Objects.equals(defaultGameState, that.defaultGameState);
    }

    @Override
    public int hashCode() {
        return Objects.hash(defaultGameState);
    }
}
