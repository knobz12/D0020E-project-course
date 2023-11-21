package se.ltu.softwareengineering.game.phase;

import se.ltu.softwareengineering.game.state.GameState;

public class Phase05EndTurn extends Phase {
    Phase05EndTurn(GameState gameState) {
        super(gameState);
    }

    @Override
    Phase computeNextPhase(GameState gameState) {
        return new Phase02BeginTurn(gameState);
    }

    @Override
    public Phase playPhase() {
        gameState.nextTurn();
        return computeNextPhase(gameState);
    }

    @Override
    void initPhase() {

    }

    @Override
    public String getPhaseName() {
        return "End turn";
    }
}
