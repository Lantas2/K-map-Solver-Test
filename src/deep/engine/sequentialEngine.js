import { readInputPort } from "./evaluateCircuit";
import { isSequentialComponent } from "../registry/componentRegistry";

function bitValue(nodes, edges, simulation, nodeId, port) {
  return readInputPort(nodes, edges, simulation, nodeId, port);
}

export function resetSequentialState(nodes) {
  return Object.fromEntries(nodes
    .filter((node) => isSequentialComponent(node.type))
    .map((node) => [node.id, node.type === "DFF" ? { q: Boolean(node.properties?.initial) } : { value: 0 }]));
}

export function reconcileSequentialState(nodes, current = {}) {
  const next = { ...current };
  nodes.filter((node) => isSequentialComponent(node.type)).forEach((node) => {
    if (!next[node.id]) {
      next[node.id] = node.type === "DFF" ? { q: Boolean(node.properties?.initial) } : { value: 0 };
    }
  });
  Object.keys(next).forEach((id) => {
    if (!nodes.some((node) => node.id === id && isSequentialComponent(node.type))) delete next[id];
  });
  return next;
}

export function captureRisingEdge(nodes, edges, previewSimulation, current = {}) {
  const next = reconcileSequentialState(nodes, current);

  nodes.filter((node) => isSequentialComponent(node.type)).forEach((node) => {
    const reset = bitValue(nodes, edges, previewSimulation, node.id, "rst");
    const clock = bitValue(nodes, edges, previewSimulation, node.id, "clk");
    if (!clock) return;

    if (node.type === "DFF") {
      next[node.id] = { q: reset ? false : bitValue(nodes, edges, previewSimulation, node.id, "d") };
    }

    if (node.type === "REGISTER4") {
      const value = reset ? 0 : [0, 1, 2, 3].reduce((total, index) => (
        total + (bitValue(nodes, edges, previewSimulation, node.id, `d${index}`) ? (2 ** index) : 0)
      ), 0);
      next[node.id] = { value };
    }

    if (node.type === "COUNTER4") {
      const previous = Number(next[node.id]?.value ?? 0);
      next[node.id] = { value: reset ? 0 : (previous + 1) % 16 };
    }
  });

  return next;
}
