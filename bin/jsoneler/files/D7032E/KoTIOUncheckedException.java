package se.ltu.softwareengineering.exception;

import se.ltu.softwareengineering.concept.Concept;

import java.util.function.Function;

/**
 * Unchecked wrapper around KoTIOException. Provide a way to use them with streams.
 */
public class KoTIOUncheckedException extends KoTUncheckedException{
    private KoTIOException cause;

    public KoTIOUncheckedException() {
    }

    public KoTIOUncheckedException(String message) {
        super(message);
    }

    public KoTIOUncheckedException(String message, KoTIOException cause) {
        super(message, cause);
        this.cause = cause;
    }

    public KoTIOUncheckedException(KoTIOException cause) {
        super(cause);
        this.cause = cause;
    }

    public KoTIOUncheckedException(String message, KoTIOException cause, boolean enableSuppression, boolean writableStackTrace) {
        super(message, cause, enableSuppression, writableStackTrace);
        this.cause = cause;
    }

    public static <T, R extends Concept> Function<T, R> wrapKotIOException(FunctionException<T, R, KoTIOException> function) {
        return (parameter) -> {
            try {
                return function.apply(parameter);
            } catch (KoTIOException e) {
                throw new KoTIOUncheckedException(e);
            }
        };
    }

    @Override
    public KoTIOException getCause() {
        return cause;
    }
}
