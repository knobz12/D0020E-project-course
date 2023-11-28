import java.io.*;
import java.net.*;
import java.util.*;
import java.util.concurrent.*;
import java.util.stream.*;

public class VarietyWordSquares {
    HashMap<String, Integer> englishScrabbleTiles;
    public ServerSocket aSocket;
    public ArrayList<String> dictionary = new ArrayList<String>();
    public ArrayList<Player> players = new ArrayList<Player>();
    public boolean scrabbleMode;   
    boolean test = false;
    String[][] test55 = new String[][] {{"G","a0"}, {"L","a1"}, {"A","a2"}, {"D","a3"}, {"Y","a4"},
                                        {"R","b0"}, {"E","b1"}, {"S","b2"}, {"T","b3"}, {"E","b4"},
                                        {"O","c0"}, {"X","c1"}, {"A","c2"}, {"R","c3"}, {"A","c4"},
                                        {"U","d0"}, {"R","d1"}, {"N","d2"}, {"R","d3"}, {"R","d4"},
                                        {"P","e0"}, {"O","e1"}, {"U","e2"}, {"R","e3"}, {"S","e4"}};
    class Square {
        //Square types
        public static final int RL = 1; //regular letter
        public static final int DL = 2; //double letter
        public static final int TL = 3; //tripple letter
        public static final int DW = 4; //double word
        public static final int TW = 5; //tripple word
        
        public static final String LETTER_VALUES = "1 point:  E A I O N R T L S U, 2 points: D G, 3 points B C M P\n" + 
                                                   "4 points: F H V W Y, 5 points: K, 8 points: J X, 10 points Q Z";

        public String letter = ""; //empty until 
        public int squareType = RL;
        public int letterValue = 0; //value depends on game-mode
        public boolean scrabbleValues = false;
        public HashMap<String, Integer> englishScrabbleTiles;

        public Square(boolean scrabbleValues) { //regular mode constructor
            this(scrabbleValues, RL);
        }
        public Square(boolean scrabbleValues, int squareType) {
            this.scrabbleValues = scrabbleValues;
            this.squareType = squareType;    
        }
        
        public void put(String letter) {
            this.letter = letter;
            this.letterValue = 1;
            if(scrabbleValues) {
                this.letterValue = englishScrabbleTiles.get(letter);
            }
        }
        
        public Square(String letter, int squareType, int letterValue) { //scrabble mode constructor
            this.letter = letter;
            this.squareType = squareType;
            this.letterValue = letterValue;
        }
        
        @Override
        public String toString() {
            return this.letter;
        }
    }

    class Player implements Comparable<Player>{
        public int playerID;
        public boolean online;
        public boolean isBot;
        public Socket connection;
        public ObjectInputStream inFromClient;
        public ObjectOutputStream outToClient;
        public ArrayList<Square[]> words;
        Scanner in = new Scanner(System.in);
        Square[][] board;
        public int score=0;
        
