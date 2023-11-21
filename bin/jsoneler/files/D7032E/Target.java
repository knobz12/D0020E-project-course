package se.ltu.softwareengineering.concept;

/**
 * Represent an effect target.
 * <br>
 * Representing an unknown number of target would be hard to structure.
 * Therefore, an effect that can be applied to multiple targets should declare this effect as many times as targets.
 */
public enum Target {
    None,
    Self,
    One,
    Others,
    Everyone,
    AnotherRandom,
    AnyoneRandom,
}
