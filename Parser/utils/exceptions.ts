/**
 * Responsible for argument parsing and validation exceptions.
 * @module Argument Exceptions
 * @category Exceptions
 */

/**
 * Error when the path is not found.
 * Used in argument validation.
 */
 export class PathNotFound extends Error {
    constructor(message: string | undefined) {
        super(message);
        this.name = this.constructor.name
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Error when the path has invalid type.
 * Used in argument validation.
 */
 export class PathTypeInvalid extends Error {
    constructor(message: string | undefined) {
        super(message);
        this.name = this.constructor.name
        Error.captureStackTrace(this, this.constructor);
    }
}


/**
 * Error when there is an uncaught exception when parsing arguments.
 * Used in argument validation.
 */
 export class UnableToParseArguments extends Error {
    constructor(message: string | undefined) {
        super(message);
        this.name = this.constructor.name
        Error.captureStackTrace(this, this.constructor);
    }
}

