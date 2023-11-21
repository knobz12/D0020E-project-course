package se.ltu.softwareengineering.concept.card;

import se.ltu.softwareengineering.concept.Spell;

import java.util.List;
import java.util.Objects;

public class EvolutionCard extends Card {
    private String monsterName;

    public EvolutionCard(String name, String description, CardType type, List<Spell> effects, String monsterName) {
        super(name, description, type, effects);
        this.monsterName = monsterName;
    }

    public String getMonsterName() {
        return monsterName;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        if (!super.equals(o)) return false;
        EvolutionCard that = (EvolutionCard) o;
        return Objects.equals(getMonsterName(), that.getMonsterName());
    }

    @Override
    public int hashCode() {
        return Objects.hash(super.hashCode(), getMonsterName());
    }

    @Override
    public String toString() {
        return "EvolutionCard{" +
                "monsterName='" + monsterName + '\'' +
                "} " + super.toString();
    }
}
