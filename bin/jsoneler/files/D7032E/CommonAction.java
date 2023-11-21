package se.ltu.softwareengineering.game.action;

import se.ltu.softwareengineering.communication.message.Choice;
import se.ltu.softwareengineering.communication.message.Message;
import se.ltu.softwareengineering.communication.message.MessageFactory;
import se.ltu.softwareengineering.concept.Effect;
import se.ltu.softwareengineering.concept.Target;
import se.ltu.softwareengineering.exception.KoTIOException;
import se.ltu.softwareengineering.game.state.AlterationType;
import se.ltu.softwareengineering.game.state.EffectProviderState;
import se.ltu.softwareengineering.game.state.GameState;
import se.ltu.softwareengineering.game.state.MonsterState;
import se.ltu.softwareengineering.player.Player;
import se.ltu.softwareengineering.tool.Randomizer;
import se.ltu.softwareengineering.tool.Resource;
import se.ltu.softwareengineering.tool.ResourceLoader;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public enum CommonAction {
    GainStars((gameState, executor, value, targets, effectProvider) -> {
        targets.forEach(target -> gameState.addStars(target, value));
        return true;
    }),
    GainHearts((gameState, executor, value, targets, effectProvider) -> {
        targets.forEach(target -> gameState.addHearts(target, value));
        return true;
    }),
    GainEnergy((gameState, executor, value, targets, effectProvider) -> {
        targets.forEach(target -> gameState.addEnergy(target, value));
        return true;
    }),
    DealDamages((gameState, executor, value, targets, effectProvider) -> {
        targets.forEach(monsterState -> gameState.dealDamages(executor, monsterState, value));
        return true;
    }),
    AlterDamages((gameState, executor, value, targets, effectProvider) -> {
        targets.forEach(monsterState -> monsterState.registerAlteration(effectProvider, value, AlterationType.Damages));
        return true;
    }),
    AlterArmor((gameState, executor, value, targets, effectProvider) -> {
        targets.forEach(monsterState -> monsterState.registerAlteration(effectProvider, value, AlterationType.Armor));
        return true;
    }),
    AlterMaxHealth((gameState, executor, value, targets, effectProvider) -> {
        targets.forEach(monsterState -> monsterState.registerAlteration(effectProvider, value, AlterationType.MaxHealth));
        return true;
    }),
    AlterRerollNumber((gameState, executor, value, targets, effectProvider) -> {
        targets.forEach(monsterState -> monsterState.registerAlteration(effectProvider, value, AlterationType.RerollNumber));
        return true;
    }),
    AlterCardCost((gameState, executor, value, targets, effectProvider) -> {
        targets.forEach(monsterState -> monsterState.registerAlteration(effectProvider, value, AlterationType.CardCost));
        return true;
    });

    private Action action;

    CommonAction(Action action) {
        this.action = action;
    }

    public static CommonAction findAction(Effect effect) {
        return Arrays.stream(values())
                .filter(value -> value.name().equalsIgnoreCase(effect.name()))
                .findFirst()
                .orElse(null);
    }

    public boolean execute(GameState gameState, EffectProviderState effectProviderState, int value, Target target) throws KoTIOException {
        List<MonsterState> targets = computeTargets(gameState, effectProviderState.getSpellCaster(), target);
        return action.execute(gameState, effectProviderState.getSpellCaster(), value, targets, effectProviderState.getProvider());
    }

    // region Targets
    private static List<MonsterState> computeTargets(GameState gameState, MonsterState executor, Target target) throws KoTIOException {
        List<MonsterState> affectedMonsters = new ArrayList<>();
        List<MonsterState> monsters = new ArrayList<>(gameState.getMonsters());
        List<MonsterState> otherMonsters = monsters
                .stream()
                .filter(monsterState -> !monsterState.equals(executor))
                .collect(Collectors.toList());

        switch (target) {
            case None:
                break;
            case Self:
                affectedMonsters.add(executor);
                break;
            case One:
                affectedMonsters.add(askPlayerForTarget(gameState, executor, otherMonsters));
                break;
            case Others:
                affectedMonsters.addAll(otherMonsters);
                break;
            case Everyone:
                affectedMonsters.addAll(monsters);
                break;
            case AnotherRandom:
                affectedMonsters.add(getRandomMonster(otherMonsters));
                break;
            case AnyoneRandom:
                affectedMonsters.add(getRandomMonster(monsters));
                break;
        }
        return affectedMonsters;
    }

    private static MonsterState getRandomMonster(List<MonsterState> monsters) {
        return Randomizer.pickRandomElements(monsters, 1).get(0);
    }

    private static MonsterState askPlayerForTarget(GameState gameState, MonsterState executor, List<MonsterState> potentialTargets) throws KoTIOException {
        Player player = gameState.getPlayer(executor.getMonster());

        List<Choice> choices = potentialTargets
                .stream()
                .map(monsterState -> monsterState.getMonster().getName())
                .map(monsterName -> new Choice(
                        monsterName,
                        ResourceLoader.getString(
                                Resource.Game,
                                "targetMonster",
                                monsterName
                        )
                ))
                .collect(Collectors.toList());
        Message message = MessageFactory.createMessage(
                ResourceLoader.getString(
                        Resource.Game,
                        "chooseTarget"
                ),
                choices,
                1
        );

        Choice choicePiked = player.chooseAction(message).get(0);

        return potentialTargets
                .stream()
                .filter(target -> target.getMonster().getName().equalsIgnoreCase(choicePiked.getShortcut()))
                .collect(Collectors.toList())
                .get(0);
    }
    // endregion
}
