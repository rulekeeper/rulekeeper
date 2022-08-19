/**
 * Responsible for handling errors.
 * @module Error handling
 * @category Utilities
 */

/**
 * Exits program orderly and prints error message and name.
 * @param error terminating error
 */
export function exit(error: Error) : void {
    console.log(`${error.name}: ${error.message}`)
    process.exit(0)
}
