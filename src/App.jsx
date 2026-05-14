import { useMemo, useState } from "react";
import "./index.css";

const ALL_VARIABLES = ["A", "B", "C", "D"];

function grayCodes(bitCount) {
  if (bitCount === 1) return ["0", "1"];
  if (bitCount === 2) return ["00", "01", "11", "10"];
  return ["0"];
}

function makeConfig(variableCount) {
  const variables = ALL_VARIABLES.slice(0, variableCount);
  const rowVarCount = variableCount === 4 ? 2 : 1;
  const colVarCount = variableCount - rowVarCount;

  const rowVars = variables.slice(0, rowVarCount);
  const colVars = variables.slice(rowVarCount);

  const rowCodes = grayCodes(rowVarCount);
  const colCodes = grayCodes(colVarCount);

  const cells = [];

  rowCodes.forEach((rowCode, row) => {
    colCodes.forEach((colCode, col) => {
      const bits = rowCode + colCode;
      const minterm = parseInt(bits, 2);

      cells.push({
        row,
        col,
        bits,
        minterm,
        label: `m${minterm}`,
      });
    });
  });

  return {
    variableCount,
    variables,
    rowVars,
    colVars,
    rowCodes,
    colCodes,
    rowCount: rowCodes.length,
    colCount: colCodes.length,
    cells,
    maxMinterm: 2 ** variableCount - 1,
  };
}

function binaryOf(minterm, variableCount) {
  return minterm
    .toString(2)
    .padStart(variableCount, "0")
    .split("")
    .map(Number);
}

function variableLabel(vars, code) {
  return code
    .split("")
    .map((bit, index) => (bit === "1" ? vars[index] : `${vars[index]}'`))
    .join("");
}

function groupKey(minterms) {
  return [...minterms].sort((a, b) => a - b).join(",");
}

function getCell(config, row, col) {
  const fixedRow = ((row % config.rowCount) + config.rowCount) % config.rowCount;
  const fixedCol = ((col % config.colCount) + config.colCount) % config.colCount;

  return config.cells.find((cell) => cell.row === fixedRow && cell.col === fixedCol);
}

function termFromGroup(group, config) {
  const binaries = group.minterms.map((m) => binaryOf(m, config.variableCount));
  const result = [];

  for (let i = 0; i < config.variableCount; i++) {
    const values = new Set(binaries.map((bits) => bits[i]));

    if (values.size === 1) {
      const value = binaries[0][i];
      result.push(value === 1 ? config.variables[i] : `${config.variables[i]}'`);
    }
  }

  return result.length === 0 ? "1" : result.join("");
}

function powerSizes(max) {
  const sizes = [];
  let value = 1;

  while (value <= max) {
    sizes.push(value);
    value *= 2;
  }

  return sizes;
}

function groupType(rect, config) {
  const size = rect.rowSize * rect.colSize;

  if (size === config.rowCount * config.colCount) return "all cells";
  if (size === 1) return "single cell";
  if (rect.rowSize === 1 && rect.colSize > 1) return "horizontal";
  if (rect.rowSize > 1 && rect.colSize === 1) return "vertical";
  return "block";
}

function isWrap(rect, config) {
  const rowWrap = rect.rowStart + rect.rowSize > config.rowCount && rect.rowSize !== config.rowCount;
  const colWrap = rect.colStart + rect.colSize > config.colCount && rect.colSize !== config.colCount;

  return rowWrap || colWrap;
}

function generateGroups(activeMinterms, config) {
  const activeSet = new Set(activeMinterms);
  const groups = [];
  const seen = new Set();

  const rowSizes = powerSizes(config.rowCount);
  const colSizes = powerSizes(config.colCount);

  function addGroup(rect) {
    const minterms = [];

    for (let r = 0; r < rect.rowSize; r++) {
      for (let c = 0; c < rect.colSize; c++) {
        const cell = getCell(config, rect.rowStart + r, rect.colStart + c);
        minterms.push(cell.minterm);
      }
    }

    const unique = [...new Set(minterms)].sort((a, b) => a - b);

    if (!unique.every((m) => activeSet.has(m))) return;

    const key = groupKey(unique);
    if (seen.has(key)) return;

    const group = {
      minterms: unique,
      size: unique.length,
      rect,
      type: groupType(rect, config),
      wrap: isWrap(rect, config),
    };

    group.term = termFromGroup(group, config);

    seen.add(key);
    groups.push(group);
  }

  for (const rowSize of rowSizes) {
    for (const colSize of colSizes) {
      for (let rowStart = 0; rowStart < config.rowCount; rowStart++) {
        for (let colStart = 0; colStart < config.colCount; colStart++) {
          addGroup({
            rowStart,
            colStart,
            rowSize,
            colSize,
          });
        }
      }
    }
  }

  return groups.sort((a, b) => b.size - a.size);
}

