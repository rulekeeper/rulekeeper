/* eslint-disable no-param-reassign */
/* eslint-disable consistent-return */
function buildCFG(astGraph) {
    const graph = astGraph;

    function traverse(node, parent) {
        function defaultNode(defNode, defParent) {
            defNode.context = defParent.context.slice();
            defNode.edges.map((edge) => traverse(edge.nodes[1], defNode));
            return {
                root: defNode,
                exit: defNode,
            };
        }

        if (node === null) {
            return;
        }

        switch (node.type) {
        //
        // Scripts
        //
        case "Program": {
            const cfgNamespace = "__main__";
            node.context = [cfgNamespace];

            const _start = graph.addNode("CFG_F_START", { type: "CFG" });
            _start.identifier = "__main__";
            _start.namespace = cfgNamespace;
            _start.context = node.context.slice();
            graph.addStartNodes("CFG", _start);

            const _end = graph.addNode("CFG_F_END", { type: "CFG" });
            _end.identifier = "__main__";
            _end.context = node.context.slice();

            let previousNode = _start;
            node.edges.forEach((edge) => {
                const [, childNode] = edge.nodes;
                const { root, exit } = traverse(childNode, previousNode);
                graph.addEdge(previousNode.id, root.id, { type: "CFG" });
                previousNode = exit;
            });
            graph.addEdge(previousNode.id, _end.id, { type: "CFG" });
            return {
                root: _start,
                exit: _end,
            };
        }

        case "BlockStatement": {
            node.context = parent.context.slice();
            if (node.edges.length > 0) {
                let previousNode = node.edges[0].nodes[1];
                const firstNode = previousNode;

                traverse(firstNode, node);

                node.edges.slice(1).forEach((edge) => {
                    const [, childNode] = edge.nodes;
                    const { root, exit } = traverse(childNode, node);
                    graph.addEdge(previousNode.id, root.id, { type: "CFG" });
                    previousNode = exit;
                });

                return {
                    root: firstNode,
                    exit: previousNode,
                };
            }

            return defaultNode(node);
        }

        case "ArrowFunctionExpression":
        case "FunctionDeclaration":
        case "FunctionExpression":
        case "LabeledStatement": {
            const name = `${node.id}_${node.identifier}`;
            const cfgNamespace = `__${name}__`;
            node.context = parent.context.slice();
            node.context.push(cfgNamespace);
            node.namespace = cfgNamespace;
            node.identifier = name;

            const _start = graph.addNode("CFG_F_START", { type: "CFG" });
            _start.identifier = name;
            _start.namespace = cfgNamespace;
            _start.context = node.context.slice();

            graph.addStartNodes("CFG", _start);

            const _end = graph.addNode("CFG_F_END", { type: "CFG" });
            _end.identifier = name;
            _end.context = node.context.slice();

            const paramEdges = node.edges.filter((edge) => edge.label === "param");
            paramEdges.forEach((paramEdge) => {
                const paramNode = paramEdge.nodes[1];
                traverse(paramNode, node);
            });

            const blockEdge = node.edges.filter((edge) => edge.label === "block")[0];
            const blockNode = blockEdge.nodes[1];
            const { root, exit } = traverse(blockNode, node);
            graph.addEdge(_start.id, root.id, { type: "CFG" });
            graph.addEdge(exit.id, _end.id, { type: "CFG" });
            return {
                root: node,
                exit: node,
            };
        }

        case "IfStatement":
        case "ConditionalExpression": {
            node.context = parent.context.slice();
            node.context.push(node.id);
            // eslint-disable-next-line max-len
            const [test, consequent, alternate] = node.edges.map((edge) => traverse(edge.nodes[1], node));

            const _endIf = graph.addNode("CFG_IF_END", { type: "CFG" });
            _endIf.identifier = node.id;
            _endIf.context = node.context.slice();

            graph.addEdge(node.id, test.root.id, { type: "CFG", label: "test" });
            graph.addEdge(test.exit.id, consequent.root.id, { type: "CFG", label: "TRUE" });
            graph.addEdge(consequent.exit.id, _endIf.id, { type: "CFG" });

            if (alternate) {
                graph.addEdge(test.exit.id, alternate.root.id, { type: "CFG", label: "FALSE" });
                graph.addEdge(alternate.exit.id, _endIf.id, { type: "CFG" });
            } else {
                graph.addEdge(test.exit.id, _endIf.id, { type: "CFG", label: "FALSE" });
            }
            return {
                root: node,
                exit: _endIf,
            };
        }

        default:
            return defaultNode(node, parent);
        }
    }

    traverse(graph.startNodes.AST[0], null);
    return graph;
}

module.exports = { buildCFG };
