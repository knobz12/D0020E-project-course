package se.ltu.softwareengineering.game.state;

import se.ltu.softwareengineering.concept.EffectProvider;

import java.util.HashMap;
import java.util.Map;

/**
 * Alterations that can be added to a monster.
 * Alterations can add damages, armor; reduce cards cost, ...
 */
class MonsterAlteration {
    private Map<AlterationType, Map<EffectProvider, Integer>> alterations = new HashMap<>();

    /**
     * Compute the overall alteration to given statistic.
     *
     * @param type Type of the statistic
     * @return The overall alteration to given statistic. 0 if there is no alteration applying on this statistic.
     */
    int getAlteration(AlterationType type) {
        return alterations
                .getOrDefault(type, new HashMap<>())
                .values()
                .stream()
                .mapToInt(Integer::intValue)
                .sum();
    }

    /**
     * Add a new alteration.
     *
     * @param provider Provider of the alteration
     * @param value    Value of the alteration
     * @param type     Type of the alteration
     */
    void registerAlteration(EffectProvider provider, int value, AlterationType type) {
        Map<EffectProvider, Integer> alreadyExistingProviders = alterations.computeIfAbsent(type, k -> new HashMap<>());
        alreadyExistingProviders.put(provider, value);
    }

    /**
     * Remove an alteration (e.g. when a card is removed from the game).
     *
     * @param provider Provider of the alteration
     */
    void unregisterAlteration(EffectProvider provider) {
        alterations
                .values()
                .forEach(typedAlterations -> typedAlterations.remove(provider));
    }

}
