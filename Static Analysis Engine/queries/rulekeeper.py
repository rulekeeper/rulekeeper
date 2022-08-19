from neo4j import GraphDatabase
import json

## RETURN
# CallExpression
def find_function_calls(session, functionName):
	functionCalls = []
	with session.begin_transaction() as tx:
		# QUERY 1
		# get CallExpression that holds the call to a functionName
		query = f"""
            MATCH
                (c:CallExpression)-[callee:AST]->(i:Identifier)
            WHERE
                i.IdentifierName = "{functionName}" AND
                callee.RelationType = "callee"
			RETURN *
		"""
		queryResults = tx.run(query)
		for record in queryResults:
			functionCalls.append(record['c'])
	return functionCalls


def find_pdg_object(session, variableId):
    results = []
    with session.begin_transaction() as tx:
            # QUERY 2
            # get PDGObject resulting from the require a package
        query = f"""
                MATCH (v)-[c:OBJECT]->(o:PDG_OBJECT)
                WHERE v.Id="{variableId}" AND c.RelationType="CREATE"
                RETURN *
            """
        queryResults = tx.run(query)
        for record in queryResults:
            results.append(record["o"])
    return results


## RETURN
# {
#     variable: variableDeclarator,
#     object: PDF_OBJECT
# }
def find_require_calls(session, packageName):
    requireCalls = find_function_calls(session, "require")

    variablesHoldingPackages = []
    for call in requireCalls:
        callId = call.id
        with session.begin_transaction() as tx:
            # QUERY 3
            # get VariableDeclarator that holds the call to a functionName
            query = f"""
                MATCH
                    (v:VariableDeclarator)-[:AST]->(c:CallExpression)-[r:AST]->(l:Literal)
                WHERE
                    c.Id = "{callId}" AND
                    r.RelationType = "arg" AND
                    r.ArgumentIndex = "1" AND
                    l.Value = "{packageName}"
                RETURN *
            """
            queryResults = tx.run(query)
            for record in queryResults:
                variablesHoldingPackages.append(record['v'])

    packageObject = {}
    for variable in variablesHoldingPackages:
        variableId = variable.id
        pdgObject = find_pdg_object(session, variableId)[0]
        packageObject = {
            "variable": variable,
            "object": pdgObject
        }
    return packageObject


def find_lookup_property(session, objectId, propertyName):
    lookupVariables = []
    with session.begin_transaction() as tx:
        # QUERY 4
        # get variables holding the model function
        query = f"""
            MATCH
                (o:PDG_OBJECT)-[dep:PDG]->(v:VariableDeclarator)
            WHERE
                o.Id="{objectId}" AND
                dep.RelationType="LOOKUP" AND
                dep.IdentifierName="{propertyName}"
            RETURN *
        """
        queryResults = tx.run(query)
        for record in queryResults:
            lookupVariables.append(record["v"])

    return lookupVariables


def find_call_with_no_param(session, fundDeclId, funcCallName):
    results = []
    with session.begin_transaction() as tx:
        # QUERY 5
        # get call to the router function
        query = f"""
            MATCH
                (v)-[dep:PDG]->(stmt)-[:AST]->(c:CallExpression)-[callee:AST]->(i:Identifier)
            WHERE
                v.Id="{fundDeclId}" AND
                dep.RelationType="VAR" AND
                dep.IdentifierName="{funcCallName}" AND
                callee.RelationType="callee" AND
                i.IdentifierName="{funcCallName}"
            RETURN *
        """
        queryResults = tx.run(query)
        for record in queryResults:
            results.append(record["stmt"])
    return results


