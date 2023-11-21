package se.ltu.softwareengineering.exception;

/**
 * Exception that are thrown by a network component.
 * Provide a better way to manage exception throughout the application.
 */

public class KoTNetworkException extends KoTException {
    public KoTNetworkException() {
    }

    public KoTNetworkException(String message) {
        super(message);
    }

    public KoTNetworkException(String message, Throwable cause) {
        super(message, cause);
    }

    public KoTNetworkException(Throwable cause) {
        super(cause);
    }

    public KoTNetworkException(String message, Throwable cause, boolean enableSuppression, boolean writableStackTrace) {
        super(message, cause, enableSuppression, writableStackTrace);
    }
}
