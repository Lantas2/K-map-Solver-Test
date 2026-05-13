import { useMemo, useState } from "react";
import "./index.css";

const kmapCells = [
  { minterm: 0, row: 0, col: 0, label: "m0" },
  { minterm: 1, row: 0, col: 1, label: "m1" },
  { minterm: 3, row: 0, col: 2, label: "m3" },
  { minterm: 2, row: 0, col: 3, label: "m2" },
  { minterm: 4, row: 1, col: 0, label: "m4" },
  { minterm: 5, row: 1, col: 1, label: "m5" },
  { minterm: 7, row: 1, col: 2, label: "m7" },
  { minterm: 6, row: 1, col: 3, label: "m6" },
];

function binaryOf(minterm) {
  return minterm.toString(2).padStart(3, "0").split("").map(Number);
}

function getCell(row, col) {
  const fixedCol = ((col % 4) + 4) % 4;
  return kmapCells.find((cell) => cell.row === row && cell.col === fixedCol);
}

function getCellByMinterm(minterm) {
  return kmapCells.find((cell) => cell.minterm === minterm);
}

function groupKey(group) {
  return [...group].sort((a, b) => a - b).join(",");
}

function termFromGroup(group) {
  const binaries = group.map(binaryOf);
  const variables = ["A", "B", "C"];
  const result = [];

  for (let i = 0; i < 3; i++) {
    const values = new Set(binaries.map((bits) => bits[i]));
    if (values.size === 1) {
      const value = binaries[0][i];
      result.push(value === 1 ? variables[i] : `${variables[i]}'`);
    }
  }

  return result.length === 0 ? "1" : result.join("");
}

function generateGroups(activeMinterms) {
  const activeSet = new Set(activeMinterms);
  const groups = [];
  const seen = new Set();

  function addGroup(values, type) {
    const unique = [...new Set(values)].sort((a, b) => a - b);

    if (!unique.every((m) => activeSet.has(m))) return;

    const key = groupKey(unique);
    if (seen.has(key)) return;

    seen.add(key);

    groups.push({
      minterms: unique,
      term: termFromGroup(unique),
      size: unique.length,
      type,
    });
  }

  addGroup([0, 1, 2, 3, 4, 5, 6, 7], "8 cell");

  for (let row = 0; row < 2; row++) {
    addGroup([0, 1, 2, 3].map((col) => getCell(row, col).minterm), "4 cell row");
  }

  for (let col = 0; col < 4; col++) {
    addGroup(
      [
        getCell(0, col).minterm,
        getCell(0, col + 1).minterm,
        getCell(1, col).minterm,
        getCell(1, col + 1).minterm,
      ],
      "4 cell block"
    );
  }

  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 4; col++) {
      addGroup(
        [getCell(row, col).minterm, getCell(row, col + 1).minterm],
        "2 cell horizontal"
      );
    }
  }

  for (let col = 0; col < 4; col++) {
    addGroup([getCell(0, col).minterm, getCell(1, col).minterm], "2 cell vertical");
  }

  for (const minterm of activeMinterms) {
    addGroup([minterm], "single cell");
  }

  return groups.sort((a, b) => b.size - a.size);
}

function removeSubgroups(groups) {
  return groups.filter((group) => {
    return !groups.some((other) => {
      if (groupKey(group.minterms) === groupKey(other.minterms)) return false;
      if (other.size <= group.size) return false;

      const otherSet = new Set(other.minterms);
      return group.minterms.every((m) => otherSet.has(m));
    });
  });
}