        public static final String REGULAR = "\u001B[47m\u001B[30m"; //white background black text
        public static final String DOUBLE_LETTER = "\u001B[46m\u001B[30m"; //cyan background black text
        public static final String TRIPPLE_LETTER = "\u001B[42m\u001B[30m"; //green background black text
        public static final String DOUBLE_WORD = "\u001B[43m\u001B[30m"; //yellow background black text
        public static final String TRIPPLE_WORD = "\u001B[45m\u001B[30m"; //magenta background black text
        public static final String HEADING = "\u001B[44m\u001B[37m"; //blue background white text
        public static final String RESET = "\u001B[0m"; //reset to default

                
        public Player(int playerID, Square[][] board, boolean isBot, Socket connection, ObjectInputStream inFromClient, ObjectOutputStream outToClient) {
            this.playerID = playerID;
            Square[][] newBoard = new Square[board.length][board[0].length]; //Make a new instance and copy - avoid writing to the same board
            for(int r=0; r<board.length; r++) {
                for(int c=0; c<board[r].length; c++) {
                    newBoard[r][c] = new Square(board[r][c].scrabbleValues, board[r][c].squareType);
                }
            } //copy
            this.board = newBoard;
            if(connection==null)
                this.online = false;
            else
                this.online = true;
            this.connection = connection; this.inFromClient = inFromClient; this.outToClient = outToClient; this.isBot = isBot;        
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
 
        public void placeLetter(String letter, String place) {//used for testing only - remove later
            if(isBot){this.placeLetter(letter);}
            else {
                String[] placement = place.split("");
                int r = ((int) placement[0].charAt(0))-97;
                int c = Integer.parseInt(placement[1]);
                board[r][c].letter = letter;
                board[r][c].letterValue = (scrabbleMode?englishScrabbleTiles.get(letter):1);
            }
        }
        public void placeLetter(String letter) {
            int value = (scrabbleMode?englishScrabbleTiles.get(letter):1);
            String theLetter = letter + (scrabbleMode?" [" + value + "]":"");
            int r, c =0;         
            if(!isBot) {
                sendMessage("Place " + theLetter + " (syntax [row column])");
                do {
                    String place = readMessage().toLowerCase();
                    String[] placement = (place.contains(" ")?place.split(" "):place.split("")); //got tired of writing spaces when picking a letter
                    r = ((int) placement[0].charAt(0))-97; //ascii code for a
                    c = Integer.parseInt(placement[1]);
                } while(!board[r][c].letter.equals(""));
            } else { //bot
                Random rnd = new Random();
                do {
                    r = rnd.nextInt(board.length);
                    rnd = new Random();
                    c = rnd.nextInt(board[0].length);
                } while(!board[r][c].letter.equals(""));
            }
            board[r][c].letter = letter;
            board[r][c].letterValue = value;    
        }

        public String pickLetter() {
            if(isBot) {
                Random rnd = new Random();
                int theLetter = rnd.nextInt(26);
                return ""+((char) (theLetter+65));
            }
            sendMessage((scrabbleMode?Square.LETTER_VALUES+"\n":"") + "Pick a letter");
            return readMessage();
        }
                
        //Print the board
        @Override
        public String toString() {
            int asciiRowCount = 97; //a
            String retStr = "";
            for(int i=0; i<board[0].length; i++) {
                retStr += "\t"+RESET+HEADING+"  "+i+"  ";
            }
            for(Square[] cols : board) {
                retStr += "\t" + RESET +"\n"+HEADING + "  "+ ((char) asciiRowCount++)+"  "; 
                for(Square letter : cols) {
                    String coloring = "";
                    if(letter.squareType == Square.RL) {coloring = REGULAR;}
                    if(letter.squareType == Square.DL) {coloring = DOUBLE_LETTER;}
                    if(letter.squareType == Square.TL) {coloring = TRIPPLE_LETTER;}
                    if(letter.squareType == Square.DW) {coloring = DOUBLE_WORD;}
                    if(letter.squareType == Square.TW) {coloring = TRIPPLE_WORD;}
                    String letterValue = (letter.letterValue == 0)?"     ":" ["+letter.letterValue+"]";
                    String theLetter = "";
                    if(letter.scrabbleValues) {
                        theLetter = letter.letter+letterValue;
                    } else {
                        theLetter = "  "+(letter.letter.equals("")?" ":letter.letter)+"  ";
                    }
                    retStr += "\t" + RESET + coloring + theLetter;
                }
            }
            retStr += "\t";
            if(scrabbleMode) {
                retStr += RESET + "\n\n\t" +REGULAR + " STD \t" + RESET+DOUBLE_LETTER + " DL  \t" + RESET+TRIPPLE_LETTER + " TL  \t" + RESET+DOUBLE_WORD + " DW  \t" + RESET+TRIPPLE_WORD + " TW  \t" + RESET;
            }
            return retStr + RESET + "\n";
        }
        
        @Override
        public int compareTo(Player o) {
            return o.score - this.score; //Reverse order: Highest score first
        }        
    }
    
