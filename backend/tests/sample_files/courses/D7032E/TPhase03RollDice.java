package se.ltu.softwareengineering.game.phase;

import org.junit.Test;
import se.ltu.softwareengineering.concept.Effect;
import se.ltu.softwareengineering.concept.Monster;
import se.ltu.softwareengineering.concept.Spell;
import se.ltu.softwareengineering.concept.Target;
import se.ltu.softwareengineering.concept.card.CardType;
import se.ltu.softwareengineering.concept.card.EvolutionCard;
import se.ltu.softwareengineering.exception.KoTIOException;
import se.ltu.softwareengineering.game.state.GameState;
import se.ltu.softwareengineering.game.state.MonsterState;
import se.ltu.softwareengineering.io.Console;
import se.ltu.softwareengineering.io.Input;
import se.ltu.softwareengineering.io.InputString;
import se.ltu.softwareengineering.player.HumanPlayer;
import se.ltu.softwareengineering.player.Player;
import se.ltu.softwareengineering.tool.Randomizer;

import java.util.*;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

public class TPhase03RollDice {
    /**
     * Test requirements 12:
     * <ul>
     * <li>3 x 2 STAR</li>
     * <li>3 x 3 STAR</li>
     * </ul>
     *
     * @throws KoTIOException when an IO operation fails
     */
    @Test
    public void rollStars() throws KoTIOException {
        List<Monster> monsters = Arrays.asList(
                new Monster("Kong", 10, 1, 0),
                new Monster("Gigazaur", 10, 1, 0)
        );
        List<MonsterState> monsterStates = monsters.stream()
                .map(MonsterState::new)
                .collect(Collectors.toList());

        Input input = new InputString(
                new LinkedList<>(
                        Arrays.asList(
                                "1,2,3,4,5,6",
                                "1,2,3"
                        )
                )
        );
        Map<Monster, Player> players = monsters
                .stream()
                .collect(
                        Collectors.toMap(
                                monster -> monster,
                                monster -> new HumanPlayer(input, new Console())
                        )
                );

        GameState gameState = new GameState(
                new ArrayList<>(),
                monsterStates,
                players,
                new HashMap<>(),
                monsterStates.get(0)
        );


        Randomizer.addValues(
                0, 0, 0, 0, 0, 0,   // First roll
                0, 0, 0, 1, 1, 1,   // Second roll
                2, 2, 2             // Third roll
        );

        GameState newGameState = new Phase03RollDice(gameState).playPhase().gameState;

        List<MonsterState> expectedMonsterStates = monsters.stream()
                .map(MonsterState::new)
                .collect(Collectors.toList());
        expectedMonsterStates.get(0).addStars(5);
        GameState expected = new GameState(
                new ArrayList<>(),
                expectedMonsterStates,
                players,
                new HashMap<>(),
                expectedMonsterStates.get(0)
        );

        assertEquals(expected, newGameState);
        assertFalse(Randomizer.hasValues());
    }

    /**
     * Test requirements 12:
     * <ul>
     * <li>4 x 1 STAR</li>
     * <li>2 x ENERGY</li>
     * </ul>
     *
     * @throws KoTIOException when an IO operation fails
     */
    @Test
    public void rollStarsAndEnergy() throws KoTIOException {
        List<Monster> monsters = Arrays.asList(
                new Monster("Kong", 10, 1, 0),
                new Monster("Gigazaur", 10, 1, 0)
        );
        List<MonsterState> monsterStates = monsters.stream()
                .map(MonsterState::new)
                .collect(Collectors.toList());

        Input input = new InputString(
                new LinkedList<>(
                        Arrays.asList(
                                "1,2,3,4,5,6",
                                "1,2,3"
                        )
                )
        );
        Map<Monster, Player> players = monsters
                .stream()
                .collect(
                        Collectors.toMap(
                                monster -> monster,
                                monster -> new HumanPlayer(input, new Console())
                        )
                );

        GameState gameState = new GameState(
                new ArrayList<>(),
                monsterStates,
                players,
                new HashMap<>(),
                monsterStates.get(0)
        );


        Randomizer.addValues(
                0, 0, 0, 0, 0, 0,   // First roll
                0, 0, 0, 0, 0, 0,   // Second roll
                0, 5, 5             // Third roll
        );

        GameState newGameState = new Phase03RollDice(gameState).playPhase().gameState;

        List<MonsterState> expectedMonsterStates = monsters.stream()
                .map(MonsterState::new)
                .collect(Collectors.toList());
        expectedMonsterStates.get(0).addStars(2);
        expectedMonsterStates.get(0).addEnergy(2);
        GameState expected = new GameState(
                new ArrayList<>(),
                expectedMonsterStates,
                players,
                new HashMap<>(),
                expectedMonsterStates.get(0)
        );

        assertEquals(expected, newGameState);
        assertFalse(Randomizer.hasValues());
    }

