package se.ltu.softwareengineering.game;

import se.ltu.softwareengineering.communication.message.Choice;
import se.ltu.softwareengineering.tool.Resource;
import se.ltu.softwareengineering.tool.ResourceLoader;

public enum CommonChoice {
    Yes(ResourceLoader.getString(Resource.Choice, "yes"), ResourceLoader.getString(Resource.Choice, "yes")),
    No(ResourceLoader.getString(Resource.Choice, "no"), ResourceLoader.getString(Resource.Choice, "no"));
    Choice choice;

    CommonChoice(String shortcut, String description) {
        this.choice = new Choice(shortcut, description);
    }

    public Choice getChoice() {
        return choice;
    }
}
