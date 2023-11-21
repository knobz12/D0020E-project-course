package se.ltu.softwareengineering.exception;

import java.io.IOException;

/**
 * Wrapper around standard IOException. Provide a better way to manage exception throughout the application.
 */
public class KoTIOException extends KoTException {
    public KoTIOException() {
    }

    public KoTIOException(String message) {
        super(message);
    }

    public KoTIOException(String message, IOException cause) {
        super(message, cause);
    }

    public KoTIOException(Throwable cause) {
        super(cause);
    }

    public KoTIOException(String message, IOException cause, boolean enableSuppression, boolean writableStackTrace) {
        super(message, cause, enableSuppression, writableStackTrace);
    }
}
