package se.ltu.softwareengineering.game.state;

import se.ltu.softwareengineering.concept.EffectProvider;

import java.util.Objects;

/**
 * Current state of an EffectProvider. Let the provider be bound to its caster.
 */
public class EffectProviderState {
    private MonsterState spellCaster;
    private EffectProvider provider;

    public EffectProviderState(MonsterState spellCaster, EffectProvider provider) {
        this.spellCaster = spellCaster;
        this.provider = provider;
    }

    public MonsterState getSpellCaster() {
        return spellCaster;
    }

    public EffectProvider getProvider() {
        return provider;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        EffectProviderState that = (EffectProviderState) o;
        return Objects.equals(getSpellCaster(), that.getSpellCaster()) &&
                Objects.equals(getProvider(), that.getProvider());
    }

    @Override
    public int hashCode() {
        return Objects.hash(getSpellCaster(), getProvider());
    }
}
