package se.ltu.softwareengineering.game.phase;

import se.ltu.softwareengineering.communication.message.Choice;
import se.ltu.softwareengineering.communication.message.Message;
import se.ltu.softwareengineering.communication.message.MessageFactory;
import se.ltu.softwareengineering.concept.Spell;
import se.ltu.softwareengineering.concept.TriggeringAction;
import se.ltu.softwareengineering.concept.card.CardType;
import se.ltu.softwareengineering.concept.card.StoreCard;
import se.ltu.softwareengineering.exception.KoTIOException;
import se.ltu.softwareengineering.game.CommonChoice;
import se.ltu.softwareengineering.game.state.AlterationType;
import se.ltu.softwareengineering.game.state.GameState;
import se.ltu.softwareengineering.game.state.MonsterState;
import se.ltu.softwareengineering.tool.Resource;
import se.ltu.softwareengineering.tool.ResourceLoader;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import static se.ltu.softwareengineering.game.GameConstantRules.CARDS_IN_STORE;
import static se.ltu.softwareengineering.game.GameConstantRules.ENERGY_TO_RESET;

public class Phase04Store extends Phase {
    Phase04Store(GameState gameState) {
        super(gameState);
    }

    @Override
    Phase computeNextPhase(GameState gameState) {
        return new Phase05EndTurn(gameState);
    }

    @Override
    public Phase playPhase() throws KoTIOException {
        initPhase();

        askToBuy();

        return computeNextPhase(gameState);
    }

    @Override
    void initPhase() throws KoTIOException {
        for (MonsterState monster : gameState.getMonsters()) {
            askToPlayCards(monster);
        }
    }

    @Override
    public String getPhaseName() {
        return "Buy cards";
    }

    private void askToBuy() throws KoTIOException {
        MonsterState currentMonster = gameState.getMonster(0);

        if (gameState.isStoreEmpty()) {
            Message emptyStoreMessage = MessageFactory.createMessage(
                    ResourceLoader.getString(
                            Resource.Game,
                            "emptyStore"
                    )
            );
            sendMessageToCurrentMonster(emptyStoreMessage);
            return;
        }

        int energyToReset = ENERGY_TO_RESET + currentMonster.getAlteration(AlterationType.EnergyToReset);
        List<Choice> choices = getStoreCardsAsChoices();
        if (currentMonster.getEnergy() >= energyToReset) {
            choices.add(
                    new Choice(
                            ResourceLoader.getString(
                                    Resource.Game,
                                    "reset"
                            ),
                            ResourceLoader.getString(
                                    Resource.Game,
                                    "resetStore",
                                    energyToReset
                            )
                    )
            );
        }
        choices.add(new Choice(
                ResourceLoader.getString(
                        Resource.Game,
                        "cancel"
                ),
                ResourceLoader.getString(
                        Resource.Game,
                        "cancel"
                )
        ));

        Message message = MessageFactory.createMessage(
                ResourceLoader.getString(
                        Resource.Game,
                        "buyCards",
                        currentMonster.getEnergy()
                ),
                choices,
                1
        );

        List<Choice> results = askCurrentMonster(message);

        String cancelShortcut = ResourceLoader.getString(
                Resource.Game,
                "cancel"
        );
        if (results.isEmpty()
                || results.get(0).getShortcut().equalsIgnoreCase(cancelShortcut)) {
            return;
        }

        applyChoice(results.get(0));

        if (currentMonster.getEnergy() > 0) {
            askToBuy();
        }
    }

    private void applyChoice(Choice choice) throws KoTIOException {
        MonsterState currentMonster = gameState.getMonster(0);


        String choiceShortcut = choice.getShortcut();
        String resetShortcut = ResourceLoader.getString(
                Resource.Game,
                "reset"
        );

        if (resetShortcut.equalsIgnoreCase(choice.getShortcut())
                && checkEffects(gameState, TriggeringAction.ResetStore)) {
            gameState.resetStore(currentMonster);
            Message storeResetMessage = MessageFactory.createMessage(
                    ResourceLoader.getString(
                            Resource.Game,
                            "storeReset"
                    )
            );
            sendMessageToEverybody(storeResetMessage);
        } else {
            int cardPosition = Integer.parseInt(choiceShortcut) - 1;
            buyCard(cardPosition);
        }
    }

    private List<Choice> getStoreCardsAsChoices() {
        List<StoreCard> topCardsOfDeck = gameState.getStore();
        int cardsInStore = Integer.min(CARDS_IN_STORE, topCardsOfDeck.size());
        return IntStream.range(0, cardsInStore)
                .boxed()
                .map(i -> new Choice(
                        String.valueOf(i + 1),
                        getChoiceDescription(topCardsOfDeck.get(i))
                ))
                .collect(Collectors.toList());
    }

    private String getChoiceDescription(StoreCard card) {
        int costAlteration = gameState.getMonster(0).getCardCostAlteration();
        return ResourceLoader.getString(
                Resource.Game,
                "displayBuyableCard",
                card.getName(),
                card.getCost() + costAlteration,
                card.getType(),
                card.getDescription()
        );
    }

    private void buyCard(int position) throws KoTIOException {
        MonsterState currentMonster = gameState.getMonster(0);

        List<StoreCard> store = gameState.getStore();
        StoreCard card = store.get(position);
        int cost = card.getCost() + currentMonster.getAlteration(AlterationType.CardCost);

        if (cost <= currentMonster.getEnergy()) {
            if (checkEffects(gameState, TriggeringAction.BuyStoreCard)) {
                StoreCard boughtCard = gameState.buyCard(currentMonster, position);

                Message boughtCardMessage = MessageFactory.createMessage(
                        ResourceLoader.getString(
                                Resource.Game,
                                "boughtCard",
                                currentMonster.getMonster().getName(),
                                boughtCard.getName()
                        )
                );
                sendMessageToEverybody(boughtCardMessage);

                triggerCard(boughtCard);
            }
        } else {
            Message cantBuyMessage = MessageFactory.createMessage(
                    ResourceLoader.getString(
                            Resource.Game,
                            "cantBuyNotEnoughStars",
                            card.getName(),
                            card.getCost() - currentMonster.getEnergy()
                    )
            );
            sendMessageToCurrentMonster(cantBuyMessage);
        }
    }

    private void triggerCard(StoreCard card) throws KoTIOException {
        MonsterState currentMonster = gameState.getMonster(0);

        boolean playCard = true;
        if (CardType.Keep.equals(card.getType())) {
            Message playCardNowMessage = MessageFactory.createMessage(
                    ResourceLoader.getString(
                            Resource.Game,
                            "playCardNow",
                            card.getName()
                    ),
                    Arrays.asList(
                            CommonChoice.Yes.getChoice(),
                            CommonChoice.No.getChoice()
                    ),
                    1
            );
            Choice choice = askCurrentMonster(playCardNowMessage).get(0);
            if (choice.equals(CommonChoice.No.getChoice())) {
                playCard = false;
            }

            currentMonster.addCard(card, playCard);
        }

        playCard(currentMonster, card);
    }
}
