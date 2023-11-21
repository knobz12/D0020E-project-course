package se.ltu.softwareengineering.concept;

import java.util.List;

/**
 * Represent an element that provides one or more effects.
 * Usually used to represent a card.
 */
public interface EffectProvider {
    List<Spell> getEffects();
    String getName();
}