function isSubgroup(group, other) {
  if (other.size <= group.size) return false;

  const otherSet = new Set(other.minterms);
  return group.minterms.every((m) => otherSet.has(m));
}

function removeSubgroups(groups) {
  return groups.filter((group) => {
    return !groups.some((other) => {
      if (groupKey(group.minterms) === groupKey(other.minterms)) return false;
      return isSubgroup(group, other);
    });
  });
}

function chooseGroups(activeMinterms, config) {
  if (activeMinterms.length === 0) {
    return {
      selectedGroups: [],
      expression: "0",
      covered: [],
      uncovered: [],
      candidates: [],
    };
  }

  const candidates = removeSubgroups(generateGroups(activeMinterms, config));
  const selectedGroups = [];
  const covered = new Set();

  for (const minterm of activeMinterms) {
    const covering = candidates.filter((group) => group.minterms.includes(minterm));

    if (covering.length === 1) {
      const essential = covering[0];

      if (!selectedGroups.some((g) => groupKey(g.minterms) === groupKey(essential.minterms))) {
        selectedGroups.push(essential);
        essential.minterms.forEach((m) => covered.add(m));
      }
    }
  }

  while (activeMinterms.some((m) => !covered.has(m))) {
    let bestGroup = null;
    let bestScore = -1;

    for (const group of candidates) {
      const alreadySelected = selectedGroups.some(
        (g) => groupKey(g.minterms) === groupKey(group.minterms)
      );

      if (alreadySelected) continue;

      const newCoverage = group.minterms.filter((m) => !covered.has(m)).length;
      const score = newCoverage * 100 + group.size;

      if (score > bestScore) {
        bestScore = score;
        bestGroup = group;
      }
    }

    if (!bestGroup) break;

    selectedGroups.push(bestGroup);
    bestGroup.minterms.forEach((m) => covered.add(m));
  }

  const uncovered = activeMinterms.filter((m) => !covered.has(m));
  const expression = selectedGroups.length === 0 ? "0" : selectedGroups.map((g) => g.term).join(" + ");

  return {
    selectedGroups,
    expression,
    covered: [...covered].sort((a, b) => a - b),
    uncovered,
    candidates,
  };
}

function validateCoverage(activeMinterms, selectedGroups) {
  if (activeMinterms.length === 0) {
    return {
      isEmpty: true,
      isValid: false,
      covered: [],
      uncovered: [],
    };
  }

  const covered = new Set();

  selectedGroups.forEach((group) => {
    group.minterms.forEach((m) => covered.add(m));
  });

  const uncovered = activeMinterms.filter((m) => !covered.has(m));

  return {
    isEmpty: false,
    isValid: uncovered.length === 0,
    covered: [...covered].filter((m) => activeMinterms.includes(m)).sort((a, b) => a - b),
    uncovered,
  };
}

function splitRange(start, size, count) {
  if (size === count) return [[0, count - 1]];

  const end = start + size - 1;

  if (end < count) {
    return [[start, end]];
  }

  return [
    [start, count - 1],
    [0, end % count],
  ];
}

function getVisualRects(group, config) {
  const rowRanges = splitRange(group.rect.rowStart, group.rect.rowSize, config.rowCount);
  const colRanges = splitRange(group.rect.colStart, group.rect.colSize, config.colCount);

  const rects = [];

  rowRanges.forEach(([rowStart, rowEnd]) => {
    colRanges.forEach(([colStart, colEnd]) => {
      rects.push({
        rowStart,
        rowEnd,
        colStart,
        colEnd,
      });
    });
  });

  return rects;
}

function rectStyle(rect, config) {
  return {
    left: `${(rect.colStart / config.colCount) * 100}%`,
    top: `${(rect.rowStart / config.rowCount) * 100}%`,
    width: `${((rect.colEnd - rect.colStart + 1) / config.colCount) * 100}%`,
    height: `${((rect.rowEnd - rect.rowStart + 1) / config.rowCount) * 100}%`,
  };
}

