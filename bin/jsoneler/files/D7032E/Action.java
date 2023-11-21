package se.ltu.softwareengineering.game.action;

import se.ltu.softwareengineering.concept.EffectProvider;
import se.ltu.softwareengineering.game.state.GameState;
import se.ltu.softwareengineering.game.state.MonsterState;

import java.util.List;

/**
 * Represent an action that can be executed on the current game state.
 * Can block the execution of a game mechanism (e.g. a monster can be disallowed to gain a star while in Tokyo).
 */
@FunctionalInterface
public interface Action {

    /**
     * Execute the action.
     *
     * @param gameState        Current game state
     * @param executor         Monster that executes the action
     * @param value            Value of the action
     * @param affectedMonsters Monsters that are targeted by this action
     * @param provider         Element that provide this action
     * @return True if the action that has summoned this one should be cancelled, false otherwire.
     */
    boolean execute(GameState gameState,
                    MonsterState executor,
                    int value,
                    List<MonsterState> affectedMonsters,
                    EffectProvider provider
    );
}
