import {
    ConsentRule,
    DataCollectionRule, DataCollectionNewRule,
    DataItemRule,
    DataLocationRule,
    DataMinimizationRule, DataOwnershipRule,
    EntityRepresentationRule,
    EntityRoleRule,
    EntityRule,
    LawfulnessBaseRule,
    OperationEndpointRule,
    OperationPurposeRule,
    OperationRule,
    PersonalDataItemRule,
    PrincipalRule,
    PurposeRule,
    RbacRoleRule,
    RoleOperationsRule
} from './Rules';
import { getDataProcessedByOperation, getDataProcessing, getPersonalDataOperations } from './Verifier';

export class Program {
    dataItems: DataItemRule[] = [];
    personalDataItems: PersonalDataItemRule[] = [];
    purposes: PurposeRule[] = [];
    dataCollection: DataCollectionRule[] = [];
    dataCollectionNew: DataCollectionNewRule[] = [];
    dataMinimization: DataMinimizationRule[] = [];
    dataLocation: DataLocationRule[] = [];
    operations: OperationRule[] = [];
    operationPurpose: OperationPurposeRule[] = [];
    roles: RbacRoleRule[] = [];
    principals: PrincipalRule[] = [];
    roleOperations: RoleOperationsRule[] = [];
    operationEndpoints: OperationEndpointRule[] = [];
    entities: EntityRule[] = [];
    entityRoles: EntityRoleRule[] = [];
    entityRepresentation: EntityRepresentationRule[] = [];
    lawfulnessBases: LawfulnessBaseRule[] = [];
    consents: ConsentRule[] = [];
    personalDataTables: DataOwnershipRule[] = [];


    generateRuntimeJson(): string {
        return JSON.stringify({
            "data_items": this.dataItems,
            "personal_data_items": this.personalDataItems,
            "purposes": this.purposes,
            "data_purposes": this.dataCollection,
            "maximum-data": this.dataMinimization,
            "data-location": this.dataLocation,
            "operations": this.operations,
            "operation_purposes": this.operationPurpose,
            "roles": this.roles,
            "principals": this.principals,
            "role_operations": this.roleOperations,
            "operation_endpoints": this.operationEndpoints,
            "entities": this.entities,
            "entity_roles": this.entityRoles,
            "entity_representation": this.entityRepresentation,
            "lawfulness_bases": this.lawfulnessBases,
            "consents": this.consents,
            "personal_data_tables": this.personalDataTables
        }, null, 3);
    }

    generateVerificationJson(): string {
        const data_processing = getDataProcessing(this.dataCollectionNew, this.dataLocation)
        const operations = getPersonalDataOperations(this.operationPurpose, this.dataCollectionNew, this.operationEndpoints)
        const data_operations = getDataProcessedByOperation(this.operationPurpose, this.dataCollectionNew, this.operationEndpoints, this.dataLocation)
        return JSON.stringify({
            "data_processing": data_processing,
            "operations": operations,
            "data_operations": data_operations
        })
    }

}
