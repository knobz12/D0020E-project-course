package se.ltu.softwareengineering.io;

import org.junit.AfterClass;
import org.junit.Before;
import org.junit.Test;
import se.ltu.softwareengineering.communication.message.Choice;
import se.ltu.softwareengineering.communication.message.Message;
import se.ltu.softwareengineering.communication.message.MessageFactory;
import se.ltu.softwareengineering.exception.KoTException;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.PrintStream;
import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class TConsole {
    private static PrintStream defaultOut = System.out;
    private static PrintStream defaultErr = System.err;
    private static InputStream defaultIn = System.in;

    private ByteArrayOutputStream output;
    private ByteArrayOutputStream err;

    @Before
    public void initOutput() {
        output = new ByteArrayOutputStream();
        System.setOut(new PrintStream(output));

        err = new ByteArrayOutputStream();
        System.setErr(new PrintStream(err));
    }

    @AfterClass
    public static void clean() {
        System.setOut(defaultOut);
        System.setErr(defaultErr);
        System.setIn(defaultIn);
    }

    private void setIn(String string) {
        System.setIn(new ByteArrayInputStream(string.getBytes()));
    }

    @Test
    public void getLine() {
        String expected = "Testing this awesome interface";
        setIn(expected);
        assertEquals(expected, new Console().getInput());
        assertEquals("", output.toString());
        assertEquals("", err.toString());

        System.setIn(defaultIn);
    }

    @Test
    public void printInformation() {
        String expected = "Testing this awesome interface" + System.lineSeparator()
                + System.lineSeparator();

        Message message = MessageFactory.createMessage("Testing this awesome interface", null, 0);

        Console console = new Console();
        console.displayMessage(message);

        assertEquals(expected, output.toString());
        assertEquals("", err.toString());
    }

    @Test
    public void printSingleChoice() {
        String expected = "Testing this awesome interface" + System.lineSeparator()
                + "\t" + "YES: Agree" + System.lineSeparator()
                + "\t" + "NO: Disagree" + System.lineSeparator()
                + "Pick a single choice and press [ENTER] to continue" + System.lineSeparator();

        Message message = MessageFactory.createMessage(
                "Testing this awesome interface",
                Arrays.asList(
                        new Choice("YES", "Agree"),
                        new Choice("NO", "Disagree")
                ), 1);

        Console console = new Console();
        console.displayMessage(message);

        assertEquals(expected, output.toString());
        assertEquals("", err.toString());
    }

    @Test
    public void printMultipleChoices() {
        String expected = "Testing this awesome interface" + System.lineSeparator()
                + "\t" + "YES: Agree" + System.lineSeparator()
                + "\t" + "NO: Disagree" + System.lineSeparator()
                + "Pick a maximum of 2 choices separated by [,] and press [ENTER] to continue" + System.lineSeparator();

        Message message = MessageFactory.createMessage(
                "Testing this awesome interface",
                Arrays.asList(
                        new Choice("YES", "Agree"),
                        new Choice("NO", "Disagree")
                ), 2);

        Console console = new Console();
        console.displayMessage(message);

        assertEquals(expected, output.toString());
        assertEquals("", err.toString());
    }

    /**
     * Test only the first line of the error output. The others depend on the system.
     */
    @Test
    public void printErr() {
        Console console = new Console();
        console.displayError(new KoTException("Testing this awesome interface - oh, is that an exception?"));

        assertEquals("", output.toString());
        assertEquals(
                "se.ltu.softwareengineering.exception.KoTException: Testing this awesome interface - oh, is that an exception?",
                err.toString().split(System.lineSeparator())[0]
        );
    }
}
