/**
 * Base error class for the application
 */
class AppError extends Error {
    constructor(message, code = 'INTERNAL_SERVER_ERROR') {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
    }
}

/**
 * Error thrown when there's a bad request
 */
class BadRequestError extends AppError {
    constructor(message) {
        super(message, 'BAD_REQUEST');
    }
}

/**
 * Error thrown when a resource is not found
 */
class NotFoundError extends AppError {
    constructor(message) {
        super(message, 'NOT_FOUND');
    }
}

/**
 * Error thrown when there's an authentication failure
 */
class AuthenticationError extends AppError {
    constructor(message) {
        super(message, 'AUTHENTICATION_ERROR');
    }
}

/**
 * Error thrown when there's an authorization failure
 */
class AuthorizationError extends AppError {
    constructor(message) {
        super(message, 'AUTHORIZATION_ERROR');
    }
}

module.exports = {
    AppError,
    BadRequestError,
    NotFoundError,
    AuthenticationError,
    AuthorizationError
};