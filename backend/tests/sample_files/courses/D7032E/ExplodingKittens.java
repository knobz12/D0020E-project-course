import java.util.*; 
import java.io.*; 
import java.net.*;
import java.util.concurrent.*;

public class ExplodingKittens {
    public ServerSocket aSocket;
	public static ArrayList<Card> deck = new ArrayList<Card>();
	public static ArrayList<Card> discard = new ArrayList<Card>();
	public static int numberOfTurnsToTake = 1; //attacked?
	public ArrayList<Player> players = new ArrayList<Player>();
	public int secondsToInterruptWithNope = 5;

	enum Card {
		ExplodingKitten,
		Defuse,
		Attack,
		Favor,
		Nope,
		Shuffle,
		Skip,
		SeeTheFuture,
		HairyPotatoCat,
		Cattermelon,
		RainbowRalphingCat,
		TacoCat,
		OverweightBikiniCat
	}

	class Player {
        public int playerID;
        public boolean online;
        public boolean isBot;
        public Socket connection;
        public boolean exploded = false;
        public ObjectInputStream inFromClient;
        public ObjectOutputStream outToClient;
        public ArrayList<Card> hand = new ArrayList<Card>();
        Scanner in = new Scanner(System.in);
 
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
        public String readMessage(boolean interruptable) {
            String word = " "; 
            if(online)
                try{
                	word = (String) inFromClient.readObject();
                } catch (Exception e){
                	System.out.println("Reading from client failed: " + e.getMessage());
                }
            else
                try {
                	if(interruptable) {
    				    BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
    				    int millisecondsWaited = 0;
    				    while(!br.ready() && millisecondsWaited<(secondsToInterruptWithNope*1000)) {
    				    	Thread.sleep(200);
    				    	millisecondsWaited += 200;
    				    }
    				    if(br.ready())
    				    	return br.readLine();               		
                	} else {
	                	in = new Scanner(System.in); 
	                	word=in.nextLine();
                	}
                } catch(Exception e){System.out.println(e.getMessage());}
            return word;
        }		
	}

	public ExplodingKittens(String[] params) throws Exception {
		if(params.length == 2) {
			this.initGame(Integer.valueOf(params[0]).intValue(), Integer.valueOf(params[1]).intValue());
		} else if(params.length == 1) {
			client(params[0]);
		} else {
			System.out.println("Server syntax: java ExplodingKittens numPlayers numBots");
			System.out.println("Client syntax: IP");
		}
	}

	public static void main(String argv[]) {
		try {
			new ExplodingKittens(argv);
		} catch(Exception e) {

		}
	}

	public void initGame(int numPlayers, int numBots) {
		try {
	        server(numPlayers, numBots);

			//Create the deck
			for(int i=0; i<6-players.size(); i++) {deck.add(Card.Defuse);}
			for(int i=0; i<4; i++) {deck.add(Card.Attack);}
			for(int i=0; i<4; i++) {deck.add(Card.Favor);}
			for(int i=0; i<5; i++) {deck.add(Card.Nope);}
			for(int i=0; i<4; i++) {deck.add(Card.Shuffle);}
			for(int i=0; i<4; i++) {deck.add(Card.Skip);}
			for(int i=0; i<5; i++) {deck.add(Card.SeeTheFuture);}
			for(int i=0; i<4; i++) {deck.add(Card.HairyPotatoCat);}
			for(int i=0; i<4; i++) {deck.add(Card.Cattermelon);}
			for(int i=0; i<4; i++) {deck.add(Card.RainbowRalphingCat);}
			for(int i=0; i<4; i++) {deck.add(Card.TacoCat);}
			for(int i=0; i<4; i++) {deck.add(Card.OverweightBikiniCat);}
			Collections.shuffle(deck);

			for(Player player : players) {
				player.hand.add(Card.Defuse);
				for(int i=0; i<7; i++) {player.hand.add(deck.remove(0));}
			}

			for(int i=0; i<players.size()-1; i++) {deck.add(Card.ExplodingKitten);}
			Collections.shuffle(deck);

	        Random rnd = new Random();
	        game(rnd.nextInt(players.size()));
		} catch(Exception e) {
			System.out.println(e.getMessage());
		}
	}