def find_calls_with_one_param(session, fundDeclId, funcCallName):
    results = []
    with session.begin_transaction() as tx:
        # QUERY 6
        # get calls to the mongoose model function
        query = f"""
            MATCH
                (v1)-[dep:PDG]->(stmt)-[:AST]->(c:CallExpression)-[callee:AST]->(i:Identifier),
                (c)-[arg:AST]->(l:Literal)
            WHERE
                v1.Id="{fundDeclId}" AND
                dep.RelationType="VAR" AND
                dep.IdentifierName="{funcCallName}" AND
                callee.RelationType="callee" AND
                i.IdentifierName="{funcCallName}" AND
                arg.RelationType="arg" AND
                arg.ArgumentIndex="1"
            RETURN *
        """
        queryResults = tx.run(query)
        for record in queryResults:
            results.append({
                "stmt": record["stmt"], # could be VariableDeclarator or ExpressionsStatement
                "param_value": record["l"]["Value"]
            })
    return results


def find_mongoose_model_calls(session, mongooseObject):
    mongooseObjectId = mongooseObject["object"].id
    modelFunctionVariable = find_lookup_property(session, mongooseObjectId, "model")

    models = []
    for modelFunction in modelFunctionVariable:
        modelFunctionId = modelFunction.id
        modelFunctionName = modelFunction["IdentifierName"]
        for model in find_calls_with_one_param(session, modelFunctionId, modelFunctionName):
            models.append(model)

    return models


def find_express_router_methods(session, expressObject):
    expressObjectId = expressObject["object"].id
    routerFunctions = find_lookup_property(session, expressObjectId, "Router")
    routerCall = None
    methods = []

    for routerFunction in routerFunctions:
        routerFunctionId = routerFunction.id
        routerFunctionName = routerFunction["IdentifierName"]
        routerCalls = find_call_with_no_param(session, routerFunctionId, routerFunctionName)

        for routerCall in routerCalls:
            routerCallId = routerCall.id
            routerObject = find_pdg_object(session, routerCallId)[0]
            if routerObject:
                routerObjectId = routerObject.id

                postFunctions = find_lookup_property(session, routerObjectId, "post")
                for post in postFunctions:
                    postFunctionId = post.id
                    postFunctionName = post["IdentifierName"]
                    postCall = find_calls_with_one_param(session, postFunctionId, postFunctionName)[0]
                    postCallback = find_methods_callback(session, postCall["stmt"].id)[0]
                    methods.append({
                        "endpoint_type": "POST",
                        "endpoint": postCall,
                        "callback": postCallback
                    })

                getFunctions = find_lookup_property(session, routerObjectId, "get")
                for get in getFunctions:
                    getFunctionId = get.id
                    getFunctionName = get["IdentifierName"]
                    getCall = find_calls_with_one_param(session, getFunctionId, getFunctionName)[0]
                    getCallback = find_methods_callback(session, getCall["stmt"].id)[0]
                    methods.append({
                        "endpoint_type": "GET",
                        "endpoint": getCall,
                        "callback": getCallback
                    })

                deleteFunctions = find_lookup_property(session, routerObjectId, "delete")
                for delete in deleteFunctions:
                    deleteFunctionId = delete.id
                    deleteFunctionName = delete["IdentifierName"]
                    deleteCall = find_calls_with_one_param(session, deleteFunctionId, deleteFunctionName)[0]
                    deleteCallback = find_methods_callback(session, deleteCall["stmt"].id)[0]
                    methods.append({
                        "endpoint_type": "DELETE",
                        "endpoint": deleteCall,
                        "callback": deleteCallback
                    })

    return methods


def find_methods_callback(session, callStmtId):
    results = []
    with session.begin_transaction() as tx:
        # QUERY 7
        # get callback decl stmt and function node
        query = f"""
            MATCH
                (e)-[:AST]->(c:CallExpression)-[arg:AST]->(i:Identifier),
                (v:VariableDeclarator)-[dep:PDG]->(e),
                (v)-[init:AST]->(f)
            WHERE
                e.Id="{callStmtId}" AND
                arg.RelationType="arg" AND
                arg.ArgumentIndex="2" AND
                dep.RelationType="VAR" AND
                dep.IdentifierName=i.IdentifierName AND
                init.RelationType="init"
            RETURN *
        """
        queryResults = tx.run(query)
        for record in queryResults:
            results.append({
                "callback_decl": record["v"],
                "callback_func": record["f"]
            })

    return results


