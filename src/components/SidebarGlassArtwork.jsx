const GRAY = {
  1: ["0", "1"],
  2: ["00", "01", "11", "10"],
};

function mapLayout(variableCount) {
  const rowBits = variableCount === 4 ? 2 : 1;
  const colBits = variableCount - rowBits;
  const rows = GRAY[rowBits];
  const cols = GRAY[colBits];
  const cells = [];

  rows.forEach((rowCode, row) => {
    cols.forEach((colCode, col) => {
      cells.push({
        row,
        col,
        minterm: parseInt(`${rowCode}${colCode}`, 2),
      });
    });
  });

  return { rows, cols, cells };
}


function ArtifactThemeMotif({ kind }) {
  if (kind === "kmap") {
    return (
      <g className="artifact-theme-motifs kmap-material-motifs">
        <g className="artifact-motif motif-original">
          <path className="motif-line" d="M76 99 V90 H85 M208 99 V90 H199 M76 193 V202 H85 M208 193 V202 H199" />
          <circle className="motif-beacon" cx="218" cy="111" r="2.5" />
        </g>
        <g className="artifact-motif motif-rose">
          <path className="motif-line" d="M69 157 C55 139 61 112 82 102 C99 94 112 96 125 103" />
          <path className="motif-line soft" d="M199 184 C220 172 226 147 215 127 C211 119 207 114 201 110" />
          <path className="motif-fill" d="M72 151 C61 142 62 133 76 130 C87 134 87 144 72 151 Z" />
          <path className="motif-fill alt" d="M211 161 C221 153 219 143 206 140 C196 146 199 155 211 161 Z" />
        </g>
        <g className="artifact-motif motif-ocean">
          <path className="motif-line" d="M54 190 C76 178 92 202 114 190 C136 178 152 202 174 190 C196 178 211 198 227 190" />
          <path className="motif-line soft" d="M61 200 C82 188 99 211 120 200 C142 188 157 211 179 200" />
          <circle className="motif-bubble" cx="218" cy="112" r="6" />
          <circle className="motif-bubble small" cx="229" cy="99" r="3" />
        </g>
        <g className="artifact-motif motif-forest">
          <path className="motif-line" d="M70 201 C75 179 79 165 93 148 C102 137 105 120 107 101" />
          <path className="motif-fill" d="M80 171 C61 164 62 151 84 154 C91 160 90 167 80 171 Z" />
          <path className="motif-fill alt" d="M91 144 C95 127 108 125 108 143 C102 150 97 150 91 144 Z" />
        </g>
        <g className="artifact-motif motif-coffee">
          <circle className="motif-ring" cx="210" cy="168" r="28" />
          <circle className="motif-ring soft" cx="210" cy="168" r="21" />
          <path className="motif-line" d="M65 202 H101 M65 198 V206 M101 198 V206" />
          <path className="motif-line soft" d="M202 116 C196 108 200 101 207 94 M215 116 C209 107 215 100 220 94" />
        </g>
      </g>
    );
  }

  if (kind === "learning") {
    return (
      <g className="artifact-theme-motifs learning-material-motifs">
        <g className="artifact-motif motif-original">
          <path className="motif-line" d="M32 96 H47 M32 96 V112 M262 96 H247 M262 96 V112 M32 194 H47 M32 194 V178 M262 194 H247 M262 194 V178" />
          <circle className="motif-beacon" cx="220" cy="112" r="2.5" />
        </g>
        <g className="artifact-motif motif-rose">
          <path className="motif-line" d="M112 98 C126 83 155 82 170 98 C184 113 185 128 191 144 C184 162 184 178 169 190 C150 202 124 199 112 187" />
          <path className="motif-fill" d="M100 105 C91 92 101 85 114 95 C116 102 110 107 100 105 Z" />
          <path className="motif-fill alt" d="M204 181 C216 169 224 176 214 188 C207 191 202 187 204 181 Z" />
        </g>
        <g className="artifact-motif motif-ocean">
          <path className="motif-line" d="M28 194 C47 184 62 203 82 194 C102 185 116 204 136 194 C156 184 172 203 192 194 C211 185 226 203 248 194" />
          <path className="motif-line soft" d="M30 101 C54 92 70 109 92 101" />
          <circle className="motif-bubble" cx="239" cy="106" r="6" />
        </g>
        <g className="artifact-motif motif-forest">
          <path className="motif-line" d="M106 193 C115 174 121 154 122 119 C126 105 134 96 149 92" />
          <path className="motif-fill" d="M113 157 C94 150 94 137 115 142 C122 148 120 154 113 157 Z" />
          <path className="motif-fill alt" d="M123 132 C127 115 140 113 139 131 C133 137 128 137 123 132 Z" />
        </g>
        <g className="artifact-motif motif-coffee">
          <path className="motif-line" d="M92 191 C92 184 98 179 105 179 H193 C202 179 207 184 207 191" />
          <circle className="motif-ring" cx="151" cy="144" r="49" />
          <path className="motif-line soft" d="M143 95 C137 86 142 79 148 73 M157 95 C151 86 157 79 162 73" />
        </g>
      </g>
    );
  }

  return (
    <g className="artifact-theme-motifs circuit-material-motifs">
      <g className="artifact-motif motif-original">
        <path className="motif-line" d="M28 78 H48 M28 78 V99 M269 203 H247 M269 203 V182" />
        <circle className="motif-beacon" cx="251" cy="92" r="2.8" />
      </g>
      <g className="artifact-motif motif-rose">
        <path className="motif-line" d="M29 177 C45 143 42 111 68 94 C85 83 95 83 107 87" />
        <path className="motif-fill" d="M53 126 C38 117 42 105 59 110 C65 117 62 124 53 126 Z" />
        <path className="motif-fill alt" d="M73 102 C76 86 88 84 89 100 C84 107 78 107 73 102 Z" />
      </g>
      <g className="artifact-motif motif-ocean">
        <path className="motif-line" d="M28 198 C51 187 66 210 89 198 C112 187 127 210 150 198 C173 187 188 210 211 198 C233 188 246 203 265 198" />
        <circle className="motif-bubble" cx="245" cy="111" r="7" />
        <circle className="motif-bubble small" cx="257" cy="98" r="3.4" />
      </g>
      <g className="artifact-motif motif-forest">
        <path className="motif-line" d="M33 198 C45 173 50 154 49 121 C54 104 65 92 83 84" />
        <path className="motif-fill" d="M49 152 C30 145 31 132 52 137 C59 143 57 149 49 152 Z" />
        <path className="motif-fill alt" d="M56 118 C60 101 73 99 73 117 C67 123 62 123 56 118 Z" />
      </g>
      <g className="artifact-motif motif-coffee">
        <circle className="motif-ring" cx="230" cy="171" r="29" />
        <circle className="motif-ring soft" cx="230" cy="171" r="20" />
        <path className="motif-line soft" d="M207 112 C202 102 207 95 212 88 M220 112 C214 102 220 95 225 88" />
      </g>
    </g>
  );
}