    /**
     * Test requirements 12:
     * HEART in Tokyo
     *
     * @throws KoTIOException when an IO operation fails
     */
    @Test
    public void rollHeartInTokyo() throws KoTIOException {
        List<Monster> monsters = Collections.singletonList(
                new Monster("Kong", 10, 1, 0)
        );
        List<MonsterState> monsterStates = monsters.stream()
                .map(MonsterState::new)
                .collect(Collectors.toList());

        monsterStates.get(0).addHealth(-7);

        Input input = new InputString(
                new LinkedList<>(
                        Arrays.asList(
                                "1,2,3,4,5,6",
                                "1,2,3"
                        )
                )
        );
        Map<Monster, Player> players = monsters
                .stream()
                .collect(
                        Collectors.toMap(
                                monster -> monster,
                                monster -> new HumanPlayer(input, new Console())
                        )
                );

        GameState gameState = new GameState(
                new ArrayList<>(),
                monsterStates,
                players,
                new HashMap<>(),
                monsterStates.get(0)
        );


        Randomizer.addValues(
                4, 4, 4, 4, 4, 4,   // First roll
                4, 4, 4, 4, 4, 4,   // Second roll
                4, 4, 4             // Third roll
        );

        GameState newGameState = new Phase03RollDice(gameState).playPhase().gameState;

        List<MonsterState> expectedMonsterStates = monsters.stream()
                .map(MonsterState::new)
                .collect(Collectors.toList());
        expectedMonsterStates.get(0).addHealth(-7);
        GameState expected = new GameState(
                new ArrayList<>(),
                expectedMonsterStates,
                players,
                new HashMap<>(),
                expectedMonsterStates.get(0)
        );

        assertEquals(expected, newGameState);
        assertFalse(Randomizer.hasValues());
    }

    /**
     * Test requirements 12:
     * HEART not in Tokyo
     *
     * @throws KoTIOException when an IO operation fails
     */
    @Test
    public void rollHeartNotInTokyo() throws KoTIOException {
        List<Monster> monsters = Arrays.asList(
                new Monster("Kong", 10, 1, 0),
                new Monster("Gigazaur", 10, 1, 0)
        );
        List<MonsterState> monsterStates = monsters.stream()
                .map(MonsterState::new)
                .collect(Collectors.toList());

        monsterStates.get(0).addHealth(-7);

        Input input = new InputString(
                new LinkedList<>(
                        Arrays.asList(
                                "1,2,3,4,5,6",
                                "1,2,3"
                        )
                )
        );
        Map<Monster, Player> players = monsters
                .stream()
                .collect(
                        Collectors.toMap(
                                monster -> monster,
                                monster -> new HumanPlayer(input, new Console())
                        )
                );

        GameState gameState = new GameState(
                new ArrayList<>(),
                monsterStates,
                players,
                new HashMap<>(),
                null
        );


        Randomizer.addValues(
                4, 4, 4, 4, 4, 4,   // First roll
                4, 4, 4, 4, 4, 4,   // Second roll
                4, 4, 4             // Third roll
        );

        GameState newGameState = new Phase03RollDice(gameState).playPhase().gameState;

        List<MonsterState> expectedMonsterStates = monsters.stream()
                .map(MonsterState::new)
                .collect(Collectors.toList());
        expectedMonsterStates.get(0).addHealth(-1);
        GameState expected = new GameState(
                new ArrayList<>(),
                expectedMonsterStates,
                players,
                new HashMap<>(),
                null
        );

        assertEquals(expected, newGameState);
        assertFalse(Randomizer.hasValues());
    }

