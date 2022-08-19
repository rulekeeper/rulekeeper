package rulekeeper

default allow = false

# If there is personal data involved
allow {
	personalData := getPersonalData 
    allowDataMinimization(personalData)             # Allow if data is minimal
    allowPurposeLimitation(personalData)            # Allow if operation respects purpose
	allowLawfulnessOfProcessing       				# Allow if processing is lawful (has a valid lawfulness base and subject(s) consents, if applicable)
}

allow {
	count(getPersonalData) == 0
}
