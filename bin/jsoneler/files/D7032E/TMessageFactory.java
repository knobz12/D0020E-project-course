package se.ltu.softwareengineering.communication.message;

import org.junit.Test;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class TMessageFactory {

    @Test
    public void createInformation() {
        Message expected = new Information("Test");
        assertEquals(expected, MessageFactory.createMessage("Test", null, 0));
    }

    @Test
    public void createQuestion() {
        List<Choice> choices = Arrays.asList(
                new Choice("1", "a"),
                new Choice("2", "b")
        );
        Message expected = new ClosedQuestion("Test", choices, 2);
        assertEquals(expected, MessageFactory.createMessage("Test", choices, 2));
    }

    @Test
    public void createReply() {
        List<Choice> choices = Arrays.asList(
                new Choice("1", "a"),
                new Choice("2", "b")
        );
        Message expected = new Reply(choices);
        assertEquals(expected, MessageFactory.createMessage(null, choices, 0));
    }
}
