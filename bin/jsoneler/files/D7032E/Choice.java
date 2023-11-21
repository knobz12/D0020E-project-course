package se.ltu.softwareengineering.communication.message;

import java.io.Serializable;
import java.util.Objects;

public class Choice implements Serializable {
    private final String shortcut;
    private final String description;

    public Choice(String shortcut, String description) {
        this.shortcut = shortcut;
        this.description = description;
    }

    public String getShortcut() {
        return shortcut;
    }

    public String getDescription() {
        return description;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Choice choice = (Choice) o;
        return Objects.equals(shortcut, choice.shortcut) &&
                Objects.equals(description, choice.description);
    }

    @Override
    public String toString() {
        return "Choice{" +
                "shortcut='" + shortcut + '\'' +
                ", description='" + description + '\'' +
                '}';
    }
}