def find_model_api_calls(session, model):
    modelStmtId = model["stmt"].id
    results = []
    # print(modelStmtId)
    with session.begin_transaction() as tx:
        # QUERY 8
        # get model.create stmt
        query = f"""
            WITH ["create", "findOne", "find", "findOneAndUpdate", "deleteOne", "updateMany"] as APICalls
            MATCH
                (t)-[create:OBJECT]->(o:PDG_OBJECT)-[lookup:PDG]->(stmt)-[var:PDG]->(expression)-[e:AST]->(call:CallExpression)-[callee:AST]->(i:Identifier)
            WHERE
                t.Id="{modelStmtId}" AND
                create.RelationType="CREATE" AND
                lookup.RelationType="LOOKUP" AND
                lookup.IdentifierName in APICalls AND
                var.IdentifierName=stmt.IdentifierName AND
                (e.RelationType="expression" OR e.RelationType="init") AND
                callee.RelationType="callee" AND
                i.IdentifierName=stmt.IdentifierName
            RETURN *
        """
        queryResults = tx.run(query)
        for record in queryResults:
            results.append({
                "model_object": record["o"],
                "create_stmt": record["stmt"],
                "expression_stmt": record["expression"],
                "call": record["call"],
                "op": record["lookup"]["IdentifierName"]
            })
    return results


def is_call_in_function_scope(session, functionDecl, stmtWithCall):
    functionName = functionDecl["IdentifierName"]
    stmtWithCallId = stmtWithCall.id
    # print(functionName, stmtWithCallId)

    with session.begin_transaction() as tx:
        # QUERY 9
        # get (function, parameter) pairs that we consider source
        query = f"""
            MATCH
                (f:CFG_F_START)-[:CFG*1..]->(expression)
            WHERE
                f.IdentifierName="{functionName}" AND
                expression.Id="{stmtWithCallId}"
            RETURN *
        """
        queryResults = tx.run(query)

        if queryResults.peek():
            return True

    return False

def find_api_param(session, callExpression, argumentIndex):
    results = []
    callExpressionId = callExpression.id
    # print(callExpressionId)
    with session.begin_transaction() as tx:
        # QUERY 10
        # get object used as first param for model.create call
        query=f"""
            MATCH
                (e)-[expression:AST]->(c:CallExpression)-[arg:AST]->(i:Identifier),
                (v)-[var:PDG]->(e)
            WHERE
                (expression.RelationType="expression" OR expression.RelationType="init") AND
                c.Id="{callExpressionId}" AND
                arg.RelationType="arg" AND
                arg.ArgumentIndex="{argumentIndex}" AND
                var.RelationType="VAR" AND
                var.IdentifierName=i.IdentifierName
            RETURN *
        """
        queryResults = tx.run(query)
        for record in queryResults:
            results.append({
                "stmt": record["v"],
                "variable_name": record["i"]["IdentifierName"]
            })
    return results


def find_param_object(session, param):
    results = []
    stmtId = param["stmt"].id
    variableName = param["variable_name"]
    # print(stmtId, variableName)
    with session.begin_transaction() as tx:
        # QUERY 11
        # get object used as first param for model.create call
        query=f"""
            MATCH
                (v)-[create:OBJECT]->(o:PDG_OBJECT)
            WHERE
                v.Id="{stmtId}" AND
                create.RelationType="CREATE" AND
                create.IdentifierName="{variableName}"
            RETURN *
        """
        queryResults = tx.run(query)
        for record in queryResults:
            results.append({
                "object": record["o"],
            })
    return results


