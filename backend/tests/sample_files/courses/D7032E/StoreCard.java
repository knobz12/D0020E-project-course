package se.ltu.softwareengineering.concept.card;

import se.ltu.softwareengineering.concept.Spell;

import java.util.List;
import java.util.Objects;

public class StoreCard extends Card {
    private int cost;

    public StoreCard(String name, String description, CardType type, List<Spell> effects, int cost) {
        super(name, description, type, effects);
        this.cost = cost;
    }

    public int getCost() {
        return cost;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        if (!super.equals(o)) return false;
        StoreCard storeCard = (StoreCard) o;
        return getCost() == storeCard.getCost();
    }

    @Override
    public String toString() {
        return "StoreCard{" +
                "cost=" + cost +
                "} " + super.toString();
    }

    @Override
    public int hashCode() {
        return Objects.hash(super.hashCode(), getCost());
    }
}