function node(id, type, label, x, y, properties = {}) {
  return { id, type, label, x, y, properties };
}
function edge(id, source, target, targetPort, sourcePort = "out") {
  return { id, source, sourcePort, target, targetPort };
}

export const CIRCUIT_TEMPLATES = [
  {
    id: "half-adder",
    name: "Half Adder",
    category: "Arithmetic",
    description: "Gate-level SUM and CARRY from A and B.",
    nodes: [
      node("ha-a", "INPUT", "A", 74, 160, { value: true }),
      node("ha-b", "INPUT", "B", 74, 340, { value: false }),
      node("ha-xor", "XOR", "SUM XOR", 390, 160),
      node("ha-and", "AND", "CARRY AND", 390, 340),
      node("ha-sum", "OUTPUT", "SUM", 724, 160),
      node("ha-carry", "OUTPUT", "CARRY", 724, 340),
    ],
    edges: [
      edge("ha-e1", "ha-a", "ha-xor", "inA"), edge("ha-e2", "ha-b", "ha-xor", "inB"),
      edge("ha-e3", "ha-a", "ha-and", "inA"), edge("ha-e4", "ha-b", "ha-and", "inB"),
      edge("ha-e5", "ha-xor", "ha-sum", "inA"), edge("ha-e6", "ha-and", "ha-carry", "inA"),
    ],
  },
  {
    id: "full-adder",
    name: "Full Adder",
    category: "Arithmetic",
    description: "Single full-adder block with carry-in and carry-out.",
    nodes: [
      node("fa-a", "INPUT", "A", 70, 118, { value: true }),
      node("fa-b", "INPUT", "B", 70, 267, { value: false }),
      node("fa-cin", "INPUT", "CIN", 70, 416, { value: true }),
      node("fa-core", "FULL_ADDER", "FULL ADDER", 390, 252),
      node("fa-sum", "OUTPUT", "SUM", 736, 196),
      node("fa-cout", "OUTPUT", "COUT", 736, 338),
    ],
    edges: [
      edge("fa-e1", "fa-a", "fa-core", "a"), edge("fa-e2", "fa-b", "fa-core", "b"),
      edge("fa-e3", "fa-cin", "fa-core", "cin"), edge("fa-e4", "fa-core", "fa-sum", "inA", "sum"),
      edge("fa-e5", "fa-core", "fa-cout", "inA", "cout"),
    ],
  },
  {
    id: "mux-2",
    name: "2-to-1 MUX",
    category: "Plexers",
    description: "Switch between D0 and D1 with SELECT.",
    nodes: [
      node("mx-d0", "INPUT", "D0", 70, 130, { value: true }),
      node("mx-d1", "INPUT", "D1", 70, 274, { value: false }),
      node("mx-sel", "INPUT", "SELECT", 70, 426, { value: false }),
      node("mx-core", "MUX2", "MUX 2:1", 420, 255),
      node("mx-out", "OUTPUT", "Q", 755, 255),
    ],
    edges: [
      edge("mx-e1", "mx-d0", "mx-core", "d0"), edge("mx-e2", "mx-d1", "mx-core", "d1"),
      edge("mx-e3", "mx-sel", "mx-core", "sel"), edge("mx-e4", "mx-core", "mx-out", "inA"),
    ],
  },
  {
    id: "decoder",
    name: "Decoder 2-to-4",
    category: "Plexers",
    description: "Decode two inputs into four active lines.",
    nodes: [
      node("de-a", "INPUT", "A", 74, 188, { value: true }),
      node("de-b", "INPUT", "B", 74, 340, { value: false }),
      node("de-core", "DECODER2", "DECODER", 378, 250),
      node("de-y0", "OUTPUT", "Y0", 755, 120),
      node("de-y1", "OUTPUT", "Y1", 755, 240),
      node("de-y2", "OUTPUT", "Y2", 755, 360),
      node("de-y3", "OUTPUT", "Y3", 755, 480),
    ],
    edges: [
      edge("de-e1", "de-a", "de-core", "a"), edge("de-e2", "de-b", "de-core", "b"),
      edge("de-e3", "de-core", "de-y0", "inA", "y0"), edge("de-e4", "de-core", "de-y1", "inA", "y1"),
      edge("de-e5", "de-core", "de-y2", "inA", "y2"), edge("de-e6", "de-core", "de-y3", "inA", "y3"),
    ],
  },
  {
    id: "dff-lab",
    name: "D Flip-Flop Lab",
    category: "Memory",
    description: "Capture D on a rising edge with simulator clock.",
    nodes: [
      node("dff-clock", "CLOCK", "CLOCK", 70, 276),
      node("dff-d", "INPUT", "DATA D", 70, 128, { value: true }),
      node("dff-rst", "INPUT", "RESET", 70, 438, { value: false }),
      node("dff-core", "DFF", "D FLIP-FLOP", 410, 250),
      node("dff-q", "OUTPUT", "Q", 770, 212),
      node("dff-nq", "OUTPUT", "NOT Q", 770, 334),
    ],
    edges: [
      edge("dff-e1", "dff-d", "dff-core", "d"),
      edge("dff-e2", "dff-clock", "dff-core", "clk", "clk"),
      edge("dff-e3", "dff-rst", "dff-core", "rst"),
      edge("dff-e4", "dff-core", "dff-q", "inA", "q"),
      edge("dff-e5", "dff-core", "dff-nq", "inA", "nq"),
    ],
  },
  {
    id: "counter-4",
    name: "Counter 4-bit",
    category: "Memory",
    description: "Clock-driven binary counter connected to hex and binary monitors.",
    nodes: [
      node("ct-clock", "CLOCK", "CLOCK", 68, 190),
      node("ct-reset", "INPUT", "RESET", 68, 350, { value: false }),
      node("ct-core", "COUNTER4", "COUNTER 4-BIT", 350, 244),
      node("ct-bin", "BINARY4", "BINARY MONITOR", 680, 155),
      node("ct-hex", "HEX4", "HEX MONITOR", 680, 420),
    ],
    edges: [
      edge("ct-e0", "ct-clock", "ct-core", "clk", "clk"),
      edge("ct-er", "ct-reset", "ct-core", "rst"),
      edge("ct-b0", "ct-core", "ct-bin", "b0", "q0"), edge("ct-b1", "ct-core", "ct-bin", "b1", "q1"),
      edge("ct-b2", "ct-core", "ct-bin", "b2", "q2"), edge("ct-b3", "ct-core", "ct-bin", "b3", "q3"),
      edge("ct-h0", "ct-core", "ct-hex", "b0", "q0"), edge("ct-h1", "ct-core", "ct-hex", "b1", "q1"),
      edge("ct-h2", "ct-core", "ct-hex", "b2", "q2"), edge("ct-h3", "ct-core", "ct-hex", "b3", "q3"),
    ],
  },
  {
    id: "register-4",
    name: "Register 4-bit",
    category: "Memory",
    description: "Load a four-bit input value on a rising edge.",
    nodes: [
      node("reg-clock", "CLOCK", "CLOCK", 50, 92),
      node("reg-d0", "INPUT", "D0", 50, 210, { value: true }),
      node("reg-d1", "INPUT", "D1", 50, 330, { value: false }),
      node("reg-d2", "INPUT", "D2", 50, 450, { value: true }),
      node("reg-d3", "INPUT", "D3", 50, 570, { value: false }),
      node("reg-core", "REGISTER4", "REGISTER 4-BIT", 356, 302),
      node("reg-hex", "HEX4", "HEX MONITOR", 760, 300),
    ],
    edges: [
      edge("reg-ec", "reg-clock", "reg-core", "clk", "clk"),
      edge("reg-e0", "reg-d0", "reg-core", "d0"), edge("reg-e1", "reg-d1", "reg-core", "d1"),
      edge("reg-e2", "reg-d2", "reg-core", "d2"), edge("reg-e3", "reg-d3", "reg-core", "d3"),
      edge("reg-o0", "reg-core", "reg-hex", "b0", "q0"), edge("reg-o1", "reg-core", "reg-hex", "b1", "q1"),
      edge("reg-o2", "reg-core", "reg-hex", "b2", "q2"), edge("reg-o3", "reg-core", "reg-hex", "b3", "q3"),
    ],
  },
];

export function cloneTemplate(id) {
  const template = CIRCUIT_TEMPLATES.find((item) => item.id === id) ?? CIRCUIT_TEMPLATES[0];
  return JSON.parse(JSON.stringify(template));
}
