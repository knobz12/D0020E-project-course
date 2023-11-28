import java.util.*; 
import java.io.*; 
import java.net.*;
import java.util.concurrent.*;

public class BoomerangAustralia {
    public ServerSocket aSocket;
	public ArrayList<Player> players = new ArrayList<Player>();
	public Card[] arrayDeck;
	public ArrayList<Card> deck;

	class Card {
		public String name, letter, region, Collections, Animals, Activities;
		public int number;
		public String sortMode;
		public Card(String name, String letter, String region, int number, String Collections, String Animals, String Activities) {
			this.name=name; this.letter=letter; this.number=number; this.region=region; this.Collections=Collections; 
			this.Animals=Animals; this.Activities=Activities;
		}

	    public boolean equals(Object o) {
    		return ((Card) o).letter.equals(letter);
		}
	}

	class Player {
	    public int playerID;
	    public boolean online;
	    public boolean isBot;
	    public Socket connection;
	    public ObjectInputStream inFromClient;
	    public ObjectOutputStream outToClient;
	    public ArrayList<String> region = new ArrayList<String>();
	    Scanner in = new Scanner(System.in);
	    public ArrayList<Card> nextHand = new ArrayList<Card>();
	    public ArrayList<Card> hand = new ArrayList<Card>();
		public ArrayList<Card> draft = new ArrayList<Card>();
		HashMap<String, String> sites = new HashMap<String, String>(); //letter, region
		ArrayList<HashMap<String, Integer>> rScore = new ArrayList<HashMap<String, Integer>>();
		HashMap<String, Integer> activitiesScore = new HashMap<>();
		public int regionRoundScore = 0;
		public int finalScore = 0;


	    public Player(int playerID, boolean isBot, Socket connection, ObjectInputStream inFromClient, ObjectOutputStream outToClient) {
	    	this.playerID = playerID; this.connection = connection; this.inFromClient = inFromClient; this.outToClient = outToClient; this.isBot = isBot;
	    	if(connection == null)
	    		this.online = false;
	    	else
	    		this.online = true;
		}
	    public void sendMessage(Object message) {
	        if(online) {
	            try {outToClient.writeObject(message);} catch (Exception e) {}
	        } else if(!isBot){
	            System.out.println(message);                
	        }
	    }
	    public String readMessage() {
	        String word = ""; 
	        if(online)
	            try{word = (String) inFromClient.readObject();} catch (Exception e){}
	        else
	            try {word=in.nextLine();} catch(Exception e){}
	        return word;
	    }

		public void addCardToDraft(Player sendToPlayer) {
			// Print the list of cards in the draft
			if(draft.size() == 0) {sendMessage("You haven't drafted any cards yet");} else {
				sendMessage("\n*****************************\nYour current draft: \n" + printCards(draft));
			}
			if(sites.size()>0) {
				TreeMap<String, String> sortedSites = new TreeMap<String, String>();
				sortedSites.putAll(sites);
				sendMessage("Sites from previous rounds:\n"+sortedSites+"\n");

			}
			// Print the list of cards in the hand
			sendMessage("\nYour current hand: \n" + printCards(hand));
			// Prompt the user for which cards to keep (remove from hand and add to draft)
			sendMessage("Type the letter of the card to draft");
			String response = "";
			if(!isBot) {
				response = readMessage();
			} else {
				Random rnd = new Random();
				response = hand.get(rnd.nextInt(hand.size()-1)).letter;
			}
			for(Card c : hand) {
				if(c.letter.equalsIgnoreCase(response)) {
					draft.add(hand.remove(hand.indexOf(c))); break;
				}
			}
			sendToPlayer.nextHand.clear();
			for(Card c : hand) {sendToPlayer.nextHand.add(c);} //pass my hand to the next player
		}

		public boolean checkRegionComplete(String theRegion) {
			ArrayList<String> temp = new ArrayList<String>();
			for(Map.Entry<String,String> set : sites.entrySet()) {
				if(set.getValue().equals(theRegion))
					temp.add(set.getKey());				
			}
			for(Card c : draft) {
				if(c.region.equals(theRegion) && !temp.contains(c.letter)) {
					temp.add(c.letter);
				}
			}
			if(temp.size() == 4)
				return true;
			else
				return false;
		}

