package se.ltu.softwareengineering.game.phase;

import se.ltu.softwareengineering.communication.message.Choice;
import se.ltu.softwareengineering.communication.message.Message;
import se.ltu.softwareengineering.communication.message.MessageFactory;
import se.ltu.softwareengineering.concept.TriggeringAction;
import se.ltu.softwareengineering.concept.card.EvolutionCard;
import se.ltu.softwareengineering.exception.KoTIOException;
import se.ltu.softwareengineering.game.CommonChoice;
import se.ltu.softwareengineering.game.GameConstantRules;
import se.ltu.softwareengineering.game.state.AlterationType;
import se.ltu.softwareengineering.game.state.GameState;
import se.ltu.softwareengineering.game.state.MonsterState;
import se.ltu.softwareengineering.tool.Dice;
import se.ltu.softwareengineering.tool.Resource;
import se.ltu.softwareengineering.tool.ResourceLoader;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import static se.ltu.softwareengineering.game.GameConstantRules.DICE_PER_ROLL;
import static se.ltu.softwareengineering.game.GameConstantRules.REROLL;

public class Phase03RollDice extends Phase {
    Phase03RollDice(GameState gameState) {
        super(gameState);
    }

    @Override
    Phase computeNextPhase(GameState gameState) {
        return new Phase04Store(gameState);
    }

    @Override
    public Phase playPhase() throws KoTIOException {
        initPhase();

        MonsterState monster = gameState.getMonster(0);
        int diceNumber = DICE_PER_ROLL + monster.getAlteration(AlterationType.DiceNumber);
        int rerollNumber = REROLL + monster.getAlteration(AlterationType.RerollNumber);

        List<Dice.DiceValue> results = rollDice(diceNumber);
        displayResults(results);

        for (int i = 0; i < rerollNumber; i++) {
            List<Choice> rerollDice = askForReroll(results);

            if (rerollDice.isEmpty()) break;

            Set<Integer> index = rerollDice.stream()
                    .map(choice -> Integer.parseInt(choice.getShortcut()))
                    .collect(Collectors.toCollection(() -> new TreeSet<>(Collections.reverseOrder())));
            for (Integer position : index) {
                results.remove(position - 1);
            }
            results.addAll(rollDice(diceNumber - results.size()));
            displayResults(results);
        }

        applyResults(results);

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
        return "Roll dice";
    }

    private List<Dice.DiceValue> rollDice(int number) throws KoTIOException {
        checkEffects(gameState, TriggeringAction.RollDice);
        return IntStream.range(0, number)
                .boxed()
                .map(i -> Dice.rollDice())
                .collect(Collectors.toList());
    }

    private void displayResults(List<Dice.DiceValue> results) throws KoTIOException {
        String diceAsString = results.stream()
                .map(Enum::name)
                .collect(Collectors.joining(", "));

        Message rolledDice = MessageFactory.createMessage(
                ResourceLoader.getString(
                        Resource.Game,
                        "rolled",
                        gameState.getMonster(0).getMonster().getName(),
                        diceAsString
                )
        );

        sendMessageToEverybody(rolledDice);
    }

    private List<Choice> askForReroll(List<Dice.DiceValue> previousResults) throws KoTIOException {
        int diceNumber = previousResults.size();

        List<Choice> rerollDice = IntStream.range(0, diceNumber)
                .boxed()
                .map(i -> new Choice(
                                String.valueOf(i + 1),
                                ResourceLoader.getString(
                                        Resource.Game,
                                        "rerollDice",
                                        i + 1,
                                        previousResults.get(i)
                                )
                        )
                )
                .collect(Collectors.toList());

        Message rolledDice = MessageFactory.createMessage(
                ResourceLoader.getString(Resource.Game, "wantToReroll"),
                rerollDice,
                diceNumber
        );

        return askCurrentMonster(rolledDice);
    }

    private void applyResults(List<Dice.DiceValue> results) throws KoTIOException {
        Map<Dice.DiceValue, Integer> summedResults = Arrays.stream(Dice.DiceValue.values())
                .collect(Collectors.toMap(
                        value -> (Dice.DiceValue) value,
                        value -> (int) results.stream().filter(result -> result == value).count()
                ));

        MonsterState currentMonster = gameState.getMonster(0);
        if (computeNewStars(summedResults) > 0) {
            int newStars = computeNewStars(summedResults);
            gameState.addStars(currentMonster, newStars);
        }
        if (summedResults.get(Dice.DiceValue.Energy) > 0) {
            int newEnergy = summedResults.get(Dice.DiceValue.Energy);
            gameState.addEnergy(currentMonster, newEnergy);
        }
        if (computeHealthRecovering(summedResults) > 0) {
            int healthRecovering = computeHealthRecovering(summedResults);
            gameState.addHearts(currentMonster, healthRecovering);
        }
        if (summedResults.get(Dice.DiceValue.Heart) >= 3
                && checkEffects(gameState, TriggeringAction.DrawEvolutionCard)) {
            drawEvolutionCard();
        }

        if (summedResults.get(Dice.DiceValue.Claws) > 0 && checkEffects(gameState, TriggeringAction.DealDamages)) {
            Map<MonsterState, Integer> damages = computeDamages(summedResults);
            if (damages.isEmpty() && gameState.isTokyoFree()) {
                invadeTokyo();
            } else {
                for (MonsterState target : damages.keySet()) {
                    int dealtDamages = damages.get(target);
                    dealDamages(target, dealtDamages);
                }
            }
        }
    }

