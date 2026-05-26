import { useEffect, useMemo, useRef, useState } from "react";
import "./circuitIdeLab.css";
import { evaluateCircuit, readNodePort } from "../deep/engine/evaluateCircuit";
import { formatNibble, truthTableForType } from "../deep/engine/gateLogic";
import { captureRisingEdge, reconcileSequentialState, resetSequentialState } from "../deep/engine/sequentialEngine";
import {
  COMPONENT_CATEGORIES,
  getComponent,
  getComponentsByCategory,
  inputPortsForType,
  outputPortsForType,
  isImplementedComponent,
  isSequentialComponent,
} from "../deep/registry/componentRegistry";
import { CIRCUIT_TEMPLATES, cloneTemplate } from "../deep/templates/circuitTemplates";

const BOARD_W = 1320;
const BOARD_H = 820;
const GRID = 20;
const NODE_W = 164;
const MIN_NODE_H = 92;
const AI_PROVIDER = "none";

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`;
}

function snap(value) {
  return Math.round(value / GRID) * GRID;
}

function outputLabel(port) {
  return port === "out" ? "Q" : port.toUpperCase();
}

function nodeHeight(node) {
  const largestPortCount = Math.max(inputPortsForType(node.type).length, outputPortsForType(node.type).length, 1);
  return Math.max(MIN_NODE_H, 58 + largestPortCount * 24);
}

function portY(node, port, direction) {
  const ports = direction === "in" ? inputPortsForType(node.type) : outputPortsForType(node.type);
  const index = Math.max(0, ports.indexOf(port));
  return node.y + 48 + index * 24;
}

function outputPoint(node, port) {
  return { x: node.x + NODE_W, y: portY(node, port, "out") };
}

function inputPoint(node, port) {
  return { x: node.x, y: portY(node, port, "in") };
}

function wirePath(source, sourcePort, target, targetPort) {
  const start = outputPoint(source, sourcePort);
  const end = inputPoint(target, targetPort);
  const distance = Math.max(60, Math.abs(end.x - start.x) * 0.44);
  return `M ${start.x} ${start.y} C ${start.x + distance} ${start.y}, ${end.x - distance} ${end.y}, ${end.x} ${end.y}`;
}

function nextLabel(type, nodes) {
  const definition = getComponent(type);
  const same = nodes.filter((node) => node.type === type).length + 1;
  if (type === "INPUT") return ["A", "B", "C", "D", "E", "F"][same - 1] ?? `IN ${same}`;
  if (type === "OUTPUT") return `OUT ${same}`;
  if (type === "CONSTANT") return `CONST ${same}`;
  if (type === "CLOCK") return `CLK ${same}`;
  return `${definition?.name ?? type} ${same}`;
}

function snapshot(nodes, edges) {
  return JSON.stringify({ nodes, edges });
}

function downloadJson(nodes, edges, memory = {}) {
  const payload = JSON.stringify({
    format: "citools-digital-lab-v3",
    version: 3,
    aiProvider: AI_PROVIDER,
    nodes,
    edges,
    memory,
  }, null, 2);
  const url = URL.createObjectURL(new Blob([payload], { type: "application/json" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "citools-circuit-project.json";
  anchor.click();
  URL.revokeObjectURL(url);
}

function PortSignal({ value }) {
  return <b className={value ? "is-high" : ""}>{value ? "1" : "0"}</b>;
}

function NodeReadout({ node, simulation }) {
  if (["BINARY4", "HEX4", "REGISTER4", "COUNTER4"].includes(node.type)) {
    const result = formatNibble(simulation.nodeOutputs[node.id] ?? {});
    return (
      <div className={`dil-digital-display ${node.type === "HEX4" ? "is-hex" : ""}`}>
        <strong>{node.type === "HEX4" ? result.hex : result.binary}</strong>
        <small>{node.type === "HEX4" ? `BIN ${result.binary}` : `HEX ${result.hex}`}</small>
      </div>
    );
  }
  return (
    <div className="dil-node-outputs">
      {outputPortsForType(node.type).map((port) => (
        <div key={port}><small>{outputLabel(port)}</small><PortSignal value={readNodePort(simulation, node.id, port)} /></div>
      ))}
    </div>
  );
}

function LibraryItem({ definition, onAdd }) {
  const enabled = definition.implemented;
  return (
    <button
      type="button"
      className={`dil-library-item ${enabled ? "is-ready" : "is-planned"}`}
      draggable={enabled}
      disabled={!enabled}
      onClick={() => enabled && onAdd(definition.type)}
      onDragStart={(event) => {
        if (enabled) event.dataTransfer.setData("application/citools-component", definition.type);
      }}
      title={definition.description}
    >
      <i>{definition.icon}</i>
      <span>{definition.name}<small>{enabled ? "ready" : "planned"}</small></span>
    </button>
  );
}

export default function CircuitIdeMode() {
  const starter = useMemo(() => cloneTemplate("half-adder"), []);
  const [nodes, setNodes] = useState(starter.nodes);
  const [edges, setEdges] = useState(starter.edges);
  const [memory, setMemory] = useState(() => resetSequentialState(starter.nodes));
  const [selected, setSelected] = useState({ kind: "node", id: "ha-xor" });
  const [connecting, setConnecting] = useState(null);
  const [zoom, setZoom] = useState(100);
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("gates");
  const [templateId, setTemplateId] = useState("half-adder");
  const [bottomTab, setBottomTab] = useState("console");
  const [notice, setNotice] = useState("Half Adder loaded. Build a circuit or open a clocked template.");
  const [drag, setDrag] = useState(null);
  const [history, setHistory] = useState([snapshot(starter.nodes, starter.edges)]);
  const [future, setFuture] = useState([]);
  const [clockLevel, setClockLevel] = useState(false);
  const [clockRunning, setClockRunning] = useState(false);
  const [tickCount, setTickCount] = useState(0);
  const [timing, setTiming] = useState([]);
  const boardRef = useRef(null);
  const fileRef = useRef(null);
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  const memoryRef = useRef(memory);
  const clockRef = useRef(clockLevel);

  useEffect(() => { nodesRef.current = nodes; }, [nodes]);
  useEffect(() => { edgesRef.current = edges; }, [edges]);
  useEffect(() => { memoryRef.current = memory; }, [memory]);
  useEffect(() => { clockRef.current = clockLevel; }, [clockLevel]);

  const simulation = useMemo(() => evaluateCircuit(nodes, edges, { memory, clockLevel }), [nodes, edges, memory, clockLevel]);
  const selectedNode = selected.kind === "node" ? nodes.find((node) => node.id === selected.id) ?? null : null;
  const selectedEdge = selected.kind === "edge" ? simulation.evaluatedEdges.find((edge) => edge.id === selected.id) ?? null : null;
  const monitorNodes = nodes.filter((node) => ["OUTPUT", "PROBE", "BINARY4", "HEX4", "COUNTER4", "REGISTER4"].includes(node.type));
  const inputs = nodes.filter((node) => ["INPUT", "CONSTANT", "CLOCK"].includes(node.type));
  const selectedDefinition = selectedNode ? getComponent(selectedNode.type) : null;
  const truthRows = selectedNode ? truthTableForType(selectedNode.type) : [];
  const clockPresent = nodes.some((node) => node.type === "CLOCK");

  const monitoredSignals = useMemo(() => monitorNodes.flatMap((node) => {
    if (["BINARY4", "HEX4", "COUNTER4", "REGISTER4"].includes(node.type)) {
      return outputPortsForType(node.type).map((port) => ({ key: `${node.id}:${port}`, label: `${node.label}.${outputLabel(port)}` }));
    }
    return [{ key: `${node.id}:out`, label: node.label }];
  }).slice(0, 12), [monitorNodes]);

  function recordTiming(nextSimulation, label = `T${tickCount}`) {
    const signals = Object.fromEntries(monitoredSignals.map((channel) => {
      const [nodeId, port] = channel.key.split(":");
      return [channel.key, readNodePort(nextSimulation, nodeId, port)];
    }));
    setTiming((current) => [...current.slice(-15), { label, signals }]);
  }

  useEffect(() => {
    if (!drag) return undefined;
    const onMove = (event) => {
      const rect = boardRef.current?.getBoundingClientRect();
      if (!rect) return;
      const scale = zoom / 100;
      let x = (event.clientX - rect.left) / scale - drag.offsetX;
      let y = (event.clientY - rect.top) / scale - drag.offsetY;
      x = Math.max(18, Math.min(BOARD_W - NODE_W - 18, snapEnabled ? snap(x) : x));
      y = Math.max(58, Math.min(BOARD_H - nodeHeight(drag.node) - 18, snapEnabled ? snap(y) : y));
      setNodes((current) => current.map((node) => node.id === drag.id ? { ...node, x, y } : node));
    };
    const onUp = () => {
      setDrag(null);
      setHistory((current) => [...current.slice(-39), snapshot(nodesRef.current, edgesRef.current)]);
      setFuture([]);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [drag, snapEnabled, zoom]);

  function commit(nextNodes, nextEdges, message, options = {}) {
    const nextMemory = options.resetMemory
      ? resetSequentialState(nextNodes)
      : reconcileSequentialState(nextNodes, memoryRef.current);
    const nextSimulation = evaluateCircuit(nextNodes, nextEdges, { memory: nextMemory, clockLevel: clockRef.current });
    setNodes(nextNodes);
    setEdges(nextEdges);
    setMemory(nextMemory);
    memoryRef.current = nextMemory;
    setHistory((current) => [...current.slice(-39), snapshot(nextNodes, nextEdges)]);
    setFuture([]);
    if (options.capture) recordTiming(nextSimulation, options.label);
    if (message) setNotice(message);
  }

  function addNode(type, position) {
    if (!isImplementedComponent(type)) return;
    const definition = getComponent(type);
    const index = nodes.length;
    const nextNode = {
      id: createId("node"),
      type,
      label: nextLabel(type, nodes),
      x: position?.x ?? snap(110 + ((index * 44) % 580)),
      y: position?.y ?? snap(112 + ((index * 67) % 510)),
      properties: { ...(definition?.properties ?? {}) },
    };
    commit([...nodes, nextNode], edges, `${definition.name} added to workspace.`);
    setSelected({ kind: "node", id: nextNode.id });
  }

  function startConnection(event, nodeId, sourcePort) {
    event.stopPropagation();
    setConnecting({ nodeId, sourcePort });
    setNotice(`Connect ${sourcePort} output: select a target input pin.`);
  }

  function completeConnection(event, targetId, targetPort) {
    event.stopPropagation();
    if (!connecting) {
      setNotice("Select a source output pin first.");
      return;
    }
    if (connecting.nodeId === targetId) {
      setNotice("A component cannot feed itself directly.");
      return;
    }
    const nextEdge = {
      id: createId("wire"),
      source: connecting.nodeId,
      sourcePort: connecting.sourcePort,
      target: targetId,
      targetPort,
    };
    const nextEdges = [...edges.filter((edge) => !(edge.target === targetId && edge.targetPort === targetPort)), nextEdge];
    commit(nodes, nextEdges, "Wire connected. Realtime propagation recalculated.");
    setConnecting(null);
    setSelected({ kind: "edge", id: nextEdge.id });
  }

  function toggleSource(nodeId) {
    const nextNodes = nodes.map((node) => node.id === nodeId
      ? { ...node, properties: { ...node.properties, value: !node.properties?.value } }
      : node);
    commit(nextNodes, edges, "Digital source toggled.", { capture: true, label: `INPUT ${tickCount}` });
  }

  function updateNodeLabel(value) {
    if (!selectedNode) return;
    const label = value.slice(0, 28);
    setNodes((current) => current.map((node) => node.id === selectedNode.id ? { ...node, label } : node));
  }

  function finishLabelCommit() {
    commit(nodesRef.current, edgesRef.current, "Component label updated.");
  }

  function duplicateSelection() {
    if (!selectedNode) return;
    const copy = {
      ...selectedNode,
      id: createId("node"),
      label: `${selectedNode.label} copy`,
      x: snap(selectedNode.x + 40),
      y: snap(selectedNode.y + 40),
      properties: { ...selectedNode.properties },
    };
    commit([...nodes, copy], edges, `${selectedNode.label} duplicated.`);
    setSelected({ kind: "node", id: copy.id });
  }

  function deleteSelection() {
    if (selectedEdge) {
      commit(nodes, edges.filter((edge) => edge.id !== selectedEdge.id), "Wire deleted.");
      setSelected({ kind: null, id: null });
      return;
    }
    if (!selectedNode) return;
    const nextNodes = nodes.filter((node) => node.id !== selectedNode.id);
    const nextEdges = edges.filter((edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id);
    commit(nextNodes, nextEdges, `${selectedNode.label} deleted.`);
    setSelected({ kind: null, id: null });
  }

  function resetSequential() {
    const resetMemory = resetSequentialState(nodesRef.current);
    memoryRef.current = resetMemory;
    setMemory(resetMemory);
    setClockLevel(false);
    clockRef.current = false;
    setTickCount(0);
    setTiming([]);
    setNotice("Sequential state and timing diagram reset.");
  }

  function stepClock() {
    const nextLevel = !clockRef.current;
    const currentNodes = nodesRef.current;
    const currentEdges = edgesRef.current;
    let nextMemory = memoryRef.current;
    const preview = evaluateCircuit(currentNodes, currentEdges, { memory: nextMemory, clockLevel: nextLevel });

    if (!clockRef.current && nextLevel) {
      nextMemory = captureRisingEdge(currentNodes, currentEdges, preview, nextMemory);
      memoryRef.current = nextMemory;
      setMemory(nextMemory);
    }

    clockRef.current = nextLevel;
    setClockLevel(nextLevel);
    setTickCount((value) => value + 1);
    const after = evaluateCircuit(currentNodes, currentEdges, { memory: nextMemory, clockLevel: nextLevel });
    recordTiming(after, `${nextLevel ? "↑" : "↓"} ${tickCount + 1}`);
    setNotice(nextLevel ? "Rising clock edge captured sequential inputs." : "Clock returned LOW.");
  }

  useEffect(() => {
    if (!clockRunning) return undefined;
    const id = window.setInterval(stepClock, 850);
    return () => window.clearInterval(id);
  });

  function loadTemplate(id) {
    const template = cloneTemplate(id);
    setClockRunning(false);
    setClockLevel(false);
    clockRef.current = false;
    setTickCount(0);
    setTiming([]);
    commit(template.nodes, template.edges, `${template.name} template loaded.`, { resetMemory: true });
    setSelected({ kind: "node", id: template.nodes[0]?.id ?? null });
    setConnecting(null);
  }

  function newProject() {
    setClockRunning(false);
    setClockLevel(false);
    clockRef.current = false;
    setTickCount(0);
    setTiming([]);
    commit([], [], "Empty circuit project created.", { resetMemory: true });
    setSelected({ kind: null, id: null });
    setConnecting(null);
  }

  function undo() {
    if (history.length <= 1) return;
    const previous = JSON.parse(history[history.length - 2]);
    setFuture((current) => [history[history.length - 1], ...current]);
    setHistory((current) => current.slice(0, -1));
    setNodes(previous.nodes);
    setEdges(previous.edges);
    const nextMemory = reconcileSequentialState(previous.nodes, memoryRef.current);
    setMemory(nextMemory);
    memoryRef.current = nextMemory;
    setNotice("Undo applied.");
  }

  function redo() {
    if (!future.length) return;
    const nextSerialized = future[0];
    const next = JSON.parse(nextSerialized);
    setFuture((current) => current.slice(1));
    setHistory((current) => [...current, nextSerialized]);
    setNodes(next.nodes);
    setEdges(next.edges);
    const nextMemory = reconcileSequentialState(next.nodes, memoryRef.current);
    setMemory(nextMemory);
    memoryRef.current = nextMemory;
    setNotice("Redo applied.");
  }

  function loadJson(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) throw new Error("invalid");
        const nextMemory = parsed.memory ?? resetSequentialState(parsed.nodes);
        memoryRef.current = nextMemory;
        setMemory(nextMemory);
        commit(parsed.nodes, parsed.edges, "Project JSON loaded.");
        setSelected({ kind: "node", id: parsed.nodes[0]?.id ?? null });
      } catch {
        setNotice("Invalid CITools circuit JSON file.");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  }

  function beginNodeDrag(event, node) {
    if (event.target.closest("button") || event.target.closest("input")) return;
    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const scale = zoom / 100;
    setDrag({ id: node.id, node, offsetX: (event.clientX - rect.left) / scale - node.x, offsetY: (event.clientY - rect.top) / scale - node.y });
    setSelected({ kind: "node", id: node.id });
  }

  function onComponentDrop(event) {
    event.preventDefault();
    const type = event.dataTransfer.getData("application/citools-component");
    if (!type) return;
    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const scale = zoom / 100;
    const x = snap(Math.max(18, Math.min(BOARD_W - NODE_W - 18, (event.clientX - rect.left) / scale - NODE_W / 2)));
    const y = snap(Math.max(58, Math.min(BOARD_H - MIN_NODE_H - 18, (event.clientY - rect.top) / scale - MIN_NODE_H / 2)));
    addNode(type, { x, y });
  }

  useEffect(() => {
    const handler = (event) => {
      const inField = ["INPUT", "TEXTAREA", "SELECT"].includes(event.target?.tagName);
      if (inField) return;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        event.shiftKey ? redo() : undo();
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        downloadJson(nodesRef.current, edgesRef.current, memoryRef.current);
      }
      if (event.key === "Delete" || event.key === "Backspace") deleteSelection();
      if (event.code === "Space" && clockPresent) {
        event.preventDefault();
        stepClock();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  const visibleLibrary = useMemo(() => {
    const term = search.trim().toLowerCase();
    return COMPONENT_CATEGORIES.map((category) => ({
      ...category,
      items: getComponentsByCategory(category.id).filter((item) => !term || item.name.toLowerCase().includes(term) || item.type.toLowerCase().includes(term)),
    })).filter((category) => category.items.length);
  }, [search]);

  const selectedNibble = selectedNode && ["BINARY4", "HEX4", "REGISTER4", "COUNTER4"].includes(selectedNode.type)
    ? formatNibble(simulation.nodeOutputs[selectedNode.id] ?? {})
    : null;

  return (
    <section className="dil-shell" aria-label="Digital and Electronics Interactive Lab">
      <header className="dil-toolbar">
        <div className="dil-brand">
          <span className="dil-live-dot" />
          <div>
            <small>CITools · Circuit IDE</small>
            <strong>Digital &amp; Electronics Interactive Lab</strong>
          </div>
          <em>Phase 2 Sequential Core</em>
        </div>
        <div className="dil-tools">
          <button type="button" onClick={newProject}>New</button>
          <select value={templateId} onChange={(event) => setTemplateId(event.target.value)} aria-label="Template circuit">
            {CIRCUIT_TEMPLATES.map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}
          </select>
          <button type="button" onClick={() => loadTemplate(templateId)}>Load Template</button>
          <button type="button" disabled={history.length <= 1} onClick={undo}>Undo</button>
          <button type="button" disabled={!future.length} onClick={redo}>Redo</button>
          <button type="button" onClick={() => downloadJson(nodes, edges, memory)}>Export JSON</button>
          <button type="button" onClick={() => fileRef.current?.click()}>Load JSON</button>
          <input ref={fileRef} type="file" accept="application/json" hidden onChange={loadJson} />
        </div>
      </header>

      <div className="dil-sequential-bar">
        <div>
          <small>Sequential Simulator</small>
          <strong>Clock Level <b className={clockLevel ? "is-high" : ""}>{clockLevel ? "HIGH · 1" : "LOW · 0"}</b></strong>
          <span>{clockPresent ? `Tick ${tickCount}` : "Add a Clock component or load a Memory template."}</span>
        </div>
        <div>
          <button type="button" className={clockRunning ? "active" : ""} disabled={!clockPresent} onClick={() => setClockRunning((value) => !value)}>{clockRunning ? "Pause Clock" : "Run Clock"}</button>
          <button type="button" disabled={!clockPresent} onClick={stepClock}>Step Edge</button>
          <button type="button" onClick={resetSequential}>Reset State</button>
          <kbd>Space = Step</kbd>
        </div>
      </div>

      <div className="dil-grid">
        <aside className="dil-library">
          <div className="dil-panel-heading"><span>Component Library</span><b>Parts Registry</b></div>
          <label className="dil-search"><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search components" /></label>
          {!search && (
            <nav className="dil-category-tabs" aria-label="Component categories">
              {COMPONENT_CATEGORIES.map((category) => (
                <button type="button" key={category.id} className={activeCategory === category.id ? "active" : ""} onClick={() => setActiveCategory(category.id)}>{category.icon}<span>{category.name}</span></button>
              ))}
            </nav>
          )}
          <div className="dil-library-scroll">
            {visibleLibrary.filter((category) => search || category.id === activeCategory).map((category) => (
              <section className="dil-library-group" key={category.id}>
                <h3>{category.name}</h3>
                <div>
                  {category.items.map((definition) => <LibraryItem key={definition.type} definition={definition} onAdd={addNode} />)}
                </div>
              </section>
            ))}
          </div>
          <div className="dil-library-note"><b>Phase status</b><span>Clock, DFF, Register, Counter and 4-bit monitors are now live.</span><span>Electronics and Arduino modules remain planned.</span></div>
        </aside>

        <main className="dil-workspace">
          <div className="dil-canvas-toolbar">
            <div>
              <strong>Infinite Grid Workspace</strong>
              <span>{notice}</span>
            </div>
            <div className="dil-canvas-actions">
              <label><input type="checkbox" checked={snapEnabled} onChange={() => setSnapEnabled((value) => !value)} /> Snap grid</label>
              <button type="button" onClick={() => setZoom((value) => Math.max(60, value - 10))}>−</button>
              <b>{zoom}%</b>
              <button type="button" onClick={() => setZoom((value) => Math.min(150, value + 10))}>+</button>
              <span className="dil-signal-pill">Signal Live</span>
            </div>
          </div>
          <div className="dil-canvas-frame">
            <div
              ref={boardRef}
              className="dil-canvas"
              style={{ transform: `scale(${zoom / 100})` }}
              onDragOver={(event) => event.preventDefault()}
              onDrop={onComponentDrop}
              onClick={() => setSelected({ kind: null, id: null })}
            >
              <span className="dil-axis-label">DIGITAL SIGNAL PLANE · drag ready components here</span>
              <svg className="dil-wires" viewBox={`0 0 ${BOARD_W} ${BOARD_H}`}>
                {simulation.evaluatedEdges.map((edge) => {
                  const source = nodes.find((node) => node.id === edge.source);
                  const target = nodes.find((node) => node.id === edge.target);
                  if (!source || !target) return null;
                  const path = wirePath(source, edge.sourcePort ?? "out", target, edge.targetPort);
                  return (
                    <g key={edge.id} className={`dil-wire ${edge.active ? "is-high" : ""} ${selectedEdge?.id === edge.id ? "is-selected" : ""}`} onClick={(event) => { event.stopPropagation(); setSelected({ kind: "edge", id: edge.id }); }}>
                      <path className="dil-wire-hit" d={path} />
                      <path className="dil-wire-visible" d={path} />
                    </g>
                  );
                })}
              </svg>
              {nodes.map((node) => {
                const definition = getComponent(node.type);
                const firstOutput = outputPortsForType(node.type)[0] ?? "out";
                const active = readNodePort(simulation, node.id, firstOutput);
                return (
                  <article
                    key={node.id}
                    className={`dil-node type-${node.type.toLowerCase()} ${active ? "is-high" : ""} ${selectedNode?.id === node.id ? "is-selected" : ""}`}
                    style={{ left: node.x, top: node.y, minHeight: nodeHeight(node) }}
                    onPointerDown={(event) => beginNodeDrag(event, node)}
                    onClick={(event) => { event.stopPropagation(); setSelected({ kind: "node", id: node.id }); }}
                  >
                    <header><i>{definition?.icon}</i><div><small>{definition?.category}</small><strong>{node.label}</strong></div></header>
                    {inputPortsForType(node.type).map((port) => (
                      <button key={port} type="button" className={`dil-port dil-input-port ${port === "rst" ? "is-optional" : ""}`} style={{ top: portY({ ...node, y: 0 }, port, "in") }} onClick={(event) => completeConnection(event, node.id, port)} title={`Input ${port}`}><span>{port}</span></button>
                    ))}
                    {outputPortsForType(node.type).map((port) => (
                      <button key={port} type="button" className={`dil-port dil-output-port ${connecting?.nodeId === node.id && connecting?.sourcePort === port ? "is-connecting" : ""}`} style={{ top: portY({ ...node, y: 0 }, port, "out") }} onClick={(event) => startConnection(event, node.id, port)} title={`Output ${port}`}><span>{outputLabel(port)}</span></button>
                    ))}
                    {["INPUT", "CONSTANT"].includes(node.type) ? (
                      <button type="button" className={`dil-toggle ${node.properties?.value ? "is-high" : ""}`} onClick={(event) => { event.stopPropagation(); toggleSource(node.id); }}>{node.properties?.value ? "HIGH · 1" : "LOW · 0"}</button>
                    ) : node.type === "CLOCK" ? (
                      <div className={`dil-clock-face ${clockLevel ? "is-high" : ""}`}><span /><strong>{clockLevel ? "↑ HIGH" : "LOW"}</strong></div>
                    ) : (
                      <NodeReadout node={node} simulation={simulation} />
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        </main>

        <aside className="dil-inspector">
          <div className="dil-panel-heading"><span>Inspector</span><b>{selectedNode ? "Component" : selectedEdge ? "Wire" : "Nothing Selected"}</b></div>
          {selectedNode ? (
            <div className="dil-selected-card">
              <span>{selectedDefinition?.name}</span>
              <label>Rename component<input value={selectedNode.label} onChange={(event) => updateNodeLabel(event.target.value)} onBlur={finishLabelCommit} /></label>
              <p>{selectedDefinition?.description}</p>
              <div className="dil-properties">
                <span>Inputs <b>{inputPortsForType(selectedNode.type).length}</b></span>
                <span>Outputs <b>{outputPortsForType(selectedNode.type).length}</b></span>
                <span>Bits <b>{selectedDefinition?.properties?.width ?? 1}</b></span>
              </div>
              {isSequentialComponent(selectedNode.type) && <div className="dil-seq-badge"><small>Sequential State</small><strong>Captured on rising clock edge</strong></div>}
              {selectedNibble ? (
                <div className="dil-inspector-monitor"><small>Live monitor</small><strong>{selectedNibble.binary}</strong><b>HEX {selectedNibble.hex}</b></div>
              ) : (
                <div className="dil-inspector-signal"><small>Live output</small>{outputPortsForType(selectedNode.type).map((port) => <span key={port}>{outputLabel(port)} <PortSignal value={readNodePort(simulation, selectedNode.id, port)} /></span>)}</div>
              )}
              <div className="dil-inspector-actions"><button type="button" onClick={duplicateSelection}>Duplicate</button><button type="button" className="danger" onClick={deleteSelection}>Delete</button></div>
            </div>
          ) : selectedEdge ? (
            <div className="dil-selected-card"><span>Wire</span><h3>{selectedEdge.sourcePort ?? "out"} → {selectedEdge.targetPort}</h3><div className="dil-inspector-signal"><small>Live signal</small><PortSignal value={selectedEdge.active} /></div><div className="dil-inspector-actions"><button type="button" className="danger" onClick={deleteSelection}>Delete wire</button></div></div>
          ) : <p className="dil-empty">Select a component or wire to inspect its live state.</p>}
          <div className="dil-provider-card"><span>Optional AI architecture</span><strong>aiProvider: {AI_PROVIDER}</strong><p>Simulator is fully usable offline. AI remains disabled by default.</p></div>
        </aside>
      </div>

      <section className="dil-bottom-panel">
        <nav>
          {["console", "truth", "timing", "errors"].map((tab) => <button key={tab} type="button" className={bottomTab === tab ? "active" : ""} onClick={() => setBottomTab(tab)}>{tab === "truth" ? "Truth Table" : tab}</button>)}
        </nav>
        {bottomTab === "console" && (
          <div className="dil-console">
            <p><strong>ENGINE</strong> Digital and clocked propagation is active.</p>
            <p><strong>CLOCK</strong> {clockPresent ? `${clockRunning ? "RUNNING" : "PAUSED"} · level ${clockLevel ? 1 : 0} · tick ${tickCount}` : "No Clock component in workspace."}</p>
            <p><strong>MONITOR</strong> {inputs.map((node) => `${node.label}=${readNodePort(simulation, node.id, outputPortsForType(node.type)[0] ?? "out") ? 1 : 0}`).join("  ") || "No sources"} │ {monitorNodes.map((node) => `${node.label}=${["BINARY4", "HEX4", "COUNTER4", "REGISTER4"].includes(node.type) ? formatNibble(simulation.nodeOutputs[node.id]).binary : (readNodePort(simulation, node.id) ? 1 : 0)}`).join("  ") || "No monitors"}</p>
            <p><strong>NOTICE</strong> {notice}</p>
          </div>
        )}
        {bottomTab === "errors" && (
          <div className="dil-errors">{simulation.warnings.length ? simulation.warnings.map((warning) => <p key={warning}>⚠ {warning}</p>) : <p className="ok">✓ No floating inputs or propagation errors detected.</p>}</div>
        )}
        {bottomTab === "truth" && (
          <div className="dil-truth">{selectedNode && truthRows.length ? <table><thead><tr>{inputPortsForType(selectedNode.type).map((port) => <th key={port}>{port}</th>)}{outputPortsForType(selectedNode.type).map((port) => <th key={port}>{outputLabel(port)}</th>)}</tr></thead><tbody>{truthRows.map((row, index) => <tr key={index}>{Object.values(row.inputs).map((value, cell) => <td key={cell}>{value ? 1 : 0}</td>)}{Object.values(row.outputs).map((value, cell) => <td key={cell}>{value ? 1 : 0}</td>)}</tr>)}</tbody></table> : <p>Combinational components show a truth table here. Clocked memory is visualized in Timing Diagram.</p>}</div>
        )}
        {bottomTab === "timing" && (
          <div className="dil-timing">
            <div className="dil-wave-head"><strong>Timing Diagram</strong><span>Clocked snapshots · load Counter or Register template, then Run Clock</span></div>
            {timing.length && monitoredSignals.length ? (
              <div className="dil-wave-chart">
                <div className="dil-wave-axis"><span>Signal</span>{timing.map((entry, index) => <small key={`${entry.label}-${index}`}>{entry.label}</small>)}</div>
                {monitoredSignals.map((channel) => (
                  <div className="dil-wave-channel" key={channel.key}>
                    <b>{channel.label}</b>
                    {timing.map((entry, index) => <span key={`${channel.key}-${index}`} className={entry.signals[channel.key] ? "high" : "low"}>{entry.signals[channel.key] ? "1" : "0"}</span>)}
                  </div>
                ))}
              </div>
            ) : <p>Run or step a clocked template to capture digital transitions.</p>}
          </div>
        )}
      </section>
    </section>
  );
}