    public void game(int startPlayer) throws Exception {
        Player currentPicker = players.get(startPlayer);
        int rounds = currentPicker.board.length * currentPicker.board[0].length;
        for(int i=0; i<rounds; i++) {
            players.forEach((player) -> player.sendMessage(player.toString() + "\nWaiting for a letter to be picked...\n"));            
            String letter = test?test55[i][0]:currentPicker.pickLetter().toUpperCase(); //use predefined picks during test

            ExecutorService threadpool = Executors.newFixedThreadPool(players.size());  
            for(Player player : players) {
                if(test) {player.placeLetter(letter, test55[i][1]);}
                else {
                    //Make sure every player can place their letter at the same time
                    Runnable task = new Runnable() {
                        @Override
                        public void run() {
                           player.placeLetter(letter);   
                        }
                    };
                    threadpool.execute(task);
                }
            }
            threadpool.shutdown();

            //wait for all the answers to come in
            while(!threadpool.isTerminated()) {
                Thread.sleep(100);
            }
            int nextPlayer = (currentPicker.playerID+1==players.size()?0:currentPicker.playerID+1);
            currentPicker = players.get(nextPlayer);
        }
        players.forEach((player) -> player.sendMessage(player.toString() + "\n"));
        players.forEach((player) -> player.words=checkWords(player.board));
        players.forEach((player) -> player.score=calculateScore(player.words));
        Collections.sort(players);
        String winnerMsg = "Winner: PlayerID "+ players.get(0).playerID+ ", Scores:\n";
        for(Player player : players) {winnerMsg += "PlayerID " + player.playerID + " Score " + player.score + "\n";}
        for(Player player : players) {player.sendMessage(winnerMsg);}
        System.exit(0); //quit game
    }
    
    public ArrayList<Square[]> checkWords(Square[][] board) {
        ArrayList<Square[]> words = new ArrayList();
        //Check all possible combinations for each row
        for(Square[] columns : board) {
            for(int col=0; col<columns.length; col++) {
                ArrayList<Square> possibleWord = new ArrayList();
                //String possibleWord = "";
                for(int i=col; i<columns.length; i++) {
                    possibleWord.add(columns[i]);
                    String aWord = Arrays.toString(possibleWord.toArray()).replace("[", "").replace("]", "").replace(", ", "");
                    if(dictionary.contains(aWord)){
                        words.add(possibleWord.toArray(new Square[possibleWord.size()]));
                    }
                }
            }
        }
        //Check all possible combinations for each column
        for(int col = 0; col<board[0].length; col++) {
            Square[] rows = new Square[board.length];
            for(int row=0; row<rows.length; row++) {
                rows[row] = board[row][col];
            }
            for(int row=0; row<rows.length; row++) {
                ArrayList<Square> possibleWord = new ArrayList();
                for(int i=row; i<rows.length; i++) {
                    possibleWord.add(rows[i]);
                    String aWord = Arrays.toString(possibleWord.toArray()).replace("[", "").replace("]", "").replace(", ", "");
                    if(dictionary.contains(aWord)){
                        words.add(possibleWord.toArray(new Square[possibleWord.size()]));
                    }                                    
                }
            }
        }
        //Check downwards diagonals from left to right
        for(int col=0; col<board[0].length; col++) {
            for(int row=board.length-1; row>=0; row--) { //start bottom-left
                ArrayList<Square> possibleWord = new ArrayList();
                int r=row, c=col;
                while(r<board.length && c<board[0].length) {
                    possibleWord.add(board[r][c]);
                    String aWord = Arrays.toString(possibleWord.toArray()).replace("[", "").replace("]", "").replace(", ", "");
                    if(dictionary.contains(aWord)) {
                        words.add(possibleWord.toArray(new Square[possibleWord.size()]));
                    }
                    r++; c++;
                }
            }
        }
        return words;
    }

