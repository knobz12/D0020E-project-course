package se.ltu.softwareengineering.game.phase;

import org.junit.Test;
import se.ltu.softwareengineering.concept.Monster;
import se.ltu.softwareengineering.exception.KoTIOException;
import se.ltu.softwareengineering.game.state.GameState;
import se.ltu.softwareengineering.game.state.MonsterState;
import se.ltu.softwareengineering.io.Console;
import se.ltu.softwareengineering.player.HumanPlayer;
import se.ltu.softwareengineering.player.Player;

import java.util.*;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class TPhase02BeginTurn {

    /**
     * Test requirement 7
     *
     * @throws KoTIOException when an IO operation fails
     */
    @Test
    public void startTurnMonsterInTokyo() throws KoTIOException {
        List<Monster> monsters = Arrays.asList(
                new Monster("Kong", 10, 1, 0),
                new Monster("Gigazaur", 10, 1, 0),
                new Monster("Alienoid", 10, 1, 0)
        );
        List<MonsterState> monsterStates = monsters.stream()
                .map(MonsterState::new)
                .collect(Collectors.toList());

        Map<Monster, Player> players = monsters
                .stream()
                .collect(
                        Collectors.toMap(
                                monster -> monster,
                                monster -> new HumanPlayer(new Console())
                        )
                );

        GameState currentGameState = new GameState(
                new ArrayList<>(),
                monsterStates,
                players,
                new HashMap<>(),
                monsterStates.get(0)
        );

        List<MonsterState> expectedMonsterStates = monsters.stream()
                .map(MonsterState::new)
                .collect(Collectors.toList());

        GameState expected = new GameState(
                new ArrayList<>(),
                expectedMonsterStates,
                players,
                new HashMap<>(),
                expectedMonsterStates.get(0)
        );
        expected.getMonster(0).addStars(1);

        GameState newGameState = new Phase02BeginTurn(currentGameState)
                .playPhase()
                .gameState;

        assertEquals(expected, newGameState);
    }

    /**
     * Test requirement 7
     *
     * @throws KoTIOException when an IO operation fails
     */
    @Test
    public void startTurnMonsterNotInTokyo() throws KoTIOException {
        List<Monster> monsters = Arrays.asList(
                new Monster("Kong", 10, 1, 0),
                new Monster("Gigazaur", 10, 1, 0),
                new Monster("Alienoid", 10, 1, 0)
        );
        List<MonsterState> monsterStates = monsters.stream()
                .map(MonsterState::new)
                .collect(Collectors.toList());

        Map<Monster, Player> players = monsters
                .stream()
                .collect(
                        Collectors.toMap(
                                monster -> monster,
                                monster -> new HumanPlayer(new Console())
                        )
                );


        GameState currentGameState = new GameState(
                new ArrayList<>(),
                monsterStates,
                players,
                new HashMap<>(),
                monsterStates.get(1)
        );

        List<MonsterState> expectedMonsterStates = monsters.stream()
                .map(MonsterState::new)
                .collect(Collectors.toList());

        GameState expected = new GameState(
                new ArrayList<>(),
                expectedMonsterStates,
                players,
                new HashMap<>(),
                expectedMonsterStates.get(1)
        );

        GameState newGameState = new Phase02BeginTurn(currentGameState)
                .playPhase()
                .gameState;

        assertEquals(expected, newGameState);
    }
}
