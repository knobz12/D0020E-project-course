package se.ltu.softwareengineering.tool;

import org.junit.jupiter.api.BeforeEach;
import org.junit.Test;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import static org.junit.jupiter.api.Assertions.*;


public class TRandomizer {
    @BeforeEach
    public void init() {
        Randomizer.clear();
    }

    @Test
    public void fixedNumbers() {
        Randomizer.addValues(42, 59);

        assertEquals(42, Randomizer.nextInt(70));
        assertEquals(59, Randomizer.nextInt(70));
    }

    @Test
    public void tooHigh() {
        Randomizer.addValues(42);

        assertThrows(RuntimeException.class, () -> Randomizer.nextInt(10));
    }

    @Test
    public void takeNoValue() {
        final List<Integer> expected = new ArrayList<>(Collections.emptyList());

        Randomizer.addValues(0);

        assertEquals(expected, Randomizer.pickRandomElements(Arrays.asList(1,2,3,4)));
    }

    @Test
    public void takeAllValues() {
        final List<Integer> expected = new ArrayList<>(Arrays.asList(3,1,2));

        Randomizer.addValues(3, 0, 0, 0);

        assertEquals(expected, Randomizer.pickRandomElements(expected));
    }

    @Test
    public void takeRandomValues() {
        final List<Integer> expected = new ArrayList<>(Arrays.asList(1,4));

        Randomizer.addValues(2, 1, 2);

        assertEquals(expected, Randomizer.pickRandomElements(Arrays.asList(3,1,2,4)));
    }

    /**
     * Caution: as randomness can yield the exact list on a shuffle this test can fail.
     * However the probability is really, really, really low and it shouldn't happen.
     * If this happens try to restart this test.
     */
    @Test
    public void shuffle() {
        final int n = 100;

        final List<Integer> initial = new ArrayList<>(Arrays.asList(1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20));

        // Concatenate n times the initial list
        final List<Integer> expectedResult = IntStream.range(0, n)
                .mapToObj(i -> initial)
                .flatMap(List::stream)
                .collect(Collectors.toList());

        // Compute n shuffles of the initial list and concatenate them in a single list
        final List<Integer> actualRseult = IntStream.range(0, n)
                .mapToObj(i -> Randomizer.shuffle(initial))
                .flatMap(List::stream)
                .collect(Collectors.toList());

        assertNotEquals(expectedResult, actualRseult);
    }
}
