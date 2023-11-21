package se.ltu.softwareengineering.tool;

public class Dice {
    public enum DiceValue {
        One,
        Two,
        Three,
        Claws,
        Heart,
        Energy
    }

    public static DiceValue rollDice() {
        DiceValue[] values = DiceValue.values();
        int choice = Randomizer.nextInt(values.length);
        return values[choice];
    }
}
