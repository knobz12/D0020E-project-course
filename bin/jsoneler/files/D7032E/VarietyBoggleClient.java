import java.io.*;
import java.net.*;
import java.util.*;

public class VarietyBoggleClient {
    public VarietyBoggleClient (String ipAddress) {
    	ObjectInputStream inFromServer;
    	Scanner in = new Scanner(System.in);
		try {
			//Connect to server
			Socket aSocket = new Socket(ipAddress, 2048);
			ObjectOutputStream outToServer = new ObjectOutputStream(aSocket.getOutputStream());
			inFromServer = new ObjectInputStream(aSocket.getInputStream());
			Runnable receive = new Runnable() { //Be ready to receive messages from the server at any time
				@Override
				public void run() {
					boolean run = true;
					while(run) {
						try {
							String message = (String) inFromServer.readObject();
							if(message.equals("CLOSE SOCKET")) {
								run=false;
								aSocket.close();
								System.exit(0);
							}
							System.out.println(message);					
						} catch (Exception e) {
							System.out.println("Socket has closed");
							System.exit(0);
						}						
					}
				}
			};
			(new Thread(receive)).start();
			while(true) {
				outToServer.writeObject(in.nextLine());
				Thread.sleep(50); //Print things in the correct order
			}						
		} catch(Exception e) {
			System.out.println("Game has ended");
			//threadpool.shutdownNow();
		}
    }

    public static void main(String argv[]) {
    	new VarietyBoggleClient("127.0.0.1");
    }

}