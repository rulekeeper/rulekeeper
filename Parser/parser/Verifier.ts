import { DataCollectionNewRule, DataLocationRule, OperationEndpointRule, OperationPurposeRule } from "./Rules";

export function getDataProcessing(dataCollectionNew: DataCollectionNewRule[], dataLocation: DataLocationRule[]) {
    const data_processing: any[] = []
    dataCollectionNew.forEach((dataCollection) => {
        const collectedMappedData: any[] = []
        dataCollection.data.forEach((data) => {
            const location = dataLocation.find(location => location.data == data)
            if (!location) console.log(`Data ${data} not mapped`) // TODO throw error
            else collectedMappedData.push({ table: location.table, column: location.column})
        });
        data_processing.push({ purpose: dataCollection.purpose, data: collectedMappedData})      
    });
    return data_processing;
}

export function getPersonalDataOperations(operationPurposes: OperationPurposeRule[], dataCollectionNew: DataCollectionNewRule[], operationEndpoint: OperationEndpointRule[]) {
    const personalDataOperations: any[] = []
    operationPurposes.forEach((operationPurpose) => {
        // if purpose of operation processes personal data, find the endpoint and add to array
        const collectedData = dataCollectionNew.find(dataCollection => dataCollection.purpose == operationPurpose.purpose)
        if (collectedData && collectedData.data.length > 0) {
            const endpoint = operationEndpoint.find((op => op.operation == operationPurpose.operation))
            if (endpoint) personalDataOperations.push(endpoint.endpoint);
        }
    });
    return personalDataOperations;
}

export function getDataProcessedByOperation(operationPurposes: OperationPurposeRule[], dataCollectionNew: DataCollectionNewRule[], operationEndpoint: OperationEndpointRule[], dataLocation: DataLocationRule[]) {
    const personalDataOperations: any[] = []
    operationPurposes.forEach((operationPurpose) => {
        const collectedData = dataCollectionNew.find(dataCollection => dataCollection.purpose == operationPurpose.purpose)
        if (collectedData && collectedData.data.length > 0) {
            // Map the collected data (by the purpose of the operation)
            const collectedMappedData: { table: String; column: String; }[] = []
            collectedData.data.forEach((data) => {
                const location = dataLocation.find(location => location.data == data)
                if (!location) console.log(`Data ${data} not mapped`) // TODO throw error
                else collectedMappedData.push({ table: location.table, column: location.column})
            });
            // Map the endpoint
            const endpoint = operationEndpoint.find((op => op.operation == operationPurpose.operation))
            if (endpoint)  personalDataOperations.push({operation: endpoint.endpoint, data: collectedMappedData});
        }
    });
    return personalDataOperations;
}