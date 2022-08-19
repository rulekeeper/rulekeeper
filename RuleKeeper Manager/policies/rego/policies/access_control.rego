package rulekeeper

default allow = false

# We want to allow the query if:
# (1) The role of the principal is authorized to perform the operation
# (2) If the operation does not require authorization

allow {
	isRoleAllowed
}

allow {
    isOperationAllowed
}

isRoleAllowed {
	role := getRole(input.principal) # Get principal role
	some i
	data.role_operations[i].role == role # Get authorizations associated with the role
	operations := data.role_operations[i].operations # Get all authorized operations
	operations[_] == getOperation(input.operation) # Verify if the query operation is authorized
}

isOperationAllowed {
	some i
    data.role_operations[i].role == "all" # Get all operations that do not require authorization
    operations := data.role_operations[i].operations
    operations[_] == getOperation(input.operation) # Verify if the query operation does not require authorization
}
