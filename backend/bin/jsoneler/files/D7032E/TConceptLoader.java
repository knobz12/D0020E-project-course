package se.ltu.softwareengineering.game;

import org.junit.Test;
import se.ltu.softwareengineering.concept.*;
import se.ltu.softwareengineering.concept.card.CardType;
import se.ltu.softwareengineering.concept.card.EvolutionCard;
import se.ltu.softwareengineering.concept.card.StoreCard;
import se.ltu.softwareengineering.exception.KoTIOException;

import java.util.*;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class TConceptLoader {

    @Test
    public void loadMonsters() throws KoTIOException {
        Set<Monster> expected = new HashSet<>(Set.of(
                new Monster("Kong", 10, 1, 0),
                new Monster("Gigazaur", 10, 1, 0),
                new Monster("Alienoid", 10, 1, 0)
        ));

        assertEquals(expected, ConceptLoader.loadMonsters());
    }

    @Test
    public void loadStoreCards() throws KoTIOException {
        Set<StoreCard> expected = Set.of(
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
                ),
                new StoreCard(
                        "Even Bigger",
                        "Your maximum HEART is increased by 2. Gain 2 HEART when you get this card.",
                        CardType.Keep,
                        Arrays.asList(
                                new Spell(
                                        Effect.GainHearts,
                                        2,
                                        Collections.singletonList(Target.Self),
                                        Collections.emptyList()
                                ),
                                new Spell(
                                        Effect.AlterMaxHealth,
                                        2,
                                        Collections.singletonList(Target.Self),
                                        Collections.emptyList()
                                )
                        ),
                        4
                ),
                new StoreCard(
                        "Giant Brain",
                        "You have one extra reroll each turn.",
                        CardType.Keep,
                        Collections.singletonList(
                                new Spell(
                                        Effect.AlterRerollNumber,
                                        1,
                                        Collections.singletonList(Target.Self),
                                        Collections.emptyList()
                                )
                        ),
                        5
                )
        );

        List<StoreCard> sortedExpected = new ArrayList<>(expected);
        sortedExpected.sort((o1, o2) -> o1.getName().compareToIgnoreCase(o2.getName()));

        List<StoreCard> loaded = new ArrayList<>(ConceptLoader.loadStoreCards());
        loaded.sort((o1, o2) -> o1.getName().compareToIgnoreCase(o2.getName()));
        assertEquals(sortedExpected, loaded);
    }

    @Test
    public void loadEvolutionCards() throws KoTIOException {
        List<Spell> effectsArmorPlating = Collections.singletonList(
                new Spell(
                        Effect.GainStars,
                        2,
                        Collections.singletonList(Target.Self),
                        Collections.emptyList()
                )
        );
        List<Spell> effectsPrimalBellow = Collections.singletonList(
                new Spell(
                        Effect.GainStars,
                        -2,
                        Collections.singletonList(Target.Others),
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
        List<Spell> effectsIronCurtain = Collections.singletonList(
                new Spell(
                        Effect.DealDamages,
                        1,
                        Collections.singletonList(Target.Others),
                        Collections.singletonList(TriggeringAction.LeaveTokyo)
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

        Set<EvolutionCard> expected = Set.of(
                new EvolutionCard(
                        "Alien Scourge",
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
                        "Iron Curtain",
                        "Other Monsters who leave Tokyo lose 1 HEART.",
                        CardType.Keep,
                        effectsIronCurtain,
                        "Kong"
                ),
                new EvolutionCard(
                        "Radioactive Waste",
                        "Gain 2 ENERGY and 1 HEART.",
                        CardType.Discard,
                        effectsRadioactiveWaste,
                        "Gigazaur"),
                new EvolutionCard(
                        "Primal Bellow",
                        "All other Monsters lose 2 STAR.",
                        CardType.Discard,
                        effectsPrimalBellow,
                        "Gigazaur"
                )
        );

        assertEquals(expected, ConceptLoader.loadEvolutionCards());
    }
}