    /**
     * Test requirements 12:
     * Max HEART not in Tokyo
     *
     * @throws KoTIOException when an IO operation fails
     */
    @Test
    public void rollMaxHeartNotInTokyo() throws KoTIOException {
        List<Monster> monsters = Arrays.asList(
                new Monster("Kong", 10, 1, 0),
                new Monster("Gigazaur", 10, 1, 0)
        );
        List<MonsterState> monsterStates = monsters.stream()
                .map(MonsterState::new)
                .collect(Collectors.toList());

        monsterStates.get(0).addHealth(-3);

        Input input = new InputString(
                new LinkedList<>(
                        Arrays.asList(
                                "1,2,3,4,5,6",
                                "1,2,3"
                        )
                )
        );
        Map<Monster, Player> players = monsters
                .stream()
                .collect(
                        Collectors.toMap(
                                monster -> monster,
                                monster -> new HumanPlayer(input, new Console())
                        )
                );

        GameState gameState = new GameState(
                new ArrayList<>(),
                monsterStates,
                players,
                new HashMap<>(),
                null
        );


        Randomizer.addValues(
                4, 4, 4, 4, 4, 4,   // First roll
                4, 4, 4, 4, 4, 4,   // Second roll
                4, 4, 4             // Third roll
        );

        GameState newGameState = new Phase03RollDice(gameState).playPhase().gameState;

        List<MonsterState> expectedMonsterStates = monsters.stream()
                .map(MonsterState::new)
                .collect(Collectors.toList());
        GameState expected = new GameState(
                new ArrayList<>(),
                expectedMonsterStates,
                players,
                new HashMap<>(),
                null
        );

        assertEquals(expected, newGameState);
        assertFalse(Randomizer.hasValues());
    }

    /**
     * Test requirements 12:
     * Draw evolution card on 3+ HEART
     *
     * @throws KoTIOException when an IO operation fails
     */
    @Test
    public void roll3Heart() throws KoTIOException {
        List<Monster> monsters = Collections.singletonList(
                new Monster("Kong", 10, 1, 0)
        );
        List<MonsterState> monsterStates = monsters.stream()
                .map(MonsterState::new)
                .collect(Collectors.toList());

        Input input = new InputString(
                new LinkedList<>(
                        Arrays.asList(
                                "1,2,3,4,5,6",
                                "1,2,3"
                        )
                )
        );
        Map<Monster, Player> players = monsters
                .stream()
                .collect(
                        Collectors.toMap(
                                monster -> monster,
                                monster -> new HumanPlayer(input, new Console())
                        )
                );

        EvolutionCard drawnCard = new EvolutionCard(
                "Red Dawn",
                "All other Monsters lose 2 HEART.",
                CardType.Discard,
                Collections.singletonList(
                        new Spell(
                                Effect.DealDamages,
                                2,
                                Collections.singletonList(Target.Others),
                                Collections.emptyList()
                        )
                ),
                "Kong"
        );
        Map<Monster, List<EvolutionCard>> evolutionCards = new HashMap<>();
        evolutionCards.put(monsters.get(0), new ArrayList<>(Collections.singleton(
                drawnCard
        )));

        GameState gameState = new GameState(
                new ArrayList<>(),
                monsterStates,
                players,
                evolutionCards,
                monsterStates.get(0)
        );


        Randomizer.addValues(
                4, 4, 4, 4, 4, 4,   // First roll
                4, 4, 4, 4, 4, 4,   // Second roll
                4, 4, 4             // Third roll
        );

        GameState newGameState = new Phase03RollDice(gameState).playPhase().gameState;

        List<MonsterState> expectedMonsterStates = monsters.stream()
                .map(MonsterState::new)
                .collect(Collectors.toList());

        expectedMonsterStates.get(0).addCard(drawnCard, false);
        Map<Monster, List<EvolutionCard>> expectedEvolutionCards = new HashMap<>();
        expectedEvolutionCards.put(monsters.get(0), new ArrayList<>());

        GameState expected = new GameState(
                new ArrayList<>(),
                expectedMonsterStates,
                players,
                expectedEvolutionCards,
                expectedMonsterStates.get(0)
        );

        assertEquals(expected, newGameState);
        assertFalse(Randomizer.hasValues());
    }

    /**
     * Test requirements 12:
     * 6 CLAW
     * Monster in Tokyo leaves
     *
     * @throws KoTIOException when an IO operation fails
     */
    @Test
    public void rollClawsNoDeathMonsterLeaves() throws KoTIOException {
        List<Monster> monsters = Arrays.asList(
                new Monster("Kong", 10, 1, 0),
                new Monster("Gigazaur", 10, 1, 0)
        );
        List<MonsterState> monsterStates = monsters.stream()
                .map(MonsterState::new)
                .collect(Collectors.toList());

        Input kongInput = new InputString(
                new LinkedList<>(
                        Arrays.asList(
                                "1,2,3,4,5,6",
                                "1,2,3"
                        )
                )
        );
        Input gigazaurInput = new InputString(
                new LinkedList<>(
                        Collections.singletonList(
                                "Yes"
                        )
                )
        );
        Map<Monster, Player> players = new HashMap<>();
        players.put(monsters.get(0), new HumanPlayer(kongInput, new Console()));
        players.put(monsters.get(1), new HumanPlayer(gigazaurInput, new Console()));

        GameState gameState = new GameState(
                new ArrayList<>(),
                monsterStates,
                players,
                new HashMap<>(),
                monsterStates.get(1)
        );


        Randomizer.addValues(
                3, 3, 3, 3, 3, 3,   // First roll
                3, 3, 3, 3, 3, 3,   // Second roll
                3, 3, 3             // Third roll
        );

        GameState newGameState = new Phase03RollDice(gameState).playPhase().gameState;

        List<MonsterState> expectedMonsterStates = monsters.stream()
                .map(MonsterState::new)
                .collect(Collectors.toList());
        expectedMonsterStates.get(1).addHealth(-6);
        expectedMonsterStates.get(0).addStars(1);
        GameState expected = new GameState(
                new ArrayList<>(),
                expectedMonsterStates,
                players,
                new HashMap<>(),
                expectedMonsterStates.get(0)
        );

        assertEquals(expected, newGameState);
        assertFalse(Randomizer.hasValues());
    }