function KMapArtifact({
  activeMinterms = [],
  selectedGroups = [],
  variableCount = 3,
  validationState = "empty",
  expression = "0",
  groupCount = 0,
  pulseKey = 0,
}) {
  const { rows, cols, cells } = mapLayout(variableCount);
  const active = new Set(activeMinterms);
  const cellSize = variableCount === 4 ? 31 : 37;
  const gap = 6;
  const boardWidth = cols.length * cellSize + (cols.length - 1) * gap;
  const boardHeight = rows.length * cellSize + (rows.length - 1) * gap;
  const originX = 92 - boardWidth / 2;
  const originY = 109;
  const groupPalette = ["pink", "cyan", "violet", "mint"];
  const statusText = validationState === "empty"
    ? "SELECT CELLS TO START"
    : validationState === "valid"
      ? `SIMPLIFIED / ${groupCount} GROUP${groupCount === 1 ? "" : "S"}`
      : "CHECK COVERAGE";
  const compactExpression = expression.length > 22
    ? `${expression.slice(0, 21)}…`
    : expression;

  return (
    <svg className={`artifact-svg kmap-artifact state-${validationState}`} viewBox="0 0 295 270" role="presentation">
      <g className="artifact-grid-meta">
        <text x="26" y="91">GRAY</text>
        <text x="27" y="102">CODE</text>
        <path d="M64 96 H76" />
      </g>

      <g className="artifact-board-shadow">
        <rect x={originX - 12} y={originY - 15} width={boardWidth + 24} height={boardHeight + 30} rx="22" />
      </g>

      <ArtifactThemeMotif kind="kmap" />

      <g className="artifact-axis">
        {cols.map((code, col) => (
          <text key={`col-${code}`} x={originX + col * (cellSize + gap) + cellSize / 2} y={originY - 7}>{code}</text>
        ))}
        {rows.map((code, row) => (
          <text key={`row-${code}`} x={originX - 13} y={originY + row * (cellSize + gap) + cellSize / 2 + 3}>{code}</text>
        ))}
      </g>

      <g className="artifact-kmap-cells">
        {cells.map((cell) => (
          <rect
            key={cell.minterm}
            className={active.has(cell.minterm) ? "map-art-cell active" : "map-art-cell"}
            x={originX + cell.col * (cellSize + gap)}
            y={originY + cell.row * (cellSize + gap)}
            width={cellSize}
            height={cellSize}
            rx="9"
          />
        ))}
      </g>

      <g className="artifact-kmap-groups">
        {selectedGroups.slice(0, 4).flatMap((group, groupIndex) =>
          group.minterms.map((minterm) => {
            const cell = cells.find((item) => item.minterm === minterm);
            if (!cell) return null;
            return (
              <rect
                key={`group-${groupIndex}-${minterm}`}
                className={`map-art-group group-${groupPalette[groupIndex]}`}
                x={originX + cell.col * (cellSize + gap) - 3}
                y={originY + cell.row * (cellSize + gap) - 3}
                width={cellSize + 6}
                height={cellSize + 6}
                rx="12"
              />
            );
          })
        )}
      </g>

      {pulseKey > 0 && (
        <g key={`kmap-pulse-${pulseKey}`} className="kmap-feedback-pulse">
          <rect
            x={originX - 12}
            y={originY - 15}
            width={boardWidth + 24}
            height={boardHeight + 30}
            rx="22"
          />
        </g>
      )}

      <g className="artifact-status-line">
        <circle cx="30" cy="224" r="4" className={validationState === "valid" ? "status-dot live" : "status-dot"} />
        <text x="41" y="227">{statusText}</text>
      </g>

      <g className="artifact-readout">
        <rect x="29" y="236" width="181" height="21" rx="10.5" />
        <text x="41" y="249">F = {compactExpression}</text>
      </g>
    </svg>
  );
}

