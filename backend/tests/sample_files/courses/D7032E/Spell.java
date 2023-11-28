package se.ltu.softwareengineering.concept;

import java.util.List;
import java.util.Objects;

public class Spell {
    private Effect effect;
    private int value;
    private List<Target> targets;
    private List<TriggeringAction> triggeringActions;

    public Spell(Effect effect, int value, List<Target> targets, List<TriggeringAction> triggeringActions) {
        this.effect = effect;
        this.value = value;
        this.targets = targets;
        this.triggeringActions = triggeringActions;
    }

    public Effect getEffect() {
        return effect;
    }

    public int getValue() {
        return value;
    }

    public List<Target> getTargets() {
        return targets;
    }

    public List<TriggeringAction> getTriggeringActions() {
        return triggeringActions;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Spell spell = (Spell) o;
        return getValue() == spell.getValue() &&
                getEffect() == spell.getEffect() &&
                Objects.equals(getTargets(), spell.getTargets()) &&
                Objects.equals(getTriggeringActions(), spell.getTriggeringActions());
    }

    @Override
    public int hashCode() {
        return Objects.hash(getEffect(), getValue(), getTargets(), getTriggeringActions());
    }

    @Override
    public String toString() {
        return "Spell{" +
                "effect=" + effect +
                ", value=" + value +
                ", targets=" + targets +
                ", triggeringActions=" + triggeringActions +
                '}';
    }
}