    public int calculateScore(ArrayList<Square[]> words) {
        int score = 0;
        if(!scrabbleMode) { //regular WordSquares scoring
            for(Square[] word : words) { //score: 1, 2, 4, 6, 8, 10, etc.
                if(word.length==3) score+=1;
                if(word.length>3) score+=(word.length-3)*2;
            }
        } else {
            for(Square[] word : words) {
                int wordScore = 0;
                int wordMultiplier = 1;
                for(int i=0;i<word.length; i++) {
                    int letterMultiplier = 1;
                    if(word[i].squareType == Square.DL) {letterMultiplier = 2;}
                    if(word[i].squareType == Square.TL) {letterMultiplier = 3;}
                    wordScore += (word[i].letterValue * letterMultiplier);
                    int tileMultiplier = 1;
                    if(word[i].squareType == Square.DW) {tileMultiplier = 2;}
                    if(word[i].squareType == Square.TW) {tileMultiplier = 3;}
                    wordMultiplier = wordMultiplier * tileMultiplier;
                }
                wordScore = wordScore * wordMultiplier;
                String theWord = Arrays.toString(word).replace("[", "").replace("]", "").replace(", ", "");
//                System.out.println("Word: " + theWord + ", Score: " + wordScore);
                score += wordScore;
            }            
        }
        return score;
    }

    
    public static void main(String argv[]) {
        VarietyWordSquares game = new VarietyWordSquares(argv);
    }
    
