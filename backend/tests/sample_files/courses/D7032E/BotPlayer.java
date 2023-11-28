package se.ltu.softwareengineering.player;

import se.ltu.softwareengineering.communication.message.Choice;
import se.ltu.softwareengineering.communication.message.Message;
import se.ltu.softwareengineering.exception.KoTException;
import se.ltu.softwareengineering.exception.KoTIOException;
import se.ltu.softwareengineering.io.Input;
import se.ltu.softwareengineering.io.Output;
import se.ltu.softwareengineering.tool.Randomizer;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.function.Function;

/**
 * A simple, stupid player that always choose a random option.
 */
public class BotPlayer extends Player {
    BotPlayer(Input input, Output output) {
        super(input, output);
    }

    @Override
    public List<Choice> chooseAction(Message message, Function<Choice, Boolean> validateChoice) throws KoTIOException {
        output.displayMessage(message);

        final int maxChoices = message.getMaxChoices();
        if (maxChoices == 0) {
            return new ArrayList<>();
        }

        final List<Choice> availableChoices = message.getChoices();
        if (maxChoices == 1) {
            final int randomChoice = Randomizer.nextInt(availableChoices.size());
            return Collections.singletonList(availableChoices.get(randomChoice));
        }

        final List<Choice> choices = Randomizer.pickRandomElements(availableChoices);
        if (choices.stream().map(validateChoice).anyMatch(valid -> !valid)) {
            return chooseAction(message, validateChoice);
        } else {
            return choices;
        }
    }

    @Override
    public void displayMessage(Message message) {

    }

    @Override
    public void displayError(KoTException e) {

    }
}