function chooseGroups(activeMinterms) {
  if (activeMinterms.length === 0) {
    return {
      selectedGroups: [],
      expression: "0",
      covered: [],
      uncovered: [],
    };
  }

  const candidates = removeSubgroups(generateGroups(activeMinterms));
  const selectedGroups = [];
  const covered = new Set();

  for (const minterm of activeMinterms) {
    const covering = candidates.filter((group) => group.minterms.includes(minterm));

    if (covering.length === 1) {
      const only = covering[0];

      if (!selectedGroups.some((g) => groupKey(g.minterms) === groupKey(only.minterms))) {
        selectedGroups.push(only);
        only.minterms.forEach((m) => covered.add(m));
      }
    }
  }

  while (activeMinterms.some((m) => !covered.has(m))) {
    let bestGroup = null;
    let bestScore = -1;

    for (const group of candidates) {
      if (selectedGroups.some((g) => groupKey(g.minterms) === groupKey(group.minterms))) {
        continue;
      }

      const newCoverage = group.minterms.filter((m) => !covered.has(m)).length;
      const score = newCoverage * 10 + group.size;

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
  const expression = selectedGroups.map((group) => group.term).join(" + ");

  return {
    selectedGroups,
    expression,
    covered: [...covered].sort((a, b) => a - b),
    uncovered,
  };
}

function validateCoverage(activeMinterms, selectedGroups) {
  if (activeMinterms.length === 0) {
    return {
      isEmpty: true,
      isValid: false,
      uncovered: [],
      covered: [],
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
    uncovered,
    covered: [...covered].filter((m) => activeMinterms.includes(m)).sort((a, b) => a - b),
  };
}

function splitColumns(cols) {
  const sorted = [...cols].sort((a, b) => a - b);

  if (sorted.length === 4) return [[0, 3]];

  if (sorted.includes(0) && sorted.includes(3)) {
    const left = sorted.filter((c) => c === 0 || c === 1);
    const right = sorted.filter((c) => c === 2 || c === 3);

    const result = [];

    if (right.length) result.push([Math.min(...right), Math.max(...right)]);
    if (left.length) result.push([Math.min(...left), Math.max(...left)]);

    return result;
  }

  return [[Math.min(...sorted), Math.max(...sorted)]];
}

function getRectsForGroup(group) {
  if (group.minterms.length === 8) {
    return [{ rowStart: 0, rowEnd: 1, colStart: 0, colEnd: 3 }];
  }

  const cells = group.minterms.map(getCellByMinterm);
  const rows = [...new Set(cells.map((cell) => cell.row))];
  const cols = [...new Set(cells.map((cell) => cell.col))];

  const rowStart = Math.min(...rows);
  const rowEnd = Math.max(...rows);
  const colRanges = splitColumns(cols);

  return colRanges.map(([colStart, colEnd]) => ({
    rowStart,
    rowEnd,
    colStart,
    colEnd,
  }));
}

function rectStyle(rect) {
  return {
    left: `${rect.colStart * 25}%`,
    top: `${rect.rowStart * 50}%`,
    width: `${(rect.colEnd - rect.colStart + 1) * 25}%`,
    height: `${(rect.rowEnd - rect.rowStart + 1) * 50}%`,
  };
}

function describeGroupReason(group) {
  const cells = group.minterms.map(getCellByMinterm);
  const rows = [...new Set(cells.map((cell) => cell.row))];
  const cols = [...new Set(cells.map((cell) => cell.col))].sort((a, b) => a - b);

  const mintermText = group.minterms.join(", ");
  const term = group.term;

  if (group.size === 8) {
    return {
      question: `Kenapa semua cell bisa menjadi 1 group?`,
      answer: `Karena seluruh 8 minterm bernilai 1. Pada K-Map 3 variabel, group 8 cell menghilangkan semua variabel A, B, dan C, sehingga hasilnya menjadi F = 1.`,
    };
  }

  if (group.size === 4 && rows.length === 1) {
    return {
      question: `Kenapa group ${mintermText} dibuat horizontal?`,
      answer: `Karena keempat minterm berada pada satu baris yang sama. Artinya nilai A tetap, sedangkan kombinasi B dan C berubah. Variabel yang berubah dihilangkan, sehingga tersisa ${term}.`,
    };
  }

  if (group.size === 4 && rows.length === 2) {
    const isWrap = cols.includes(0) && cols.includes(3);

    return {
      question: isWrap
        ? `Kenapa group ${mintermText} boleh wrap-around?`
        : `Kenapa group ${mintermText} dibuat sebagai kotak 2x2?`,
      answer: isWrap
        ? `Karena pada K-Map, kolom paling kiri dan paling kanan dianggap bertetangga akibat urutan Gray Code. Jadi group boleh melewati tepi map. Dari group ini, variabel yang berubah dihilangkan dan tersisa ${term}.`
        : `Karena minterm tersebut membentuk kotak 2x2. Dalam K-Map, group 4 cell menghilangkan 2 variabel yang berubah, lalu menyisakan variabel tetap yaitu ${term}.`,
    };
  }

  if (group.size === 2 && rows.length === 1) {
    const isWrap = cols.includes(0) && cols.includes(3);

    return {
      question: isWrap
        ? `Kenapa group ${mintermText} boleh horizontal wrap-around?`
        : `Kenapa group ${mintermText} dibuat horizontal?`,
      answer: isWrap
        ? `Karena kolom 00 dan 10 berada di sisi tepi K-Map dan tetap dianggap adjacent. Urutan K-Map memakai Gray Code, jadi cell ujung kiri dan ujung kanan tetap bertetangga. Hasil penyederhanaannya adalah ${term}.`
        : `Karena kedua minterm berada berdampingan secara horizontal dan hanya berbeda 1 variabel. Variabel yang berubah dihilangkan, sehingga hasil group ini adalah ${term}.`,
    };
  }

  if (group.size === 2 && rows.length === 2) {
    return {
      question: `Kenapa group ${mintermText} dibuat vertical?`,
      answer: `Karena kedua minterm berada pada kolom yang sama dan hanya berbeda nilai A. Nilai B dan C tetap, sedangkan A berubah, jadi A dihilangkan. Hasilnya adalah ${term}.`,
    };
  }

  if (group.size === 1) {
    return {
      question: `Kenapa minterm ${mintermText} menjadi single group?`,
      answer: `Karena minterm ini tidak punya pasangan adjacent yang bisa membentuk group lebih besar. Maka dia tetap harus diambil sendiri agar semua minterm tetap ter-cover. Hasil term-nya adalah ${term}.`,
    };
  }

  return {
    question: `Kenapa group ${mintermText} dipilih?`,
    answer: `Group ini dipilih karena membantu menutup minterm aktif dan menghasilkan term ${term}.`,
  };
}

function generateReasoning(activeMinterms, selectedGroups, validation, expression) {
  const reasons = [];

  reasons.push({
    question: "Apa tujuan utama grouping di K-Map?",
    answer:
      "Tujuan grouping adalah menggabungkan minterm yang bernilai 1 agar ekspresi boolean menjadi lebih sederhana. Group yang valid biasanya berukuran 1, 2, 4, atau 8 cell.",
  });

  reasons.push({
    question: "Kenapa group harus berisi 1, 2, 4, atau 8 cell?",
    answer:
      "Karena ukuran group harus berupa pangkat dua. Dengan begitu, perubahan variabel bisa dihilangkan secara teratur. Misalnya group 2 menghilangkan 1 variabel, group 4 menghilangkan 2 variabel, dan group 8 menghilangkan 3 variabel.",
  });

  selectedGroups.forEach((group) => {
    reasons.push(describeGroupReason(group));
  });

  reasons.push({
    question: "Bagaimana ekspresi SOP akhir dibentuk?",
    answer:
      selectedGroups.length === 0
        ? "Karena tidak ada minterm aktif, maka fungsi bernilai 0."
        : `Setiap group menghasilkan satu term. Semua term tersebut digabung menggunakan OR atau tanda '+'. Maka hasil akhirnya adalah F = ${expression}.`,
  });

  reasons.push({
    question: "Apakah semua minterm sudah ter-cover?",
    answer: validation.isValid
      ? `Ya. Semua minterm aktif yaitu ${activeMinterms.join(", ") || "-"} sudah masuk ke dalam grouping yang dipilih.`
      : `Belum. Minterm ${validation.uncovered.join(", ")} belum ter-cover, sehingga hasil simplifikasi belum valid.`,
  });

  reasons.push({
    question: "Kenapa validasi coverage penting?",
    answer:
      "Karena grouping yang terlihat bagus belum tentu menutup semua minterm asli. Validasi coverage memastikan tidak ada minterm bernilai 1 yang hilang dari hasil akhir.",
  });

  return reasons;
}

export default function App() {
  const [active, setActive] = useState(new Set([2, 3, 4, 5, 6]));
  const [labelMode, setLabelMode] = useState("binary");

  const activeMinterms = useMemo(() => {
    return [...active].sort((a, b) => a - b);
  }, [active]);

  const result = useMemo(() => {
    return chooseGroups(activeMinterms);
  }, [activeMinterms]);

  const validation = useMemo(() => {
    return validateCoverage(activeMinterms, result.selectedGroups);
  }, [activeMinterms, result.selectedGroups]);

const reasoning = useMemo(() => {
  return generateReasoning(
    activeMinterms,
    result.selectedGroups,
    validation,
    result.expression
  );
}, [activeMinterms, result.selectedGroups, validation, result.expression]);

  const colLabels =
    labelMode === "binary"
      ? ["00", "01", "11", "10"]
      : ["B'C'", "B'C", "BC", "BC'"];

  const rowLabels = labelMode === "binary" ? ["0", "1"] : ["A'", "A"];

  function toggleCell(minterm) {
    setActive((prev) => {
      const next = new Set(prev);

      if (next.has(minterm)) {
        next.delete(minterm);
      } else {
        next.add(minterm);
      }

      return next;
    });
  }

  function loadBugCase() {
    setActive(new Set([2, 3, 4, 5, 6]));
  }

  function clearAll() {
    setActive(new Set());
  }

  function setAll() {
    setActive(new Set([0, 1, 2, 3, 4, 5, 6, 7]));
  }

  return (
    <div className="page">
      <div className="container">
        <header className="hero">
          <div>
            <p className="eyebrow">Boolean Algebra Tool</p>
            <h1>K-Map Solver 3 Variabel</h1>
            <p className="subtitle">
              Klik cell K-Map, lalu sistem akan membuat grouping, ekspresi SOP, garis grouping, dan validasi coverage otomatis.
            </p>
          </div>

          <div className="hero-card">
            <span>F(A,B,C)</span>
            <strong>{result.expression}</strong>
          </div>
        </header>

        <div className="actions">
          <button onClick={loadBugCase}>Load Σm(2,3,4,5,6)</button>
          <button onClick={clearAll}>Clear</button>
          <button onClick={setAll}>Set All</button>
          <button onClick={() => setLabelMode(labelMode === "binary" ? "variable" : "binary")}>
            Label: {labelMode === "binary" ? "00/01/11/10" : "A', A, B'C'"}
          </button>
        </div>

        <main className="grid-layout">
          <section className="panel kmap-panel">
            <div className="panel-title">
              <h2>Karnaugh Map</h2>
              <span className="badge">3 variables</span>
            </div>

            <div className="kmap-shell">
              <div className="kmap-labels">
                <div className="corner">{labelMode === "binary" ? "A\\BC" : "A / BC"}</div>
                {colLabels.map((label) => (
                  <div className="axis" key={label}>{label}</div>
                ))}
              </div>

              <div className="kmap-body">
                <div className="row-labels">
                  {rowLabels.map((label) => (
                    <div className="axis row-axis" key={label}>{label}</div>
                  ))}
                </div>

                <div className="cell-area">
                  <div className="group-overlay">
                    {result.selectedGroups.map((group, groupIndex) =>
                      getRectsForGroup(group).map((rect, rectIndex) => (
                        <div
                          key={`${groupKey(group.minterms)}-${rectIndex}`}
                          className={`group-line group-color-${groupIndex % 5}`}
                          style={rectStyle(rect)}
                          title={`${group.term}: ${group.minterms.join(", ")}`}
                        >
                          <span>{group.term}</span>
                        </div>
                      ))
                    )}
                  </div>

                  {kmapCells.map((cell) => (
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
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="panel">
            <div className="panel-title">
              <h2>Result</h2>
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
          <div className="panel-title">
            <h2>Grouping</h2>
            <span className="badge">{result.selectedGroups.length} group</span>
          </div>

          {result.selectedGroups.length === 0 ? (
            <p className="empty">Belum ada grouping.</p>
          ) : (
            <div className="group-grid">
              {result.selectedGroups.map((group, index) => (
                <div className={`group-card group-card-${index % 5}`} key={groupKey(group.minterms)}>
                  <div className="group-top">
                    <span>Group {index + 1}</span>
                    <b>{group.term}</b>
                  </div>
                  <p>Minterm: {group.minterms.join(", ")}</p>
                  <small>{group.type}</small>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="panel">
          <div className="panel-title">
            <h2>Coverage Validation</h2>
            <section className="panel">
  <div className="panel-title">
    <h2>Reasoning</h2>
    <span className="badge">Step-by-step</span>
  </div>

  <div className="reasoning-list">
    {reasoning.map((item, index) => (
      <div className="reasoning-card" key={index}>
        <div className="reasoning-number">{index + 1}</div>

        <div>
          <h3>{item.question}</h3>
          <p>{item.answer}</p>
        </div>
      </div>
    ))}
  </div>
</section>
            <span className="badge">Bug Prevention</span>
          </div>

          <div className="explain">
            <p>
              Validasi ini mencegah bug seperti kasus <b>m6 tidak ter-cover</b>. Setelah ekspresi dibuat, sistem tetap mengecek apakah semua minterm asli masuk ke grouping yang dipilih.
            </p>

            <pre>
{`original  = { ${activeMinterms.join(", ") || "-"} }
covered   = { ${validation.covered.join(", ") || "-"} }
uncovered = original - covered
result    = ${validation.isValid ? "VALID" : "INVALID"}`}
            </pre>
          </div>
        </section>
      </div>
    </div>
  );
}