		public String printCards(List<Card> cards) {
			// String.format("%-20s", str); % = format sequence. - = string is left-justified (no - = right-justified). 20 = string will be 20 long. s = character string format code		
			String printString = String.format("%27s", "Site [letter] (nr):  ");
			for(Card c : cards) { //print name letter and number of each card
				printString += String.format("%-35s", c.name+ " ["+c.letter+"] ("+c.number+")");
			}
			printString += "\n" + String.format("%27s", "Region:  ");
			for(Card c : cards) { //print name letter and number of each card
				printString += String.format("%-35s", c.region);
			}			
			printString +="\n" + String.format("%27s", "Collections:  ");
			for(Card c : cards) { //print collections of each card, separate with tab
				printString  += String.format("%-35s", c.Collections);
			}
			printString +="\n" + String.format("%27s", "Animals:  ");
			for(Card c : cards) { //print animals of each card, separate with tab
				printString += String.format("%-35s", c.Animals);
			}
			printString +="\n" + String.format("%27s", "Activities:  ");
			for(Card c : cards) { //print activities of each card, separate with tab
				printString += String.format("%-35s", c.Activities);
			}
			return printString;
		}
		public int numberThings(String aThing, String category) {
			int nrThings = 0;
			for(Card aCard : draft) {
				if(category.equals("Collections")) {
					if(aCard.Collections.equals(aThing)) {nrThings++;}
				} else if(category.equals("Animals")) {
					if(aCard.Animals.equals(aThing)) {nrThings++;}
				} else if(category.equals("Activities")) {
					if(aCard.Activities.equals(aThing)) {nrThings++;}
				}
			}
			return nrThings;
		}

