import java.util.*;
import java.io.*;
import java.net.*;
import java.util.concurrent.ThreadLocalRandom;
import java.util.Scanner;

public class KingTokyoPowerUpClient {

    private Scanner sc = new Scanner(System.in);

    public KingTokyoPowerUpClient(boolean bot) {
        String name = "";
        Random rnd = ThreadLocalRandom.current();
        //Server stuffs
        try {
            Socket aSocket = new Socket("localhost", 2048);
            DataOutputStream outToServer = new DataOutputStream(aSocket.getOutputStream());
            BufferedReader inFromServer = new BufferedReader(new InputStreamReader(aSocket.getInputStream()));
            name = inFromServer.readLine();
            System.out.println(name);

            while(true) {
                String[] message = inFromServer.readLine().split(":");
                for(int i=0; i<message.length; i++) {System.out.println(message[i].toString());}
                if(message[0].equalsIgnoreCase("VICTORY")) {
                    outToServer.writeBytes("Bye!\n");
                } else if(message[0].equalsIgnoreCase("ATTACKED")) {
                    if(bot)
                        outToServer.writeBytes("YES\n");
                    else {
                        outToServer.writeBytes(sc.nextLine() + "\n");
                    }
                } else if(message[0].equalsIgnoreCase("ROLLED")) {
                    if(bot) {
                        rnd = ThreadLocalRandom.current();
                        int num1 = rnd.nextInt(2) + 4; 
                        int num2 = rnd.nextInt(2) + 1;
                        String reroll = ""+num1+","+num2+"\n";                  
                        outToServer.writeBytes(reroll);// Some randomness at least
                    } else {
                        outToServer.writeBytes(sc.nextLine() + "\n");
                    }
                } else if(message[0].equalsIgnoreCase("PURCHASE")) {
                    if(bot)
                        outToServer.writeBytes("-1\n");
                    else
                        outToServer.writeBytes(sc.nextLine() + "\n");
                } else {
                    if(bot)
                        outToServer.writeBytes("OK\n");
                    else {
                        System.out.println("Press [ENTER]");
                        sc.nextLine();
                        outToServer.writeBytes("OK\n");
                    }
                }
                System.out.println("\n");
            }
        } catch(Exception e) {}
    }

    public static void main(String argv[]) {
        KingTokyoPowerUpClient client;
        if(argv.length != 0) //Syntax: java KingTokyoPowerUpClient bot
            client = new KingTokyoPowerUpClient(true);
        else
            client = new KingTokyoPowerUpClient(false);
    }
}