function gatePath(gate) {
  if (gate === "NOT") return "M129 113 L129 175 L184 144 Z";
  if (gate === "AND" || gate === "NAND") return "M126 113 H155 C190 113 194 175 155 175 H126 Z";
  if (gate === "XOR" || gate === "OR" || gate === "NOR" || gate === "XNOR") {
    return "M130 113 C149 127 149 161 130 175 C158 168 185 167 196 144 C185 121 158 120 130 113 Z";
  }
  return "M126 113 H155 C190 113 194 175 155 175 H126 Z";
}

function LearningArtifact({ gate = "AND", a = 0, b = 0, output = 0, pulseKey = 0 }) {
  const singleInput = gate === "NOT";
  const inverted = gate === "NOT" || gate === "NAND" || gate === "NOR" || gate === "XNOR";
  const equation = singleInput ? `${gate} ${a} = ${output}` : `${a} ${gate} ${b} = ${output}`;

  return (
    <svg className={`artifact-svg learning-artifact output-${output}`} viewBox="0 0 295 270" role="presentation">
      <g className="learning-board">
        <rect x="24" y="85" width="247" height="121" rx="25" />
        <path className={a ? "signal-wire live" : "signal-wire"} d="M58 126 H119" />
        {!singleInput && <path className={b ? "signal-wire live secondary" : "signal-wire secondary"} d="M58 163 H119" />}
        <path className={output ? "signal-wire output live" : "signal-wire output"} d="M203 144 H236" />
      </g>

      {pulseKey > 0 && (
        <g key={`learning-pulse-${pulseKey}`} className="learning-action-pulse">
          <path className="pulse-input" d="M58 126 H119" />
          {!singleInput && <path className="pulse-input secondary" d="M58 163 H119" />}
          <path className="pulse-output" d="M203 144 H236" />
          <circle className="pulse-lamp" cx="249" cy="144" r="21" />
        </g>
      )}

      <ArtifactThemeMotif kind="learning" />

      <g className="learning-input-node">
        <circle className={a ? "node active" : "node"} cx="47" cy="126" r="15" />
        <text x="43" y="130">A</text>
        <text className={a ? "logic-bit active" : "logic-bit"} x="65" y="130">{a}</text>
        {!singleInput && (
          <>
            <circle className={b ? "node active" : "node"} cx="47" cy="163" r="15" />
            <text x="43" y="167">B</text>
            <text className={b ? "logic-bit active" : "logic-bit"} x="65" y="167">{b}</text>
          </>
        )}
      </g>

      <g className="learning-gate">
        <path d={gatePath(gate)} />
        {gate === "XOR" || gate === "XNOR" ? <path className="xor-mark" d="M123 113 C142 127 142 161 123 175" /> : null}
        {inverted ? <circle className="invert-ring" cx={gate === "NOT" ? 191 : 202} cy="144" r="6" /> : null}
        <text x="160" y="148">{gate}</text>
      </g>

      <g className="learning-output">
        <circle className={output ? "lamp active" : "lamp"} cx="249" cy="144" r="17" />
        <text x="245" y="148">Q</text>
        <text className={output ? "logic-bit active" : "logic-bit"} x="244" y="183">{output}</text>
      </g>

      <g className="artifact-status-line">
        <circle cx="30" cy="224" r="4" className={output ? "status-dot live" : "status-dot"} />
        <text x="41" y="227">{output ? "OUTPUT HIGH" : "OUTPUT LOW"} / {gate}</text>
      </g>

      <g className="artifact-readout">
        <rect x="29" y="236" width="181" height="21" rx="10.5" />
        <text x="41" y="249">{equation}</text>
      </g>
    </svg>
  );
}