		public int roundScore(int roundNr) {
			HashMap<String, Integer> score = new HashMap<String, Integer>();
			//Fix total score and round score... Also, sum up the round score according to the scoring sheet

			//Requirement 10a
			int throwCatchScore = Math.abs(draft.get(0).number - draft.get(6).number);
			sendMessage("This round you scored " + throwCatchScore + " as your Throw and catch score");
			score.put("Throw and Catch score", throwCatchScore);

			//Requirement 10b
			int thisRoundSites = 0;			
			for(Card draftCard : draft) {
				if(!sites.containsKey(draftCard.letter)) {
					thisRoundSites++;
					sites.put(draftCard.letter, draftCard.region);
				}
			}
			sendMessage("This round you scored " + thisRoundSites + " new sites points and " + regionRoundScore + " points for completing regions");
			score.put("Tourist sites score", thisRoundSites);

			//Requirement 10c - Calculate score for Collections
			String thisRoundCollections = "";
			int countRoundCollections = 0;
			String[] collectionarr = {"Leaves", "Wildflowers", "Shells", "Souvenirs"};
			for(String thisColl : collectionarr) {
				int nr = numberThings(thisColl, "Collections");
				int sumColl = (nr<8)?nr*2:nr;
				thisRoundCollections += thisColl + " [" + sumColl + " points]\t";
				countRoundCollections += sumColl;
			}
			sendMessage("This round you scored these collections: " + thisRoundCollections);
			score.put("Collections score", countRoundCollections);

			//Requirement 10d Calculate score for Animals
			String thisRoundAnimals = "";
			int countRoundAnimals = 0;
			String[] animalarr = {"Kangaroos", "Emus", "Wombats", "Koalas", "Platypuses"};
			for(String thisAnim : animalarr) {
				int frequency = numberThings(thisAnim, "Animals");
				if(frequency == 2 && thisAnim.equals("Kangaroos")) {
					thisRoundAnimals += "Kangaroos [3 points]\t";
					countRoundAnimals+=3;
				} else if(frequency == 2 && thisAnim.equals("Emus")) {
					thisRoundAnimals += "Emus [4 points]\t";
					countRoundAnimals+=4;
				} else if(frequency == 2 && thisAnim.equals("Wombats")) {
					thisRoundAnimals += "Wombats [5 points]\t";	
					countRoundAnimals+=5;			
				} else if(frequency == 2 && thisAnim.equals("Koalas")) {
					thisRoundAnimals += "Koalas [7 points]\t";
					countRoundAnimals+=7;
				} else if(frequency == 2 && thisAnim.equals("Platypuses")) {
					thisRoundAnimals += "Platypuses [9 points]";
					countRoundAnimals+=9;				
				}

			}
			sendMessage("This round you scored these Animals: " + thisRoundAnimals);
			score.put("Animals score", countRoundAnimals);

			//Requirement 10e Calculate score for the Activities if the player wants to score it
			String[] act={"Indigenous Culture","Bushwalking","Swimming","Sightseeing"};
			sendMessage("This round you have gathered the following new activities:");
			HashMap<String, Integer> newActivitiesMap = new HashMap<>();
			String newActivities = "";
			for(String thisAct : act) { //Requirement 10e(ii)
				if(!activitiesScore.containsKey(thisAct)) {
					int frequency = numberThings(thisAct, "Activities");
					newActivities += thisAct+"(# "+frequency+")\t";
					newActivitiesMap.put(thisAct, frequency);
				}
			}

			sendMessage(newActivities + "\nSelect if you wish to score one of them");
			int countRoundActivities = 0;
			int[] scoreTable = {0,2,4,7,10,15};
			for(Map.Entry<String, Integer> entry : newActivitiesMap.entrySet()) {
				int frequency = numberThings(entry.getKey(), "Activities");
				int scoret = (frequency>0)?scoreTable[frequency-1]:0;
				sendMessage("Want to keep " + entry.getKey() + "("+entry.getValue()+") [" + scoret + " points]? (Y/N)");
				String response = "";
				if(!isBot) {
					response = readMessage();
				} else {
					response = "Y";
				}
				if(response.equalsIgnoreCase("Y")) {
					activitiesScore.put(entry.getKey(), scoret);
					sendMessage("This round you scored this activity: " + entry.getKey() + "["+scoret + " points]");
					//We do not need to add the Activity score to the score variable, since it's stored separately in the activitiesScore hashmap
					countRoundActivities = scoret;
					break; //Requirement 10e(i) exit the loop since you are only allowed to score one activity per round
				}
			}
			rScore.add(score);
			if(roundNr==3) {//last round
				String t="Throw and Catch score", to="Tourist sites score", c="Collections score", a="Animals score";
				int totalAct = 0;
				for(String anAct : act) {
					if(activitiesScore.get(anAct)==null)
						activitiesScore.put(anAct, 0);
					totalAct+=activitiesScore.get(anAct).intValue();
				}
				int totalT=rScore.get(0).get(t).intValue()+rScore.get(1).get(t).intValue()+rScore.get(2).get(t).intValue()+rScore.get(3).get(t).intValue();
				int totalTo=rScore.get(0).get(to).intValue()+rScore.get(1).get(to).intValue()+rScore.get(2).get(to).intValue()+rScore.get(3).get(to).intValue();
				int totalC=rScore.get(0).get(c).intValue()+rScore.get(1).get(c).intValue()+rScore.get(2).get(c).intValue()+rScore.get(3).get(c).intValue();
				int totalA=rScore.get(0).get(a).intValue()+rScore.get(1).get(a).intValue()+rScore.get(2).get(a).intValue()+rScore.get(3).get(a).intValue();
				//Requirement 12
					String finalScore =  "                       Round 1\tRound 2\tRound 3\tRound 4\tTotal\n";
					       finalScore += "Throw and Catch score:   " + rScore.get(0).get(t)+"\t  "+rScore.get(1).get(t)+"\t  "+rScore.get(2).get(t)+"\t  "+rScore.get(3).get(t)+"\t  "+totalT+"\n";
					       finalScore += "  Tourist sites score:   " + rScore.get(0).get(to)+"\t  "+rScore.get(1).get(to)+"\t  "+rScore.get(2).get(to)+"\t  "+rScore.get(3).get(to)+"\t  "+totalTo+"\n";;
					       finalScore += "    Collections score:   " + rScore.get(0).get(c)+"\t  "+rScore.get(1).get(c)+"\t  "+rScore.get(2).get(c)+"\t  "+rScore.get(3).get(c)+"\t  "+totalC+"\n";
						   finalScore += "        Animals score:   " + rScore.get(0).get(a)+"\t  "+rScore.get(1).get(a)+"\t  "+rScore.get(2).get(a)+"\t  "+rScore.get(3).get(a)+"\t  "+totalA+"\n";	
	  				       finalScore += "                        IndC\tBushw\tSwim\tSights\n";
	  				       finalScore += "     Activities score:   " + activitiesScore.get(act[0])+"\t  "+activitiesScore.get(act[1])+"\t  "+activitiesScore.get(act[2])+"\t  "+activitiesScore.get(act[3])+"\t  "+totalAct+"\n";
	  				       finalScore += "       Region bonuses:   " + (region.size()*3)+"\n";
	  				       finalScore += "          Total score:   " + (totalT+totalC+totalA+totalAct+(region.size()*3)) + " points\n";
	  				sendMessage("\n*********************************************\n"+finalScore);
	  				return (totalT+totalC+totalA+totalAct+(region.size()*3));
			}
			int totalRoundScore = regionRoundScore+throwCatchScore+thisRoundSites+countRoundCollections+countRoundAnimals+countRoundActivities;
			regionRoundScore = 0; //it has been added to the region list, and will be summed up at the end of the 4 rounds.
			return totalRoundScore;
		}
	}