    public VarietyWordSquares(String[] params) {
        String language="English";
        int rows=3; int columns=3; int numberOfPlayers=1; int numberOfBots=1;
        String playmode = "";
        if(params.length == 0) {
            while(!playmode.equals("!")) {
                System.out.println( "****************************************************************\n" +
                                    " Welcome to VarietyBoggle\n" +
                                    "****************************************************************\n" +
                                    " Current settings:\n" +
                                    "    Board size (rows/columns): " + rows + "/" + columns + "\n" +
                                    "    Language: "+ language + "\n" + 
                                    "    Number of players: " + numberOfPlayers + "\n"+
                                    "    Number of bots: " + numberOfBots + "\n"+
                                    "    Testing (remove for final release): " + test + "\n"+
                                    "****************************************************************\n" +
                                    " Menu:\n" +
                                    "  [1] Play standard WordSquares\n" +
                                    "  [2] Play ScrabbleSquares on standard board\n" +
                                    "  [3] Load 5x5 predefined ScrabbleBoard and play ScrabbleSquares\n" +
                                    "  [4] Load 5x5 randomised ScrabbleBoard and play ScrabbleSquares\n" +
                                    "  [5] Settings\n" +
                                    "  [!] Quit\n" +
                                    "****************************************************************\n");            
                Scanner in = new Scanner(System.in);
                playmode = in.nextLine();
                if(playmode.equals("1") || playmode.equals("2")) {
                    scrabbleMode = playmode.equals("1")?false:true;
                    Square board[][] = new Square[rows][columns];
                    for(Square [] tiles: board) {Arrays.fill(tiles, new Square(scrabbleMode));}
                    gameSetup(numberOfPlayers, numberOfBots, board);           
                } else if(playmode.equals("3") ||playmode.equals("4")) {
                    scrabbleMode=true;
                    //5x5 predefined scrabbleboard
                    int scrabbleBoard[][] = {{VarietyWordSquares.Square.DW, VarietyWordSquares.Square.RL, VarietyWordSquares.Square.TW, VarietyWordSquares.Square.RL, VarietyWordSquares.Square.DW},
                                             {VarietyWordSquares.Square.RL, VarietyWordSquares.Square.DL, VarietyWordSquares.Square.RL, VarietyWordSquares.Square.DL, VarietyWordSquares.Square.RL},
                                             {VarietyWordSquares.Square.TL, VarietyWordSquares.Square.RL, VarietyWordSquares.Square.TW, VarietyWordSquares.Square.RL, VarietyWordSquares.Square.TL},
                                             {VarietyWordSquares.Square.RL, VarietyWordSquares.Square.DL, VarietyWordSquares.Square.RL, VarietyWordSquares.Square.DL, VarietyWordSquares.Square.RL},
                                             {VarietyWordSquares.Square.DW, VarietyWordSquares.Square.RL, VarietyWordSquares.Square.TW, VarietyWordSquares.Square.RL, VarietyWordSquares.Square.DW}};
                    if(playmode.equals("4")) {
                        //5x5 random scrabbleboard (3 double letter, 2 tripple letter, 3 double word, 1 tripple word)
                        for(int[] row: scrabbleBoard) {Arrays.fill(row, VarietyWordSquares.Square.RL);} //reset scrabbleBoard
                        //Random place 3 DL, 2 TL, 3 DW, 1 TW
                        int tileTypes [] = {VarietyWordSquares.Square.DL, VarietyWordSquares.Square.DL, VarietyWordSquares.Square.DL, VarietyWordSquares.Square.TL, VarietyWordSquares.Square.TL, VarietyWordSquares.Square.DW, VarietyWordSquares.Square.DW, VarietyWordSquares.Square.DW, VarietyWordSquares.Square.TW};
                        for(int tile : tileTypes) {
                            Random rnd = new Random();
                            int r, c;
                            do {r = rnd.nextInt(5); c = rnd.nextInt(5);
                            } while(scrabbleBoard[r][c]!=VarietyWordSquares.Square.RL);
                            scrabbleBoard[r][c] = tile;
                        }
                    }
                    //Create a board using the scrabbleBoard tiles
                    Square board[][] = new Square[5][5];
                    for(int i=0; i<5; i++) {
                        for(int j=0; j<5; j++) {
                            board[i][j] = new Square(true, scrabbleBoard[i][j]);
                        }    
                    }
                    gameSetup(numberOfPlayers, numberOfBots, board);                
                }
                else if(playmode.equals("5")) {
                    //Settings
                    System.out.println("****************************************************************\n" +
                                       " Current settings:\n" +
                                       "  [1]  Board size (rows/columns): " + rows + "/" + columns + "\n" +
                                       "  [2]  Language: "+ language + "\n" + 
                                       "  [3]  Number of players: " + numberOfPlayers + "\n"+
                                       "  [4]  Number of bots: " + numberOfBots + "\n"+
                                       "  [5]  Testing (remove for final release): " + test + "\n"+
                                       "  [6]  Return to the main menu" + "\n" +
                                       "****************************************************************\n");
                    String setting = in.nextLine();
                    if(setting.equals("1")) {
                        System.out.println("Enter new board size (rows/columns): ");
                        String[] option = in.nextLine().split("/");
                        rows = Integer.parseInt(option[0]);
                        columns = Integer.parseInt(option[1]);
                    } else if(setting.equals("2")) {
                        System.out.println("Currently only English is supported");
                    } else if(setting.equals("3")) {
                        System.out.println("Enter the number of players: ");
                        String option = in.nextLine();
                        numberOfPlayers = Integer.parseInt(option);
                    } else if(setting.equals("4")) {
                        System.out.println("Enter the number of bots: ");
                        String option = in.nextLine();
                        numberOfBots = Integer.parseInt(option);
                    } else if(setting.equals("5")) {
                        System.out.println("Toggling testing");
                        test = !test;
                        if(test) {
                            rows=5; columns=5;
                        }
                    }
                }   
            }      
        } else {
            try {
                client("127.0.0.1");            
            } catch (Exception e){}
        }  
    }

