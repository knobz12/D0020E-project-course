package se.ltu.softwareengineering.exception;

/**
 * Unchecked wrapper around KoTException. Provide a way to use them with streams.
 */
public class KoTUncheckedException extends RuntimeException {
    private KoTException cause;

    public KoTUncheckedException() {
    }

    public KoTUncheckedException(String message) {
        super(message);
    }

    public KoTUncheckedException(String message, KoTException cause) {
        super(message, cause);
        this.cause = cause;
    }

    public KoTUncheckedException(KoTException cause) {
        super(cause);
        this.cause = cause;
    }

    public KoTUncheckedException(String message, KoTException cause, boolean enableSuppression, boolean writableStackTrace) {
        super(message, cause, enableSuppression, writableStackTrace);
        this.cause = cause;
    }

    @Override
    public KoTException getCause() {
        return cause;
    }
}
