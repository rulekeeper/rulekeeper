#!/usr/bin/env node
import * as fs from 'fs';
import { validateArgs, arguments } from "./utils/arguments";
import parseProgram from "./parser/Parser";


const args: arguments = validateArgs()  // Validate program arguments

// Read file content
const fileContent = fs.readFileSync(`inputs/${args.input}`, 'utf8');

// Parse program
const program = parseProgram(fileContent);

// Generate runtime json
const jsonRuntimeProgram = program.generateRuntimeJson();
fs.writeFileSync(`outputs/${args.input}`, jsonRuntimeProgram, 'utf8');

// Generate verifier json
const jsonVerifierProgram = program.generateVerificationJson();
fs.writeFileSync(`outputs/${args.input}-verifier`, jsonVerifierProgram, 'utf8');
