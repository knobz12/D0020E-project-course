package se.ltu.softwareengineering.concept;

import java.util.Objects;

public class Monster implements Concept {
    private String name;
    private int maxHealth;
    private int baseDamages;
    private int baseArmor;

    public Monster(String name, int maxHealth, int baseDamages, int baseArmor) {
        this.name = name;
        this.maxHealth = maxHealth;
        this.baseDamages = baseDamages;
        this.baseArmor = baseArmor;
    }

    public String getName() {
        return name;
    }

    public int getMaxHealth() {
        return maxHealth;
    }

    public int getBaseDamages() {
        return baseDamages;
    }

    public int getBaseArmor() {
        return baseArmor;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Monster monster = (Monster) o;
        return getMaxHealth() == monster.getMaxHealth() &&
                getBaseDamages() == monster.getBaseDamages() &&
                getBaseArmor() == monster.getBaseArmor() &&
                Objects.equals(getName(), monster.getName());
    }

    @Override
    public int hashCode() {
        return Objects.hash(getName(), getMaxHealth(), getBaseDamages(), getBaseArmor());
    }

    @Override
    public String toString() {
        return "Monster{" +
                "name='" + name + '\'' +
                ", maxHealth=" + maxHealth +
                ", baseDamages=" + baseDamages +
                ", baseArmor=" + baseArmor +
                '}';
    }
}
