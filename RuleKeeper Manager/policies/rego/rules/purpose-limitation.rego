package rulekeeper

#default allowPurposeLimitation = false

# We want to allow the query if the purposes of the data being processed include the purpose of the operation
# for all t in typeset(o), exists pt in purposes(t), and exists po in purposes(o), such that po ∈ pt

allowPurposeLimitation(personalData) {
    # Get operation
    operation := getOperation(input.operation)

    # Check purpose of the invoked operation
    purpose := getOperationPurpose(operation)
    count(purpose) >= 1

	# Get collected purposes of the personal data (union)
	data_purposes := {p | p = data.data_purposes[_]; p.data == personalData[_]}

	# Check if processed all data purposes contain the purpose of the operation
    res := { x | x = data_purposes[_]; x.purposes[_] == purpose}
	count(res) == count(personalData)
}
