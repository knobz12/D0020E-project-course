import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.InputStreamReader;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Random;
import java.util.Scanner;

public class KingTokyoPowerUpServer {

    /**
     * @param args the command line arguments
     */
    public static void main(String[] args) {
        // TODO code application logic here
        // https://www.youtube.com/watch?v=HqdOaAzPtek
        // https://boardgamegeek.com/thread/1408893/categorizing-cards
        new KingTokyoPowerUpServer();
    }
    
    class Monsters {
        public int maxHealth = 10;
        public int currentHealth = 10;
        public String name;
        public int energy = 0;
        public int stars = 0;
        public boolean inTokyo = false;
        ArrayList<Card> cards = new ArrayList<Card>();
        public Socket connection = null;
        public BufferedReader inFromClient = null;
        public DataOutputStream outToClient = null;
       
        public Monsters(String name) {
            this.name = name;
        }
       
        // search all available cards and return the effect value of an effect
        public int cardEffect(String effectName) {
            for(int i=0; i<cards.size(); i++) {
                try {
                    //Find variable by "name"
                     if(Effect.class.getField(effectName).getInt(cards.get(i).effect) > 0) {
                         return Effect.class.getField(effectName).getInt(cards.get(i).effect);
                     }
                } catch (Exception e) {}
            }
            return 0;
        }

        public String cardsToString() {
            String returnString = "";
            if (cards.size()==0)
                return "[NO CARDS]:";
            for(int i=0; i<cards.size(); i++) {returnString += "\t["+i+"] " + cards.get(i) + ":";}
            return returnString;           
        }
    }
    
    class Deck {
        public ArrayList<Card> deck = new ArrayList<Card>();
        public Card[] store = new Card[3];
        
        public Deck() {
            Effect moreDamage = new Effect(); moreDamage.moreDamage = 1;
            Effect cardsCostLess = new Effect(); cardsCostLess.cardsCostLess = 1;
            Effect starsWhenAttacking = new Effect(); starsWhenAttacking.starsWhenAttacking = 1;
            Effect stars3 = new Effect(); stars3.stars = 3;
            Effect armor = new Effect(); armor.armor = 1;
            Effect stars2 = new Effect(); stars2.stars = 2;
            Effect stars1 = new Effect(); stars1.stars = 1;
            deck.add(new Card("Acid Attack", 6, false, moreDamage, "Deal 1 extra damage each turn"));
            deck.add(new Card("Alien Metabolism", 3, false, cardsCostLess, "Buying cards costs you 1 less"));
            deck.add(new Card("Alpha Monster", 5, false, starsWhenAttacking, "Gain 1 star when you attack"));
            deck.add(new Card("Apartment Building", 5, true, stars3, "+3 stars"));
            deck.add(new Card("Armor Plating", 4, false, armor, "Ignore damage of 1"));
            deck.add(new Card("Commuter Train", 4, true, stars2, "+2 stars"));
            deck.add(new Card("Corner Stone", 3, true, stars1, "+1 stars"));
            //Todo: Add more cards
            Collections.shuffle(deck);
            // Start the game with 3 cards face up in the store
            for(int i=0; i<3; i++) {store[i] = deck.remove(0);}
        }
        // Print the store
        public String toString() {
            String returnString = "";
            for(int i=0; i<3; i++) {returnString += "\t["+i+"] " + store[i] + ":";}
            return returnString;
        }
    }
    
    class Card {
        public String name;
        public int cost;
        public boolean discard;
        public Effect effect;
        public String description;
        public Card(String name, int cost, boolean discard, Effect effect, String description) {
            this.name = name;
            this.cost = cost;
            this.discard = discard;
            this.effect = effect;
            this.description = description;
        }       
        public String toString() {
            return name + ", Cost " + cost + ", " + (discard?"DISCARD":"KEEP") + ", Effect " + description;
        }
    }
    
    class Effect {
        public int moreDamage = 0; //Acid Attack
        public int cardsCostLess = 0; //Alien Metabolism
        public int starsWhenAttacking = 0; //Alpha monster
        public int stars = 0; //Apartment Building, Commuter Train, Corner Stone
        public int armor = 0; //Armor Plating
    }
    
