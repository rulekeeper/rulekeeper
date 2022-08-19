# RuleKeeper

An open-source, prototype implementation of RuleKeeper, a GDPR-compliant consent management system designed for full-stack web development frameworks.
We use MERN (MongoDB, Express.js, React.js, and Node.js) as our demonstration target.

RuleKeeper operates in two phases: an offline phase and a runtime phase.
The offline phase takes place at development time and includes a code analysis tool.
The runtime phase is composed of a middleware and a manager service. 
RuleKeeper also includes a parser to translate the GDPR manifest specified using our DSL to a JSON format.

In this repository you will find: 

* The static analysis engine in **Static Analysis Engine/** (including the Webus graph in **Webus Graph/**);
* The middleware code in **RuleKeeper Middleware/**;
* The manager code in **RuleKeeper Manager/**;
* The parser code in **Parser/**;
* The material used for the usability tests in **Usability Tests/**;
* The use case applications in **Use Cases/**.