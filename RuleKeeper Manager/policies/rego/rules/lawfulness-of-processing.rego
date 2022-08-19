package rulekeeper

default allowLawfulnessOfProcessing = false

# Allow if the lawfulness base is valid, and if it is, if the data subject gave consent, if needed
# exists p in purposes(o) and requires-consent(p) then, for all d in dataset(o), granted-consent(owner(d), d, p)

# Allow if the lawfulness base is valid and does not require consent verification
allowLawfulnessOfProcessing {
    not operationRequiresConsent
}

# Allow if the lawfulness base is valid and the data subject consented
allowLawfulnessOfProcessing {
	# If the principal is a data subject - check its consent
    principalIsDataSubject

    # Get operation
    operation := getOperation(input.operation)

    # Check purpose of the invoked operation
    purpose := getOperationPurpose(operation)

    # Check consent of the entity associated with the principal
    subjectConsent := getConsent(input.principal)

	# Check if subject has a valid lawfulness base for the purpose of the operation
	purpose == subjectConsent[_]
}

# Allow if the lawfulness base is valid and all the data subject consented
allowLawfulnessOfProcessing {
	# If the principal is not the data subject - check consent of all subjects involved
    principalIsControllerProcessor

	# Get operation
    operation := getOperation(input.operation)

    # Check purpose of the invoked operation
    purpose := getOperationPurpose(operation)

    # Get consent of the subjects
    subjectConsents := getSubjectsConsent

	# Check if all subjects have a valid lawfulness base for the purposes of the operation
    numberConsented := [consent | consent = subjectConsents[_]; purpose == consent[_]]

    # Check if all subjects have a valid lawfulness base for the purposes of the operation
    count(numberConsented) == count(input.subjects.list)
}
