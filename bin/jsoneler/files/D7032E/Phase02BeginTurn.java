package se.ltu.softwareengineering.game.phase;

import se.ltu.softwareengineering.communication.message.Message;
import se.ltu.softwareengineering.communication.message.MessageFactory;
import se.ltu.softwareengineering.concept.TriggeringAction;
import se.ltu.softwareengineering.exception.KoTIOException;
import se.ltu.softwareengineering.game.GameConstantRules;
import se.ltu.softwareengineering.game.state.GameState;
import se.ltu.softwareengineering.game.state.MonsterState;
import se.ltu.softwareengineering.tool.Resource;
import se.ltu.softwareengineering.tool.ResourceLoader;

public class Phase02BeginTurn extends Phase {
    Phase02BeginTurn(GameState gameState) {
        super(gameState);
    }

    @Override
    Phase computeNextPhase(GameState gameState) {
        if (gameState.getMonster(0).isDead()) {
            return new Phase02BeginTurn(gameState);
        } else {
            return new Phase03RollDice(gameState);
        }
    }

    @Override
    public Phase playPhase() throws KoTIOException {
        initPhase();

        final MonsterState currentMonster = gameState.getMonster(0);
        if (currentMonster.isDead()) {
            gameState.nextTurn();
            return computeNextPhase(gameState);
        }

        Message newTurn = MessageFactory.createMessage(
                ResourceLoader.getString(
                        Resource.Game,
                        "newTurn",
                        gameState.getMonster(0).getMonster().getName()
                )
        );
        sendMessageToEverybody(newTurn);

        displayStats();

        MonsterState monsterInTokyo = gameState.getMonsterInTokyo();
        if (monsterInTokyo == null) {
            Message nobodyInTokyo = MessageFactory.createMessage(
                    ResourceLoader.getString(
                            Resource.Game,
                            "nobodyInTokyo"
                    )
            );
            sendMessageToCurrentMonster(nobodyInTokyo);
        } else {
            Message monsterInTokyoMessage = MessageFactory.createMessage(
                    ResourceLoader.getString(
                            Resource.Game,
                            "isInTokyo",
                            monsterInTokyo.getMonster().getName()
                    )
            );
            sendMessageToCurrentMonster(monsterInTokyoMessage);
        }

        if (gameState.isInTokyo(currentMonster)) {
            triggerMonsterInTokyo();
        } else {
            triggerMonsterOutsideTokyo();
        }
        return computeNextPhase(gameState);
    }

    @Override
    void initPhase() throws KoTIOException {
        for (MonsterState monster : gameState.getMonsters()) {
            askToPlayCards(monster);
        }
    }

    @Override
    public String getPhaseName() {
        return "Begin turn";
    }

    private void triggerMonsterInTokyo() throws KoTIOException {
        if (checkEffects(gameState, TriggeringAction.MonsterStartsInTokyo)) {
            gameState.addStars(gameState.getMonster(0), GameConstantRules.STARS_WHEN_STARTING_IN_TOKYO);
        }
    }

    private void triggerMonsterOutsideTokyo() throws KoTIOException {
        checkEffects(gameState, TriggeringAction.MonsterStartsOutsideTokyo);
    }
}
