package rulekeeper
import future.keywords.in

# Verifies if the data parameter includes personal data
getPersonalData = personalData {
    personalData := { name | name := data.data_location[input.table][column].data; column in input.data; name in data.personal_data_items }
}