    /**
     * Test requirements 12:
     * 6 CLAW
     * Monster in Tokyo stays
     *
     * @throws KoTIOException when an IO operation fails
     */
    @Test
    public void rollClawsNoDeathMonsterStays() throws KoTIOException {
        List<Monster> monsters = Arrays.asList(
                new Monster("Kong", 10, 1, 0),
                new Monster("Gigazaur", 10, 1, 0)
        );
        List<MonsterState> monsterStates = monsters.stream()
                .map(MonsterState::new)
                .collect(Collectors.toList());

        Input kongInput = new InputString(
                new LinkedList<>(
                        Arrays.asList(
                                "1,2,3,4,5,6",
                                "1,2,3"
                        )
                )
        );
        Input gigazaurInput = new InputString(
                new LinkedList<>(
                        Collections.singletonList(
                                "No"
                        )
                )
        );
        Map<Monster, Player> players = new HashMap<>();
        players.put(monsters.get(0), new HumanPlayer(kongInput, new Console()));
        players.put(monsters.get(1), new HumanPlayer(gigazaurInput, new Console()));

        GameState gameState = new GameState(
                new ArrayList<>(),
                monsterStates,
                players,
                new HashMap<>(),
                monsterStates.get(1)
        );


        Randomizer.addValues(
                3, 3, 3, 3, 3, 3,   // First roll
                3, 3, 3, 3, 3, 3,   // Second roll
                3, 3, 3             // Third roll
        );

        GameState newGameState = new Phase03RollDice(gameState).playPhase().gameState;

        List<MonsterState> expectedMonsterStates = monsters.stream()
                .map(MonsterState::new)
                .collect(Collectors.toList());
        expectedMonsterStates.get(1).addHealth(-6);
        GameState expected = new GameState(
                new ArrayList<>(),
                expectedMonsterStates,
                players,
                new HashMap<>(),
                expectedMonsterStates.get(1)
        );

        assertEquals(expected, newGameState);
        assertFalse(Randomizer.hasValues());
    }

    /**
     * Test requirements 12:
     * 6 CLAW
     * Monster in Tokyo dies
     *
     * @throws KoTIOException when an IO operation fails
     */
    @Test
    public void rollClawsMonsterInTokyoDies() throws KoTIOException {
        List<Monster> monsters = Arrays.asList(
                new Monster("Kong", 10, 1, 0),
                new Monster("Gigazaur", 6, 1, 0),
                new Monster("Alienoid", 10, 1, 0)
        );
        List<MonsterState> monsterStates = monsters.stream()
                .map(MonsterState::new)
                .collect(Collectors.toList());

        Input kongInput = new InputString(
                new LinkedList<>(
                        Arrays.asList(
                                "1,2,3,4,5,6",
                                "1,2,3"
                        )
                )
        );
        Input gigazaurInput = new InputString(
                new LinkedList<>(
                        Collections.emptyList()
                )
        );
        Map<Monster, Player> players = new HashMap<>();
        players.put(monsters.get(0), new HumanPlayer(kongInput, new Console()));
        players.put(monsters.get(1), new HumanPlayer(gigazaurInput, new Console()));
        players.put(monsters.get(2), new HumanPlayer(new InputString(null), new Console()));

        GameState gameState = new GameState(
                new ArrayList<>(),
                monsterStates,
                players,
                new HashMap<>(),
                monsterStates.get(1)
        );


        Randomizer.addValues(
                3, 3, 3, 3, 3, 3,   // First roll
                3, 3, 3, 3, 3, 3,   // Second roll
                3, 3, 3             // Third roll
        );

        GameState newGameState = new Phase03RollDice(gameState).playPhase().gameState;

        List<MonsterState> expectedMonsterStates = monsters
                .stream()
                .filter(monster -> !"Gigazaur".equalsIgnoreCase(monster.getName()))
                .map(MonsterState::new)
                .collect(Collectors.toList());
        expectedMonsterStates.get(0).addStars(1);
        GameState expected = new GameState(
                new ArrayList<>(),
                expectedMonsterStates,
                players,
                new HashMap<>(),
                expectedMonsterStates.get(0)
        );

        assertEquals(expected, newGameState);
        assertFalse(Randomizer.hasValues());
    }

