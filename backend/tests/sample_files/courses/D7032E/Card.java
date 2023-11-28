class Card {
	public static int RED = 0;
	public static int GREEN = 1;
	public static int YELLOW = 2;
	public static int BLUE = 3;
	public static int WILD = 4;
	public int color;
	public String value;
	public boolean uno=false;
	public Card(int color, String value) {
		this.color = color; this.value = value;
	}
	public Card(String card) {
		String[] cardArray = card.split(",");
		try {
			this.color = Integer.parseInt(cardArray[0]);
			this.value = cardArray[1];
		} catch(Exception e) {}
	}
	public String toString() {
		return ""+color+","+value;
	}
}