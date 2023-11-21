package se.ltu.softwareengineering.tool;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

/**
 * Provide an interface to read a .property file and to store it in memory.
 */
public class PropertiesFileData {
    private static Map<String, PropertiesFileData> knownData = new HashMap<>();
    private Properties data;

    private PropertiesFileData(Properties data) {
        this.data = data;
    }

    /**
     * Return the value associated to a key in target file.
     * Maintain a cache to fasten researches.
     *
     * @param filePath File to the path the property should be
     * @param key      Key to the property inside the file
     * @return The value of the property
     */
    public static String getValueFromFile(String filePath, String key) {
        if (knownData.containsKey(filePath)) {
            PropertiesFileData propertiesFileData = knownData.get(filePath);
            return propertiesFileData.data.getProperty(key);
        }

        Properties properties = new Properties();
        try (InputStream inputStream = new FileInputStream(filePath)) {
            properties.load(inputStream);
            knownData.put(filePath, new PropertiesFileData(properties));
            return properties.getProperty(key);
        } catch (FileNotFoundException e) {
            throw new RuntimeException(String.format("File not found '%s'", filePath), e);
        } catch (IOException e) {
            throw new RuntimeException(String.format("Error while reading '%s'", filePath), e);
        }
    }
}