    private int computeNewStars(Map<Dice.DiceValue, Integer> summedResults) {
        int newStars = 0;

        List<Dice.DiceValue> starsOrder = Arrays.asList(
                Dice.DiceValue.One,
                Dice.DiceValue.Two,
                Dice.DiceValue.Three
        );

        for (int i = 0; i < starsOrder.size(); i++) {
            int number = summedResults.get(starsOrder.get(i));
            if (number > 2) {
                newStars += i + number - 2;
            }
        }

        return newStars;
    }

    private int computeHealthRecovering(Map<Dice.DiceValue, Integer> summedResults) {
        MonsterState monster = gameState.getMonster(0);
        if (gameState.isInTokyo(monster)) {
            return 0;
        } else {
            int maxRecovering = summedResults.get(Dice.DiceValue.Heart);
            int lostHps = monster.computeLostHps();

            return Math.min(maxRecovering, lostHps);
        }
    }

    private Map<MonsterState, Integer> computeDamages(Map<Dice.DiceValue, Integer> summedResults) {
        MonsterState currentMonster = gameState.getMonster(0);
        int monsterDamages = summedResults.get(Dice.DiceValue.Claws)
                * currentMonster.getDamages();


        List<MonsterState> targets = new ArrayList<>();
        if (gameState.isInTokyo(currentMonster)) {
            targets = gameState.getMonsters()
                    .stream()
                    .filter(target -> !Objects.equals(currentMonster, target))
                    .collect(Collectors.toList());
        } else {
            if (!gameState.isTokyoFree()) {
                MonsterState monsterInTokyo = gameState.getMonsterInTokyo();
                targets = Collections.singletonList(monsterInTokyo);
            }
        }

        return targets
                .stream()
                .filter(target -> computeDamages(target, monsterDamages) > 0)
                .collect(
                        Collectors.toMap(
                                target -> target,
                                target -> computeDamages(target, monsterDamages)
                        )
                );
    }

    private Integer computeDamages(MonsterState target, int theoreticalDamages) {
        int armor = target.getArmor();
        return Math.max(theoreticalDamages - armor, 0);
    }

    private void dealDamages(MonsterState target, int damages) throws KoTIOException {
        MonsterState currentMonster = gameState.getMonster(0);
        int dealtDamages = gameState.dealDamages(currentMonster, target, damages);
        if (dealtDamages > 0) {

            boolean isDead = target.isDead();
            boolean isInTokyo = gameState.isInTokyo(target);

            if (isDead) {
                displayDeath(target);
                gameState.removeFromGame(target);
            }

            if (isInTokyo) {
                if (isDead) {
                    invadeTokyo();
                } else {
                    askForWithdrawal(target);
                }
            }
        }
    }

    private void displayDeath(MonsterState monster) throws KoTIOException {
        Message message = MessageFactory.createMessage(
                ResourceLoader.getString(
                        Resource.Game,
                        "monsterDies",
                        monster.getMonster().getName()
                )
        );
        sendMessageToEverybody(message);
    }

    private void askForWithdrawal(MonsterState monster) throws KoTIOException {
        Message leftHpMessage = MessageFactory.createMessage(
                ResourceLoader.getString(
                        Resource.Game,
                        "remainingHp",
                        monster.getMonster().getName(),
                        monster.getCurrentHealth()
                )
        );
        sendMessageToEverybody(leftHpMessage);

        Message withdrawMessage = MessageFactory.createMessage(
                ResourceLoader.getString(
                        Resource.Game,
                        "leaveTokyo"
                ),
                Arrays.asList(
                        CommonChoice.Yes.getChoice(),
                        CommonChoice.No.getChoice()
                ),
                1
        );
        Choice choice = ask(withdrawMessage, monster).get(0);
        if (CommonChoice.Yes.getChoice().equals(choice)) {
            Message leaveTokyoMessage = MessageFactory.createMessage(
                    ResourceLoader.getString(
                            Resource.Game,
                            "tokyoLeft",
                            monster.getMonster().getName()
                    )
            );
            sendMessageToEverybody(leaveTokyoMessage);
            invadeTokyo();
        }
    }

    private void invadeTokyo() throws KoTIOException {
        MonsterState currentMonster = gameState.getMonster(0);
        gameState.invadeTokyo(currentMonster);
    }

    private void drawEvolutionCard() throws KoTIOException {
        MonsterState currentMonster = gameState.getMonster(0);
        EvolutionCard card = gameState.removeFirstEvolutionCard(currentMonster.getMonster());
        if (card == null) {
            Message messageToEverybody = MessageFactory.createMessage(
                    ResourceLoader.getString(
                            Resource.Game,
                            "cantDrawNoMoreCard",
                            currentMonster.getMonster().getName()
                    )
            );
            sendMessageToEverybody(messageToEverybody);
        } else {
            Message messageToEverybody = MessageFactory.createMessage(
                    ResourceLoader.getString(
                            Resource.Game,
                            "drawEvolutionCard",
                            currentMonster.getMonster().getName()
                    )
            );
            sendMessageToEverybody(messageToEverybody);

            Message messageToCurrent = MessageFactory.createMessage(
                    ResourceLoader.getString(
                            Resource.Game,
                            "displayDrawnCard",
                            card.getName(),
                            card.getType(),
                            card.getDescription()
                    )
            );
            sendMessageToCurrentMonster(messageToCurrent);

            currentMonster.addCard(card, false);
        }
    }
}
