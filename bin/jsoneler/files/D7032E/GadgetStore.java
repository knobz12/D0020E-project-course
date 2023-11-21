import java.util.*;
public class GadgetStore {
    enum UserType {
        CUSTOMER,
        OWNER;
    }

    static class User {
        String username, password, email;
        UserType userType;
        ShoppingCart cart;

        public void register(String username, String password, String email, UserType userType) {
            this.username = username;
            this.password = password;
            this.email = email;
            this.userType = userType;
            if (this.userType == UserType.CUSTOMER) {
                this.cart = new ShoppingCart();
            }
            // save user to database logic
        }
        public boolean login(String username, String password) {
            // check against database logic
            return true;
        }
        public UserType getUserType() {
            // fetch userType from database
            return this.userType;
    }   }

    static class Product {
        String name;
        double price;
        int stock;

        public Product(String name, double price, int stock) {
            this.name = name;
            this.price = price;
            this.stock = stock;
        }
        public boolean isAvailable(int desired) {
            return stock >= desired;
        }
        public void updateProductInformation(String name, double price, int stock) {
            this.name = name;
            this.price = price;
            this.stock = stock;
    }   }

    static class ShoppingCart {
        List<Product> products = new ArrayList<>();

        public void addProduct(Product product) {
            if (product.isAvailable(1)) {
                products.add(product);
            }
        }
        public void checkout(String paymentType) {
            double totalAmount = 0.0;
            for (Product product : products) {
                totalAmount += product.price;
            }
            if (paymentType.equals("CreditCard")) {
                // process credit card payment
            } else if (paymentType.equals("PayPal")) {
                // process PayPal payment
            }
            // Deduct stock from the products
    }   }


    public static void main(String[] args) {
        User user = new User();
        user.register("johnDoe", "securePass", "john@email.com", UserType.CUSTOMER);
        if (user.login("johnDoe", "securePass")) {
            Product phone = new Product("Smartphone", 299.99, 10);
            if (user.getUserType() == UserType.CUSTOMER) {
                user.cart.addProduct(phone);
                user.cart.checkout("CreditCard");
            } else if (user.getUserType() == UserType.OWNER) {
                phone.updateProductInformation("Advanced Smartphone", 399.99, 20);
}   }   }   }
