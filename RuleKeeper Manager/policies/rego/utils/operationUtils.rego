package rulekeeper

# Get Operation from Endpoint
getOperation(endpoint) = operation {
    some op
    data.operation_endpoints[op].endpoint == endpoint
    operation := data.operation_endpoints[op].operation
}

# Get purposes of given operation
getOperationPurpose(operation) = purpose {
	some op
	data.operation_purposes[op].operation == operation
	purpose := data.operation_purposes[op].purpose
}

# Get maximum data of given purpose
getPurposeMaximumData(purpose) = maxData {
	some p
	data.maximum_data[p].purpose == purpose
	maxData := data.maximum_data[p].data
}

# Get lawfulness base of given purpose
getPurposeLawfulnessBase(purpose) = base {
	some p
	data.lawfulness_bases[p].purpose == purpose
	base := data.lawfulness_bases[p].base
}

# Check if operation requires consent
operationRequiresConsent {
    # Get operation purpose
    operation := getOperation(input.operation)
    purpose := getOperationPurpose(operation)
    # Get purpose lawfulness base
    base := getPurposeLawfulnessBase(purpose)
    base == ["consent", "contract"][_]
}
