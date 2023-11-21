import java.util.ArrayList;
import java.util.List;

// Creational Design Patterns
interface ContentFactory {
    Content createContent();
}

class ArticleFactory implements ContentFactory {
    @Override
    public Content createContent() {
        return new Article();
    }
}

class ImageFactory implements ContentFactory {
    @Override
    public Content createContent() {
        return new Image();
    }
}

class VideoFactory implements ContentFactory {
    @Override
    public Content createContent() {
        return new Video();
    }
}

// Structural Design Patterns
interface Content {
    void display();
}

class CompositeContent implements Content {
    private List<Content> contents = new ArrayList<>();

    public void addContent(Content content) {
        contents.add(content);
    }

    @Override
    public void display() {
        for (Content content : contents) {
            content.display();
        }
    }
}

class DecoratedContent implements Content {
    private Content content;
    private String decoration;

    public DecoratedContent(Content content, String decoration) {
        this.content = content;
        this.decoration = decoration;
    }

    @Override
    public void display() {
        System.out.println(decoration);
        content.display();
        System.out.println(decoration);
    }
}

// Behavioral Design Patterns
interface Observer {
    void update(String message);
}

class ContentPublisher {
    private List<Observer> observers = new ArrayList<>();

    public void addObserver(Observer observer) {
        observers.add(observer);
    }

    public void notifyObservers(String message) {
        for (Observer observer : observers) {
            observer.update(message);
        }
    }
}

class User implements Observer {
    private String username;

    public User(String username) {
        this.username = username;
    }

    @Override
    public void update(String message) {
        System.out.println(username + " received a notification: " + message);
    }
}

public class ImprovedCMS {
    public static void main(String[] args) {
        // Creational Design Patterns
        ContentFactory articleFactory = new ArticleFactory();
        ContentFactory imageFactory = new ImageFactory();
        ContentFactory videoFactory = new VideoFactory();

        // Structural Design Patterns
        CompositeContent website = new CompositeContent();
        website.addContent(articleFactory.createContent());
        website.addContent(imageFactory.createContent());
        website.addContent(videoFactory.createContent());

        // Behavioral Design Patterns
        ContentPublisher publisher = new ContentPublisher();
        User user1 = new User("User1");
        User user2 = new User("User2");
        publisher.addObserver(user1);
        publisher.addObserver(user2);
        publisher.notifyObservers("New content is available!");

        // Display content
        website.display();
    }
}