	public void addToDiscardPile(Player currentPlayer, String card) throws Exception {
		//After an interruptable card is played everyone has 5 seconds to play Nope
		int nopePlayed = checkNrNope();
		ExecutorService threadpool = Executors.newFixedThreadPool(players.size());
		for(Player p : players) {
			p.sendMessage("Action: Player " + currentPlayer.playerID + " played " + card);
			if(p.hand.contains(Card.Nope)) { //only give the option to interrupt to those who have a Nope card
				p.sendMessage("Press <Enter> to play Nope");
				Runnable task = new Runnable() {
		        	@Override
		        	public void run() {
	        			try {
			        		String nextMessage = p.readMessage(true); //Read that is interrupted after secondsToInterruptWithNope
			        		if(!nextMessage.equals(" ") && p.hand.contains(Card.Nope)) {
		    	    			p.hand.remove(Card.Nope);
		    	    			discard.add(0, Card.Nope);
		    	    			for(Player notify: players)
		    	    				notify.sendMessage("Player " + p.playerID + " played Nope");
			        		}
	        			} catch(Exception e) {
	        				System.out.println("addToDiscardPile: " +e.getMessage());
	        			}
	        		}
	        	};
            	threadpool.execute(task);
			}
		}
		threadpool.awaitTermination((secondsToInterruptWithNope*1000)+500, TimeUnit.MILLISECONDS); //add an additional delay to avoid concurrancy problems with the ObjectInputStream
		for(Player notify: players)
			notify.sendMessage("The timewindow to play Nope passed");
		if(checkNrNope()>nopePlayed) {
			for(Player notify: players)
				notify.sendMessage("Play another Nope? (alternate between Nope and Yup)");
			addToDiscardPile(currentPlayer, card);
		}
	}

	public int checkNrNope() {
		int i=0;
		while(i<discard.size() && discard.get(i)==Card.Nope) {
			i++;	
		}
		return i;
	}