function CircuitArtifact({ circuitState = {} }) {
  const {
    nodeCount = 6,
    edgeCount = 6,
    activeEdgeCount = 0,
    outputHighCount = 0,
    selectedType = "LOGIC",
    templateName = "Custom Board",
    clockRunning = false,
    clockLevel = false,
  } = circuitState;

  const selectedToken = selectedType.slice(0, 6).toUpperCase();
  const hasInputSignal = activeEdgeCount > 0;
  const hasGateSignal = activeEdgeCount > 1;
  const hasOutputSignal = outputHighCount > 0;
  const hasClockSignal = clockRunning && clockLevel;
  const moduleSlots = Array.from(
    { length: Math.min(Math.max(nodeCount, 1), 6) },
    (_, index) => index
  );
  const boardStatus = clockRunning
    ? `CLK ${clockLevel ? "HIGH" : "LOW"} / ${activeEdgeCount} HIGH`
    : `${activeEdgeCount}/${edgeCount} WIRES HIGH`;
  const activityKey = `${activeEdgeCount}-${outputHighCount}-${selectedType}-${clockRunning ? Number(clockLevel) : "idle"}`;

  return (
    <svg className={`artifact-svg circuit-artifact ${hasInputSignal || hasClockSignal ? "activity-live" : "activity-idle"}`} viewBox="0 0 295 270" role="presentation">
      <g className="circuit-board-outline">
        <path d="M27 79 H252 L270 97 V204 H46 L27 185 Z" />
        <circle cx="43" cy="94" r="3" />
        <circle cx="251" cy="188" r="3" />
      </g>

      <ArtifactThemeMotif kind="deep" />

      <g className="circuit-telemetry">
        <text x="42" y="99">LIVE BOARD</text>
        <text x="177" y="99">{nodeCount} NODES / {edgeCount} EDGES</text>
      </g>

      <g className="circuit-traces">
        <path className={hasInputSignal ? "trace live" : "trace"} d="M59 132 H102 V116 H133" />
        <path className={hasGateSignal ? "trace live secondary" : "trace"} d="M59 164 H102 V176 H133" />
        <path className={hasOutputSignal ? "trace live delayed" : "trace"} d="M183 127 H209 V145 H237" />
        <path className={hasClockSignal ? "trace live clock" : "trace"} d="M183 170 H208 V161 H237" />
      </g>

      <g key={`activity-${activityKey}`} className="circuit-activity-feedback">
        <path d="M59 132 H102 V116 H133" />
        <path className="output-feedback" d="M183 127 H209 V145 H237" />
        <rect x="108" y="100" width="80" height="92" rx="19" />
      </g>

      <g className="circuit-modules">
        <g className="module input">
          <rect x="41" y="114" width="46" height="69" rx="13" />
          <text x="55" y="135">IN</text>
          <circle className={hasInputSignal ? "port live" : "port"} cx="73" cy="161" r="4" />
        </g>
        <g className="module gate selected">
          <rect x="111" y="103" width="74" height="86" rx="16" />
          <text className="selected-module-label" x="148" y="124">SELECTED</text>
          <text className="gate-token" x="148" y="151">{selectedToken}</text>
          <circle className={hasGateSignal ? "port live pulse" : "port"} cx="169" cy="171" r="4" />
        </g>
        <g className="module output">
          <rect x="211" y="126" width="44" height="50" rx="13" />
          <text x="226" y="146">Q</text>
          <circle className={hasOutputSignal ? "port live pulse" : "port"} cx="232" cy="161" r="5" />
        </g>
      </g>

      <g className="circuit-slot-bank">
        {moduleSlots.map((slot) => (
          <rect
            key={`slot-${slot}`}
            className={slot < activeEdgeCount ? "slot live" : "slot"}
            x={48 + slot * 24}
            y="194"
            width="17"
            height="7"
            rx="3.5"
          />
        ))}
      </g>

      <g className="artifact-status-line">
        <circle cx="30" cy="224" r="4" className={hasInputSignal || hasClockSignal ? "status-dot live" : "status-dot"} />
        <text x="41" y="227">{boardStatus}</text>
      </g>

      <g className="artifact-readout circuit-readout">
        <rect x="29" y="236" width="181" height="21" rx="10.5" />
        <text x="41" y="249">{outputHighCount ? `${outputHighCount} OUTPUT HIGH` : "OUTPUT IDLE"} / {selectedToken}</text>
      </g>

      <text className="circuit-template-label" x="264" y="227">{templateName.toUpperCase().slice(0, 15)}</text>
    </svg>
  );
}

export default function SidebarGlassArtwork({
  mode = "kmap",
  activeMinterms = [],
  selectedGroups = [],
  variableCount = 3,
  validationState = "empty",
  expression = "0",
  groupCount = 0,
  kmapPulseKey = 0,
  gate = "AND",
  a = 0,
  b = 0,
  output = 0,
  learningPulseKey = 0,
  circuitState = {},
}) {
  return (
    <div className={`sidebar-artwork adaptive-artwork art-${mode}`} aria-hidden="true">
      <div className="artifact-halo" />
      {mode === "learning" ? (
        <LearningArtifact gate={gate} a={a} b={b} output={output} pulseKey={learningPulseKey} />
      ) : mode === "deep" ? (
        <CircuitArtifact circuitState={circuitState} />
      ) : (
        <KMapArtifact
          activeMinterms={activeMinterms}
          selectedGroups={selectedGroups}
          variableCount={variableCount}
          validationState={validationState}
          expression={expression}
          groupCount={groupCount}
          pulseKey={kmapPulseKey}
        />
      )}
    </div>
  );
}
