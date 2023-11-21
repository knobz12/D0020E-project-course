interface Authenticatable {
    boolean login(String username, String password);
}

interface Registerable {
    void register(String username, String password, String email);
}

public class GadgetStore {
    enum UserType {
        CUSTOMER,
        OWNER;
    }

    abstract static class User implements Authenticatable, Registerable {
        protected String username, password, email;
        protected UserType userType;

        public UserType getUserType() {
            return this.userType;
        }
    }

    static class Customer extends User {
        ShoppingCart cart = new ShoppingCart();

        @Override
        public void register(String username, String password, String email) {
            this.username = username;
            this.password = password;
            this.email = email;
            this.userType = UserType.CUSTOMER;
            // save user to database logic
        }

        @Override
        public boolean login(String username, String password) {
            // check against database logic
            return true;
        }
    }

    static class Owner extends User {
        @Override
        public void register(String username, String password, String email) {
            this.username = username;
            this.password = password;
            this.email = email;
            this.userType = UserType.OWNER;
            // save user to database logic
        }

        @Override
        public boolean login(String username, String password) {
            // check against database logic
            return true;
        }

        public void updateProduct(Product product, String name, double price, int stock) {
            product.updateProductInformation(name, price, stock);
        }
    }

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
        }
    }

    interface PaymentProcessor {
        void processPayment(String paymentType, double amount);
    }

    static class ShoppingCart {
        List<Product> products = new ArrayList<>();
        PaymentProcessor paymentProcessor;

        public ShoppingCart(PaymentProcessor processor) {
            this.paymentProcessor = processor;
        }

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
            paymentProcessor.processPayment(paymentType, totalAmount);
            // Deduct stock from the products
        }
    }

// Or use CreditCardPayment and PayPalPayment classes which fulfills SRP, OCP, and High Cohesion better.
    static class BasicPaymentProcessor implements PaymentProcessor {
        @Override
        public void processPayment(String paymentType, double amount) {
            if (paymentType.equals("CreditCard")) {
                // process credit card payment
            } else if (paymentType.equals("PayPal")) {
                // process PayPal payment
            }
        }
    }

    public static void main(String[] args) {
        Customer customer = new Customer();
        customer.register("johnDoe", "securePass", "john@email.com");
        if (customer.login("johnDoe", "securePass")) {
            Product phone = new Product("Smartphone", 299.99, 10); // dummy code since this is just a Mockup
            customer.cart.addProduct(phone);
            customer.cart.checkout("CreditCard");
        }

        Owner owner = new Owner();
        Product phone = new Product("Smartphone", 299.99, 10);
        owner.updateProduct(phone, "Advanced Smartphone", 399.99, 20);
    }
}