function explainGroup(group, config) {
  const mintermText = group.minterms.join(", ");
  const variableLost = config.variableCount - group.term.replace(/'/g, "").length;

  if (group.type === "all cells") {
    return {
      title: `Kenapa semua cell bisa digabung?`,
      body: `Karena semua minterm bernilai 1. Jika seluruh K-Map aktif, semua variabel berubah, sehingga A, B, C, dan D yang relevan hilang. Hasil akhirnya menjadi F = 1.`,
    };
  }

  if (group.type === "horizontal") {
    return {
      title: `Kenapa group ${mintermText} dibuat horizontal?`,
      body: group.wrap
        ? `Karena cell tersebut bertetangga secara horizontal melalui wrap-around. Pada K-Map, sisi kiri dan kanan dianggap berdampingan karena urutan Gray Code. Group ini menghasilkan term ${group.term}.`
        : `Karena minterm tersebut berada dalam satu baris dan berdampingan. Variabel kolom yang berubah dihilangkan, sehingga tersisa term ${group.term}.`,
    };
  }

  if (group.type === "vertical") {
    return {
      title: `Kenapa group ${mintermText} dibuat vertical, bukan horizontal?`,
      body: group.wrap
        ? `Karena cell tersebut bertetangga secara vertical melalui wrap-around. Pada K-Map 4 variabel, sisi atas dan bawah juga dapat dianggap adjacent jika urutan Gray Code cocok. Hasil group ini adalah ${group.term}.`
        : `Karena minterm tersebut berada dalam satu kolom. Variabel pada baris berubah, sedangkan variabel kolom tetap. Jadi variabel yang berubah dihilangkan dan hasilnya ${group.term}.`,
    };
  }

  if (group.type === "block") {
    return {
      title: `Kenapa group ${mintermText} dibuat sebagai block?`,
      body: group.wrap
        ? `Karena bentuk block ini tetap valid walaupun melewati tepi map. K-Map memakai konsep adjacency wrap-around. Group block lebih besar lebih disukai karena menghilangkan lebih banyak variabel. Hasilnya adalah ${group.term}.`
        : `Karena minterm tersebut membentuk area kotak. Group yang lebih besar lebih baik karena bisa menghilangkan lebih banyak variabel. Pada group ini sekitar ${variableLost} variabel berubah dan hasilnya ${group.term}.`,
    };
  }

  return {
    title: `Kenapa minterm ${mintermText} berdiri sendiri?`,
    body: `Karena minterm ini tidak memiliki pasangan adjacent aktif yang dapat membentuk group lebih besar. Agar coverage tetap valid, minterm ini harus tetap dimasukkan sebagai single group. Hasilnya ${group.term}.`,
  };
}

function generateReasoning(activeMinterms, result, validation, config) {
  const items = [];

  items.push({
    title: "Apa tujuan grouping di K-Map?",
    body: "Tujuan grouping adalah menyatukan cell bernilai 1 agar ekspresi boolean menjadi lebih sederhana. Group yang valid berukuran 1, 2, 4, 8, atau 16 cell.",
  });

  items.push({
    title: "Kenapa group besar lebih diprioritaskan?",
    body: "Semakin besar group, semakin banyak variabel yang berubah dan bisa dihilangkan. Karena itu group 4 lebih baik daripada group 2, dan group 8 lebih baik daripada group 4 jika sama-sama valid.",
  });

  result.selectedGroups.forEach((group) => {
    items.push(explainGroup(group, config));
  });

  items.push({
    title: "Bagaimana SOP akhir dibentuk?",
    body:
      result.selectedGroups.length === 0
        ? "Belum ada minterm aktif, sehingga fungsi dianggap F = 0."
        : `Setiap group menghasilkan satu term. Semua term digabung menggunakan OR atau tanda '+'. Maka hasil akhirnya adalah F = ${result.expression}.`,
  });

  items.push({
    title: "Apakah semua minterm sudah ter-cover?",
    body: validation.isEmpty
      ? "Belum ada minterm aktif, jadi belum ada coverage yang perlu diperiksa."
      : validation.isValid
      ? `Ya. Semua minterm aktif yaitu ${activeMinterms.join(", ")} sudah masuk ke dalam group yang dipilih.`
      : `Belum. Minterm ${validation.uncovered.join(", ")} belum masuk ke grouping, sehingga hasil belum valid.`,
  });

  return items;
}

function sampleFor(variableCount) {
  if (variableCount === 2) return [1, 2, 3];
  if (variableCount === 3) return [2, 3, 4, 5, 6];
  return [0, 2, 5, 7, 8, 10, 13, 15];
}

export default function App() {
  const [variableCount, setVariableCount] = useState(3);
  const [active, setActive] = useState(new Set([2, 3, 4, 5, 6]));
  const [labelMode, setLabelMode] = useState("binary");
  const [theme, setTheme] = useState("midnight");
  const [appearance, setAppearance] = useState("dark");
  const config = useMemo(() => makeConfig(variableCount), [variableCount]);

  const activeMinterms = useMemo(() => {
    return [...active].filter((m) => m <= config.maxMinterm).sort((a, b) => a - b);
  }, [active, config.maxMinterm]);

  const result = useMemo(() => {
    return chooseGroups(activeMinterms, config);
  }, [activeMinterms, config]);

  const validation = useMemo(() => {
    return validateCoverage(activeMinterms, result.selectedGroups);
  }, [activeMinterms, result.selectedGroups]);

  const reasoning = useMemo(() => {
    return generateReasoning(activeMinterms, result, validation, config);
  }, [activeMinterms, result, validation, config]);

  const rowLabels =
    labelMode === "binary"
      ? config.rowCodes
      : config.rowCodes.map((code) => variableLabel(config.rowVars, code));

  const colLabels =
    labelMode === "binary"
      ? config.colCodes
      : config.colCodes.map((code) => variableLabel(config.colVars, code));

  function changeVariableCount(count) {
    setVariableCount(count);
    setActive(new Set(sampleFor(count)));
  }

  function toggleCell(minterm) {
    setActive((prev) => {
      const next = new Set(prev);

      if (next.has(minterm)) next.delete(minterm);
      else next.add(minterm);

      return next;
    });
  }

  function clearAll() {
    setActive(new Set());
  }

  function setAll() {
    const all = Array.from({ length: config.maxMinterm + 1 }, (_, i) => i);
    setActive(new Set(all));
  }

  function loadSample() {
    setActive(new Set(sampleFor(variableCount)));
  }

  return (
    <div className={`page theme-${theme} mode-${appearance}`}>
      <div className="container">
        <header className="hero">
          <div className="hero-text">
            <p className="eyebrow">Boolean Algebra Tool</p>
            <h1>K-Map Solver</h1>
            <p className="subtitle">
              Solver K-Map dinamis untuk 2, 3, dan 4 variabel dengan visual grouping,
              SOP expression, coverage validation, dan reasoning buka-tutup.
            </p>
          </div>

          <div className="hero-card">
            <span>F({config.variables.join(",")})</span>
            <strong>{result.expression}</strong>
          </div>
        </header>

        <div className="toolbar">
          <div className="segmented">
            {[2, 3, 4].map((count) => (
              <button
                key={count}
                className={variableCount === count ? "selected" : ""}
                onClick={() => changeVariableCount(count)}
              >
                {count} Variable
              </button>
            ))}
          </div>

          <div className="actions">
            <button onClick={loadSample}>Load Sample</button>
            <button onClick={clearAll}>Clear</button>
            <button onClick={setAll}>Set All</button>

            <button onClick={() => setLabelMode(labelMode === "binary" ? "variable" : "binary")}>
              Label: {labelMode === "binary" ? "Binary" : "Variable"}
            </button>

            <button onClick={() => setAppearance(appearance === "dark" ? "light" : "dark")}>
              Mode: {appearance === "dark" ? "Dark" : "Light"}
            </button>

            <select
              className="theme-select"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
            >
              <option value="midnight">Midnight</option>
              <option value="coffee">Coffee</option>
              <option value="forest">Forest</option>
              <option value="ocean">Ocean</option>
              <option value="rose">Rose</option>
            </select>
          </div>
        </div>

        <main className="main-grid">
          <section className="panel kmap-panel">
            <div className="panel-title stack-title">
              <div>
                <h2>Karnaugh Map</h2>
                <p>{config.variableCount} variable mode</p>
              </div>
              <span className="badge">{config.rowCount} × {config.colCount}</span>
            </div>

            <div className="kmap-shell">
              <div
                className="kmap-labels"
                style={{ gridTemplateColumns: `72px repeat(${config.colCount}, 1fr)` }}
              >
                <div className="corner">
                  {config.rowVars.join("")}\{config.colVars.join("")}
                </div>

                {colLabels.map((label) => (
                  <div className="axis" key={label}>
                    {label}
                  </div>
                ))}
              </div>

              <div
                className="kmap-body"
                style={{ gridTemplateColumns: "72px 1fr" }}
              >
                <div
                  className="row-labels"
                  style={{ gridTemplateRows: `repeat(${config.rowCount}, 104px)` }}
                >
                  {rowLabels.map((label) => (
                    <div className="axis row-axis" key={label}>
                      {label}
                    </div>
                  ))}
                </div>

                <div
                  className="cell-area"
                  style={{
                    gridTemplateColumns: `repeat(${config.colCount}, 1fr)`,
                    gridTemplateRows: `repeat(${config.rowCount}, 104px)`,
                  }}
                >
                  <div className="group-overlay">
                    {result.selectedGroups.map((group, groupIndex) =>
                      getVisualRects(group, config).map((rect, rectIndex) => (
                        <div
                          key={`${groupKey(group.minterms)}-${rectIndex}`}
                          className={`group-line group-color-${groupIndex % 6}`}
                          style={rectStyle(rect, config)}
                        >
                          <span>{group.term}</span>
                        </div>
                      ))
                    )}
                  </div>

                  {config.cells.map((cell) => (
                    <button
                      key={cell.minterm}
                      className={active.has(cell.minterm) ? "cell active" : "cell"}
                      onClick={() => toggleCell(cell.minterm)}
                      style={{
                        gridColumn: cell.col + 1,
                        gridRow: cell.row + 1,
                      }}
                    >
                      <span className="cell-value">{active.has(cell.minterm) ? "1" : "0"}</span>
                      <span className="cell-label">{cell.label}</span>
                      <small>{cell.bits}</small>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="panel result-panel">
            <div className="panel-title stack-title">
              <div>
                <h2>Result</h2>
                <p>Hasil simplifikasi</p>
              </div>

              <span
                className={
                  validation.isEmpty
                    ? "badge neutral"
                    : validation.isValid
                    ? "badge valid"
                    : "badge invalid"
                }
              >
                {validation.isEmpty ? "Empty" : validation.isValid ? "Valid" : "Invalid"}
              </span>
            </div>

            <div className="result-box">
              <p>Minterm</p>
              <strong>Σm({activeMinterms.join(",") || "-"})</strong>
            </div>

            <div className="result-box">
              <p>SOP Expression</p>
              <strong>F = {result.expression}</strong>
            </div>

            <div className="result-box">
              <p>Covered Minterms</p>
              <strong>{validation.covered.join(", ") || "-"}</strong>
            </div>

            <div
              className={
                validation.isEmpty
                  ? "status neutral"
                  : validation.isValid
                  ? "status success"
                  : "status danger"
              }
            >
              {validation.isEmpty
                ? "Belum ada minterm aktif. Klik cell pada K-Map untuk mulai."
                : validation.isValid
                ? "Semua minterm aktif sudah ter-cover."
                : `Minterm belum ter-cover: ${validation.uncovered.join(", ")}`}
            </div>
          </section>
        </main>

        <section className="panel">
          <div className="panel-title stack-title">
            <div>
              <h2>Grouping</h2>
              <p>Garis warna di map menunjukkan area grouping.</p>
            </div>
            <span className="badge">{result.selectedGroups.length} group</span>
          </div>

          {result.selectedGroups.length === 0 ? (
            <p className="empty">Belum ada grouping.</p>
          ) : (
            <div className="group-grid">
              {result.selectedGroups.map((group, index) => (
                <div className={`group-card group-card-${index % 6}`} key={groupKey(group.minterms)}>
                  <div className="group-top">
                    <span>Group {index + 1}</span>
                    <b>{group.term}</b>
                  </div>
                  <p>Minterm: {group.minterms.join(", ")}</p>
                  <small>
                    {group.type}
                    {group.wrap ? " • wrap-around" : ""}
                  </small>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="panel">
          <div className="panel-title stack-title">
            <div>
              <h2>Coverage Validation</h2>
              <p>Bug prevention agar tidak ada minterm yang hilang.</p>
            </div>
            <span className="badge">Check</span>
          </div>

          <pre>
{`original  = { ${activeMinterms.join(", ") || "-"} }
covered   = { ${validation.covered.join(", ") || "-"} }
uncovered = original - covered
result    = ${validation.isEmpty ? "EMPTY" : validation.isValid ? "VALID" : "INVALID"}`}
          </pre>
        </section>

        <section className="panel">
          <div className="panel-title stack-title">
            <div>
              <h2>Reasoning</h2>
              <p>Klik pertanyaan untuk membuka penjelasan.</p>
            </div>
            <span className="badge">Accordion</span>
          </div>

          <div className="reasoning-list">
            {reasoning.map((item, index) => (
              <details className="reasoning-card" key={index}>
                <summary>
                  <span>{index + 1}</span>
                  <b>{item.title}</b>
                </summary>
                <p>{item.body}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}