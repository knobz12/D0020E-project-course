package se.ltu.softwareengineering.exception;

/**
 * @param <T> The type of the input to the function
 * @param <R> The type of the result of the function
 * @param <E> The type of the exception thrown by the function
 */
@FunctionalInterface
public interface FunctionException<T, R, E extends Throwable> {
    R apply(T parameter) throws E;
}