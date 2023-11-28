package se.ltu.softwareengineering.game.state;

import se.ltu.softwareengineering.concept.Monster;
import se.ltu.softwareengineering.concept.card.EvolutionCard;
import se.ltu.softwareengineering.concept.card.StoreCard;
import se.ltu.softwareengineering.player.Player;

import java.util.Objects;
import java.util.Set;

/**
 * Represent the game state before it has actually been started. Players, monsters and cards haven't yet been shuffled.
 */
public class DefaultGameState {
    private Set<Player> players;
    private Set<Monster> monsters;
    private Set<EvolutionCard> evolutionCards;
    private Set<StoreCard> storeCards;

    public DefaultGameState(Set<Player> players, Set<Monster> monsters, Set<EvolutionCard> evolutionCards, Set<StoreCard> storeCards) {
        this.players = players;
        this.monsters = monsters;
        this.evolutionCards = evolutionCards;
        this.storeCards = storeCards;
    }

    public Set<Player> getPlayers() {
        return players;
    }

    public Set<Monster> getMonsters() {
        return monsters;
    }

    public Set<EvolutionCard> getEvolutionCards() {
        return evolutionCards;
    }

    public Set<StoreCard> getStoreCards() {
        return storeCards;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        DefaultGameState that = (DefaultGameState) o;
        return Objects.equals(getPlayers(), that.getPlayers()) &&
                Objects.equals(getMonsters(), that.getMonsters()) &&
                Objects.equals(getEvolutionCards(), that.getEvolutionCards()) &&
                Objects.equals(getStoreCards(), that.getStoreCards());
    }

    @Override
    public int hashCode() {
        return Objects.hash(getPlayers(), getMonsters(), getEvolutionCards(), getStoreCards());
    }
}