	public BoomerangAustralia(String[] params) throws Exception {
		//Requirement 1, 2-4 players
		if(params.length == 2 && ((Integer.valueOf(params[0]).intValue()+Integer.valueOf(params[1]).intValue())>=2) && ((Integer.valueOf(params[0]).intValue()+Integer.valueOf(params[1]).intValue())<=4)) {
			this.initGame(Integer.valueOf(params[0]).intValue(), Integer.valueOf(params[1]).intValue());
		} else if(params.length == 1) {
			client(params[0]);
		} else {
			System.out.println("This game is for a total of 2-4 players/bots");
			System.out.println("Server syntax: java BoomerangAustralia numPlayers numBots");
			System.out.println("Client syntax: IP");
		}
	}

	public void initGame(int numPlayers, int numBots) {
		arrayDeck = new Card[28]; //Requirement 2
		arrayDeck[0] = new Card("The Bungle Bungles","A","Western Australia", 1, "Leaves", "", "Indigenous Culture");
		arrayDeck[1] = new Card("The Pinnacles","B","Western Australia", 1, "", "Kangaroos", "Sightseeing");
		arrayDeck[2] = new Card("Margaret River","C","Western Australia", 1, "Shells", "Kangaroos", "");
		arrayDeck[3] = new Card("Kalbarri National Park","D","Western Australia", 1, "Wildflowers", "", "Bushwalking");
		arrayDeck[4] = new Card("Uluru","E","Northern Territory", 4, "", "Emus", "Indigenous Culture");
		arrayDeck[5] = new Card("Kakadu National Park","F","Northern Territory", 4, "", "Wombats", "Sightseeing");
		arrayDeck[6] = new Card("Nitmiluk National Park","G","Northern Territory", 4, "Shells", "Platypuses", ""); 
		arrayDeck[7] = new Card("King's Canyon","H","Northern Territory", 4, "", "Koalas", "Swimming");
		arrayDeck[8] = new Card("The Great Barrier Reef","I","Queensland", 6, "Wildflowers", "", "Sightseeing");
		arrayDeck[9] = new Card("The Whitsundays","J","Queensland", 6, "", "Kangaroos", "Indigenous Culture");
		arrayDeck[10] =	new Card("Daintree Rainforest","K","Queensland", 6, "Souvenirs", "", "Bushwalking");
		arrayDeck[11] =	new Card("Surfers Paradise","L","Queensland", 6, "Wildflowers", "", "Swimming");
		arrayDeck[12] =	new Card("Barossa Valley","M","South Australia", 3, "", "Koalas", "Bushwalking");
		arrayDeck[13] =	new Card("Lake Eyre","N","South Australia", 3, "", "Emus", "Swimming");
		arrayDeck[14] =	new Card("Kangaroo Island","O","South Australia", 3, "", "Kangaroos", "Bushwalking");
		arrayDeck[15] =	new Card("Mount Gambier","P","South Australia", 3, "Wildflowers", "", "Sightseeing");
		arrayDeck[16] =	new Card("Blue Mountains","Q","New South Whales", 5, "", "Wombats", "Indigenous Culture");
		arrayDeck[17] =	new Card("Sydney Harbour","R","New South Whales", 5, "", "Emus", "Sightseeing");
		arrayDeck[18] =	new Card("Bondi Beach","S","New South Whales", 5, "", "Wombats", "Swimming");
		arrayDeck[19] =	new Card("Hunter Valley","T","New South Whales", 5, "", "Emus", "Bushwalking");
		arrayDeck[20] =	new Card("Melbourne","U","Victoria", 2, "", "Wombats", "Bushwalking");
		arrayDeck[21] =	new Card("The MCG","V","Victoria", 2, "Leaves", "", "Indigenous Culture");
		arrayDeck[22] =	new Card("Twelve Apostles","W","Victoria", 2, "Shells", "", "Swimming");
		arrayDeck[23] =	new Card("Royal Exhibition Building","X","Victoria", 2, "Leaves", "Platypuses", "");	 
		arrayDeck[24] =	new Card("Salamanca Markets","Y","Tasmania", 7, "Leaves", "Emus", "");
		arrayDeck[25] =	new Card("Mount Wellington","Z","Tasmania", 7, "", "Koalas", "Sightseeing");
		arrayDeck[26] =	new Card("Port Arthur","*","Tasmania", 7, "Leaves", "", "Indigenous Culture");
		arrayDeck[27] =	new Card("Richmond","-","Tasmania", 7, "", "Kangaroos", "Swimming");
		String[] regions = {"Wester Australia", "Northern Territory", "Queensland", "South Australia", "New South Whales", "Victoria", "Tasmania"};
		ArrayList<String> finishedRegions = new ArrayList<String>();
		try {
			deck = new ArrayList<>(Arrays.asList(arrayDeck)); 
			Collections.shuffle(deck); //Requirement 3
	        server(numPlayers, numBots);
	        //Requirement 4
			for(Player player : players) {
				for(int i=0; i<7; i++) {player.hand.add(deck.remove(0));}
			}
			//Requirement 12 - play 4 rounds
			for(int round=0; round<4; round++) { //Requirement 11
				//Draft 6 cards, the 7th card is sent to the previous player's hand
				for(int i=0; i<6; i++) { //Requirement 8
		            ExecutorService threadpool = Executors.newFixedThreadPool(players.size());  
		            for(int p=0; p<players.size(); p++) {
		            	final int currentPlayerIndex = p;
		            	Player sendHand;
		            	if(i<5) {
		            		// Requirement 6 (Pass remaining cards to the next player)
		            		sendHand = (p<(players.size()-1))?players.get(p+1):players.get(0);
		            	} else {
		            		// Requirement 9 (The final card is passed to the previous player)
		            		sendHand = (p>0)?players.get(p-1):players.get(players.size()-1);
		            	}
	                    //Requirement 7 - Make sure every player can draft their card at the same time
	                    Runnable task = new Runnable() {
	                        @Override
	                        public void run() {
	                           players.get(currentPlayerIndex).addCardToDraft(sendHand);   
	                        }
	                    };
	                    threadpool.execute(task);
	                }
		            threadpool.shutdown();

		            //wait for all the hands to switch places
		            while(!threadpool.isTerminated()) {
		                Thread.sleep(100);
		            }

		            for(Player sendToPlayer : players) {
						sendToPlayer.hand.clear();
						for(Card c : sendToPlayer.nextHand) {sendToPlayer.hand.add(c);} // grab the cards passed on from the previous player
		            }
		            // Requirement 5 (Keep throw card hidden)
		            if(i>0) {
		            	// Requirement 7 (Show cards)
		            	for(int pID=0; pID<players.size(); pID++) {
		            		for(Player sendToPlayer : players) {
		            			Player id=players.get(pID);
		            			sendToPlayer.sendMessage("\nPlayer "+pID+" has drafted\n" + id.printCards(id.draft.subList(1, id.draft.size())));
		            		}
		            	}
		            }
				}
				// Check if I'm the first to complete a region, add regionBonusScore if that's the case
				//Requirement 10b(i+ii)
				for(int r=0; r<regions.length; r++) {
					boolean regionComplete = false;
					for(Player player : players) {
						if(!finishedRegions.contains(regions[r]) && (player.checkRegionComplete(regions[r]))) {
							player.region.add(regions[r]);
							player.regionRoundScore+=3;
							regionComplete = true;
						}
					}
					if(regionComplete) {
						finishedRegions.add(regions[r]); //Requirement 10b(ii)
					}
				}

				for(Player player : players) {
					player.draft.add(player.hand.remove(0)); //Requirement 9 - last card on hand is added to draft
					//Requirement 10 - scoring
					player.sendMessage("********************************\nYour draft this round: \n"+player.printCards(player.draft)+"\n");
					player.finalScore = player.roundScore(round);
					player.sendMessage("The following regions have now been completed: "+ finishedRegions);
				}

				deck = new ArrayList<>(Arrays.asList(arrayDeck)); //Requirement 11 & Requirement 2
				Collections.shuffle(deck); //Requirement 3
		        //Requirement 4
				for(Player player : players) {
					player.draft.clear();
					player.hand.clear();
					for(int i=0; i<7; i++) {player.hand.add(deck.remove(0));}
				}
			}
			Player highScore = players.get(0);
			for(Player player : players) {
				if (player.finalScore > highScore.finalScore) {
					highScore = player;
				}
			}
			for(Player player : players) {
				player.sendMessage("The winner is player: " + players.indexOf(highScore) + " with " + highScore.finalScore + " points");
			}
		} catch(Exception e) {
			System.out.println(e.getMessage());
		}
	}

