package se.ltu.softwareengineering.tool;

import java.io.File;

/**
 * List every available resource.
 * A resource is made of two parts:
 * <ol>
 * <li>
 * a type: used to compute the folder where the file should be stored;
 * </li>
 * <li>
 * a path: relative to the type folder.
 * </li>
 * </ol>
 */
public enum Resource {
    Game(Type.Messages, "game.properties"),
    Error(Type.Messages, "error.properties"),
    Choice(Type.Messages, "choice.properties"),

    Monsters(Type.Data, "monsters.json"),
    StoreCards(Type.Data, "storeCards.json"),
    EvolutionCards(Type.Data, "evolutionCards.json");

    private String path;

    Resource(Type type, String path) {
        this.path = type.getPath() + File.separator + path;
    }

    public String getPath() {
        return path;
    }

    private enum Type {
        Messages("messages"),
        Data("data");

        private String path;

        Type(String path) {
            this.path = path;
        }

        public String getPath() {
            return path;
        }
    }
}
