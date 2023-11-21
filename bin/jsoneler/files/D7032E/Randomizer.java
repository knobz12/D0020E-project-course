package se.ltu.softwareengineering.tool;

import java.util.*;

/**
 * Provide a way to control the application randomness.
 * A list of fixed values can be submitted. They will subsequently be used as if they were random values.
 */
public class Randomizer {
    private final static Randomizer randomizer = new Randomizer();
    private final Random random = new Random();

    /**
     * Emulate a false random.
     * If not empty, call to `nextInt` takes the first value of `nextIntegers`.
     */
    private Queue<Integer> nextIntegers = new LinkedList<>();

    private Randomizer() {
    }

    private static Randomizer getRandomizer() {
        return randomizer;
    }

    /**
     * Choose value between 0 (inclusive) and a maximum value (exclusive).
     * If `nextIntegers` is not empty, get the top value of it.
     * Otherwise, returns a random value.
     *
     * @param maxValue Maximum bound
     * @return Chosen value
     */
    public static int nextInt(int maxValue) {
        if (getRandomizer().nextIntegers.isEmpty()) {
            return getRandomizer().random.nextInt(maxValue);
        }

        final int value = getRandomizer().nextIntegers.poll();
        if (value >= maxValue) {
            throw new RuntimeException(String.format("Next value is %d: higher than %d", value, maxValue));
        }
        return value;
    }

    /**
     * Add new values to the queue.
     *
     * @param values Values to be added to the queue
     */
    public static void addValues(int... values) {
        for (int value : values) {
            getRandomizer().nextIntegers.add(value);
        }
    }

    /**
     * Check whether there still are some non-random values.
     *
     * @return true if there is still at least a non-random value, false otherwise
     */
    public static boolean hasValues() {
        return !getRandomizer().nextIntegers.isEmpty();
    }

    /**
     * Clear the queue.
     */
    @SuppressWarnings("WeakerAccess")
    public static void clear() {
        getRandomizer().nextIntegers.clear();
    }

    /**
     * Pick a random number of random elements from the available pool
     *
     * @param elements Elements that can be picked
     * @param <T>      Type of the elements
     * @return Picked elements
     */
    public static <T> List<T> pickRandomElements(Collection<T> elements) {
        final int number = nextInt(elements.size() + 1);
        return pickRandomElements(elements, number);
    }

    /**
     * Pick random elements from the available pool
     *
     * @param elements Elements that can be picked
     * @param number   Number of elements to pick
     * @param <T>      Type of the elements
     * @return Picked elements
     */
    public static <T> List<T> pickRandomElements(Collection<T> elements, int number) {
        final List<T> choices = new ArrayList<>(number);
        final List<T> notChosenChoices = new ArrayList<>(elements);
        for (int i = 0; i < number; i++) {
            int index = nextInt(notChosenChoices.size());
            T choice = notChosenChoices.remove(index);
            choices.add(choice);
        }

        return choices;
    }

    /**
     * Shuffle a collection of elements using the Randomizer.
     * Can be used to create a renewable scenario.
     *
     * @param elements Collection of elements to shuffle
     * @param <T>      Type of the elements
     * @return Shuffled list of elements
     */
    public static <T> List<T> shuffle(Collection<T> elements) {
        return pickRandomElements(elements, elements.size());
    }
}