    public void client(String ipAddress) throws Exception {
        //Connect to server
        Socket aSocket = new Socket(ipAddress, 2048);
        ObjectOutputStream outToServer = new ObjectOutputStream(aSocket.getOutputStream());
        ObjectInputStream inFromServer = new ObjectInputStream(aSocket.getInputStream());
        String nextMessage = "";
        while(!nextMessage.contains("winner")){
            nextMessage = (String) inFromServer.readObject();
            System.out.println(nextMessage);
            if(nextMessage.contains("Type") || nextMessage.contains("keep")) {
                Scanner in = new Scanner(System.in);
                outToServer.writeObject(in.nextLine());
            } 
        }
    }

    public void server(int numberPlayers, int numberOfBots) throws Exception {
        players.add(new Player(0, false, null, null, null)); //add this instance as a player
        //Open for connections if there are online players
        for(int i=0; i<numberOfBots; i++) {
            players.add(new Player(i+1, true, null, null, null)); //add a bot    
        }
        if(numberPlayers>1)
            aSocket = new ServerSocket(2048);
        for(int i=numberOfBots+1; i<numberPlayers+numberOfBots; i++) {
            Socket connectionSocket = aSocket.accept();
            ObjectInputStream inFromClient = new ObjectInputStream(connectionSocket.getInputStream());
            ObjectOutputStream outToClient = new ObjectOutputStream(connectionSocket.getOutputStream());
            players.add(new Player(i, false, connectionSocket, inFromClient, outToClient)); //add an online client
            System.out.println("Connected to player " + i);
            outToClient.writeObject("You connected to the server as player " + i + "\n");
        }    
    }

	public static void main(String argv[]) {
		try {
			new BoomerangAustralia(argv);
		} catch(Exception e) {

		}
	}

}


