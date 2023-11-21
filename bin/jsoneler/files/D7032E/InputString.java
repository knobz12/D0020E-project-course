package se.ltu.softwareengineering.io;

import java.util.Queue;

/**
 * Input where every action is already planned. Each String in the Queue is a single input.
 */
public class InputString implements Input {
    private Queue<String> input;

    public InputString(Queue<String> input) {
        this.input = input;
    }

    @Override
    public String getInput() {
        return input.poll();
    }
}