    class Dice implements Comparable<Dice> {
        public static final int HEART = 0;
        public static final int ENERGY = 4;
        public static final int CLAWS = 5;
        public int value = -1;  
        public Dice(int value) {
            this.value = value;
        }
        public String toString() {
            return (value==HEART?"HEART":value==ENERGY?"ENRGY":value==CLAWS?"CLAWS":value==1?"ONE":value==2?"TWO":"THREE");
        }
        @Override
        public int compareTo(Dice o) {
            return value<o.value?-1:value==o.value?0:1;
        }
        public boolean equals(Object o) {
            return value==((Dice) o).value;
        }
        public int hashCode() {
            return toString().hashCode();
        }
    }
    
    private ArrayList<Monsters> monsters = new ArrayList<Monsters>();
    private Random ran = new Random();
    private Scanner sc = new Scanner(System.in);

    
    public KingTokyoPowerUpServer() {
        Monsters kong = new Monsters("Kong");
        Monsters gigazaur = new Monsters("Gigazaur");
        Monsters alien = new Monsters("Alienoid");
        monsters.add(kong);
        monsters.add(gigazaur);
        monsters.add(alien);
        //Shuffle which player is which monster
        Collections.shuffle(monsters);
        Deck deck = new Deck();
       
        //Server stuffs
        try {
            ServerSocket aSocket = new ServerSocket(2048);
            //assume two online clients
            for(int onlineClient=0; onlineClient<2; onlineClient++) {
                Socket connectionSocket = aSocket.accept();
                BufferedReader inFromClient = new BufferedReader(new InputStreamReader(connectionSocket.getInputStream()));
                DataOutputStream outToClient = new DataOutputStream(connectionSocket.getOutputStream());
                outToClient.writeBytes("You are the monster: " + monsters.get(onlineClient).name + "\n");
                monsters.get(onlineClient).connection = connectionSocket;
                monsters.get(onlineClient).inFromClient = inFromClient;
                monsters.get(onlineClient).outToClient = outToClient;
                System.out.println("Connected to " + monsters.get(onlineClient).name);
            }
        } catch (Exception e) {}

        //Shuffle the starting order
        Collections.shuffle(monsters);
        /*
            Game loop:
            pre: Award a monster in Tokyo 1 star
            1. Roll 6 dice
            2. Decide which dice to keep
            3. Reroll remaining dice
            4. Decide which dice to keep 
            5. Reroll remaining dice
            6. Sum up totals
              6a. Hearts = health (max 10 unless a cord increases it)
              6b. 3 hearts = power-up
              6c. 3 of a number = victory points
              6d. claws = attack (if in Tokyo attack everyone, else attack monster in Tokyo)
              6e. If you were outside, then the monster inside tokyo may decide to leave Tokyo
              6f. energy = energy tokens
            7. Decide to buy things for energy
              7a. Play "DISCARD" cards immediately
            8. Check victory conditions
        */        
        while(true) {
            for(int i=0; i<monsters.size(); i++) {
                Monsters currentMonster = monsters.get(i);
                if(currentMonster.currentHealth <= 0) {
                    currentMonster.inTokyo = false;
                    continue;
                }
                // pre: Award a monster in Tokyo 1 star
                if(currentMonster.inTokyo) {currentMonster.stars += 1;}
                String statusUpdate = "You are " + currentMonster.name + " and it is your turn. Here are the stats";
                for(int count=0; count<3; count++) {
                    statusUpdate += ":"+monsters.get(count).name + (monsters.get(count).inTokyo?" is in Tokyo ":" is not in Tokyo ");
                    statusUpdate += "with " + monsters.get(count).currentHealth + " health, " + monsters.get(count).stars + " stars, ";
                    statusUpdate += monsters.get(count).energy + " energy, and owns the following cards:";
                    statusUpdate += monsters.get(count).cardsToString();
                }
                sendMessage(i, statusUpdate+"\n");
                // 1. Roll 6 dice
                ArrayList<Dice> dice = new ArrayList<Dice>();
                dice = diceRoll(6);
                // 2. Decide which dice to keep
                String rolledDice = "ROLLED:You rolled:\t[1]\t[2]\t[3]\t[4]\t[5]\t[6]:";
                for(int allDice=0; allDice<dice.size(); allDice++) {rolledDice+="\t["+dice.get(allDice)+"]";}
                rolledDice += ":Choose which dice to reroll, separate with comma and in decending order (e.g. 5,4,1   0 to skip)\n";
                String[] reroll = sendMessage(i, rolledDice).split(",");
                if(Integer.parseInt(reroll[0]) != 0)
                    for(int j=0; j<reroll.length; j++) { dice.remove(Integer.parseInt(reroll[j])-1); }
                // 3. Reroll remaining dice
                dice.addAll(diceRoll(6-dice.size()));
                // 4. Decide which dice to keep
                rolledDice = "ROLLED:You rolled:\t[1]\t[2]\t[3]\t[4]\t[5]\t[6]:";
                for(int allDice=0; allDice<dice.size(); allDice++) {rolledDice+="\t["+dice.get(allDice)+"]";}
                rolledDice += ":Choose which dice to reroll, separate with comma and in decending order (e.g. 5,4,1   0 to skip)\n";
                reroll = sendMessage(i, rolledDice).split(",");
                if(Integer.parseInt(reroll[0]) != 0)
                    for(int j=0; j<reroll.length; j++) { dice.remove(Integer.parseInt(reroll[j])-1); }
                // 5. Reroll remaining dice
                dice.addAll(diceRoll(6-dice.size()));
                // 6. Sum up totals
                Collections.sort(dice);
                HashMap<Dice, Integer> result = new HashMap<Dice, Integer>();
                for(Dice unique : new HashSet<Dice>(dice)) {
                     result.put(unique, Collections.frequency(dice, unique));
                }
                String ok = sendMessage(i, "ROLLED:You rolled " + result + " Press [ENTER]\n");
                // 6a. Hearts = health (max 10 unless a cord increases it)
                Dice aHeart = new Dice(Dice.HEART);
                if(result.containsKey(aHeart)) { //+1 currentHealth per heart, up to maxHealth
                    if(currentMonster.currentHealth + result.get(aHeart).intValue() >= currentMonster.maxHealth) {
                        currentMonster.currentHealth = currentMonster.maxHealth;
                    } else {
                        currentMonster.currentHealth += result.get(aHeart).intValue();
                    }
                    // 6b. 3 hearts = power-up
                    if(result.get(aHeart).intValue() >= 3) {
                        // Deal a power-up card to the currentMonster
                        if(currentMonster.name.equals("Kong")) {
                            //Todo: Add support for more cards.
                            //Current support is only for the Red Dawn card
                            //Add support for keeping it secret until played
                            String power = sendMessage(i, "POWERUP:Deal 2 damage to all others\n");
                            for(int mon=0; mon<monsters.size(); mon++) {
                                if(mon!=i) {monsters.get(mon).currentHealth+=-2;}
                            }
                        }
                        if(currentMonster.name.equals("Gigazaur")) {
                            //Todo: Add support for more cards.
                            //Current support is only for the Radioactive Waste
                            //Add support for keeping it secret until played
                            String power = sendMessage(i, "POWERUP:Receive 2 energy and 1 health\n");
                            currentMonster.energy += 2;
                            if(currentMonster.currentHealth + 1 >= currentMonster.maxHealth) {
                                currentMonster.currentHealth = currentMonster.maxHealth;
                            } else {
                                currentMonster.currentHealth += 1;
                            }    
                        }
                        if(currentMonster.name.equals("Alienoid")) {
                            //Todo: Add support for more cards.
                            //Current support is only for the Alien Scourge
                            //Add support for keeping it secret until played
                            String power = sendMessage(i, "POWERUP:Receive 2 stars\n");
                            currentMonster.stars+=2;
                        }
                    }
                }
                // 6c. 3 of a number = victory points
                for(int num = 1; num < 4; num++) {
                    if(result.containsKey(new Dice(num)))
                        if(result.get(new Dice(num)).intValue() >= 3)
                            currentMonster.stars += num + (result.get(new Dice(num)).intValue()-3);                    
                }
                // 6d. claws = attack (if in Tokyo attack everyone, else attack monster in Tokyo)
                Dice aClaw = new Dice(Dice.CLAWS);
                if(result.containsKey(aClaw)) {
                    currentMonster.stars += currentMonster.cardEffect("starsWhenAttacking"); //Alpha Monster
                    if(currentMonster.inTokyo) {
                        for(int mon=0; mon<monsters.size(); mon++) {
                            int moreDamage = currentMonster.cardEffect("moreDamage"); //Acid Attack
                            int totalDamage = result.get(aClaw).intValue()+moreDamage;
                            if(mon!=i && totalDamage > monsters.get(mon).cardEffect("armor")) { //Armor Plating
                                monsters.get(mon).currentHealth+=-totalDamage;
                            }
                        }
                    }
                    else {
                        boolean monsterInTokyo = false;
                        for(int mon=0; mon<monsters.size(); mon++) {
                            if(monsters.get(mon).inTokyo){
                                monsterInTokyo = true;
                                int moreDamage = currentMonster.cardEffect("moreDamage"); //Acid Attack
                                int totalDamage = result.get(aClaw).intValue()+moreDamage;
                                if(totalDamage > monsters.get(mon).cardEffect("armor")) //Armor Plating
                                    monsters.get(mon).currentHealth+=-totalDamage;
                                // 6e. If you were outside, then the monster inside tokyo may decide to leave Tokyo
                                String answer = sendMessage(mon, "ATTACKED:You have " + 
                                    monsters.get(mon).currentHealth + " health left. Do you wish to leave Tokyo? [YES/NO]\n");
                                if(answer.equalsIgnoreCase("YES")) {
                                    monsters.get(mon).inTokyo = false;
                                    monsterInTokyo = false;
                                }
                            }
                        }
                        if(!monsterInTokyo) {
                            currentMonster.inTokyo = true;
                            currentMonster.stars +=1;
                        }
                    }
                }
                // 6f. energy = energy tokens
                Dice anEnergy = new Dice(Dice.ENERGY);
                if(result.containsKey(anEnergy))
                    currentMonster.energy += result.get(anEnergy).intValue();
                // 7. Decide to buy things for energy
                String msg = "PURCHASE:Do you want to buy any of the cards from the store? (you have " + currentMonster.energy + " energy) [#/-1]:" + deck + "\n";
                String answer = sendMessage(i, msg);
                int buy = Integer.parseInt(answer);
                if(buy>0 && (currentMonster.energy >= (deck.store[buy].cost - currentMonster.cardEffect("cardsCostLess")))) { //Alien Metabolism
                    if(deck.store[buy].discard) {
                        //7a. Play "DISCARD" cards immediately
                        currentMonster.stars += deck.store[buy].effect.stars;
                    } else
                        currentMonster.cards.add(deck.store[buy]);
                    //Deduct the cost of the card from energy
                    currentMonster.energy += -(deck.store[buy].cost-currentMonster.cardEffect("cardsCostLess")); //Alient Metabolism
                    //Draw a new card from the deck to replace the card that was bought
                    deck.store[buy] = deck.deck.remove(0);
                }
                //8. Check victory conditions
                int alive=0; String aliveMonster = "";
                for(int mon=0; mon<monsters.size(); mon++) {
                    if(monsters.get(mon).stars >= 20) {
                        for(int victory=0; victory<monsters.size(); victory++) {
                            String victoryByStars = sendMessage(victory, "Victory: " + monsters.get(mon).name + " has won by stars\n");
                        }
                        System.exit(0);
                    }
                    if(monsters.get(mon).currentHealth > 0) {
                        alive++; aliveMonster = monsters.get(mon).name;
                    }
                }
                if(alive==1) {
                    for(int victory=0; victory<monsters.size(); victory++) {
                        String victoryByKills = sendMessage(victory, "Victory: " + aliveMonster + " has won by being the only one alive\n");
                    } 
                    System.exit(0);
                }
            }
        }      
    }
    
    private String sendMessage(int recipient, String message) {
        Monsters aMonster = monsters.get(recipient);
        String response = "";
        if(aMonster.connection != null) {
            try {
                aMonster.outToClient.writeBytes(message);
                response = aMonster.inFromClient.readLine();
            } catch (Exception e) {}
        } else {
            String[] theMessage = message.split(":");
            for(int i=0; i<theMessage.length; i++) {System.out.println(theMessage[i].toString());}
            if(!(theMessage[0].equals("ATTACKED") || theMessage[0].equals("ROLLED") || theMessage[0].equals("PURCHASE")))
                System.out.println("Press [ENTER]");
            response = sc.nextLine();
        }
        return response;
    }
    
    private ArrayList<Dice> diceRoll(int nrOfDice) {
        ArrayList<Dice> dice = new ArrayList<Dice>();
        for(int i=0; i<nrOfDice; i++) {
            dice.add(new Dice(ran.nextInt(6)));
        }
        return dice;
    }
    
}