    public void gameSetup(int numPlayers, int numBots, Square[][] board) {
        try {
            FileReader fileReader = new FileReader("CollinsScrabbleWords2019.txt");
            BufferedReader bufferedReader = new BufferedReader(fileReader);
            String line = null;
            while((line = bufferedReader.readLine()) != null) {
                dictionary.add(line);
            }
            initScrabbleValues();
            bufferedReader.close();
            server(numPlayers, numBots, board);
            Random rnd = new Random();
            int randomStarter = rnd.nextInt(players.size());
            game(randomStarter);
        } catch(Exception e) {
            System.out.println(e.getMessage());
        }
    }
    
    public void initScrabbleValues() {
        this.englishScrabbleTiles = new HashMap<String, Integer>();
        //1-point letters
        englishScrabbleTiles.put("E", 1);
        englishScrabbleTiles.put("A", 1);
        englishScrabbleTiles.put("I", 1);
        englishScrabbleTiles.put("O", 1);
        englishScrabbleTiles.put("N", 1);
        englishScrabbleTiles.put("R", 1);
        englishScrabbleTiles.put("T", 1);
        englishScrabbleTiles.put("L", 1);
        englishScrabbleTiles.put("S", 1);
        englishScrabbleTiles.put("U", 1);

        //2-point letters
        englishScrabbleTiles.put("D", 2);
        englishScrabbleTiles.put("G", 2);

        //3-point letters
        englishScrabbleTiles.put("B", 3);
        englishScrabbleTiles.put("C", 3);
        englishScrabbleTiles.put("M", 3);
        englishScrabbleTiles.put("P", 3);

        //4-point letters
        englishScrabbleTiles.put("F", 4);
        englishScrabbleTiles.put("H", 4);
        englishScrabbleTiles.put("V", 4);
        englishScrabbleTiles.put("W", 4);
        englishScrabbleTiles.put("Y", 4);

        //5-point letters
        englishScrabbleTiles.put("K", 5);

        //8-point letters
        englishScrabbleTiles.put("J", 8);
        englishScrabbleTiles.put("X", 8);

        //10-point letters
        englishScrabbleTiles.put("Q", 10);
        englishScrabbleTiles.put("Z", 10);
    }

    public void client(String ipAddress) throws Exception {
        //Connect to server
        Socket aSocket = new Socket(ipAddress, 2048);
        ObjectOutputStream outToServer = new ObjectOutputStream(aSocket.getOutputStream());
        ObjectInputStream inFromServer = new ObjectInputStream(aSocket.getInputStream());
        //Get the hand of apples from server
        String nextMessage = "";
        while(!nextMessage.contains("Winner")){
            nextMessage = (String) inFromServer.readObject();
            System.out.println(nextMessage);
            if(nextMessage.contains("Pick") || nextMessage.contains("Place")) {
                Scanner in = new Scanner(System.in);
                outToServer.writeObject(in.nextLine());
            } 
        }
    }
    
    public void server(int numberPlayers, int numberOfBots, Square[][] board) throws Exception {
        // Square[][] copy = Arrays.stream(board).map(Square[]::clone).toArray(Square[][]::new); //creates a new instance of board with copied values
        players.add(new Player(0, board, false, null, null, null)); //add this instance as a player
        //Open for connections if there are online players
        for(int i=0; i<numberOfBots; i++) {
            players.add(new Player(i+1, board, true, null, null, null)); //add a bot    
        }
        if(numberPlayers>1)
            aSocket = new ServerSocket(2048);
        for(int i=numberOfBots+1; i<numberPlayers+numberOfBots; i++) {
            Socket connectionSocket = aSocket.accept();
            ObjectInputStream inFromClient = new ObjectInputStream(connectionSocket.getInputStream());
            ObjectOutputStream outToClient = new ObjectOutputStream(connectionSocket.getOutputStream());
            players.add(new Player(i, board, false, connectionSocket, inFromClient, outToClient)); //add an online client
            System.out.println("Connected to player " + i);
            outToClient.writeObject("You connected to the server as player " + i + "\n");
        }
        
    }


}
