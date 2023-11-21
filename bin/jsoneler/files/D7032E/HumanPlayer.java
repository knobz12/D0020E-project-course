package se.ltu.softwareengineering.player;

import se.ltu.softwareengineering.communication.message.Choice;
import se.ltu.softwareengineering.communication.message.Message;
import se.ltu.softwareengineering.communication.message.MessageFactory;
import se.ltu.softwareengineering.exception.KoTException;
import se.ltu.softwareengineering.exception.KoTIOException;
import se.ltu.softwareengineering.io.Input;
import se.ltu.softwareengineering.io.Output;
import se.ltu.softwareengineering.tool.ResourceLoader;
import se.ltu.softwareengineering.tool.Resource;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * A human player that can choose an action or a list of actions.
 * As the input object can be a file the choices could be a well-known scenario.
 */
public class HumanPlayer extends Player {
    public HumanPlayer(Input input, Output output) {
        super(input, output);
    }

    public <T extends Input & Output> HumanPlayer(T ioObject) {
        super(ioObject);
    }

    @Override
    public List<Choice> chooseAction(Message message, Function<Choice, Boolean> validateChoice) throws KoTIOException {
        final int maxChoices = message.getMaxChoices();

        output.displayMessage(message);

        String inputChoice = input.getInput();
        if (message.getMaxChoices() == -1) {
            output.displayMessage(MessageFactory.createMessage(""));

            Choice choice = new Choice(inputChoice, inputChoice);
            if (validateChoice.apply(choice)) {
                return Collections.singletonList(choice);
            } else {
                return chooseNewAction(Collections.singletonList(inputChoice), 0,0, message, validateChoice);
            }
        }

        final List<String> choicesAsStrings = Arrays.stream(
                inputChoice.split(ResourceLoader.getString(Resource.Choice, "choicesSeparator"))
        )
                .map(String::trim)
                .filter(choice -> !choice.isEmpty())
                .collect(Collectors.toList());

        final Map<String, Choice> availableChoices = message.getChoices()
                .stream()
                .collect(
                        Collectors.toMap(
                                choice -> choice.getShortcut().toLowerCase(),
                                choice -> choice
                        )
                );

        final List<Choice> choices = new ArrayList<>(choicesAsStrings.size());
        final List<String> invalidChoices = new ArrayList<>();
        for (String choiceAsString : choicesAsStrings) {
            Choice choice = availableChoices.get(choiceAsString.toLowerCase());

            if (choice == null || !validateChoice.apply(choice)) {
                invalidChoices.add(choiceAsString);
            } else {
                choices.add(choice);
            }
        }

        output.displayMessage(MessageFactory.createMessage(""));
        if (invalidChoices.isEmpty() && choices.size() <= maxChoices) {
            return choices;
        } else {
            return chooseNewAction(invalidChoices, maxChoices, choices.size(), message, validateChoice);
        }
    }

    @Override
    public void displayMessage(Message message) throws KoTIOException {
        output.displayMessage(message);
    }

    @Override
    public void displayError(KoTException e) throws KoTIOException {
        output.displayError(e);
    }

    /**
     * Ask the player to choose a new action (or a new list of actions) when the latest was invalid.
     *
     * @param invalidChoices List of choices that were not valid
     * @param message        Message that ask to choose an action (usually the same as passed to {@link Player#chooseAction(Message)})
     * @return Choices picked by the player. Can be empty if there was no choice or the player hasn't selected any.
     */
    private List<Choice> chooseNewAction(List<String> invalidChoices,
                                         int expectedNumber, int actualNumber,
                                         Message message,
                                         Function<Choice, Boolean> validateChoice) throws KoTIOException {
        String text = "";
        if (invalidChoices.size() == 1) {
            text = ResourceLoader.getString(Resource.Choice, "invalidChoice", invalidChoices.get(0));
        } else if (invalidChoices.size() > 1){
            text = ResourceLoader.getString(Resource.Choice, "invalidChoices", String.join(",", invalidChoices));
        }
        if (actualNumber > expectedNumber) {
            if (!text.isEmpty()) {
                text += System.lineSeparator();
            }
            text += ResourceLoader.getString(Resource.Choice, "tooMuchChoices", expectedNumber);
        }
        if (text.isEmpty()) {
            text += ResourceLoader.getString(Resource.Choice, "invalidChoice", invalidChoices.get(0));
        }

        displayMessage(MessageFactory.createMessage(text, null, 0));

        return chooseAction(message, validateChoice);
    }
}
