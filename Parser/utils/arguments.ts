/**
 * Responsible for argument parsing and validation.
 * @module Argument Parsing
 * @category Utilities
 */

import * as fs from 'fs';
import { Command, OptionValues } from 'commander';
import { PathNotFound, PathTypeInvalid, UnableToParseArguments } from "./exceptions";
import { exit } from "./errors";


/**
 * Expected one argument - input file.
 */
 export type arguments = { input: string };


/**
 * Validates if the file exists. If not, throws error.
 * @param path - path of the directory.
 * @exception PathNotFound, PathTypeInvalid
 */
 function validateInput(path: string): string {
    if (!fs.existsSync(`inputs/${path}`)) throw new PathNotFound(`${path} does not exist.`);
    if (!fs.lstatSync(`inputs/${path}`).isFile()) throw new PathTypeInvalid(`${path} is not a file.`);
    return path;
}

export function validateArgs(): arguments {
    const program: Command = new Command();
    program.version('0.0.1')
    try {
        program.option('-i --input <path>', 'File that contains the input policy.', validateInput)
        program.parse();
        const options: OptionValues = program.opts();
        if (options.input) return { input: options.input }
    } catch (error) {
        if (error instanceof PathNotFound || error instanceof PathTypeInvalid) exit(error)
        else throw error;
    }
    throw new UnableToParseArguments(`Error parsing arguments.`)
}