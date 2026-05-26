import {
  evaluateComponent,
  inputPortsForType,
  outputPortsForType,
} from "./gateLogic";
import { requiredInputPortsForType } from "../registry/componentRegistry";

function signalKey(nodeId, port = "out") {
  return `${nodeId}:${port}`;
}

export function evaluateCircuit(nodes, edges, runtime = {}) {
  const signals = {};
  const nodeOutputs = {};
  const warnings = [];
  const maxPasses = Math.max(3, nodes.length * 2 + 2);

  nodes.forEach((node) => {
    const outputs = evaluateComponent(node.type, {}, node.properties ?? { value: node.value }, { ...runtime, nodeId: node.id });
    nodeOutputs[node.id] = outputs;
    Object.entries(outputs).forEach(([port, value]) => {
      signals[signalKey(node.id, port)] = Boolean(value);
    });
  });

  for (let pass = 0; pass < maxPasses; pass += 1) {
    let changed = false;
    nodes.forEach((node) => {
      if (["INPUT", "CONSTANT", "CLOCK"].includes(node.type)) return;
      const inputs = Object.fromEntries(inputPortsForType(node.type).map((port) => {
        const edge = edges.find((item) => item.target === node.id && item.targetPort === port);
        const sourcePort = edge?.sourcePort ?? "out";
        return [port, edge ? Boolean(signals[signalKey(edge.source, sourcePort)]) : false];
      }));
      const outputs = evaluateComponent(node.type, inputs, node.properties ?? { value: node.value }, { ...runtime, nodeId: node.id });
      nodeOutputs[node.id] = outputs;
      Object.entries(outputs).forEach(([port, value]) => {
        const key = signalKey(node.id, port);
        const next = Boolean(value);
        if (signals[key] !== next) {
          signals[key] = next;
          changed = true;
        }
      });
    });
    if (!changed) break;
    if (pass === maxPasses - 1) warnings.push("Potential combinational loop: signal did not settle.");
  }

  nodes.forEach((node) => {
    requiredInputPortsForType(node.type).forEach((port) => {
      if (!edges.some((edge) => edge.target === node.id && edge.targetPort === port)) {
        warnings.push(`${node.label}: port ${port} is floating.`);
      }
    });
  });

  const duplicates = edges.filter((edge, index) => edges.findIndex((item) => item.target === edge.target && item.targetPort === edge.targetPort) !== index);
  if (duplicates.length) warnings.push("More than one wire drives the same input port.");

  const evaluatedEdges = edges.map((edge) => ({
    ...edge,
    sourcePort: edge.sourcePort ?? "out",
    active: Boolean(signals[signalKey(edge.source, edge.sourcePort ?? "out")]),
  }));

  const signalByNode = Object.fromEntries(nodes.map((node) => {
    const firstOutput = outputPortsForType(node.type)[0] ?? "out";
    return [node.id, Boolean(signals[signalKey(node.id, firstOutput)])];
  }));

  return { signals, nodeOutputs, signalByNode, evaluatedEdges, warnings };
}

export function readNodePort(simulation, nodeId, port = "out") {
  return Boolean(simulation.signals[signalKey(nodeId, port)]);
}

export function readInputPort(nodes, edges, simulation, nodeId, port) {
  const edge = edges.find((item) => item.target === nodeId && item.targetPort === port);
  return edge ? readNodePort(simulation, edge.source, edge.sourcePort ?? "out") : false;
}
