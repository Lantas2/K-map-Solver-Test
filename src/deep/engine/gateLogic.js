import {
  inputPortsForType,
  outputPortsForType,
  isSequentialComponent,
} from "../registry/componentRegistry";

export { inputPortsForType, outputPortsForType };

function bit(value) {
  return Boolean(value);
}

function fourBitPass(inputMap = {}) {
  return {
    q0: bit(inputMap.b0),
    q1: bit(inputMap.b1),
    q2: bit(inputMap.b2),
    q3: bit(inputMap.b3),
  };
}

function bitsFromNumber(value) {
  return {
    q0: Boolean(value & 1),
    q1: Boolean(value & 2),
    q2: Boolean(value & 4),
    q3: Boolean(value & 8),
  };
}

export function evaluateComponent(type, inputMap = {}, properties = {}, runtime = {}) {
  const a = bit(inputMap.inA ?? inputMap.a ?? inputMap.d0);
  const b = bit(inputMap.inB ?? inputMap.b ?? inputMap.d1);
  const memory = runtime.memory?.[runtime.nodeId];

  switch (type) {
    case "INPUT":
    case "CONSTANT":
      return { out: bit(properties.value) };
    case "CLOCK":
      return { clk: bit(runtime.clockLevel) };
    case "OUTPUT":
    case "PROBE":
    case "BUFFER":
      return { out: a };
    case "AND":
      return { out: a && b };
    case "OR":
      return { out: a || b };
    case "NOT":
      return { out: !a };
    case "XOR":
      return { out: a !== b };
    case "NAND":
      return { out: !(a && b) };
    case "NOR":
      return { out: !(a || b) };
    case "XNOR":
      return { out: a === b };
    case "HALF_ADDER":
      return { sum: a !== b, carry: a && b };
    case "FULL_ADDER": {
      const cin = bit(inputMap.cin);
      return { sum: a !== b !== cin, cout: (a && b) || (a && cin) || (b && cin) };
    }
    case "MUX2":
      return { out: inputMap.sel ? bit(inputMap.d1) : bit(inputMap.d0) };
    case "DECODER2": {
      const index = Number(bit(inputMap.a)) + Number(bit(inputMap.b)) * 2;
      return { y0: index === 0, y1: index === 1, y2: index === 2, y3: index === 3 };
    }
    case "BUS4":
    case "SPLITTER4":
    case "BINARY4":
    case "HEX4":
      return fourBitPass(inputMap);
    case "DFF": {
      const q = bit(memory?.q ?? properties.initial);
      return { q, nq: !q };
    }
    case "REGISTER4":
      return bitsFromNumber(Number(memory?.value ?? 0));
    case "COUNTER4":
      return bitsFromNumber(Number(memory?.value ?? 0));
    default: {
      const output = outputPortsForType(type)[0] ?? "out";
      return { [output]: false };
    }
  }
}

export function truthTableForType(type) {
  if (isSequentialComponent(type) || type === "CLOCK") return [];
  const ports = inputPortsForType(type).filter((port) => port !== "rst");
  if (!ports.length || ports.length > 4) return [];

  const total = 2 ** ports.length;
  return Array.from({ length: total }, (_, row) => {
    const inputs = Object.fromEntries(ports.map((port, index) => [port, Boolean((row >> (ports.length - index - 1)) & 1)]));
    return { inputs, outputs: evaluateComponent(type, inputs) };
  });
}

export function formatNibble(outputs = {}, prefix = "q") {
  const value = [3, 2, 1, 0].reduce((total, bitIndex) => total + (outputs[`${prefix}${bitIndex}`] ? (2 ** bitIndex) : 0), 0);
  return {
    value,
    binary: value.toString(2).padStart(4, "0"),
    hex: value.toString(16).toUpperCase(),
  };
}
