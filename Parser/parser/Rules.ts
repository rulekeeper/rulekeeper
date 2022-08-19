import assert = require('assert');

// Rule Types
export type DataItemRule = String;
export type PersonalDataItemRule = String;
export type PurposeRule = String;
export type DataCollectionRule = { data: String, purposes: Array<String>};
export type DataCollectionNewRule = { purpose: String, data: Array<String>};
export type DataMinimizationRule = { purpose: String, data: Array<String>};
export type DataLocationRule = { data: String, table: String, column: String};
export type OperationRule = String;
export type OperationEndpointRule = { operation: String, endpoint: String };
export type OperationPurposeRule = { operation: String, purpose: String };
export type RbacRoleRule = String;
export type PrincipalRule = { principal: String, role: String };
export type EntityRule = String;
export type EntityRoleRule = { entity: String, roles: Array<String> };
export type EntityRepresentationRule = { principal: String, entity: String };
export type RoleOperationsRule = { role: String, operations: Array<String>};
export type LawfulnessBaseRule = { purpose: String, base: String };
export type ConsentRule = { dataSubject: String, purposes: Array<String>};
export type DataOwnershipRule = { table: String, column: String};

/**
 * Parses DataItems Rules
 * @param tokens
 */
export const parseDataItems = (tokens: Array<String>) => {
    // This rule needs at least 4 tokens: "data-item", "(", item, ")"
    assert(tokens.length >= 4)
    // Assert token values
    validateSimpleRule("data-item", tokens.slice(0,4))
    // Get values
    const dataItem: DataItemRule = tokens[2]
    const remainingTokens : Array<String> = tokens.slice(4)
    return { value: dataItem, remainingTokens }
};

/**
 * Parses PersonalDataItems Rules
 * @param tokens
 */
export const parsePersonalDataItems = (tokens: Array<String>) => {
    // This rule needs at least 4 tokens: "personal-data-item", "(", item, ")"
    assert(tokens.length >= 4)
    // Assert token values
    validateSimpleRule("personal-data-item", tokens.slice(0,4))
    // Get values
    const personalDataItem: PersonalDataItemRule = tokens[2]
    const remainingTokens : Array<String> = tokens.slice(4)
    return { value: personalDataItem, remainingTokens }
};

/**
 * Parses Purpose Rules
 * @param tokens
 */
export const parsePurpose = (tokens: Array<String>) => {
    // This rule needs at least 4 tokens: "purpose", "(", purpose, ")"
    assert(tokens.length >= 4)
    // Assert token values
    validateSimpleRule("purpose", tokens.slice(0,4))
    // Get values
    const purpose: PurposeRule = tokens[2]
    const remainingTokens : Array<String> = tokens.slice(4)
    return { value: purpose, remainingTokens }
};

/**
 * Parses Data Collection Rules
 * @param tokens
 */
export const parseDataCollection = (tokens: Array<String>) => {
    // This rule needs at least 8 tokens: "collected-for", "(", data, ",", "[", purpose, "]", ")"
    assert(tokens.length >= 8)
    // Assert token values
    validateTupleArrayRule("collected-for", tokens)

    // Get data item
    const data: DataItemRule = tokens[2]
    // Parse array with purposes
    let remainingTokens : Array<String> = tokens.slice(4)
    const arrayValue = parseArray(remainingTokens)
    const purposes = arrayValue.elements
    remainingTokens = arrayValue.tokens

    // Verify that the rule ended
    assert(remainingTokens.shift() == ")")
    return { value: { data, purposes }, remainingTokens }
};

/**
 * Parses Data Minimization Rules
 * @param tokens
 */
export const parseDataCollectionNew = (tokens: Array<String>) => {
    // This rule needs at least 8 tokens: "collected-for-new", "(", purpose, ",", "[", data, "]", ")"
    assert(tokens.length >= 8)
    // Assert token values
    validateTupleArrayRule("collected-for-new", tokens)

    // Get data item
    const purpose: PurposeRule = tokens[2]
    // Parse array with purposes
    let remainingTokens : Array<String> = tokens.slice(4)
    const arrayValue = parseArray(remainingTokens)
    const data = arrayValue.elements
    remainingTokens = arrayValue.tokens

    // Verify that the rule ended
    assert(remainingTokens.shift() == ")")
    return { value: { purpose, data }, remainingTokens }
};

export const parseDataMinimization = (tokens: Array<String>) => {
    // This rule needs at least 8 tokens: "max-personal-data", "(", purpose, ",", "[", data, "]", ")"
    assert(tokens.length >= 8)
    // Assert token values
    validateTupleArrayRule("max-personal-data", tokens)

    // Get data item
    const purpose: PurposeRule = tokens[2]
    // Parse array with purposes
    let remainingTokens : Array<String> = tokens.slice(4)
    const arrayValue = parseArray(remainingTokens)
    const data = arrayValue.elements
    remainingTokens = arrayValue.tokens

    // Verify that the rule ended
    assert(remainingTokens.shift() == ")")
    return { value: { purpose, data }, remainingTokens }
};

