package se.ltu.softwareengineering.tool;

import com.google.gson.Gson;
import se.ltu.softwareengineering.exception.KoTIOException;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.lang.reflect.Type;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;

/**
 * Provide access methods to language resource files.
 * Can be set to use different languages if linked files exist.
 */
public abstract class ResourceLoader {
    /**
     * List every language that can currently be used in the application.
     * As it does not really matter for this project, the single currently available is English.
     */
    public enum AvailableLanguage {
        English("english", "en");

        private String name;
        private String path;

        AvailableLanguage(String name, String path) {
            this.name = name;
            this.path = path;
        }

        public String getName() {
            return name;
        }

        /**
         * Construct the path to the language folder.
         *
         * @return A stringified representation of the path to the corresponding language folder
         */
        public String getFullPath() {
            return "resources" + File.separator + path;
        }
    }

    private static AvailableLanguage currentLanguage = AvailableLanguage.English;

    public static AvailableLanguage getCurrentLanguage() {
        return currentLanguage;
    }

    public static void setCurrentLanguage(AvailableLanguage currentLanguage) {
        ResourceLoader.currentLanguage = currentLanguage;
    }

    /**
     * Get a string from a properties file.
     *
     * @param resource Resource file to look for the property
     * @param key      Key that the string is associated with
     * @return String associated to the key
     */
    public static String getString(Resource resource, String key) {
        return PropertiesFileData.getValueFromFile(getPathForResource(resource), key)
                .replace("\\n", System.lineSeparator());
    }

    /**
     * Get a string a properties file and format it.
     *
     * @param resource  Resource file to look for the property
     * @param key       Key that the string is associated with
     * @param arguments Arguments to format the string with
     * @return String associated to the key
     */
    public static String getString(Resource resource, String key, Object... arguments) {
        return String.format(getString(resource, key), arguments);
    }

    private static String getPathForResource(Resource resource) {
        return currentLanguage.getFullPath() + File.separator + resource.getPath();
    }

    /**
     * Get all the lines from a resource file.
     *
     * @param resource File to read
     * @return List of lines of the file
     * @throws IOException When the reading encounters an error (file not found, ...)
     */
    public static List<String> readAllLines(Resource resource) throws IOException {
        String filePath = getPathForResource(resource);
        return Files.readAllLines(Paths.get(filePath));
    }

    /**
     * Load data from a JSON file that is declared as a resource.
     * Type of the ressource should be known before loading it.
     *
     * @param resource Resource the data comes from
     * @param type     Type of the data to load
     * @param <T>      Type of the data to load
     * @return Object representing the data in memory
     * @throws KoTIOException When no file is found
     */
    public static <T> T loadData(Resource resource, Type type) throws KoTIOException {
        try {
            return new Gson().fromJson(new FileReader(getPathForResource(resource)), type);
        } catch (FileNotFoundException e) {
            throw new KoTIOException(ResourceLoader.getString(Resource.Error, "fileNotRead", resource.getPath()), e);
        }
    }

}
