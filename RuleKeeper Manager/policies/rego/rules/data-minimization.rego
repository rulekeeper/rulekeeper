package rulekeeper

#default allowDataMinimization = false

# Allow if the operation does not process more data that the maximum data allowed for the purpose of the operation
# for all t in typeset(o), exists pt in purposes(t), such that t ∈ maximum-data(pt)

allowDataMinimization(personalData) {

    # Get operation
    operation := getOperation(input.operation)

	# Get minimal data of the purpose of the operation
    purpose := getOperationPurpose(operation)
    minimalData := getPurposeMaximumData(purpose)

    # Check if the operation is not processing more data than required
    # personal data <= minimal data
	res := {d | d = personalData[_]; d == minimalData[_]}

	count(res) == count(personalData)
}