def find_param_properties(session, paramObject):
    paramObjectId = paramObject.id
    hasMoreVersions = True
    properties = []

    while hasMoreVersions:
        with session.begin_transaction() as tx:
            # QUERY 11
            # get writes to objects depedent of param
            query=f"""
                MATCH
                    (o1:PDG_OBJECT)-[new_version:OBJECT]->(o2)<-[write:PDG]-(stmt)
                WHERE
                    o1.Id="{paramObjectId}" AND
                    new_version.RelationType="NEW_VERSION" AND
                    write.RelationType="WRITE"
                RETURN *
            """
            queryResults = tx.run(query)

            if queryResults.peek():
                for record in queryResults:
                    paramObjectId = record["o2"].id
                    properties.append(record["write"]["IdentifierName"])
            else:
                hasMoreVersions = False

    return properties


def getOperationIndex(operation):
    return {
        "create": "1",
        "find": "1",
        "findOne": "1",
        "findOneAndUpdate": "2",
        "deleteOne": "1",
        "updateMany": "2"
    }.get(operation)

#  "data_operations": [
#         { "operation": "POST /tickets/buy_ticket",
#           "data": [
#             { "table": "tickets", "column": "name" },
#             { "table": "tickets", "column": "e_mail" },
#             { "table": "tickets", "column": "destination" },
#             { "table": "tickets", "column": "date" },
#             { "table": "tickets", "column": "credit_card" }]
#         },
#         { "operation": "POST /newsletter/subscribe",
#           "data": [
#             { "table": "newsletter", "column": "e_mail" }]
#     }]


NEO4J_CONN_STRING="bolt://127.0.0.1:7687"

dataOperations = []
neoDriver = GraphDatabase.driver(NEO4J_CONN_STRING, auth=('', ''))
with neoDriver.session() as session:
    express = find_require_calls(session, "express")
    expressRouterCalls = find_express_router_methods(session, express)
    # for endpoint in expressRouterCalls:
    #     endpointName = endpoint["endpoint"]["param_value"]
    #     endpointType = endpoint["endpoint_type"]
    #     callbackDecl = endpoint["callback"]["callback_func"]
    #     print(f"{endpointType} {endpointName}")

    mongoose = find_require_calls(session, "mongoose")
    mongooseModels = find_mongoose_model_calls(session, mongoose)
    for model in mongooseModels:
        schemaTable = model["param_value"]
        # print(schemaTable)
        modelAPICalls = find_model_api_calls(session, model)

        for modelAPICall in modelAPICalls:
            modelExpression = modelAPICall["call"]
            modelOperation = modelAPICall["op"]
            # print(modelOperation)

            for endpoint in expressRouterCalls:
                endpointName = endpoint["endpoint"]["param_value"]
                endpointType = endpoint["endpoint_type"]
                callbackDecl = endpoint["callback"]["callback_func"]
                # print(schemaTable, endpointName)
                if is_call_in_function_scope(session, callbackDecl, modelAPICall["expression_stmt"]):
                    argumentIndex = getOperationIndex(modelOperation)
                    # print(argumentIndex)
                    param = find_api_param(session, modelExpression, argumentIndex)[0]
                    paramObject = find_param_object(session, param)

                    propertiesData = []
                    if len(paramObject) > 0:
                        paramObject = paramObject[0]["object"]
                        properties = find_param_properties(session, paramObject)
                        # properties = find_param_properties(session, param["object"])

                        for prop in properties:
                            propertiesData.append({
                                "table": schemaTable,
                                "column": prop
                            })

                        if len(properties) == 0:
                            propertiesData.append({
                                "table": schemaTable,
                                "column": "*"
                            })
                    else:
                        propertiesData.append({
                            "table": schemaTable,
                            "column": "unknown",
                            "object": param["variable_name"]
                        })

                    dataOperations.append({
                        "operation": f"{endpointType} {endpointName}",
                        "data": propertiesData
                    })

        # print(json.dumps({"data_operations": dataOperations}, indent=4))


print(json.dumps({"data_operations": dataOperations}, indent=4))