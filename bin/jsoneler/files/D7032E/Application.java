import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

public class Application {
	int health = 10;
	boolean sword = false;
	int attackDamage = 1;
	boolean key = false;
	boolean treasure = false;
	int beastHealth = 8;
	int dragonHealth = 18;
	boolean potion = false;

	static BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(System.in));
	String choice = "";

	public Application(String name) throws Exception {

		System.out.println("Welcome " + name + " to your treasure hunt. Beware of the dragon!");
		System.out.println("You are standing outside a cave. There is a smell of sulfur coming from the opening");
		System.out.println("The cave opening is to your east. Write \"e\" and press [Enter] to enter the cave");

		while(!(choice = bufferedReader.readLine()).equals("e")){
			System.out.println("You stumble and fall, please go east [e] to enter the cave");
		};
		System.out.println("As you enter the cave the entrance collapses behind you.");
		Room1();
	}

	public void Room1() throws Exception {
		System.out.println("The room is lit by a few candles sitting on a table in front of you.");
		System.out.println("You can go north [n] and south [s]");

		while(!((choice = bufferedReader.readLine()).equals("n") || choice.equals("s"))){
			System.out.println("You stumble and fall, please go either [n] or [s]");
		}

		if(choice.equals("n")) {
			Room2();
		} else if(choice.equals("s")) {
			Room5();
		}
	}

	public void Room2() throws Exception {
		if(sword) {
			System.out.println("You see a dead body on the floor. You can go [s] and [e]");
			while(!((choice = bufferedReader.readLine()).equals("s") || choice.equals("e"))){
				System.out.println("You stumble and fall, please go either [s] or [e]");
			};
		} else {
			System.out.println("You see a sword next to a dead body on the floor.\n"+ 
				"You can pick up the sword [p], and go [s] or [e]");
			while(!((choice = bufferedReader.readLine()).equals("s") || choice.equals("e") || choice.equals("p"))){
				System.out.println("You stumble and fall, please pick up the sword [p] or go either [s] or [e]");
			};
		}
		if(choice.equals("p")) {
			sword=true;
			attackDamage = 2;
			System.out.println("You picked up the sword. You see a dead body on the floor. You can go [s] and [e]");
			while(!((choice = bufferedReader.readLine()).equals("s") || choice.equals("e"))){
				System.out.println("You stumble and fall, please go either [s] or [e]");
			}
		} 
		if(choice.equals("s")) {
			Room1();
		} else if(choice.equals("e")) {
			Room3();
		}
	}

	public void Room3() throws Exception {
		while(beastHealth > 0 && health > 0) {
			System.out.println("A beast attacks you and does 1 damage");
			System.out.println("You attack the beast and do " + attackDamage + " damage");
			beastHealth = beastHealth - attackDamage;
			health--;
		}
		if(health <= 0) {
			System.out.println("You died... Game over");
			System.exit(0);
		} else {
			System.out.println("You defeat the beast, but you only have " + health + 
				" hitpoints left. Will it be enough for a fight with a dragon?");
		}

		System.out.println("You see an exit to the east [e], a room to the west [w] and a room to the south [s]");
		while(!((choice = bufferedReader.readLine()).equals("e") || choice.equals("s") || choice.equals("w"))) {
			System.out.println("You stumble and fall, please go either [w], [e] or [s]");
		}

		if(choice.equals("e")) {
			if(treasure) {
				System.out.println(
"                            _.--.\n"+
"                        _.-'_:-'||\n"+
"                    _.-'_.-::::'||\n"+
"               _.-:'_.-::::::'  ||\n"+
"             .'`-.-:::::::'     ||\n"+
"            /.'`;|:::::::'      ||_\n"+
"           ||   ||::::::'     _.;._'-._\n"+
"           ||   ||:::::'  _.-!oo @.!-._'-.\n"+
"           \'.  ||:::::.-!()oo @!()@.-'_.|\n"+
"            '.'-;|:.-'.&$@.& ()$%-'o.'\\U||\n"+
"              `>'-.!@%()@'@_%-'_.-o _.|'||\n"+
"               ||-._'-.@.-'_.-' _.-o  |'||\n"+
"               ||=[ '-._.-\\U/.-'    o |'||\n"+
"               || '-.]=|| |'|      o  |'||\n"+
"               ||      || |'|        _| ';\n"+
"               ||      || |'|    _.-'_.-'\n"+
"               |'-._   || |'|_.-'_.-'\n"+
"               '-._'-.|| |' `_.-'\n"+
"                    '-.||_/.-'\n");
				System.out.println("You leave the dungeon with your riches. Congratulations, you won");
				System.exit(0);
			} else {
				System.out.println("You coward");
				System.exit(0);
			}
		} else if(choice.equals("s")) {
			Room4();
		} else if(choice.equals("w")) {
			Room2();
		}

	}

	public void Room4() throws Exception {
		if(!key) {
			System.out.println("You see a locked door to the east, " + 
				"a way to the north [n], and a way to the west [w]");
		} else {
			System.out.println("The door to the east [e] can now be unlocked," + 
				" you also see a way to the north [n], and a way to the west [w]");
		}
		if(!potion) {
			System.out.println("You see a health potion on the floor, you can pick it up [p]");
		} 
		if(health < 10 && potion) {
			System.out.println("You only have " + health + " hitpoints left. " + 
				"Might be a good idea to drink that health potion [d]");
		}

		choice = bufferedReader.readLine();

		if(choice.equals("p")) {
			if(!potion) {
				System.out.println("You pick up the potion");
				potion = true;
				if(health<10) {
					System.out.println("You only have " + health + " hitpoints left. " + 
						"Might be a good idea to drink that health potion [d]");
				}
			} else {
				System.out.println("You already have the potion");
			}
			choice = bufferedReader.readLine();
		}

		if(choice.equals("d")) {
			if(health == 10) {
				System.out.println("You are already at full health");
			} else {
				System.out.println("You drink the health potion and are now at full health");
				health = 10;
				potion = false;
			}
			choice = bufferedReader.readLine();
		}

		while(!(choice.equals("n") || choice.equals("w") || (key && choice.equals("e")))) {
			if(key) {
				System.out.println("You stumble and fall, please go either [w], [e] or [n]");
			} else {
				System.out.println("You stumble and fall, please go either [w] or [n]. " + 
					"You don't have the key to unlock the door to the east");
			}
			choice = bufferedReader.readLine();
		}

		if(choice.equals("e")) {
			Room6();
		} else if(choice.equals("w")) {
			Room5();
		} else if(choice.equals("n")) {
			Room3();
		}
	}
	public void Room5() throws Exception {
		if(key) {
			System.out.println("You see an empty room. You can go [w] and [e]");
			while(!((choice = bufferedReader.readLine()).equals("w") || choice.equals("e"))){
				System.out.println("You stumble and fall, please go either [w] or [e]");
			};
		} else {
			System.out.println("You see a key laying on the floor.\n"+ 
				"You can pick up the key [p], and go [w] or [e]");
			while(!((choice = bufferedReader.readLine()).equals("w") || choice.equals("e") || choice.equals("p"))){
				System.out.println("You stumble and fall, please pick up the key [p] or go either [w] or [e]");
			};
		}
		if(choice.equals("p")) {
			key=true;
			System.out.println("You picked up the key. You see an empty room. You can go [w] and [e]");
			while(!((choice = bufferedReader.readLine()).equals("w") || choice.equals("e"))){
				System.out.println("You stumble and fall, please go either [w] or [e]");
			}
		} 
		if(choice.equals("w")) {
			Room1();
		} else if(choice.equals("e")) {
			Room4();
		}
	}

	public void Room6() throws Exception {
		System.out.println(
			"                                                  .~))>>\n"+
			"                                                 .~)>>\n"+
			"                                               .~))))>>>\n"+
			"                                             .~))>>             ___\n"+
			"                                           .~))>>)))>>      .-~))>>\n"+
			"                                         .~)))))>>       .-~))>>)>\n"+
			"                                       .~)))>>))))>>  .-~)>>)>\n"+
			"                   )                 .~))>>))))>>  .-~)))))>>)>\n"+
			"                ( )@@*)             //)>))))))  .-~))))>>)>\n"+
			"              ).@(@@               //))>>))) .-~))>>)))))>>)>\n"+
			"            (( @.@).              //))))) .-~)>>)))))>>)>\n"+
			"          ))  )@@*.@@ )          //)>))) //))))))>>))))>>)>\n"+
			"       ((  ((@@@.@@             |/))))) //)))))>>)))>>)>\n"+
			"      )) @@*. )@@ )   (\\_(\\-\\b  |))>)) //)))>>)))))))>>)>\n"+
			"    (( @@@(.@(@ .    _/`-`  ~|b |>))) //)>>)))))))>>)>\n"+
			"     )* @@@ )@*     (@)  (@) /\\b|))) //))))))>>))))>>\n"+
			"   (( @. )@( @ .   _/  /    /  \\b)) //))>>)))))>>>_._\n"+
			"    )@@ (@@*)@@.  (6///6)- / ^  \\b)//))))))>>)))>>   ~~-.\n"+
			" ( @jgs@@. @@@.*@_ VvvvvV//  ^  \\b/)>>))))>>      _.     `bb\n"+
			" ((@@ @@@*.(@@ . - | o |' \\ (  ^   \\b)))>>        .'       b`,\n"+
			"   ((@@).*@@ )@ )   \\^^^/  ((   ^  ~)_        \\  /           b `,\n"+
			"     (@@. (@@ ).     `-'   (((   ^    `\\ \\ \\ \\ \\|             b  `.\n"+
			"       (*.@*              / ((((        \\| | |  \\       .       b `.\n"+
			"                         / / (((((  \\    \\ /  _.-~\\     Y,      b  ;\n"+
			"                        / / / (((((( \\    \\.-~   _.`\" _.-~`,    b  ;\n"+
			"                       /   /   `(((((()    )    (((((~      `,  b  ;\n"+
			"                     _/  _/      `\"\"\"/   /'                  ; b   ;\n"+
			"                 _.-~_.-~           /  /'                _.'~bb _.'\n"+
			"               ((((~~              / /'              _.'~bb.--~\n"+
			"                                  ((((          __.-~bb.-~\n"+
			"                                              .'  b .~~\n"+
			"                                              :bb ,' \n"+
			"                                              ~~~~\n"
		);

		System.out.println("An angry dragon appears");
		while(dragonHealth > 0 && health > 0) {
			System.out.println("A dragon attacks you and does 1 damage");
			System.out.println("You attack the dragon and do " + attackDamage + " damage");
			dragonHealth = dragonHealth - attackDamage;
			health--;
		}
		if(health <= 0) {
			System.out.println("You died... Game over");
			System.exit(0);
		} else {
			System.out.println("You defeat the dragon and collect the treasure. " + 
				"Can you escape this dungeon with all your riches?");
			treasure=true;
		}

		System.out.println("You drag the gold out the way you came from");
		Room4();


	}

	public static void main(String[] argv) throws Exception {
		System.out.println(
			"                  Welcome to Dragon Treasure\n "+
			"       Write your name and press [Enter] to start a new game..."
		);
		String name = bufferedReader.readLine();
		Application adventure = new Application(name);
	}
}