    /**
     * Test requirements 12:
     * 6 CLAW
     * No one in Tokyo
     *
     * @throws KoTIOException when an IO operation fails
     */
    @Test
    public void rollClawsNooneInTokyo() throws KoTIOException {
        List<Monster> monsters = Arrays.asList(
                new Monster("Kong", 10, 1, 0),
                new Monster("Gigazaur", 10, 1, 0)
        );
        List<MonsterState> monsterStates = monsters.stream()
                .map(MonsterState::new)
                .collect(Collectors.toList());

        Input kongInput = new InputString(
                new LinkedList<>(
                        Arrays.asList(
                                "1,2,3,4,5,6",
                                "1,2,3"
                        )
                )
        );
        Input gigazaurInput = new InputString(
                new LinkedList<>(
                        Collections.emptyList()
                )
        );
        Map<Monster, Player> players = new HashMap<>();
        players.put(monsters.get(0), new HumanPlayer(kongInput, new Console()));
        players.put(monsters.get(1), new HumanPlayer(gigazaurInput, new Console()));

        GameState gameState = new GameState(
                new ArrayList<>(),
                monsterStates,
                players,
                new HashMap<>(),
                null
        );


        Randomizer.addValues(
                3, 3, 3, 3, 3, 3,   // First roll
                3, 3, 3, 3, 3, 3,   // Second roll
                3, 3, 3             // Third roll
        );

        GameState newGameState = new Phase03RollDice(gameState).playPhase().gameState;

        List<MonsterState> expectedMonsterStates = monsters.stream()
                .map(MonsterState::new)
                .collect(Collectors.toList());
        expectedMonsterStates.get(0).addStars(1);
        GameState expected = new GameState(
                new ArrayList<>(),
                expectedMonsterStates,
                players,
                new HashMap<>(),
                expectedMonsterStates.get(0)
        );

        assertEquals(expected, newGameState);
        assertFalse(Randomizer.hasValues());
    }

    /**
     * Test requirements 12:
     * 6 CLAW
     * Current monster in Tokyo
     *
     * @throws KoTIOException when an IO operation fails
     */
    @Test
    public void rollClawsCurrentInTokyo() throws KoTIOException {
        List<Monster> monsters = Arrays.asList(
                new Monster("Kong", 10, 1, 0),
                new Monster("Gigazaur", 10, 1, 0),
                new Monster("Alienoid", 10, 1, 0)
        );
        List<MonsterState> monsterStates = monsters.stream()
                .map(MonsterState::new)
                .collect(Collectors.toList());

        Input kongInput = new InputString(
                new LinkedList<>(
                        Arrays.asList(
                                "1,2,3,4,5,6",
                                "1,2,3"
                        )
                )
        );
        Input otherInput = new InputString(
                new LinkedList<>(
                        Collections.emptyList()
                )
        );
        Map<Monster, Player> players = new HashMap<>();
        players.put(monsters.get(0), new HumanPlayer(kongInput, new Console()));
        players.put(monsters.get(1), new HumanPlayer(otherInput, new Console()));
        players.put(monsters.get(2), new HumanPlayer(otherInput, new Console()));

        GameState gameState = new GameState(
                new ArrayList<>(),
                monsterStates,
                players,
                new HashMap<>(),
                monsterStates.get(0)
        );


        Randomizer.addValues(
                3, 3, 3, 3, 3, 3,   // First roll
                3, 3, 3, 3, 3, 3,   // Second roll
                3, 3, 3             // Third roll
        );

        GameState newGameState = new Phase03RollDice(gameState).playPhase().gameState;

        List<MonsterState> expectedMonsterStates = monsters.stream()
                .map(MonsterState::new)
                .collect(Collectors.toList());
        expectedMonsterStates.get(1).addHealth(-6);
        expectedMonsterStates.get(2).addHealth(-6);
        GameState expected = new GameState(
                new ArrayList<>(),
                expectedMonsterStates,
                players,
                new HashMap<>(),
                expectedMonsterStates.get(0)
        );

        assertEquals(expected, newGameState);
        assertFalse(Randomizer.hasValues());
    }
}
