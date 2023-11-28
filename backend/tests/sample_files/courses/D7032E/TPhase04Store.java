package se.ltu.softwareengineering.game.phase;

import org.junit.Test;
import se.ltu.softwareengineering.concept.Effect;
import se.ltu.softwareengineering.concept.Monster;
import se.ltu.softwareengineering.concept.Spell;
import se.ltu.softwareengineering.concept.Target;
import se.ltu.softwareengineering.concept.card.CardType;
import se.ltu.softwareengineering.concept.card.StoreCard;
import se.ltu.softwareengineering.exception.KoTIOException;
import se.ltu.softwareengineering.game.ConceptLoader;
import se.ltu.softwareengineering.game.KoTWinnerException;
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

import static org.junit.jupiter.api.Assertions.*;

public class TPhase04Store {
    /**
     * Test requirements 13 & 14:
     * Purchase a "Discard" card and play it
     *
     * @throws KoTIOException when an IO operation fails
     */
    @Test
    public void purchaseDiscardCard() throws KoTIOException {
        List<Monster> monsters = Arrays.asList(
                new Monster("Kong", 10, 1, 0),
                new Monster("Gigazaur", 10, 1, 0)
        );
        List<MonsterState> monsterStates = monsters.stream()
                .map(MonsterState::new)
                .collect(Collectors.toList());
        monsterStates.get(0).addEnergy(7);

        Input input = new InputString(
                new LinkedList<>(
                        Collections.singletonList(
                                "1"
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

        List<StoreCard> deck = Collections.singletonList(
                new StoreCard(
                        "Apartment Building",
                        "Gain 3 STAR.",
                        CardType.Discard,
                        Collections.singletonList(
                                new Spell(
                                        Effect.GainStars,
                                        3,
                                        Collections.singletonList(Target.Self),
                                        Collections.emptyList()
                                )
                        ),
                        5
                )
        );

        GameState gameState = new GameState(
                deck,
                monsterStates,
                players,
                new HashMap<>(),
                monsterStates.get(0)
        );

        GameState newGameState = new Phase04Store(gameState).playPhase().gameState;

        List<MonsterState> expectedMonsterStates = monsters.stream()
                .map(MonsterState::new)
                .collect(Collectors.toList());
        expectedMonsterStates.get(0).addStars(3);
        expectedMonsterStates.get(0).addEnergy(2);
        GameState expected = new GameState(
                new ArrayList<>(),
                expectedMonsterStates,
                players,
                new HashMap<>(),
                expectedMonsterStates.get(0)
        );

        assertEquals(expected, newGameState);
    }

    /**
     * Test requirements 13:
     * Reset store
     *
     * @throws KoTIOException when an IO operation fails
     */
    @Test
    public void resetStore() throws KoTIOException {
        List<Monster> monsters = Arrays.asList(
                new Monster("Kong", 10, 1, 0),
                new Monster("Gigazaur", 10, 1, 0)
        );
        List<MonsterState> monsterStates = monsters.stream()
                .map(MonsterState::new)
                .collect(Collectors.toList());
        monsterStates.get(0).addEnergy(7);

        Input input = new InputString(
                new LinkedList<>(
                        Arrays.asList(
                                "reset",
                                "0"
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

        List<StoreCard> deck = Collections.singletonList(
                new StoreCard(
                        "Apartment Building",
                        "Gain 3 STAR.",
                        CardType.Discard,
                        Collections.singletonList(
                                new Spell(
                                        Effect.GainStars,
                                        3,
                                        Collections.singletonList(Target.Self),
                                        Collections.emptyList()
                                )
                        ),
                        5
                )
        );

        GameState gameState = new GameState(
                deck,
                monsterStates,
                players,
                new HashMap<>(),
                monsterStates.get(0)
        );

        GameState newGameState = new Phase04Store(gameState).playPhase().gameState;

        List<MonsterState> expectedMonsterStates = monsters.stream()
                .map(MonsterState::new)
                .collect(Collectors.toList());
        expectedMonsterStates.get(0).addEnergy(5);
        GameState expected = new GameState(
                new ArrayList<>(),
                expectedMonsterStates,
                players,
                new HashMap<>(),
                expectedMonsterStates.get(0)
        );

        assertEquals(expected, newGameState);
    }

    /**
     * Test requirements 13 & 14:
     * Buy Keep card and play it
     *
     * @throws KoTIOException when an IO operation fails
     */
    @Test
    public void purchaseKeepCard() throws KoTIOException {
        List<Monster> monsters = Arrays.asList(
                new Monster("Kong", 10, 1, 0),
                new Monster("Gigazaur", 10, 1, 0)
        );
        List<MonsterState> monsterStates = monsters.stream()
                .map(MonsterState::new)
                .collect(Collectors.toList());
        monsterStates.get(0).addEnergy(7);

        Input input = new InputString(
                new LinkedList<>(
                        Arrays.asList(
                                "2",
                                "yes",
                                "1"
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

        List<StoreCard> deck = Arrays.asList(
                new StoreCard(
                        "Apartment Building",
                        "Gain 3 STAR.",
                        CardType.Discard,
                        Collections.singletonList(
                                new Spell(
                                        Effect.GainStars,
                                        3,
                                        Collections.singletonList(Target.Self),
                                        Collections.emptyList()
                                )
                        ),
                        5
                ),
                new StoreCard(
                        "Alien Metabolism",
                        "Buying cards costs you 1 less.",
                        CardType.Keep,
                        Collections.singletonList(
                                new Spell(
                                        Effect.AlterCardCost,
                                        -1,
                                        Collections.singletonList(Target.Self),
                                        Collections.emptyList()
                                )
                        ),
                        3
                )
        );

        GameState gameState = new GameState(
                deck,
                monsterStates,
                players,
                new HashMap<>(),
                monsterStates.get(0)
        );

        GameState newGameState = new Phase04Store(gameState).playPhase().gameState;

        List<MonsterState> expectedMonsterStates = monsters.stream()
                .map(MonsterState::new)
                .collect(Collectors.toList());
        expectedMonsterStates.get(0).addStars(3);
        expectedMonsterStates.get(0).addEnergy(0);
        expectedMonsterStates.get(0).addCard(deck.get(1), true);
        GameState expected = new GameState(
                new ArrayList<>(),
                expectedMonsterStates,
                players,
                new HashMap<>(),
                expectedMonsterStates.get(0)
        );

        assertEquals(expected, newGameState);
    }

    /**
     * Test requirements 13, 14, 16:
     * Buy card, play it and win the game
     *
     */
    @Test
    public void purchaseAndWinByStars() {
        List<Monster> monsters = Arrays.asList(
                new Monster("Kong", 10, 1, 0),
                new Monster("Gigazaur", 10, 1, 0)
        );
        List<MonsterState> monsterStates = monsters.stream()
                .map(MonsterState::new)
                .collect(Collectors.toList());
        monsterStates.get(0).addEnergy(7);
        monsterStates.get(0).addStars(19);

        Input input = new InputString(
                new LinkedList<>(
                        Collections.singletonList(
                                "1"
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

        List<StoreCard> deck = Arrays.asList(
                new StoreCard(
                        "Apartment Building",
                        "Gain 3 STAR.",
                        CardType.Discard,
                        Collections.singletonList(
                                new Spell(
                                        Effect.GainStars,
                                        3,
                                        Collections.singletonList(Target.Self),
                                        Collections.emptyList()
                                )
                        ),
                        5
                ),
                new StoreCard(
                        "Alien Metabolism",
                        "Buying cards costs you 1 less.",
                        CardType.Keep,
                        Collections.singletonList(
                                new Spell(
                                        Effect.AlterCardCost,
                                        -1,
                                        Collections.singletonList(Target.Self),
                                        Collections.emptyList()
                                )
                        ),
                        3
                )
        );

        GameState gameState = new GameState(
                deck,
                monsterStates,
                players,
                new HashMap<>(),
                monsterStates.get(0)
        );

        assertThrows(KoTWinnerException.class, () -> new Phase04Store(gameState).playPhase());
    }

    /**
     * Test requirements 13, 14, 17:
     * Buy card, play it and win the game
     *
     */
    @Test
    public void purchaseAndWinByDeath() {
        List<Monster> monsters = Arrays.asList(
                new Monster("Kong", 10, 1, 0),
                new Monster("Gigazaur", 1, 1, 0)
        );
        List<MonsterState> monsterStates = monsters.stream()
                .map(MonsterState::new)
                .collect(Collectors.toList());
        monsterStates.get(0).addEnergy(7);
        monsterStates.get(0).addStars(19);

        Input input = new InputString(
                new LinkedList<>(
                        Collections.singletonList(
                                "1"
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

        List<StoreCard> deck = Arrays.asList(
                new StoreCard(
                        "Fire blast",
                        "Deal 2 damage to all other monsters.",
                        CardType.Discard,
                        Collections.singletonList(
                                new Spell(
                                        Effect.DealDamages,
                                        2,
                                        Collections.singletonList(Target.Others),
                                        Collections.emptyList()
                                )
                        ),
                        3
                ),
                new StoreCard(
                        "Alien Metabolism",
                        "Buying cards costs you 1 less.",
                        CardType.Keep,
                        Collections.singletonList(
                                new Spell(
                                        Effect.AlterCardCost,
                                        -1,
                                        Collections.singletonList(Target.Self),
                                        Collections.emptyList()
                                )
                        ),
                        3
                )
        );

        GameState gameState = new GameState(
                deck,
                monsterStates,
                players,
                new HashMap<>(),
                monsterStates.get(0)
        );

        assertThrows(KoTWinnerException.class, () -> new Phase04Store(gameState).playPhase());
    }
}
