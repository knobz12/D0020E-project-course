package se.ltu.softwareengineering.game.state;

import se.ltu.softwareengineering.concept.EffectProvider;
import se.ltu.softwareengineering.concept.Monster;
import se.ltu.softwareengineering.concept.card.Card;

import java.util.*;

/**
 * Track a monster state. Contain:
 * <ul>
 * <li>
 * the monster itself;
 * </li>
 * <li>
 * its current health;
 * </li>
 * <li>
 * its energy;
 * </li>
 * <li>
 * its stars;
 * </li>
 * <li>
 * its cards (revealed or not).
 * </li>
 * </ul>
 */
public class MonsterState {
    private Monster monster;
    private int currentHealth;
    private int energy;
    private int stars;

    private List<Card> revealedCards = new ArrayList<>();
    private List<Card> unrevealedCards = new ArrayList<>();

    private MonsterAlteration alteration = new MonsterAlteration();


    public MonsterState(Monster monster) {
        this.monster = monster;
        this.currentHealth = getMaxHealth();
        this.energy = 0;
        this.stars = 0;
    }

    // region Getter
    public Monster getMonster() {
        return monster;
    }

    public int getCurrentHealth() {
        return currentHealth;
    }

    public int getEnergy() {
        return energy;
    }

    public int getStars() {
        return stars;
    }

    public int getDamages() {
        return getMonster().getBaseDamages()
                + getAlteration(AlterationType.Damages);
    }

    public int getMaxHealth() {
        return getMonster().getMaxHealth()
                + getAlteration(AlterationType.MaxHealth);
    }

    public int getArmor() {
        return getMonster().getBaseArmor()
                + getAlteration(AlterationType.Armor);
    }

    public int getCardCostAlteration() {
        return getAlteration(AlterationType.CardCost);
    }

    public List<Card> getRevealedCards() {
        return revealedCards;
    }

    public List<Card> getUnrevealedCards() {
        return unrevealedCards;
    }
    // endregion

    /**
     * Add health to the current value. Can become higher than maximum health value.
     * Check of maximum value should be done elsewhere.
     *
     * @param number Number of health points to restore
     */
    public void addHealth(int number) {
        this.currentHealth += number;
    }

    /**
     * Add energy to the current value.
     *
     * @param number Number of energies to add
     */
    public void addEnergy(int number) {
        this.energy += number;
    }

    /**
     * Add stars to the current value.
     *
     * @param number Number of stars to add
     */
    public void addStars(int number) {
        this.stars += number;
    }

    // region Alteration

    /**
     * Register a provider to increase self stat.
     *
     * @param provider Provider of this effect
     * @param number   Number of points that card adds to this stat
     * @param type     Stat to alter
     */
    public void registerAlteration(EffectProvider provider, int number, AlterationType type) {
        alteration.registerAlteration(provider, number, type);
    }

    /**
     * Unregister an effect provider from this monster.
     *
     * @param effectProvider Effect provider that does not provide effect anymore
     */
    void unregisterAlteration(EffectProvider effectProvider) {
        alteration.unregisterAlteration(effectProvider);
    }

    /**
     * Compute the overall alteration to given statistic.
     *
     * @param type Type of the statistic
     * @return The overall alteration to given statistic. 0 if there is no alteration applying on this statistic.
     */
    public int getAlteration(AlterationType type) {
        return alteration.getAlteration(type);
    }
    // endregion

    // region Cards

    /**
     * Add a card to the specified list.
     *
     * @param card     Card to add
     * @param revealed Whether it should be displayed to other player or not
     */
    public void addCard(Card card, boolean revealed) {
        List<Card> cards = revealed
                ? revealedCards
                : unrevealedCards;
        cards.add(card);
    }

    /**
     * Reveal a card to other players, letting it having effects.
     * This card should already be unrevealed, otherwise it won't get revealed.
     *
     * @param card Card to reveal
     * @return Whether the card was unrevealed
     */
    public boolean revealCard(Card card) {
        boolean isUnrevealed = unrevealedCards.contains(card);
        if (isUnrevealed) {
            unrevealedCards.remove(card);
            revealedCards.add(card);
        }
        return isUnrevealed;
    }

    public void removeCard(Card card) {
        unrevealedCards.remove(card);
    }
    // endregion

    /**
     * Return whether this monster is dead.
     *
     * @return True if it is dead, false otherwise
     */
    public boolean isDead() {
        return currentHealth <= 0;
    }

    public int computeLostHps() {
        return getMaxHealth()
                - getCurrentHealth();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        MonsterState that = (MonsterState) o;
        return getCurrentHealth() == that.getCurrentHealth() &&
                getEnergy() == that.getEnergy() &&
                getStars() == that.getStars() &&
                Objects.equals(getMonster(), that.getMonster()) &&
                Objects.equals(getRevealedCards(), that.getRevealedCards()) &&
                Objects.equals(getUnrevealedCards(), that.getUnrevealedCards());
    }

    @Override
    public int hashCode() {
        return Objects.hash(getMonster(), getCurrentHealth(), getEnergy(), getStars(), getRevealedCards(), getUnrevealedCards());
    }

    @Override
    public String toString() {
        return "MonsterState{" +
                "monster=" + monster +
                ", currentHealth=" + currentHealth +
                ", energy=" + energy +
                ", stars=" + stars +
                ", revealedCards=" + revealedCards +
                ", unrevealedCards=" + unrevealedCards +
                '}';
    }
}