	public void game(int startPlayer) throws Exception {
		Player currentPlayer = players.get(startPlayer);
		int playersLeft = players.size();
		do { //while playersLeft>1
			for(Player p : players) {
				if(p == currentPlayer)
					p.sendMessage("It is your turn");
				else
					p.sendMessage("It is now the turn of player " + currentPlayer.playerID);
			}
			Collections.sort(currentPlayer.hand);
			for(int i=0; i<numberOfTurnsToTake; i++) {
				String otherPlayerIDs = "PlayerID: ";
				for(Player p : players) {
					if(p.playerID != currentPlayer.playerID)
						otherPlayerIDs += p.playerID + " ";
				}

				String response = "";
				while(!response.equalsIgnoreCase("pass")) {
					int turnsLeft = numberOfTurnsToTake-i;
					currentPlayer.sendMessage("\nYou have " + turnsLeft + ((turnsLeft>1)?" turns":" turn") + " to take");
					currentPlayer.sendMessage("Your hand: " + currentPlayer.hand);
					String yourOptions = "You have the following options:\n";
					Set<Card> handSet = new HashSet<Card>(currentPlayer.hand);
					for(Card card : handSet) {
						int count = Collections.frequency(currentPlayer.hand, card);
						if(count>=2)
							yourOptions += "\tTwo " + card + " [target] (available targets: " + otherPlayerIDs + ") (Steal random card)\n";
						if(count>=3)
							yourOptions += "\tThree " + card + " [target] [Card Type] (available targets: " + otherPlayerIDs + ") (Name and pick a card)\n";
						if(card == Card.Attack)
							yourOptions += "\tAttack\n";
						if(card == Card.Favor)
							yourOptions += "\tFavor [target] (available targets: " + otherPlayerIDs + ")\n";
						if(card == Card.Shuffle)
							yourOptions += "\tShuffle\n";
						if(card == Card.Skip)
							yourOptions += "\tSkip\n";
						if(card == Card.SeeTheFuture)
							yourOptions += "\tSeeTheFuture\n";
					}  
					yourOptions += "\tPass\n";
					//We don't need to offer Nope as an option - it's only viable 5 seconds after another card is played and handled elsewhere
					currentPlayer.sendMessage(yourOptions);
					response = currentPlayer.readMessage(false);
					if(yourOptions.contains(response.replaceAll("\\d",""))) { //remove targetID to match vs yourOptions
						if(response.equals("Pass")) { //Draw a card and end turn
							Card drawCard = deck.remove(0);
							if(drawCard == Card.ExplodingKitten) {
								if(currentPlayer.hand.contains(Card.Defuse)) {
									currentPlayer.hand.remove(Card.Defuse);
									currentPlayer.sendMessage("You defused the kitten. Where in the deck do you wish to place the ExplodingKitten? [0.." + (deck.size()-1) + "]");
									deck.add((Integer.valueOf(currentPlayer.readMessage(false))).intValue(), drawCard);
									for(Player p : players) {
										p.sendMessage("Player " + currentPlayer.playerID + " successfully defused a kitten");
									}
								} else {
									discard.add(drawCard); //we discard them to the bottom of the pile, that way we don't end up with problems of Attack ending up as the last card
									discard.addAll(currentPlayer.hand);
									currentPlayer.hand.clear();
									for(Player p : players) {
										p.sendMessage("Player " + currentPlayer.playerID + " exploded");
									}
									currentPlayer.exploded = true;
									playersLeft--;
								}
							} else {
								currentPlayer.hand.add(drawCard);
								currentPlayer.sendMessage("You drew: " + drawCard);
							}
						} else if(response.contains("Two")) { //played 2 of a kind - steal random card from target player
							String[] args = response.split(" ");
							currentPlayer.hand.remove(Card.valueOf(args[1])); 
							currentPlayer.hand.remove(Card.valueOf(args[1]));
							discard.add(0, Card.valueOf(args[1]));
							discard.add(0, Card.valueOf(args[1]));
							addToDiscardPile(currentPlayer, "Two of a kind against player " + args[2]);
							if(checkNrNope() % 2 == 0) {
								Player target = players.get((Integer.valueOf(args[2])).intValue());
						        Random rnd = new Random();
						        Card aCard = target.hand.remove(rnd.nextInt(target.hand.size()-1));
						        currentPlayer.hand.add(aCard);
						        target.sendMessage("You gave " + aCard + " to player " + currentPlayer.playerID);
						        currentPlayer.sendMessage("You received " + aCard + " from player " + target.playerID);								
							}
						} else if(response.contains("Three")) { //played 3 of a kind - name a card and force target player to hand one over if they have it
							String[] args = response.split(" ");
							currentPlayer.hand.remove(Card.valueOf(args[1])); 
							currentPlayer.hand.remove(Card.valueOf(args[1]));
							currentPlayer.hand.remove(Card.valueOf(args[1]));
							discard.add(0, Card.valueOf(args[1]));
							discard.add(0, Card.valueOf(args[1]));
							discard.add(0, Card.valueOf(args[1]));
							addToDiscardPile(currentPlayer, "Three of a kind against player " + args[2]);
							if(checkNrNope() % 2 == 0) {
								Player target = players.get((Integer.valueOf(args[2])).intValue());
								Card aCard = Card.valueOf(args[3]);
								if(target.hand.contains(aCard)) {
									target.hand.remove(aCard);
									currentPlayer.hand.add(aCard);
						        	target.sendMessage("Player " + currentPlayer.playerID + " stole " + aCard);
						        	currentPlayer.sendMessage("You received " + aCard + " from player " + target.playerID);										
								} else {
									currentPlayer.sendMessage("The player did not have any " + aCard);
								}								
							}
						} else if(response.equals("Attack")) {
							int turnsToTake = 0;
							if(discard.size()>0 && discard.get(0).equals(Card.Attack)) {
								turnsToTake = numberOfTurnsToTake + 2;	
							} else {
								turnsToTake = 2;
							}
							currentPlayer.hand.remove(Card.Attack);
							discard.add(0, Card.Attack);
							addToDiscardPile(currentPlayer, "Attack");
							if(checkNrNope() % 2 == 0) {
								numberOfTurnsToTake = turnsToTake; //do not modify if Nope
								i = numberOfTurnsToTake; //ugly hack - make sure we also exit the for loop
								response="Pass"; //part of the ugly hack
								break; //exit the while-loop and move to the next player - do not draw.								
							}
						} else if(response.contains("Favor")) {
							currentPlayer.hand.remove(Card.Favor);
							discard.add(0, Card.Favor);
							String[] args = response.split(" ");
							Player target = players.get((Integer.valueOf(args[1])).intValue());
							addToDiscardPile(currentPlayer, "Favor player " + target.playerID);
							if(checkNrNope() % 2 == 0) {
								boolean viableOption = false;
								if(target.hand.size()==0)
									viableOption=true; //special case - target has no cards to give
								while(!viableOption) {
									target.sendMessage("Your hand: " + target.hand);
									target.sendMessage("Give a card to Player " + currentPlayer.playerID);
									String tres = target.readMessage(false);
									if(target.hand.contains(Card.valueOf(tres))) {
										viableOption = true;
										currentPlayer.hand.add(Card.valueOf(tres));
										target.hand.remove(Card.valueOf(tres));
									} else {
										target.sendMessage("Not a viable option, try again");
									}
								}								
							}
						} else if(response.equals("Shuffle")) {
							discard.add(0, Card.Shuffle);
							currentPlayer.hand.remove(Card.Shuffle);
							addToDiscardPile(currentPlayer, "Shuffle");
							if(checkNrNope() % 2 == 0) {
								Collections.shuffle(deck);
							}
						} else if(response.equals("Skip")) {
							currentPlayer.hand.remove(Card.Skip);
							discard.add(0, Card.Skip);
							addToDiscardPile(currentPlayer, "Skip");
							if(checkNrNope() % 2 == 0) {
								break; //Exit the while loop
							}
						} else if(response.equals("SeeTheFuture")) {
							currentPlayer.hand.remove(Card.SeeTheFuture);
							discard.add(0, Card.SeeTheFuture);
							addToDiscardPile(currentPlayer, "SeeTheFuture");
							if(checkNrNope() % 2 == 0) {
								currentPlayer.sendMessage("The top 3 cards are: " + deck.get(0) + " " + deck.get(1) + " " + deck.get(2));
							}							
						} 
					} else {
						currentPlayer.sendMessage("Not a viable option, try again");
					}
					if(i==(numberOfTurnsToTake-1))
						numberOfTurnsToTake=1; //We have served all of our turns, reset it for the next player
				}
			}
			do { //next player that is still in the game
				int nextID=((currentPlayer.playerID+1)<players.size()?(currentPlayer.playerID)+1:0);
				currentPlayer = players.get(nextID);
			} while(currentPlayer.exploded && playersLeft>1);
		} while(playersLeft>1);
		Player winner = currentPlayer;
		for(Player notify: players)
			winner = (!notify.exploded?notify:winner);
		for(Player notify: players)
			notify.sendMessage("Player " + winner.playerID + " has won the game");
		System.exit(0);
	}

