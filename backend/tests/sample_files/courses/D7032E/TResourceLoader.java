package se.ltu.softwareengineering.tool;

import org.junit.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

public class TResourceLoader {
    @Test
    public void noFormat() {
        assertEquals("King of Tokyo Power Up!", ResourceLoader.getString(Resource.Game,"name"));
    }

    @Test
    public void format() {
        assertEquals("No value associated to the key 'Not there'.", ResourceLoader.getString(Resource.Error,"valueNotFound", "Not there"));
    }

    @Test
    public void changeLanguage() {
        ResourceLoader.AvailableLanguage currentLanguage = ResourceLoader.getCurrentLanguage();
        assertEquals(ResourceLoader.AvailableLanguage.English, currentLanguage);
        assertEquals("english", currentLanguage.getName());

        ResourceLoader.setCurrentLanguage(null);
        currentLanguage = ResourceLoader.getCurrentLanguage();
        assertNull(currentLanguage);

        ResourceLoader.setCurrentLanguage(ResourceLoader.AvailableLanguage.English);
    }
}
