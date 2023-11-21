package se.ltu.softwareengineering.game.phase;

import org.junit.Test;
import se.ltu.softwareengineering.concept.*;
import se.ltu.softwareengineering.concept.card.CardType;
import se.ltu.softwareengineering.concept.card.EvolutionCard;
import se.ltu.softwareengineering.concept.card.StoreCard;
import se.ltu.softwareengineering.exception.KoTIOException;
import se.ltu.softwareengineering.game.state.DefaultGameState;
import se.ltu.softwareengineering.game.state.GameState;
import se.ltu.softwareengineering.game.state.MonsterState;
import se.ltu.softwareengineering.io.Console;
import se.ltu.softwareengineering.player.HumanPlayer;
import se.ltu.softwareengineering.player.Player;
import se.ltu.softwareengineering.tool.Randomizer;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static se.ltu.softwareengineering.game.GameConstantRules.CARDS_IN_STORE;

public class TPhase01Initialization {

    /**
     * Test requirements 1-6
     */
    @Test
    public void buildGameState() throws KoTIOException {
        List<Spell> effectsArmorPlating = Collections.singletonList(
                new Spell(
                        Effect.GainStars,
                        2,
                        Collections.singletonList(Target.Self),
                        Collections.emptyList()
                )
        );
        List<Spell> effectsRedDawn = Collections.singletonList(
                new Spell(
                        Effect.DealDamages,
                        2,
                        Collections.singletonList(Target.Others),
                        Collections.emptyList()
                )
        );
        List<Spell> effectsRadioactiveWaste = Arrays.asList(
                new Spell(
                        Effect.GainEnergy,
                        2,
                        Collections.singletonList(Target.Self),
                        Collections.emptyList()
                ),
                new Spell(
                        Effect.GainHearts,
                        1,
                        Collections.singletonList(Target.Self),
                        Collections.emptyList()
                )
        );

        List<Monster> monsters = Arrays.asList(
                new Monster("Kong", 10, 1, 0),
                new Monster("Gigazaur", 10, 1, 0),
                new Monster("Alienoid", 10, 1, 0)
        );

        List<Player> players = Arrays.asList(
                new HumanPlayer(new Console()),
                new HumanPlayer(new Console())
        );

        List<EvolutionCard> evolutionCards = Arrays.asList(
                new EvolutionCard(
                        "Armor Plating",
                        "Gain 2 STAR.",
                        CardType.Discard,
                        effectsArmorPlating,
                        "Alienoid"
                ),
                new EvolutionCard(
                        "Red Dawn",
                        "All other Monsters lose 2 HEART.",
                        CardType.Discard,
                        effectsRedDawn,
                        "Kong"
                ),
                new EvolutionCard(
                        "Radioactive Waste",
                        "Gain 2 ENERGY and 1 HEART.",
                        CardType.Discard,
                        effectsRadioactiveWaste,
                        "Gigazaur"
                )
        );

        List<StoreCard> storeCards = Arrays.asList(
                new StoreCard(
                        "Acid Attack",
                        "Deal 1 extra damage each turn (even when you don't otherwise attack).",
                        CardType.Keep,
                        Collections.singletonList(
                                new Spell(
                                        Effect.DealDamages,
                                        1,
                                        Collections.singletonList(Target.Others),
                                        Collections.singletonList(
                                                TriggeringAction.DealDamages
                                        )
                                )
                        ),
                        6
                ),
                new StoreCard(
                        "Alien Metabolism",
                        "Buying cards costs you 1 less.",
                        CardType.Keep,
                        Collections.singletonList(
                                new Spell(
                                        Effect.AlterCardCost,
                                        -1,
                                        Collections.singletonList(Target.Self),
                                        Collections.emptyList()
                                )
                        ),
                        3
                ),
                new StoreCard(
                        "Alpha Monster",
                        "Gain 1 STAR when you attack.",
                        CardType.Keep,
                        Collections.singletonList(
                                new Spell(
                                        Effect.GainStars,
                                        1,
                                        Collections.singletonList(Target.Self),
                                        Collections.singletonList(
                                                TriggeringAction.DealDamages
                                        )
                                )
                        ),
                        5
                ),
                new StoreCard(
                        "Apartment Building",
                        "Gain 3 STAR.",
                        CardType.Discard,
                        Collections.singletonList(
                                new Spell(
                                        Effect.GainStars,
                                        3,
                                        Collections.singletonList(Target.Self),
                                        Collections.emptyList()
                                )
                        ),
                        5
                ),
                new StoreCard(
                        "Armor Plating",
                        "Ignore damage of 1.",
                        CardType.Keep,
                        Collections.singletonList(
                                new Spell(
                                        Effect.AlterArmor,
                                        1,
                                        Collections.singletonList(Target.Self),
                                        Collections.emptyList()
                                )
                        ),
                        4
                ),
                new StoreCard(
                        "Commuter Train",
                        "Gain 2 STAR.",
                        CardType.Discard,
                        Collections.singletonList(
                                new Spell(
                                        Effect.GainStars,
                                        2,
                                        Collections.singletonList(Target.Self),
                                        Collections.emptyList()
                                )
                        ),
                        4
                ),
                new StoreCard(
                        "Corner Stone",
                        "Gain 1 STAR.",
                        CardType.Discard,
                        Collections.singletonList(
                                new Spell(
                                        Effect.GainStars,
                                        1,
                                        Collections.singletonList(Target.Self),
                                        Collections.emptyList()
                                )
                        ),
                        3
                )
        );


        DefaultGameState defaultGameState = new DefaultGameState(
                new LinkedHashSet<>(players),
                new LinkedHashSet<>(monsters),
                new LinkedHashSet<>(evolutionCards),
                new LinkedHashSet<>(storeCards)
        );

        Map<Monster, Player> monstersPlayers = IntStream.range(0, players.size())
                .boxed()
                .collect(
                        Collectors.toMap(
                                monsters::get,
                                players::get,
                                (x, y) -> y,
                                LinkedHashMap::new
                        )
                );

        Map<Monster, List<EvolutionCard>> monstersEvolutionCards = monsters
                .stream()
                .limit(players.size())
                .collect(
                        Collectors.toMap(
                                monster -> monster,
                                monster -> evolutionCards.stream()
                                        .filter(card -> card.getMonsterName().equalsIgnoreCase(monster.getName()))
                                        .collect(Collectors.toList()),
                                (x, y) -> y,
                                LinkedHashMap::new
                        )
                );

        GameState expected = new GameState(
                new ArrayList<>(storeCards),
                monsters.stream().limit(players.size()).map(MonsterState::new).collect(Collectors.toList()),
                monstersPlayers,
                monstersEvolutionCards,
                null
        );


        Randomizer.addValues(
                0, 0, 0, 0, 0, 0, 0,      // Randomize store cards
                0, 0,                     // Pick monster to assign them to players
                0, 0,                     // Pick players to assign them to monsters
                0, 0                      // Pick evolution cards
        );

        Phase phase = new Phase01Initialization(defaultGameState).playPhase();
        GameState actualGameState = phase.gameState;

        assertEquals(expected, actualGameState);
        assertFalse(Randomizer.hasValues());

        assertEquals(CARDS_IN_STORE, actualGameState.getStore().size());
    }
}
