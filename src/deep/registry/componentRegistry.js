export const COMPONENT_CATEGORIES = [
  { id: "wiring", name: "Wiring", icon: "⌁" },
  { id: "gates", name: "Gates", icon: "∧" },
  { id: "plexers", name: "Plexers", icon: "⇆" },
  { id: "arithmetic", name: "Arithmetic", icon: "+" },
  { id: "memory", name: "Memory", icon: "▣" },
  { id: "io", name: "Input / Output", icon: "●" },
  { id: "electronics", name: "Electronics Basic", icon: "⚡" },
  { id: "microcontroller", name: "Microcontroller Lab", icon: "⌘" },
];

function component({
  type,
  name,
  category,
  icon,
  inputs = [],
  optionalInputs = [],
  outputs = [],
  implemented = false,
  description = "",
  properties = {},
}) {
  return { type, name, category, icon, inputs, optionalInputs, outputs, implemented, description, properties };
}

const fourInputs = ["b0", "b1", "b2", "b3"];
const fourOutputs = ["q0", "q1", "q2", "q3"];

export const COMPONENT_REGISTRY = {
  INPUT: component({ type: "INPUT", name: "Toggle Input", category: "io", icon: "IN", outputs: ["out"], implemented: true, description: "Interactive single-bit input source.", properties: { value: false } }),
  OUTPUT: component({ type: "OUTPUT", name: "Output LED", category: "io", icon: "OUT", inputs: ["inA"], outputs: ["out"], implemented: true, description: "Observes a single digital signal." }),
  CONSTANT: component({ type: "CONSTANT", name: "Constant 0/1", category: "wiring", icon: "01", outputs: ["out"], implemented: true, description: "Fixed HIGH or LOW source.", properties: { value: true } }),
  PROBE: component({ type: "PROBE", name: "Probe", category: "wiring", icon: "PR", inputs: ["inA"], outputs: ["out"], implemented: true, description: "Monitor signal without changing it." }),
  WIRE: component({ type: "WIRE", name: "Wire", category: "wiring", icon: "─", description: "Connect nodes by selecting output and input pins." }),
  BUS4: component({ type: "BUS4", name: "Bus 4-bit", category: "wiring", icon: "═4", inputs: fourInputs, outputs: fourOutputs, implemented: true, description: "Carries four digital lines as one visible multi-bit block.", properties: { width: 4 } }),
  SPLITTER4: component({ type: "SPLITTER4", name: "Splitter 4-bit", category: "wiring", icon: "Y4", inputs: fourInputs, outputs: fourOutputs, implemented: true, description: "Breaks a 4-bit signal into inspectable output bits.", properties: { width: 4 } }),
  TUNNEL: component({ type: "TUNNEL", name: "Tunnel", category: "wiring", icon: "↝", description: "Named long-distance connector. Planned." }),
  LABEL: component({ type: "LABEL", name: "Label", category: "wiring", icon: "T", description: "Canvas annotation. Planned." }),
  CLOCK: component({ type: "CLOCK", name: "Clock", category: "wiring", icon: "CLK", outputs: ["clk"], implemented: true, description: "Periodic clock source driven by the simulator.", properties: { frequency: 1 } }),

  AND: component({ type: "AND", name: "AND", category: "gates", icon: "&", inputs: ["inA", "inB"], outputs: ["out"], implemented: true, description: "HIGH only when all inputs are HIGH." }),
  OR: component({ type: "OR", name: "OR", category: "gates", icon: "≥1", inputs: ["inA", "inB"], outputs: ["out"], implemented: true, description: "HIGH when any input is HIGH." }),
  NOT: component({ type: "NOT", name: "NOT", category: "gates", icon: "¬", inputs: ["inA"], outputs: ["out"], implemented: true, description: "Inverts one binary signal." }),
  NAND: component({ type: "NAND", name: "NAND", category: "gates", icon: "!&", inputs: ["inA", "inB"], outputs: ["out"], implemented: true, description: "Inverted AND gate." }),
  NOR: component({ type: "NOR", name: "NOR", category: "gates", icon: "!≥", inputs: ["inA", "inB"], outputs: ["out"], implemented: true, description: "Inverted OR gate." }),
  XOR: component({ type: "XOR", name: "XOR", category: "gates", icon: "⊕", inputs: ["inA", "inB"], outputs: ["out"], implemented: true, description: "HIGH when inputs differ." }),
  XNOR: component({ type: "XNOR", name: "XNOR", category: "gates", icon: "≡", inputs: ["inA", "inB"], outputs: ["out"], implemented: true, description: "HIGH when inputs match." }),
  BUFFER: component({ type: "BUFFER", name: "Buffer", category: "gates", icon: "▷", inputs: ["inA"], outputs: ["out"], implemented: true, description: "Pass-through digital buffer." }),
  TRISTATE: component({ type: "TRISTATE", name: "Tri-state Buffer", category: "gates", icon: "Z", inputs: ["data", "enable"], outputs: ["out"], description: "High impedance support is planned." }),

  MUX2: component({ type: "MUX2", name: "Multiplexer 2:1", category: "plexers", icon: "MUX", inputs: ["d0", "d1", "sel"], outputs: ["out"], implemented: true, description: "Routes D0 or D1 using a select input." }),
  DEMUX: component({ type: "DEMUX", name: "Demultiplexer", category: "plexers", icon: "DMX", description: "Routes one input to many outputs. Planned." }),
  DECODER2: component({ type: "DECODER2", name: "Decoder 2-to-4", category: "plexers", icon: "DEC", inputs: ["a", "b"], outputs: ["y0", "y1", "y2", "y3"], implemented: true, description: "Activates one output from a 2-bit input." }),
  ENCODER: component({ type: "ENCODER", name: "Encoder", category: "plexers", icon: "ENC", description: "Encode inputs to binary. Planned." }),
  PRIORITY_ENCODER: component({ type: "PRIORITY_ENCODER", name: "Priority Encoder", category: "plexers", icon: "PEN", description: "Priority-based encoder. Planned." }),

  HALF_ADDER: component({ type: "HALF_ADDER", name: "Half Adder", category: "arithmetic", icon: "HA", inputs: ["a", "b"], outputs: ["sum", "carry"], implemented: true, description: "Adds two single-bit values." }),
  FULL_ADDER: component({ type: "FULL_ADDER", name: "Full Adder", category: "arithmetic", icon: "FA", inputs: ["a", "b", "cin"], outputs: ["sum", "cout"], implemented: true, description: "Adds A, B, and carry-in." }),
  RIPPLE_ADDER: component({ type: "RIPPLE_ADDER", name: "Ripple Carry Adder", category: "arithmetic", icon: "4+", description: "Multi-bit cascaded adder. Planned." }),
  SUBTRACTOR: component({ type: "SUBTRACTOR", name: "Subtractor", category: "arithmetic", icon: "−", description: "Binary subtraction. Planned." }),
  COMPARATOR: component({ type: "COMPARATOR", name: "Comparator", category: "arithmetic", icon: "≷", description: "Compare two binary values. Planned." }),
  INCREMENTER: component({ type: "INCREMENTER", name: "Incrementer", category: "arithmetic", icon: "+1", description: "Increase binary input. Planned." }),
  SHIFTER: component({ type: "SHIFTER", name: "Bit Shifter", category: "arithmetic", icon: "<<", description: "Shift bits left/right. Planned." }),
  ALU: component({ type: "ALU", name: "Basic ALU", category: "arithmetic", icon: "ALU", description: "Arithmetic logic unit. Planned." }),

  DFF: component({ type: "DFF", name: "D Flip-Flop", category: "memory", icon: "DFF", inputs: ["d", "clk"], optionalInputs: ["rst"], outputs: ["q", "nq"], implemented: true, description: "Captures D on the rising clock edge.", properties: { initial: false } }),
  REGISTER4: component({ type: "REGISTER4", name: "Register 4-bit", category: "memory", icon: "REG4", inputs: ["d0", "d1", "d2", "d3", "clk"], optionalInputs: ["rst"], outputs: fourOutputs, implemented: true, description: "Stores a 4-bit value on a rising edge.", properties: { width: 4 } }),
  COUNTER4: component({ type: "COUNTER4", name: "Counter 4-bit", category: "memory", icon: "CNT4", inputs: ["clk"], optionalInputs: ["rst"], outputs: fourOutputs, implemented: true, description: "Increments its 4-bit output per rising edge.", properties: { width: 4 } }),
  SR_LATCH: component({ type: "SR_LATCH", name: "SR Latch", category: "memory", icon: "SR", description: "Sequential element. Planned." }),
  D_LATCH: component({ type: "D_LATCH", name: "D Latch", category: "memory", icon: "DL", description: "Sequential element. Planned." }),
  JKFF: component({ type: "JKFF", name: "JK Flip-Flop", category: "memory", icon: "JK", description: "Clocked storage. Planned." }),
  TFF: component({ type: "TFF", name: "T Flip-Flop", category: "memory", icon: "T", description: "Clocked toggle. Planned." }),
  RAM: component({ type: "RAM", name: "RAM", category: "memory", icon: "RAM", description: "Memory block. Future." }),
  ROM: component({ type: "ROM", name: "ROM", category: "memory", icon: "ROM", description: "Read-only memory. Future." }),

  BUTTON: component({ type: "BUTTON", name: "Button", category: "io", icon: "BTN", description: "Momentary input. Planned." }),
  LED: component({ type: "LED", name: "LED", category: "io", icon: "LED", description: "Visual electronics output. Phase 3." }),
  BINARY4: component({ type: "BINARY4", name: "Binary Display 4-bit", category: "io", icon: "BIN", inputs: fourInputs, outputs: fourOutputs, implemented: true, description: "Reads and forwards a four-bit digital value.", properties: { width: 4 } }),
  HEX4: component({ type: "HEX4", name: "Hex Display 4-bit", category: "io", icon: "HEX", inputs: fourInputs, outputs: fourOutputs, implemented: true, description: "Displays a four-bit value as hexadecimal.", properties: { width: 4 } }),
  SEVEN_SEG: component({ type: "SEVEN_SEG", name: "7-Segment", category: "io", icon: "7S", description: "Numeric output. Planned." }),
  TERMINAL: component({ type: "TERMINAL", name: "Terminal Output", category: "io", icon: ">_", description: "Console output. Planned." }),

  BATTERY: component({ type: "BATTERY", name: "Battery", category: "electronics", icon: "BAT", description: "Voltage source. Phase 3." }),
  GROUND: component({ type: "GROUND", name: "Ground", category: "electronics", icon: "GND", description: "Analog reference. Phase 3." }),
  RESISTOR: component({ type: "RESISTOR", name: "Resistor", category: "electronics", icon: "Ω", description: "Basic Ohm law simulation. Phase 3." }),
  CAPACITOR: component({ type: "CAPACITOR", name: "Capacitor", category: "electronics", icon: "C", description: "Educational RC behavior. Future." }),
  DIODE: component({ type: "DIODE", name: "Diode", category: "electronics", icon: "D", description: "Directional current. Phase 3." }),
  TRANSISTOR: component({ type: "TRANSISTOR", name: "Transistor", category: "electronics", icon: "Q", description: "Basic switch model. Phase 3." }),
  VOLTMETER: component({ type: "VOLTMETER", name: "Voltmeter", category: "electronics", icon: "V", description: "Basic voltage display. Phase 3." }),
  AMMETER: component({ type: "AMMETER", name: "Ammeter", category: "electronics", icon: "A", description: "Basic current display. Phase 3." }),

  ARDUINO: component({ type: "ARDUINO", name: "Arduino Uno", category: "microcontroller", icon: "UNO", description: "Visual MCU mock. Phase 3." }),
  BREADBOARD: component({ type: "BREADBOARD", name: "Breadboard", category: "microcontroller", icon: "BB", description: "Visual wiring board. Phase 3." }),
  SERVO: component({ type: "SERVO", name: "Servo", category: "microcontroller", icon: "SRV", description: "Actuator mock. Phase 3." }),
  BUZZER: component({ type: "BUZZER", name: "Buzzer", category: "microcontroller", icon: "BZ", description: "Audio actuator mock. Phase 3." }),
  LCD: component({ type: "LCD", name: "LCD", category: "microcontroller", icon: "LCD", description: "Visual display mock. Phase 3." }),
  POTENTIOMETER: component({ type: "POTENTIOMETER", name: "Potentiometer", category: "microcontroller", icon: "POT", description: "Variable analog input. Phase 3." }),
  CODE_EDITOR: component({ type: "CODE_EDITOR", name: "Code Editor", category: "microcontroller", icon: "</>", description: "Arduino-style code placeholder. Phase 3." }),
};

export const SEQUENTIAL_TYPES = ["DFF", "REGISTER4", "COUNTER4"];

export function getComponent(type) {
  return COMPONENT_REGISTRY[type] ?? null;
}

export function getComponentsByCategory(category) {
  return Object.values(COMPONENT_REGISTRY).filter((entry) => entry.category === category);
}

export function isImplementedComponent(type) {
  return Boolean(COMPONENT_REGISTRY[type]?.implemented);
}

export function inputPortsForType(type) {
  const entry = COMPONENT_REGISTRY[type];
  return [...(entry?.inputs ?? []), ...(entry?.optionalInputs ?? [])];
}

export function requiredInputPortsForType(type) {
  return COMPONENT_REGISTRY[type]?.inputs ?? [];
}

export function optionalInputPortsForType(type) {
  return COMPONENT_REGISTRY[type]?.optionalInputs ?? [];
}

export function outputPortsForType(type) {
  return COMPONENT_REGISTRY[type]?.outputs ?? [];
}

export function isSequentialComponent(type) {
  return SEQUENTIAL_TYPES.includes(type);
}