    public void client(String ipAddress) throws Exception {
        //Connect to server
        Socket aSocket = new Socket(ipAddress, 2048);
        ObjectOutputStream outToServer = new ObjectOutputStream(aSocket.getOutputStream());
        ObjectInputStream inFromServer = new ObjectInputStream(aSocket.getInputStream());
        //Get the hand of apples from server
        ExecutorService threadpool = Executors.newFixedThreadPool(1);
        Runnable receive = new Runnable() {
        	@Override
        	public void run() {
    			BufferedReader br = new BufferedReader(new InputStreamReader(System.in));	
        		while(true) {
        			try {
		        		String nextMessage = (String) inFromServer.readObject();
	    	    		System.out.println(nextMessage);   		
	    	    		if(nextMessage.contains("options") || nextMessage.contains("Give") || nextMessage.contains("Where")){ //options (your turn), Give (Opponent played Favor), Where (You defused an exploding kitten)
	    	    			outToServer.writeObject(br.readLine());
	    	    		} else if(nextMessage.contains("<Enter>")) { //Press <Enter> to play Nope and Interrupt
	    				    int millisecondsWaited = 0;
	    				    while(!br.ready() && millisecondsWaited<(secondsToInterruptWithNope*1000)) {
	    				    	Thread.sleep(200);
	    				    	millisecondsWaited += 200;
	    				    }
	    				    if(br.ready()) {
	    				    	outToServer.writeObject(br.readLine());
	    				    }	    				    
	    				    else
	    				    	outToServer.writeObject(" ");
	    	    		}
        			} catch(Exception e) {
        				System.exit(0);
        			}
        		}
        	}
        };

        threadpool.execute(receive);
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
}