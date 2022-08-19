import { Program } from "./Program";
import {
    parseConsent,
    parseDataCollection, parseDataCollectionNew,
    parseDataItems,
    parseDataLocation,
    parseDataMinimization, parseDataOwnership,
    parseEntity,
    parseEntityRepresentation,
    parseEntityRole, parseLawfulnessBase,
    parseOperation,
    parseOperationEndpoint,
    parseOperationPurpose,
    parsePersonalDataItems,
    parsePrincipal,
    parsePurpose,
    parseRbacRole,
    parseRoleOperations
} from "./Rules";

/**
 * Parses the input into a Program, filling the corresponding dsl rules
 * @param str input
 */
function parseProgram(str: String): Program {
    const tokens: String[] = tokenize(str);
    const program = new Program();
    parse(program, tokens);
    return program;
}

/**
 * Divides the input string into relevant tokens: strings () ,
 * @param str input
 */
function tokenize(str: String): Array<String> {
    const matches = str.match(/,|\)|\(|\[|\]|(?:\w\s*|-|\.|\/|:)+/g);
    return matches == null ? [] : matches;
}

/**
 * Parses each rule individually
 * @param program
 * @param tokens
 */
function parse(program: Program, tokens: Array<String>) : void {
    // If there are no tokens left, program has ended
    if (tokens.length == 0) return;

    //The first token represents which type of dsl rule we want to parse
    const firstToken = tokens[0];
    // The remaining tokens for the next parse
    let remainingTokens = [];

    switch(firstToken) {
        case "data-item":
            const dataItem = parseDataItems(tokens);
            const dataItemRule = dataItem.value; //get the value
            remainingTokens = dataItem.remainingTokens; //get the remaining tokens
            program.dataItems.push(dataItemRule); //add rule to program
            parse(program, remainingTokens); //continue to parse
            break;
        case "personal-data-item":
            const personalDataItem = parsePersonalDataItems(tokens);
            const personalDataItemRule = personalDataItem.value; //get the value
            remainingTokens = personalDataItem.remainingTokens; //get the remaining tokens
            program.personalDataItems.push(personalDataItemRule); //add rule to program
            parse(program, remainingTokens); //continue to parse
            break;
        case "purpose":
            const purpose = parsePurpose(tokens);
            const purposeRule = purpose.value; //get the value
            remainingTokens = purpose.remainingTokens; //get the remaining tokens
            program.purposes.push(purposeRule); //add rule to program
            parse(program, remainingTokens); //continue to parse
            break;
        case "collected-for":
            const dataCollection = parseDataCollection(tokens);
            const dataCollectionRule = dataCollection.value; //get the value
            remainingTokens = dataCollection.remainingTokens; //get the remaining tokens
            program.dataCollection.push(dataCollectionRule); //add rule to program
            parse(program, remainingTokens); //continue to parse
            break;
        case "collected-for-new":
            const dataCollectionNew = parseDataCollectionNew(tokens);
            const dataCollectionNewRule = dataCollectionNew.value; //get the value
            remainingTokens = dataCollectionNew.remainingTokens; //get the remaining tokens
            program.dataCollectionNew.push(dataCollectionNewRule); //add rule to program
            parse(program, remainingTokens); //continue to parse
            break;
        case "max-personal-data":
            const maximumData = parseDataMinimization(tokens);
            const maximumDataRule = maximumData.value; //get the value
            remainingTokens = maximumData.remainingTokens; //get the remaining tokens
            program.dataMinimization.push(maximumDataRule); //add rule to program
            parse(program, remainingTokens); //continue to parse
            break;
        case "map-data":
            const dataLocation = parseDataLocation(tokens);
            const dataLocationRule = dataLocation.value; //get the value
            remainingTokens = dataLocation.remainingTokens; //get the remaining tokens
            program.dataLocation.push(dataLocationRule); //add rule to program
            parse(program, remainingTokens); //continue to parse
            break;
        case "operation":
            const operation = parseOperation(tokens);
            const operationRule = operation.value; //get the value
            remainingTokens = operation.remainingTokens; //get the remaining tokens
            program.operations.push(operationRule); //add rule to program
            parse(program, remainingTokens); //continue to parse
            break;
        case "executed-for":
            const operationPurpose = parseOperationPurpose(tokens);
            const operationPurposeRule = operationPurpose.value; //get the value
            remainingTokens = operationPurpose.remainingTokens; //get the remaining tokens
            program.operationPurpose.push(operationPurposeRule); //add rule to program
            parse(program, remainingTokens); //continue to parse
            break;
        case "rbac-role":
            const rbacRole = parseRbacRole(tokens);
            const rbacRoleRule = rbacRole.value; //get the value
            remainingTokens = rbacRole.remainingTokens; //get the remaining tokens
            program.roles.push(rbacRoleRule); //add rule to program
            parse(program, remainingTokens); //continue to parse
            break;
        case "principal":
            const principal = parsePrincipal(tokens);
            const principalRule = principal.value; //get the value
            remainingTokens = principal.remainingTokens; //get the remaining tokens
            program.principals.push(principalRule); //add rule to program
            parse(program, remainingTokens); //continue to parse
            break;
        case "role-operations":
            const roleOperation = parseRoleOperations(tokens);
            const roleOperationRule = roleOperation.value; //get the value
            remainingTokens = roleOperation.remainingTokens; //get the remaining tokens
            program.roleOperations.push(roleOperationRule); //add rule to program
            parse(program, remainingTokens); //continue to parse
            break;
        case "map-operation":
            const operationEndpoint = parseOperationEndpoint(tokens);
            const operationEndpointRule = operationEndpoint.value; //get the value
            remainingTokens = operationEndpoint.remainingTokens; //get the remaining tokens
            program.operationEndpoints.push(operationEndpointRule); //add rule to program
            parse(program, remainingTokens); //continue to parse
            break;
        case "entity":
            const entity = parseEntity(tokens);
            const entityRule = entity.value; //get the value
            remainingTokens = entity.remainingTokens; //get the remaining tokens
            program.entities.push(entityRule); //add rule to program
            parse(program, remainingTokens); //continue to parse
            break;
        case "gdpr-roles":
            const entityRole = parseEntityRole(tokens);
            const entityRoleRule = entityRole.value; //get the value
            remainingTokens = entityRole.remainingTokens; //get the remaining tokens
            program.entityRoles.push(entityRoleRule); //add rule to program
            parse(program, remainingTokens); //continue to parse
            break;
        case "principal-represents":
            const entityRepresentation = parseEntityRepresentation(tokens);
            const entityRepresentationRule = entityRepresentation.value; //get the value
            remainingTokens = entityRepresentation.remainingTokens; //get the remaining tokens
            program.entityRepresentation.push(entityRepresentationRule); //add rule to program
            parse(program, remainingTokens); //continue to parse
            break;
        case "lawfulness-base":
            const lawfulnessBase = parseLawfulnessBase(tokens);
            const lawfulnessBaseRule = lawfulnessBase.value; //get the value
            remainingTokens = lawfulnessBase.remainingTokens; //get the remaining tokens
            program.lawfulnessBases.push(lawfulnessBaseRule); //add rule to program
            parse(program, remainingTokens); //continue to parse
            break;
        case "purpose-consent":
            const consent = parseConsent(tokens);
            const consentRule = consent.value; //get the value
            remainingTokens = consent.remainingTokens; //get the remaining tokens
            program.consents.push(consentRule); //add rule to program
            parse(program, remainingTokens); //continue to parse
            break;
        case "data-ownership":
            const personalDataTable = parseDataOwnership(tokens);
            const personalDataTableRule = personalDataTable.value; //get the value
            remainingTokens = personalDataTable.remainingTokens; //get the remaining tokens
            program.personalDataTables.push(personalDataTableRule); //add rule to program
            parse(program, remainingTokens); //continue to parse
            break;
        default:
            console.log("Error parsing rule " + firstToken);
    }
}

export = parseProgram;
