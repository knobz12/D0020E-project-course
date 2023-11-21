package se.ltu.softwareengineering.game.state;

import se.ltu.softwareengineering.concept.card.StoreCard;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * Represent a deck of cards and its store.
 */
public class Deck {
    private List<StoreCard> deck;
    private List<StoreCard> store = new ArrayList<>();
    private int storeSize;

    Deck(List<StoreCard> deck, int storeSize) {
        this.deck = new ArrayList<>(deck);
        this.storeSize = storeSize;
        resetStore();
    }

    /**
     * Return a copy of the store in order for it not to be altered.
     * @return A copy of the store
     */
    List<StoreCard> getStore() {
        return new ArrayList<>(store);
    }

    /**
     * Take a card from the store and returns it. Place a new card in the store.
     *
     * @param position Position of the card to remove from the store
     * @return Taken card if position is in [0, store.size()]
     */
    public StoreCard takeCard(int position) {
        if (position < 0 || position >= store.size()) return null;
        StoreCard takenCard = store.remove(position);
        if (!deck.isEmpty()) {
            store.add(deck.remove(0));
        }
        return takenCard;
    }

    /**
     * Reset the store:
     * <ul>
     *     <li>Remove every card from it</li>
     *     <li>Draw new cards from the deck</li>
     * </ul>
     */
    void resetStore() {
        store.clear();
        for (int i = 0; i < storeSize && !deck.isEmpty(); i++) {
            store.add(deck.remove(0));
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Deck deck1 = (Deck) o;
        return storeSize == deck1.storeSize &&
                Objects.equals(deck, deck1.deck) &&
                Objects.equals(getStore(), deck1.getStore());
    }

    @Override
    public int hashCode() {
        return Objects.hash(deck, getStore(), storeSize);
    }
}
