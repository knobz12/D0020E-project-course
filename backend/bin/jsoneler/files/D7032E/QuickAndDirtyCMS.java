import java.util.*;
public class QuickAndDirtyCMS {
    public static void main(String[] args) {
        // Content creation
        Article article = new Article("New Article", "This is a new article.");
        Image image = new Image("image1.jpg", "Image 1 description");
        Video video = new Video("video1.mp4", "Video 1 description");

        // Adding content to the website
        Website website = new Website();
        website.addContent(article);
        website.addContent(image);
        website.addContent(video);

        // Displaying content
        System.out.println("Website Content:");
        website.displayContent();
    }
}

class Article {
    private String title;
    private String body;

    public Article(String title, String body) {
        this.title = title;
        this.body = body;
    }

    public void display() {
        System.out.println("Article: " + title);
        System.out.println(body);
    }
}

class Image {
    private String fileName;
    private String description;

    public Image(String fileName, String description) {
        this.fileName = fileName;
        this.description = description;
    }

    public void display() {
        System.out.println("Image: " + fileName);
        System.out.println("Description: " + description);
    }
}

class Video {
    private String fileName;
    private String description;

    public Video(String fileName, String description) {
        this.fileName = fileName;
        this.description = description;
    }

    public void display() {
        System.out.println("Video: " + fileName);
        System.out.println("Description: " + description);
    }
}

class Website {
    private List<Object> content = new ArrayList<>();

    public void addContent(Object item) {
        content.add(item);
    }

    public void displayContent() {
        for (Object item : content) {
            if (item instanceof Article) {
                ((Article) item).display();
            } else if (item instanceof Image) {
                ((Image) item).display();
            } else if (item instanceof Video) {
                ((Video) item).display();
            }
        }
    }
}