/**
 * Parses Data Location Rules
 * @param tokens
 */
export const parseDataLocation = (tokens: Array<String>) => {
    // This rule needs at least 8 tokens: "map-data", "(", data, ",", table, "," column, ")"
    assert(tokens.length >= 8)
    // Assert token values
    validateTripleRule("map-data", tokens.slice(0,8))

    const dataLocation: DataLocationRule = {
        data: tokens[2],
        table: tokens[4],
        column: tokens[6]
    }
    const remainingTokens : Array<String> = tokens.slice(8)
    return { value: dataLocation, remainingTokens }
};

/**
 * Parses Operation Rules
 * @param tokens
 */
export const parseOperation = (tokens: Array<String>) => {
    // This rule needs at least 4 tokens: "operation", "(", purpose, ")"
    assert(tokens.length >= 4)
    // Assert token values
    validateSimpleRule("operation", tokens.slice(0,4))
    // Get values
    const operation: OperationRule = tokens[2]
    const remainingTokens : Array<String> = tokens.slice(4)
    return { value: operation, remainingTokens }
};

/**
 * Parses Operation Purposes Rules
 * @param tokens
 */
export const parseOperationPurpose = (tokens: Array<String>) => {
    // This rule needs at least 6 tokens: "executed-for", "(", operation, ",", purpose, ")"
    assert(tokens.length >= 6)
    // Assert token values
    validateTupleRule("executed-for", tokens.slice(0,6))
    // Get values
    const operation: OperationRule = tokens[2]
    const purpose: PurposeRule = tokens[4]
    const remainingTokens : Array<String> = tokens.slice(6)
    return { value: { operation, purpose }, remainingTokens }
};

/**
 * Parses RBAC Role Rules
 * @param tokens
 */
export const parseRbacRole = (tokens: Array<String>) => {
    // This rule needs at least 4 tokens: "rbac-role", "(", role, ")"
    assert(tokens.length >= 4)
    // Assert token values
    validateSimpleRule("rbac-role", tokens.slice(0,4))
    // Get values
    const rbacRole: RbacRoleRule = tokens[2]
    const remainingTokens : Array<String> = tokens.slice(4)
    return { value: rbacRole, remainingTokens }
};

/**
 * Parses Principal Rules
 * @param tokens
 */
export const parsePrincipal = (tokens: Array<String>) => {
    // This rule needs at least 6 tokens: "principal", "(", principal, ",", role, ")"
    assert(tokens.length >= 6)
    // Assert token values
    validateTupleRule("principal", tokens.slice(0,6))
    // Get values
    const principal: String = tokens[2]
    const role: RbacRoleRule = tokens[4]
    const remainingTokens : Array<String> = tokens.slice(6)
    return { value: { principal, role }, remainingTokens }
};

/**
 * Parses Role Operations Rules
 * @param tokens
 */
export const parseRoleOperations = (tokens: Array<String>) => {
    // This rule needs at least 8 tokens: "role-operations", "(", role, ",", "[", operation, "]", ")"
    assert(tokens.length >= 8)
    // Assert token values
    validateTupleArrayRule("role-operations", tokens)

    // Get role
    const role: RbacRoleRule = tokens[2]
    // Parse array with operations
    let remainingTokens : Array<String> = tokens.slice(4)
    const arrayValue = parseArray(remainingTokens)
    const operations = arrayValue.elements
    remainingTokens = arrayValue.tokens

    // Verify that the rule ended
    assert(remainingTokens.shift() == ")")

    return { value: { role, operations }, remainingTokens }
};

/**
 * Parses Operation Mapping Rules
 * @param tokens
 */
export const parseOperationEndpoint = (tokens: Array<String>) => {
    // This rule needs at least 6 tokens: "map-operation", "(", operation, ",", endpoint, ")"
    assert(tokens.length >= 6)
    // Assert token values
    validateTupleRule("map-operation", tokens.slice(0,6))
    // Get values
    const operation: OperationRule = tokens[2]
    const endpoint: String = tokens[4]
    const remainingTokens : Array<String> = tokens.slice(6)
    return { value: { operation, endpoint }, remainingTokens }
};

/**
 * Parses Entity Rules
 * @param tokens
 */
export const parseEntity = (tokens: Array<String>) => {
    // This rule needs at least 4 tokens: "entity", "(", entity, ")"
    assert(tokens.length >= 4)
    // Assert token values
    validateSimpleRule("entity", tokens.slice(0,4))
    // Get values
    const entity: EntityRule = tokens[2]
    const remainingTokens : Array<String> = tokens.slice(4)
    return { value: entity, remainingTokens }
};

/**
 * Parses Entity GDPR Role Rules
 * @param tokens
 */
