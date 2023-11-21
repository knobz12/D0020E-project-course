package se.ltu.softwareengineering.game;

import se.ltu.softwareengineering.exception.KoTUncheckedException;
import se.ltu.softwareengineering.game.state.MonsterState;

public class KoTWinnerException extends KoTUncheckedException {
    private MonsterState winner;

    public KoTWinnerException(MonsterState winner) {
        this.winner = winner;
    }

    public MonsterState getWinner() {
        return winner;
    }

    @Override
    public String toString() {
        return "KoTWinnerException{" +
                "winner=" + winner +
                "} " + super.toString();
    }
}
