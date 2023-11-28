package se.ltu.softwareengineering.tool;

import org.junit.Test;

import static org.junit.jupiter.api.Assertions.*;
import static se.ltu.softwareengineering.tool.PropertiesFileData.getValueFromFile;

public class TPropertiesFileData {
    @Test
    public void gameName() {
        assertEquals("King of Tokyo Power Up!", getValueFromFile("resources/en/messages/game.properties", "name"));
    }

    @Test
    public void fileNotFound() {
        assertThrows(
                RuntimeException.class,
                () -> getValueFromFile("unknownFile", "unknown key"),
                "File not found 'unknownFile'"
        );
    }

    @Test
    public void keyNotFound() {
        assertNull(getValueFromFile("resources/en/messages/game.properties", "unknown key"));
    }
}
