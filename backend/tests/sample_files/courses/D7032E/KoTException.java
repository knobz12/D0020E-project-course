package se.ltu.softwareengineering.exception;

/**
 * Generic exception thrown by this application
 */
public class KoTException extends Exception {
    public KoTException() {
    }

    public KoTException(String message) {
        super(message);
    }

    public KoTException(String message, Throwable cause) {
        super(message, cause);
    }

    public KoTException(Throwable cause) {
        super(cause);
    }

    public KoTException(String message, Throwable cause, boolean enableSuppression, boolean writableStackTrace) {
        super(message, cause, enableSuppression, writableStackTrace);
    }
}
