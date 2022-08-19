package rulekeeper

# Verifies if principal is the data subject
principalIsDataSubject {
	# Get entity that principal represents
	entity := getEntity(input.principal)

	# Get gdpr role associated with the entity
	roles := getGDPRroles(entity)

	# Check if entity is data_subject
	roles[_] == "Data Subject"
}

# Verifies if principal is the controller or processor
principalIsControllerProcessor {
	# Get entity that principal represents
	entity := getEntity(input.principal)

	# Get gdpr role associated with the entity
	roles := getGDPRroles(entity)

	# Check if entity is data_subject
	roles[_] == ["Data Processor", "Data Controller"][_]
}

# Get entity that principal represents
getEntity(principal) = entity {
	entity := data.principals[principal].entity
}


# Get principal role
getRole(principal) = role {
	role := data.principals[principal].role
}

# Get gdpr roles associated with the entity
getGDPRroles(entity) = roles {
    roles := data.entities[entity].roles
}

# Get consent of principal
getConsent(principal) = consent {
	entity := getEntity(principal)
    consent := data.consents[entity].purposes
}

# Get consent of entity
getConsentEntity(entity) = consent {
    consent := data.consents[entity].purposes
}

getSubjectsConsent = consents {
    consents := [ x | subject := input.subjects.list[_]; x := getConsentEntity(subject) ]
}