export const parseEntityRole = (tokens: Array<String>) => {
    // This rule needs at least 8 tokens: "gdpr-role", "(", entity, ",", "[", role, "]", ")"
    assert(tokens.length >= 8)
    // Assert token values
    validateTupleArrayRule("gdpr-roles", tokens)

    // Get entity
    const entity: String = tokens[2]
    // Parse array with operations
    let remainingTokens : Array<String> = tokens.slice(4)
    const arrayValue = parseArray(remainingTokens)
    const roles = arrayValue.elements
    remainingTokens = arrayValue.tokens

    // Verify that the rule ended
    assert(remainingTokens.shift() == ")")

    return { value: { entity, roles }, remainingTokens }
};

/**
 * Parses Entity Representation Rules
 * @param tokens
 */
export const parseEntityRepresentation = (tokens: Array<String>) => {
    // This rule needs at least 6 tokens: "principal-represents", "(", principal, ",", entity, ")"
    assert(tokens.length >= 6)
    // Assert token values
    validateTupleRule("principal-represents", tokens.slice(0,6))
    // Get values
    const principal: String = tokens[2]
    const entity: String = tokens[4]
    const remainingTokens : Array<String> = tokens.slice(6)
    return { value: { principal, entity }, remainingTokens }
};

/**
 * Parses Lawfulness Base Rules
 * @param tokens
 */
export const parseLawfulnessBase = (tokens: Array<String>) => {
    // This rule needs at least 6 tokens: "lawfulness-base", "(", purpose, ",", base, ")"
    assert(tokens.length >= 6)
    // Assert token values
    validateTupleRule("lawfulness-base", tokens.slice(0,6))
    // Get values
    const purpose: String = tokens[2]
    const base: String = tokens[4]
    const remainingTokens : Array<String> = tokens.slice(6)
    return { value: { purpose, base }, remainingTokens }
};

/**
 * Parses Consent Rules
 * @param tokens
 */
export const parseConsent = (tokens: Array<String>) => {
    // This rule needs at least 8 tokens: "purpose-consent", "(", data-subject, ",", "[", purpose, "]", ")"
    assert(tokens.length >= 8)
    // Assert token values
    validateTupleArrayRule("purpose-consent", tokens)

    // Get role
    const dataSubject: String = tokens[2]
    // Parse array with purposes
    let remainingTokens : Array<String> = tokens.slice(4)
    const arrayValue = parseArray(remainingTokens)
    const purposes = arrayValue.elements
    remainingTokens = arrayValue.tokens

    // Verify that the rule ended
    assert(remainingTokens.shift() == ")")

    return { value: { dataSubject, purposes }, remainingTokens }
};

/**
 * Parses Data Ownership Rules
 * @param tokens
 */
export const parseDataOwnership = (tokens: Array<String>) => {
    // This rule needs at least 6 tokens: "data-ownership", "(", table, ",", column, ")"
    assert(tokens.length >= 6)
    // Assert token values
    validateTupleRule("data-ownership", tokens.slice(0,6))
    // Get values
    const table: String = tokens[2]
    const column: String = tokens[4]
    const remainingTokens : Array<String> = tokens.slice(6)
    return { value: { table, column }, remainingTokens }
};


/**
 * This function receives an array and returns the elements inside the array and the last token consumed
 */
function parseArray(tokens: Array<String>): { elements: Array<String>, tokens: Array<String>} {
    let elements: String[] = []

    // Verify that the first token is the array delimiter
    let token: String | undefined = tokens.shift()
    assert(token == "[")

    // Iterate over the tokens, until we find a match ] and ) to define the end of the array
    for (token = tokens.shift(); tokens.length > 0; token = tokens.shift()) {
        if (token == "]") { break; }
        if (token != null && token != ",") elements.push(token)
    }

    return {elements, tokens};
}

/**
 * This function validates a simple rule
 * @param ruleType
 * @param tokens
 */
function validateSimpleRule(ruleType: String, tokens: Array<String>) {
    const type = tokens[0]
    assert(type == ruleType)
    assert(tokens[1] == "(")
    assert(tokens[3] == ")")
}

/**
 * This function validates a tuple rule
 * @param ruleType
 * @param tokens
 */
function validateTupleRule(ruleType: String, tokens: Array<String>) {
    const type = tokens[0]
    assert(type == ruleType)
    assert(tokens[1] == "(")
    assert(tokens[3] == ",")
    assert(tokens[5] == ")")
}

/**
 * This function validates a tuple rule with array
 * @param ruleType
 * @param tokens
 */
function validateTupleArrayRule(ruleType: String, tokens: Array<String>) {
    const type = tokens[0]
    assert(type == ruleType)
    assert(tokens[1] == "(")
    assert(tokens[3] == ",")
    assert(tokens[4] == "[")
    assert(tokens.indexOf("]") != -1)
    assert(tokens.indexOf(")") != -1)
}

/**
 * This function validates a triple rule
 * @param ruleType
 * @param tokens
 */
function validateTripleRule(ruleType: String, tokens: Array<String>) {
    const type = tokens[0]
    assert(type == ruleType)
    assert(tokens[1] == "(")
    assert(tokens[3] == ",")
    assert(tokens[5] == ",")
    assert(tokens[7] == ")")
}
