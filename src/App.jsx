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

function literalFromBit(variableName, bit) {
  return bit === 1 ? variableName : `${variableName}'`;
}

function canonicalTerm(minterm, config) {
  const bits = binaryOf(minterm, config.variableCount);

  return bits
    .map((bit, index) => literalFromBit(config.variables[index], bit))
    .join("");
}

function canonicalExpression(activeMinterms, config) {
  if (activeMinterms.length === 0) return "0";

  return activeMinterms
    .map((minterm) => canonicalTerm(minterm, config))
    .join(" + ");
}

function commonAndChangingLiterals(group, config) {
  const binaries = group.minterms.map((m) => binaryOf(m, config.variableCount));

  const common = [];
  const changing = [];

  for (let i = 0; i < config.variableCount; i++) {
    const values = new Set(binaries.map((bits) => bits[i]));

    if (values.size === 1) {
      common.push(literalFromBit(config.variables[i], binaries[0][i]));
    } else {
      changing.push(config.variables[i]);
    }
  }

  return { common, changing };
}

function groupedFactorExpression(group, config) {
  const { common, changing } = commonAndChangingLiterals(group, config);

  const commonText = common.join("");
  const changingText =
    changing.length === 0
      ? ""
      : changing.map((variableName) => `${variableName}' + ${variableName}`).join(")(");

  if (changing.length === 0) {
    return group.term;
  }

  if (changing.length === 1) {
    return `${commonText}(${changingText})`;
  }

  return `${commonText}(${changingText})`;
}

function generateAlgebraTraceForGroup(group, config, index) {
  const canonicalGroupExpression = group.minterms
    .map((minterm) => canonicalTerm(minterm, config))
    .join(" + ");

  const { common, changing } = commonAndChangingLiterals(group, config);

  const steps = [];

  steps.push({
    title: `Group ${index + 1}: bentuk awal`,
    expression: canonicalGroupExpression,
    reason: `Minterm ${group.minterms.join(", ")} ditulis dulu dalam bentuk SOP lengkap.`,
  });

  if (group.size === 1 || changing.length === 0) {
    steps.push({
      title: `Group ${index + 1}: tidak bisa difaktorkan lagi`,
      expression: group.term,
      reason: `Group ini hanya berisi satu cell, jadi tidak ada pasangan variabel komplemen yang bisa disederhanakan.`,
    });

    return steps;
  }

  steps.push({
    title: `Group ${index + 1}: faktorkan literal yang sama`,
    expression: `${canonicalGroupExpression} = ${groupedFactorExpression(group, config)}`,
    reason: `Literal yang sama pada group ini adalah ${common.join(", ") || "tidak ada"}. Literal yang berubah adalah ${changing.join(", ")}.`,
  });

  const oneExpression =
    changing.length === 1
      ? `${common.join("")}(1)`
      : `${common.join("")}${changing.map(() => "(1)").join("")}`;

  steps.push({
    title: `Group ${index + 1}: gunakan hukum komplemen`,
    expression: `${groupedFactorExpression(group, config)} = ${oneExpression}`,
    reason: `Karena berlaku hukum komplemen: X + X' = 1. Jadi bagian yang berubah dapat diganti menjadi 1.`,
  });

  steps.push({
    title: `Group ${index + 1}: gunakan hukum identitas`,
    expression: `${oneExpression} = ${group.term}`,
    reason: `Karena X·1 = X, maka hasil sederhana dari group ini adalah ${group.term}.`,
  });

  return steps;
}

function generateBooleanSteps(activeMinterms, result, config) {
  const steps = [];
  const originalExpression = canonicalExpression(activeMinterms, config);

  if (activeMinterms.length === 0) {
    steps.push({
      title: "Bentuk awal",
      expression: "F = 0",
      reason: "Belum ada minterm aktif, jadi fungsi bernilai 0.",
    });

    return steps;
  }

  steps.push({
    title: "Bentuk SOP awal dari minterm",
    expression: `F = ${originalExpression}`,
    reason:
      "Setiap minterm aktif diubah menjadi bentuk perkalian literal. Nilai 1 ditulis sebagai variabel biasa, sedangkan nilai 0 ditulis sebagai komplemen.",
  });

  result.selectedGroups.forEach((group, index) => {
    const groupTrace = generateAlgebraTraceForGroup(group, config, index);
    steps.push(...groupTrace);
  });

  const groupedTerms = result.selectedGroups
    .map((group) => group.term)
    .join(" + ");

  steps.push({
    title: "Gabungkan hasil penyederhanaan semua group",
    expression: `F = ${groupedTerms || "0"}`,
    reason:
      "Setelah setiap group disederhanakan, semua hasil group digabung menggunakan OR atau tanda '+'.",
  });

  steps.push({
    title: "Hasil akhir",
    expression: `F = ${result.expression}`,
    reason:
      "Ini adalah bentuk SOP sederhana yang dihasilkan dari grouping K-Map. Hasil ini valid jika coverage validation menyatakan semua minterm sudah ter-cover.",
  });

  return steps;
}

function getCircuitTerms(mode, activeMinterms, result, config) {
  if (mode === "original") {
    return activeMinterms.map((minterm) => canonicalTerm(minterm, config));
  }

  return result.selectedGroups.map((group) => group.term);
}

function parseTermToLiterals(term) {
  if (term === "0" || term === "1") return [];

  const matches = term.match(/[A-D]'?/g);
  return matches || [];
}

function literalInfo(literal) {
  return {
    variable: literal[0],
    inverted: literal.includes("'"),
    label: literal,
  };
}

function variableWireClass(variable) {
  switch (variable) {
    case "A":
      return "wire-a";
    case "B":
      return "wire-b";
    case "C":
      return "wire-c";
    case "D":
      return "wire-d";
    default:
      return "";
  }
}

function BufferGate({ x, y, inverted = false }) {
  if (inverted) {
    return (
      <g>
        <polygon
          points={`${x - 20},${y - 16} ${x - 20},${y + 16} ${x + 8},${y}`}
          className="buffer-gate-shape"
        />
        <circle cx={x + 14} cy={y} r="5.5" className="not-bubble" />
      </g>
    );
  }

  return (
    <polygon
      points={`${x - 18},${y - 14} ${x - 18},${y + 14} ${x + 10},${y}`}
      className="buffer-gate-shape"
    />
  );
}

function AndGate({ x, y, width = 72, height = 54 }) {
  const left = x - width / 2;
  const top = y - height / 2;
  const midX = left + width / 2;

  const d = [
    `M ${left} ${top}`,
    `H ${midX}`,
    `A ${width / 2} ${height / 2} 0 0 1 ${midX} ${top + height}`,
    `H ${left}`,
    "Z",
  ].join(" ");

  return <path d={d} className="and-gate-shape" />;
}

function OrGate({ x, y, width = 96, height = 74 }) {
  const left = x - width / 2;
  const top = y - height / 2;
  const bottom = y + height / 2;
  const right = x + width / 2;

  const d = [
    `M ${left} ${top}`,
    `Q ${left + 16} ${y} ${left} ${bottom}`,
    `Q ${left + 40} ${bottom} ${right} ${y}`,
    `Q ${left + 40} ${top} ${left} ${top}`,
    "Z",
  ].join(" ");

  return <path d={d} className="or-gate-shape" />;
}

function LogicCircuit({ activeMinterms, result, config, mode, zoom }) {
  const terms = getCircuitTerms(mode, activeMinterms, result, config);

  if (terms.length === 0) {
    return (
      <div className="circuit-empty">
        Belum ada circuit. Klik cell K-Map terlebih dahulu.
      </div>
    );
  }

  if (mode === "simplified" && result.expression === "1") {
    return (
      <div className="circuit-one">
        <div className="constant-box">1</div>
        <div className="wire-text">F = 1</div>
      </div>
    );
  }

  const parsedTerms = terms.map((term) => ({
    term,
    literals: parseTermToLiterals(term).map(literalInfo),
  }));

  function formatProductTerm(term) {
    if (term === "0" || term === "1") return term;

    const literals = parseTermToLiterals(term);
    return literals.join("·");
  }

  function formatSopExpression(expr) {
    if (expr === "0" || expr === "1") return expr;

    return expr
      .split("+")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => formatProductTerm(part))
      .join(" + ");
  }

  function formatLiteralLabel(literal) {
    return literal.inverted ? `${literal.variable}'` : literal.variable;
  }

  const displayFinalExpression =
    mode === "original"
      ? parsedTerms.map((item) => formatProductTerm(item.term)).join(" + ")
      : formatSopExpression(result.expression);

  const leftPad = 64;

const inputTitleY = 88;
const inputStartY = 118;
const inputGapY = 32;
const inputLabelX = 82;
const inputWireStartX = 130;

const railStartX = 320;
const railGap = 72;

const termTopY = 390;
const termGap = 190;

const tLabelX = 96;
const notX = 590;
const passX = 590;
const literalOutX = 730;

const andX = 1040;
const termOutX = 1200;
const orX = 1540;
const outX = 1760;

  const svgWidth = 2020;
  const lastTermY = termTopY + (parsedTerms.length - 1) * termGap;
  const svgHeight = Math.max(640, lastTermY + 180);
  const orY = termTopY + ((parsedTerms.length - 1) * termGap) / 2;

const railX = {};
const inputY = {};
const railBottomByVariable = {};
const usedVariables = new Set();

parsedTerms.forEach((item) => {
  item.literals.forEach((literal) => {
    usedVariables.add(literal.variable);
  });
});

config.variables.forEach((variable, index) => {
  railX[variable] = railStartX + index * railGap;
  inputY[variable] = inputStartY + index * inputGapY;
  railBottomByVariable[variable] = inputY[variable];
});

parsedTerms.forEach((item, termIndex) => {
  const rowY = termTopY + termIndex * termGap;
  const literalCount = item.literals.length;

  item.literals.forEach((literal, literalIndex) => {
    const y = gateInputY(rowY, literalCount, literalIndex);
    const stopY = y + 8;

    if (stopY > railBottomByVariable[literal.variable]) {
      railBottomByVariable[literal.variable] = stopY;
    }
  });
});

parsedTerms.forEach((item, termIndex) => {
  const rowY = termTopY + termIndex * termGap;
  const literalCount = item.literals.length;

  item.literals.forEach((literal, literalIndex) => {
    const y = gateInputY(rowY, literalCount, literalIndex);

    if (y > railBottomByVariable[literal.variable]) {
      railBottomByVariable[literal.variable] = y;
    }
  });
});

function getLiteralGap(count) {
  if (count >= 4) return 42;
  if (count === 3) return 52;
  if (count === 2) return 64;
  return 0;
}

function gateInputY(rowY, count, index) {
  if (count === 1) return rowY;

  const gap = getLiteralGap(count);
  return rowY - ((count - 1) * gap) / 2 + index * gap;
}

 function horizontalJumpPath(x1, y, x2, sourceVariable) {
  const startX = Math.min(x1, x2);
  const endX = Math.max(x1, x2);
  const direction = x2 >= x1 ? 1 : -1;

  const crossings = config.variables
    .filter((variable) => variable !== sourceVariable)
    .filter((variable) => {
      const railStartY = inputY[variable];
      const railEndY = railBottomByVariable[variable];

      return y >= railStartY && y <= railEndY;
    })
    .map((variable) => railX[variable])
    .filter((x) => x > startX + 10 && x < endX - 10)
    .sort((a, b) => (direction === 1 ? a - b : b - a));

  let d = `M ${x1} ${y}`;

  crossings.forEach((crossX) => {
    const beforeX = crossX - 12 * direction;
    const afterX = crossX + 12 * direction;

    d += ` H ${beforeX}`;
    d += ` C ${crossX - 8 * direction} ${y - 14}, ${crossX + 8 * direction} ${y - 14}, ${afterX} ${y}`;
  });

  d += ` H ${x2}`;

  return d;
}

  function elbowPath(x1, y1, x2, y2, midX) {
    return `M ${x1} ${y1} H ${midX} V ${y2} H ${x2}`;
  }

  function wireLabel(text, x, y, extraClass = "") {
    return (
      <text x={x} y={y} className={`expr-wire-label ${extraClass}`}>
        {text}
      </text>
    );
  }

  return (
    <div className="circuit-wrapper">
      <div
        className="circuit-scroll rail-expression-scroll"
        style={{ "--circuit-zoom": zoom }}
      >
        <svg
          className="logic-circuit rail-expression-circuit"
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          role="img"
          aria-label="Rail expression circuit visualization"
        >
          <text x={leftPad} y="34" className="circuit-title">
            Rail Expression Circuit
          </text>

          <text x={leftPad} y="58" className="expr-subtitle">
            Input berasal dari kiri. Dot berarti tersambung. Lengkungan berarti kabel hanya melewati.
          </text>

          <text x={leftPad} y={inputTitleY} className="circuit-title">
            Inputs
          </text>

          {config.variables.map((variable) => (
            <g key={variable}>
              {!usedVariables.has(variable) && (
              <text
                x={railX[variable] + 18}
                y={inputY[variable] - 10}
                className="unused-variable-label"
              >
                unused
              </text>
            )}
              <text
                x={inputLabelX}
                y={inputY[variable] + 5}
                className={`input-stack-label ${variableWireClass(variable)}`}
              >
                {variable}
              </text>

              <path
                d={`M ${inputWireStartX} ${inputY[variable]} H ${railX[variable]} V ${railBottomByVariable[variable]}`}
                className={`circuit-wire rail-main ${variableWireClass(variable)}`}
              />
              <circle
                cx={railX[variable]}
                cy={inputY[variable]}
                r="5.8"
                className={`source-dot ${variableWireClass(variable)}`}
              />
            </g>
          ))}

          <text x={leftPad} y={termTopY - 84} className="circuit-title">
            Product Terms
          </text>

          {parsedTerms.map((item, termIndex) => {
            const rowY = termTopY + termIndex * termGap;
            const literalCount = item.literals.length;

            return (
              <g key={`${item.term}-${termIndex}`}>
                <text x={tLabelX} y={rowY + 5} className="term-row-label">
                  T{termIndex + 1}
                </text>

                {item.literals.map((literal, literalIndex) => {
                  const sourceX = railX[literal.variable];
                  const variableClass = variableWireClass(literal.variable);
                  const currentInputY = gateInputY(rowY, literalCount, literalIndex);
                  const literalDisplay = formatLiteralLabel(literal);

                  const staggerX = literalIndex * 22;

                  const gateX = literal.inverted ? notX + staggerX : passX + staggerX;
                  const gateInputX = gateX - 34;
                  const gateOutputX = literal.inverted ? gateX + 38 : gateX + 22;

                  const localLiteralOutX = Math.max(literalOutX, gateOutputX + 120);

                  const labelX = gateOutputX + 34;
                  const labelY = currentInputY - 24;

                  const andEntryGap = 24;
                  const andEntryY =
                    literalCount === 1
                      ? rowY
                      : rowY - ((literalCount - 1) * andEntryGap) / 2 + literalIndex * andEntryGap;

                  const bendX = andX - 112;
                  const andInputX = andX - 50;

                  return (
                    <g key={`${item.term}-${literal.label}-${literalIndex}`}>
                      <circle
                        cx={sourceX}
                        cy={currentInputY}
                        r="5.6"
                        className={`source-dot ${variableClass}`}
                      />

                      <path
                        d={horizontalJumpPath(
                          sourceX,
                          currentInputY,
                          gateInputX,
                          literal.variable
                        )}
                        className={`circuit-wire branch-wire ${variableClass}`}
                      />

                      <BufferGate x={gateX} y={currentInputY} inverted={literal.inverted} />

                      <path
                        d={`M ${gateOutputX} ${currentInputY} H ${localLiteralOutX}`}
                        className={`circuit-wire branch-wire ${variableClass}`}
                      />

                      <g>
                        <rect
                          x={labelX - 10}
                          y={labelY - 18}
                          width={literalDisplay.length * 15 + 24}
                          height="27"
                          rx="8"
                          className="wire-label-bg"
                        />

                        {wireLabel(literalDisplay, labelX, labelY, variableClass)}
                      </g>

                    {literalCount === 1 ? (
                      <path
                        d={`M ${localLiteralOutX} ${currentInputY} H ${termOutX}`}
                        className={`circuit-wire branch-wire ${variableClass}`}
                      />
                    ) : (
                      <path
                        d={`M ${localLiteralOutX} ${currentInputY} H ${bendX} V ${andEntryY} H ${andInputX}`}
                        className={`circuit-wire branch-wire ${variableClass}`}
                      />
                    )}
                    </g>
                  );
                })}

                {literalCount > 1 && (
                  <>
                    <AndGate x={andX} y={rowY} />

                    <text
                      x={andX + 2}
                      y={rowY + 5}
                      className="gate-text"
                      textAnchor="middle"
                    >
                      AND
                    </text>

                    <path
                      d={`M ${andX + 48} ${rowY} H ${termOutX}`}
                      className="circuit-wire term-output-wire"
                    />
                  </>
                )}

                <text x={termOutX + 18} y={rowY - 18} className="term-label">
                  {formatProductTerm(item.term)}
                </text>

                <path
                  d={elbowPath(termOutX, rowY, orX - 58, orY, termOutX + 96)}
                  className="circuit-wire term-to-or"
                />
              </g>
            );
          })}

          <OrGate x={orX} y={orY} />

          <text
            x={orX + 2}
            y={orY + 5}
            className="gate-text"
            textAnchor="middle"
          >
            OR
          </text>

          <path
            d={`M ${orX + 56} ${orY} H ${outX}`}
            className="circuit-wire output-wire"
          />

          {wireLabel("F", orX + 88, orY - 18, "final-expression-text")}

          <text x={outX + 24} y={orY + 6} className="final-expression-text">
            Output
          </text>

          <foreignObject
            x={leftPad}
            y={svgHeight - 64}
            width={svgWidth - 100}
            height="54"
          >
            <div
              xmlns="http://www.w3.org/1999/xhtml"
              className="circuit-expression-box"
            >
              {mode === "original" ? "Original SOP" : "Simplified SOP"}: F ={" "}
              {displayFinalExpression}
            </div>
          </foreignObject>
        </svg>
      </div>
    </div>
  );
}
function evalGate(gate, a, b) {
  const A = Boolean(a);
  const B = Boolean(b);

  switch (gate) {
    case "AND":
      return A && B;
    case "OR":
      return A || B;
    case "NAND":
      return !(A && B);
    case "NOR":
      return !(A || B);
    case "XOR":
      return A !== B;
    case "XNOR":
      return A === B;
    case "NOT":
      return !A;
    default:
      return false;
  }
}

function GateShape({ gate }) {
  if (gate === "AND" || gate === "NAND") {
    return (
      <g>
        <path
          d="M260 105 H335 A65 65 0 0 1 335 235 H260 Z"
          className="lab-gate-shape"
        />
        {gate === "NAND" && <circle cx="403" cy="170" r="11" className="lab-bubble" />}
      </g>
    );
  }

  if (gate === "OR" || gate === "NOR" || gate === "XOR" || gate === "XNOR") {
    return (
      <g>
        {gate === "XOR" || gate === "XNOR" ? (
          <path d="M238 105 Q275 170 238 235" className="lab-gate-outline" />
        ) : null}

        <path
          d="M250 105 Q305 170 250 235 Q330 235 410 170 Q330 105 250 105 Z"
          className="lab-gate-shape"
        />

        {gate === "NOR" || gate === "XNOR" ? (
          <circle cx="420" cy="170" r="11" className="lab-bubble" />
        ) : null}
      </g>
    );
  }

  if (gate === "NOT") {
    return (
      <g>
        <polygon points="275,120 275,220 380,170" className="lab-gate-shape" />
        <circle cx="394" cy="170" r="11" className="lab-bubble" />
      </g>
    );
  }

  return null;
}

function getGateReasoning(gate, a, b, output) {
  if (gate === "AND") {
    return output
      ? `AND membutuhkan semua input bernilai 1. Karena A = ${a} dan B = ${b}, kedua switch tertutup, maka arus mengalir dan Q = 1.`
      : `AND membutuhkan semua input bernilai 1. Karena A = ${a} dan B = ${b}, masih ada switch yang terbuka, maka arus terputus dan Q = 0.`;
  }

  if (gate === "OR") {
    return output
      ? `OR hanya membutuhkan minimal satu input bernilai 1. Karena A = ${a} dan B = ${b}, ada jalur yang tertutup, maka arus mengalir dan Q = 1.`
      : `OR membutuhkan minimal satu input bernilai 1. Karena A = ${a} dan B = ${b}, semua jalur terbuka, maka arus tidak mengalir dan Q = 0.`;
  }

  if (gate === "NOT") {
    return output
      ? `NOT membalik nilai input. Karena A = ${a}, hasil kebalikannya adalah Q = 1. Dalam analogi sederhana, jalur lampu tersambung saat input tidak aktif.`
      : `NOT membalik nilai input. Karena A = ${a}, hasil kebalikannya adalah Q = 0. Dalam analogi sederhana, jalur lampu diputus saat input aktif.`;
  }

  if (gate === "NAND") {
    return `NAND adalah AND yang dibalik. Pertama dihitung A AND B, lalu hasilnya dibalik. Dengan A = ${a} dan B = ${b}, maka Q = ${output}.`;
  }

  if (gate === "NOR") {
    return `NOR adalah OR yang dibalik. Pertama dihitung A OR B, lalu hasilnya dibalik. Dengan A = ${a} dan B = ${b}, maka Q = ${output}.`;
  }

  if (gate === "XOR") {
    return output
      ? `XOR bernilai 1 jika input berbeda. Karena A = ${a} dan B = ${b}, input berbeda, maka Q = 1.`
      : `XOR bernilai 0 jika input sama. Karena A = ${a} dan B = ${b}, input sama, maka Q = 0.`;
  }

  if (gate === "XNOR") {
    return output
      ? `XNOR bernilai 1 jika input sama. Karena A = ${a} dan B = ${b}, input sama, maka Q = 1.`
      : `XNOR bernilai 0 jika input berbeda. Karena A = ${a} dan B = ${b}, input berbeda, maka Q = 0.`;
  }

  return "";
}

function ElectricFrame({
  width = 840,
  viewBox = "0 0 840 340",
  electricZoom = 1,
  children,
}) {
  return (
    <div className="electric-svg-wrap">
      <div
        className="electric-zoom-canvas"
        style={{
          width: `${electricZoom * 100}%`,
          minWidth: `${width * electricZoom}px`,
        }}
      >
        <svg viewBox={viewBox} className="electric-svg">
          {children}
        </svg>
      </div>
    </div>
  );
}

function ElectricCircuitAnalogy({
  gate,
  a,
  b,
  output,
  electricZoom,
  setElectricZoom,
}) {
  const isOn = Boolean(output);
  const aOn = Boolean(a);
  const bOn = Boolean(b);

  const zoomControls = (
    <div className="electric-toolbar">
      <div className="zoom-controls">
        <button
          type="button"
          onClick={() =>
            setElectricZoom((prev) =>
              Math.max(0.6, Number((prev - 0.1).toFixed(1)))
            )
          }
        >
          −
        </button>

        <span>{Math.round(electricZoom * 100)}%</span>

        <button
          type="button"
          onClick={() =>
            setElectricZoom((prev) =>
              Math.min(1.8, Number((prev + 0.1).toFixed(1)))
            )
          }
        >
          +
        </button>

        <button type="button" onClick={() => setElectricZoom(1)}>
          Reset
        </button>
      </div>
    </div>
  );

  if (gate === "AND") {
    return (
      <div className="electric-card">
        {zoomControls}

        <div className="electric-info">
          <h3>AND = dua switch seri</h3>
          <p>
            Lampu hanya menyala jika switch A dan switch B sama-sama tertutup.
          </p>
        </div>

        <ElectricFrame
          width={760}
          viewBox="0 0 760 320"
          electricZoom={electricZoom}
        >
          <rect
            x="40"
            y="80"
            width="56"
            height="140"
            rx="18"
            className="battery-body"
          />
          <text x="68" y="122" className="battery-mark" textAnchor="middle">
            +
          </text>
          <text x="68" y="198" className="battery-mark" textAnchor="middle">
            −
          </text>

          <path
            d="M96 110 H170"
            className={aOn ? "electric-wire active" : "electric-wire"}
          />
          <SwitchSymbol x={190} y={110} label="A" active={aOn} />

          <path
            d="M230 110 H330"
            className={aOn && bOn ? "electric-wire active" : "electric-wire"}
          />
          <SwitchSymbol x={350} y={110} label="B" active={bOn} />

          <path
            d="M390 110 H560 V145"
            className={isOn ? "electric-wire active" : "electric-wire"}
          />
          <LampSymbol x={560} y={170} active={isOn} />

          <path
            d="M560 195 V230 H68 V220"
            className={isOn ? "electric-wire active" : "electric-wire"}
          />

          <text x="190" y="286" className="electric-status">
            A: {aOn ? "closed" : "open"} • B:{" "}
            {bOn ? "closed" : "open"} • Lamp: {isOn ? "ON" : "OFF"}
          </text>
        </ElectricFrame>
      </div>
    );
  }

  if (gate === "OR") {
    return (
      <div className="electric-card">
        {zoomControls}

        <div className="electric-info">
          <h3>OR = dua switch paralel</h3>
          <p>Lampu menyala jika minimal salah satu switch tertutup.</p>
        </div>

        <ElectricFrame
          width={760}
          viewBox="0 0 760 340"
          electricZoom={electricZoom}
        >
          <rect
            x="40"
            y="100"
            width="56"
            height="140"
            rx="18"
            className="battery-body"
          />
          <text x="68" y="142" className="battery-mark" textAnchor="middle">
            +
          </text>
          <text x="68" y="218" className="battery-mark" textAnchor="middle">
            −
          </text>

          <path
            d="M96 130 H160 V90 H230"
            className={aOn ? "electric-wire active" : "electric-wire"}
          />
          <SwitchSymbol x={250} y={90} label="A" active={aOn} />
          <path
            d="M290 90 H430 V130"
            className={aOn ? "electric-wire active" : "electric-wire"}
          />

          <path
            d="M160 130 V190 H230"
            className={bOn ? "electric-wire active" : "electric-wire"}
          />
          <SwitchSymbol x={250} y={190} label="B" active={bOn} />
          <path
            d="M290 190 H430 V130"
            className={bOn ? "electric-wire active" : "electric-wire"}
          />

          <path
            d="M430 130 H560 V155"
            className={isOn ? "electric-wire active" : "electric-wire"}
          />
          <LampSymbol x={560} y={180} active={isOn} />

          <path
            d="M560 205 V250 H68 V240"
            className={isOn ? "electric-wire active" : "electric-wire"}
          />

          <text x="190" y="310" className="electric-status">
            A: {aOn ? "closed" : "open"} • B:{" "}
            {bOn ? "closed" : "open"} • Lamp: {isOn ? "ON" : "OFF"}
          </text>
        </ElectricFrame>
      </div>
    );
  }

  if (gate === "NOT") {
    return (
      <div className="electric-card">
        {zoomControls}

        <div className="electric-info">
          <h3>NOT = pembalik sederhana</h3>
          <p>
            Jika input A aktif, output diputus. Jika A tidak aktif, output
            tersambung.
          </p>
        </div>

        <ElectricFrame
          width={760}
          viewBox="0 0 760 320"
          electricZoom={electricZoom}
        >
          <rect
            x="40"
            y="80"
            width="56"
            height="140"
            rx="18"
            className="battery-body"
          />
          <text x="68" y="122" className="battery-mark" textAnchor="middle">
            +
          </text>
          <text x="68" y="198" className="battery-mark" textAnchor="middle">
            −
          </text>

          <path
            d="M96 110 H210"
            className={isOn ? "electric-wire active" : "electric-wire"}
          />
          <SwitchSymbol x={240} y={110} label="A control" active={!aOn} />
          <path
            d="M280 110 H560 V145"
            className={isOn ? "electric-wire active" : "electric-wire"}
          />

          <LampSymbol x={560} y={170} active={isOn} />

          <path
            d="M560 195 V230 H68 V220"
            className={isOn ? "electric-wire active" : "electric-wire"}
          />

          <text x="180" y="286" className="electric-status">
            A: {aOn ? "1 / control active" : "0 / control inactive"} • Lamp:{" "}
            {isOn ? "ON" : "OFF"}
          </text>
        </ElectricFrame>
      </div>
    );
  }

  if (gate === "NAND") {
    const andResult = aOn && bOn;

    return (
      <div className="electric-card">
        {zoomControls}

        <div className="electric-info">
          <h3>NAND = AND lalu dibalik</h3>
          <p>
            Jalur seri A dan B membentuk AND. Setelah itu hasilnya masuk ke
            inverter, sehingga output akhirnya dibalik.
          </p>
        </div>

        <ElectricFrame
          width={840}
          viewBox="0 0 840 350"
          electricZoom={electricZoom}
        >
          <rect
            x="40"
            y="95"
            width="56"
            height="140"
            rx="18"
            className="battery-body"
          />
          <text x="68" y="137" className="battery-mark" textAnchor="middle">
            +
          </text>
          <text x="68" y="213" className="battery-mark" textAnchor="middle">
            −
          </text>

          <path
            d="M96 125 H170"
            className={aOn ? "electric-wire active" : "electric-wire"}
          />
          <SwitchSymbol x={190} y={125} label="A" active={aOn} />

          <path
            d="M230 125 H330"
            className={andResult ? "electric-wire active" : "electric-wire"}
          />
          <SwitchSymbol x={350} y={125} label="B" active={bOn} />

          <path
            d="M390 125 H470"
            className={andResult ? "electric-wire active" : "electric-wire"}
          />

          <g>
            <rect
              x="470"
              y="95"
              width="92"
              height="60"
              rx="16"
              className="inverter-box"
            />
            <text
              x="516"
              y="131"
              className="inverter-text"
              textAnchor="middle"
            >
              NOT
            </text>
          </g>

          <path
            d="M562 125 H640 V160"
            className={isOn ? "electric-wire active" : "electric-wire"}
          />
          <LampSymbol x={640} y={185} active={isOn} />

          <path
            d="M640 210 V260 H68 V235"
            className={isOn ? "electric-wire active" : "electric-wire"}
          />

          <text x="160" y="318" className="electric-status">
            AND result: {andResult ? 1 : 0} • after NOT: Q = {output}
          </text>
        </ElectricFrame>
      </div>
    );
  }

  if (gate === "NOR") {
    const orResult = aOn || bOn;

    return (
      <div className="electric-card">
        {zoomControls}

        <div className="electric-info">
          <h3>NOR = OR lalu dibalik</h3>
          <p>
            Jalur paralel A dan B membentuk OR. Setelah itu hasilnya masuk ke
            inverter, sehingga output akhirnya dibalik.
          </p>
        </div>

        <ElectricFrame
          width={860}
          viewBox="0 0 860 370"
          electricZoom={electricZoom}
        >
          <rect
            x="40"
            y="110"
            width="56"
            height="140"
            rx="18"
            className="battery-body"
          />
          <text x="68" y="152" className="battery-mark" textAnchor="middle">
            +
          </text>
          <text x="68" y="228" className="battery-mark" textAnchor="middle">
            −
          </text>

          <path
            d="M96 140 H150 V100 H230"
            className={aOn ? "electric-wire active" : "electric-wire"}
          />
          <SwitchSymbol x={250} y={100} label="A" active={aOn} />
          <path
            d="M290 100 H430 V150"
            className={aOn ? "electric-wire active" : "electric-wire"}
          />

          <path
            d="M150 140 V210 H230"
            className={bOn ? "electric-wire active" : "electric-wire"}
          />
          <SwitchSymbol x={250} y={210} label="B" active={bOn} />
          <path
            d="M290 210 H430 V150"
            className={bOn ? "electric-wire active" : "electric-wire"}
          />

          <path
            d="M430 150 H500"
            className={orResult ? "electric-wire active" : "electric-wire"}
          />

          <g>
            <rect
              x="500"
              y="120"
              width="92"
              height="60"
              rx="16"
              className="inverter-box"
            />
            <text
              x="546"
              y="156"
              className="inverter-text"
              textAnchor="middle"
            >
              NOT
            </text>
          </g>

          <path
            d="M592 150 H660 V175"
            className={isOn ? "electric-wire active" : "electric-wire"}
          />
          <LampSymbol x={660} y={200} active={isOn} />

          <path
            d="M660 225 V270 H68 V250"
            className={isOn ? "electric-wire active" : "electric-wire"}
          />

          <text x="160" y="340" className="electric-status">
            OR result: {orResult ? 1 : 0} • after NOT: Q = {output}
          </text>
        </ElectricFrame>
      </div>
    );
  }

  if (gate === "XOR") {
    return (
      <div className="electric-card">
        {zoomControls}

        <div className="electric-info">
          <h3>XOR = menyala jika input berbeda</h3>
          <p>
            Analogi sederhana: lampu menyala hanya saat salah satu input aktif,
            bukan keduanya.
          </p>
        </div>

        <ElectricFrame
          width={840}
          viewBox="0 0 840 350"
          electricZoom={electricZoom}
        >
          <rect
            x="40"
            y="95"
            width="56"
            height="140"
            rx="18"
            className="battery-body"
          />
          <text x="68" y="137" className="battery-mark" textAnchor="middle">
            +
          </text>
          <text x="68" y="213" className="battery-mark" textAnchor="middle">
            −
          </text>

          <path
            d="M96 125 H190"
            className={isOn ? "electric-wire active" : "electric-wire"}
          />

          <g>
            <rect
              x="190"
              y="82"
              width="250"
              height="86"
              rx="18"
              className={isOn ? "xor-rule-box active" : "xor-rule-box"}
            />
            <text x="315" y="118" className="xor-rule-text" textAnchor="middle">
              A ≠ B
            </text>
            <text
              x="315"
              y="146"
              className="xor-rule-small"
              textAnchor="middle"
            >
              {a} berbeda dari {b} = {isOn ? "true" : "false"}
            </text>
          </g>

          <path
            d="M440 125 H620 V160"
            className={isOn ? "electric-wire active" : "electric-wire"}
          />
          <LampSymbol x={620} y={185} active={isOn} />

          <path
            d="M620 210 V260 H68 V235"
            className={isOn ? "electric-wire active" : "electric-wire"}
          />

          <text x="160" y="318" className="electric-status">
            XOR: A = {a}, B = {b} • Q = {output}
          </text>
        </ElectricFrame>
      </div>
    );
  }

  if (gate === "XNOR") {
    return (
      <div className="electric-card">
        {zoomControls}

        <div className="electric-info">
          <h3>XNOR = menyala jika input sama</h3>
          <p>
            Analogi sederhana: lampu menyala saat kedua input memiliki nilai
            yang sama.
          </p>
        </div>

        <ElectricFrame
          width={840}
          viewBox="0 0 840 350"
          electricZoom={electricZoom}
        >
          <rect
            x="40"
            y="95"
            width="56"
            height="140"
            rx="18"
            className="battery-body"
          />
          <text x="68" y="137" className="battery-mark" textAnchor="middle">
            +
          </text>
          <text x="68" y="213" className="battery-mark" textAnchor="middle">
            −
          </text>

          <path
            d="M96 125 H190"
            className={isOn ? "electric-wire active" : "electric-wire"}
          />

          <g>
            <rect
              x="190"
              y="82"
              width="250"
              height="86"
              rx="18"
              className={isOn ? "xor-rule-box active" : "xor-rule-box"}
            />
            <text x="315" y="118" className="xor-rule-text" textAnchor="middle">
              A = B
            </text>
            <text
              x="315"
              y="146"
              className="xor-rule-small"
              textAnchor="middle"
            >
              {a} sama dengan {b} = {isOn ? "true" : "false"}
            </text>
          </g>

          <path
            d="M440 125 H620 V160"
            className={isOn ? "electric-wire active" : "electric-wire"}
          />
          <LampSymbol x={620} y={185} active={isOn} />

          <path
            d="M620 210 V260 H68 V235"
            className={isOn ? "electric-wire active" : "electric-wire"}
          />

          <text x="160" y="318" className="electric-status">
            XNOR: A = {a}, B = {b} • Q = {output}
          </text>
        </ElectricFrame>
      </div>
    );
  }

  return (
    <div className="electric-card">
      {zoomControls}

      <div className="electric-info">
        <h3>{gate} analogy</h3>
        <p>
          Untuk gate ini, analogi listrik sederhana ditampilkan sebagai konsep:
          hasil dasar dihitung dulu, lalu output mengikuti aturan {gate}.
        </p>
      </div>

      <div className={isOn ? "simple-output active" : "simple-output"}>
        <span>Q</span>
        <b>{output}</b>
      </div>
    </div>
  );
}

function SwitchSymbol({ x, y, label, active }) {
  return (
    <g>
      <text x={x} y={y - 26} className="switch-label" textAnchor="middle">
        {label}
      </text>

      <circle cx={x - 20} cy={y} r="6" className="switch-dot" />
      <circle cx={x + 20} cy={y} r="6" className="switch-dot" />

      {active ? (
        <path
          d={`M ${x - 20} ${y} L ${x + 20} ${y}`}
          className="switch-line active"
        />
      ) : (
        <path
          d={`M ${x - 20} ${y} L ${x + 16} ${y - 22}`}
          className="switch-line"
        />
      )}
    </g>
  );
}

function LampSymbol({ x, y, active }) {
  return (
    <g>
      {active && <circle cx={x} cy={y} r="48" className="lamp-glow" />}

      <circle
        cx={x}
        cy={y}
        r="28"
        className={active ? "lamp active" : "lamp"}
      />

      <path
        d={`M ${x - 12} ${y} Q ${x} ${y - 14} ${x + 12} ${y}`}
        className="lamp-filament"
      />

      <text
        x={x + 52}
        y={y + 6}
        className={active ? "lamp-label active" : "lamp-label"}
      >
        Lamp: {active ? "ON" : "OFF"}
      </text>
    </g>
  );
}

function InteractiveLogicGateLab() {
  const [gate, setGate] = useState("AND");
  const [a, setA] = useState(0);
  const [b, setB] = useState(0);

  const [labZoom, setLabZoom] = useState(1);
  const [electricZoom, setElectricZoom] = useState(1);

  const output = evalGate(gate, a, b) ? 1 : 0;
  const isSingleInput = gate === "NOT";

  const gates = ["AND", "OR", "NOT", "NAND", "NOR", "XOR", "XNOR"];

  return (
    <section className="panel logic-lab-panel">
      <div className="panel-title stack-title">
        <div>
          <h2>Interactive Logic Gate Lab</h2>
          <p>Pilih gerbang logika, ubah input, lalu lihat output secara langsung.</p>
        </div>
        <span className="badge">Interactive</span>
      </div>

      <div className="gate-picker">
        {gates.map((item) => (
          <button
            key={item}
            className={gate === item ? "gate-pill active" : "gate-pill"}
            onClick={() => setGate(item)}
            type="button"
          >
            {item}
          </button>
        ))}
      </div>

      <div className="lab-toolbar">
        <div className="zoom-controls">
          <button
            type="button"
            onClick={() =>
              setLabZoom((prev) =>
                Math.max(0.6, Number((prev - 0.1).toFixed(1)))
              )
            }
          >
            −
          </button>

          <span>{Math.round(labZoom * 100)}%</span>

          <button
            type="button"
            onClick={() =>
              setLabZoom((prev) =>
                Math.min(1.8, Number((prev + 0.1).toFixed(1)))
              )
            }
          >
            +
          </button>

          <button type="button" onClick={() => setLabZoom(1)}>
            Reset
          </button>
        </div>
      </div>

      <div className="logic-lab-card">
        <div className="gate-controls">
          <div className="input-control">
            <span>A</span>
            <button
              type="button"
              className={a ? "toggle active" : "toggle"}
              onClick={() => setA(a ? 0 : 1)}
            >
              <i />
            </button>
            <b>{a}</b>
          </div>

          {!isSingleInput && (
            <div className="input-control">
              <span>B</span>
              <button
                type="button"
                className={b ? "toggle active" : "toggle"}
                onClick={() => setB(b ? 0 : 1)}
              >
                <i />
              </button>
              <b>{b}</b>
            </div>
          )}
        </div>

        <div
          className="gate-svg-wrap"
          style={{
            "--lab-zoom": labZoom,
          }}
        >
          <div
            className="gate-zoom-canvas"
            style={{
              width: `${labZoom * 100}%`,
              minWidth: `${720 * labZoom}px`,
            }}
          >
            <svg viewBox="0 0 720 340" className="gate-svg">
              <text x="40" y="72" className="lab-label">
                Input
              </text>

              <text
                x="105"
                y={isSingleInput ? 177 : 132}
                className="lab-input-label"
              >
                A
              </text>

              <path
                d={isSingleInput ? "M140 170 H275" : "M140 125 H260"}
                className={a ? "lab-wire active" : "lab-wire"}
              />

              {!isSingleInput && (
                <>
                  <text x="105" y="212" className="lab-input-label">
                    B
                  </text>

                  <path
                    d="M140 205 H260"
                    className={b ? "lab-wire active" : "lab-wire"}
                  />
                </>
              )}

              <GateShape gate={gate} />

              <text x="315" y="285" className="lab-gate-name">
                {gate}
              </text>

              <path
                d={
                  gate === "AND" || gate === "OR" || gate === "XOR"
                    ? "M410 170 H595"
                    : "M430 170 H595"
                }
                className={output ? "lab-wire active output" : "lab-wire output"}
              />

              <text
                x="630"
                y="148"
                className="lab-output-label"
                textAnchor="middle"
              >
                Q
              </text>

              <rect
                x="595"
                y="154"
                width="70"
                height="32"
                rx="16"
                className={output ? "output-indicator active" : "output-indicator"}
              />

              <text
                x="630"
                y="222"
                className="lab-output-number"
                textAnchor="middle"
              >
                {output}
              </text>
            </svg>
          </div>
        </div>
      </div>

      <div className="truth-table-box">
        <h3>Truth Table</h3>

        <table>
          <thead>
            <tr>
              <th>A</th>
              {!isSingleInput && <th>B</th>}
              <th>Q</th>
            </tr>
          </thead>

          <tbody>
            {isSingleInput ? (
              [0, 1].map((valueA) => {
                const q = evalGate(gate, valueA, 0) ? 1 : 0;
                const isCurrent = valueA === a;

                return (
                  <tr key={valueA} className={isCurrent ? "current-row" : ""}>
                    <td>{valueA}</td>
                    <td>{q}</td>
                  </tr>
                );
              })
            ) : (
              [
                [0, 0],
                [0, 1],
                [1, 0],
                [1, 1],
              ].map(([valueA, valueB]) => {
                const q = evalGate(gate, valueA, valueB) ? 1 : 0;
                const isCurrent = valueA === a && valueB === b;

                return (
                  <tr
                    key={`${valueA}-${valueB}`}
                    className={isCurrent ? "current-row" : ""}
                  >
                    <td>{valueA}</td>
                    <td>{valueB}</td>
                    <td>{q}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <details className="lab-accordion">
        <summary>
          <span>Electric Circuit Analogy</span>
          <b>{gate}</b>
        </summary>

        <ElectricCircuitAnalogy
          gate={gate}
          a={a}
          b={b}
          output={output}
          electricZoom={electricZoom}
          setElectricZoom={setElectricZoom}
        />
      </details>

      <details className="lab-accordion">
        <summary>
          <span>Reasoning</span>
          <b>Why Q = {output}?</b>
        </summary>

        <p className="gate-reasoning-text">
          {getGateReasoning(gate, a, b, output)}
        </p>
      </details>
    </section>
  );
}

export default function App() {
  const [toolMode, setToolMode] = useState("kmap");
  const [viewKey, setViewKey] = useState(0);
  const [variableCount, setVariableCount] = useState(3);
  const [active, setActive] = useState(new Set([2, 3, 4, 5, 6]));
  const [labelMode, setLabelMode] = useState("binary");
  const [theme, setTheme] = useState("ocean");
  const [circuitMode, setCircuitMode] = useState("simplified");
  const [circuitZoom, setCircuitZoom] = useState(1);
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

  const booleanSteps = useMemo(() => {
  return generateBooleanSteps(activeMinterms, result, config);
  }, [activeMinterms, result, config]);

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

  function switchToolMode(mode) {
  if (mode === toolMode) return;

  setToolMode(mode);
  setViewKey((prev) => prev + 1);
}

  return (
    <div className={`page theme-${theme} mode-${appearance}`}>
      <div className="container">
        <header className="hero">
          <div className="hero-text">
            <p className="eyebrow">
              {toolMode === "gate" ? "Digital Logic Tool" : "Boolean Algebra Tool"}
            </p>

            <h1>
              {toolMode === "gate" ? "Logic Gate Lab" : "K-Map Solver"}
            </h1>

            <p className="subtitle">
              {toolMode === "gate"
                ? "Simulasi gerbang logika interaktif untuk melihat cara kerja AND, OR, NOT, NAND, NOR, XOR, dan XNOR."
                : "Solver K-Map dinamis untuk 2, 3, dan 4 variabel dengan visual grouping, SOP expression, coverage validation, dan reasoning."}
            </p>
          </div>

          <div className="hero-card">
            <span>
              {toolMode === "gate" ? "Interactive Mode" : `F(${config.variables.join(",")})`}
            </span>

            <strong>
              {toolMode === "gate" ? "Gate Simulator" : result.expression}
            </strong>
          </div>
        </header>

          <div className="tool-mode-switch">
            <button
              className={toolMode === "kmap" ? "tool-mode active" : "tool-mode"}
              onClick={() => switchToolMode("kmap")}
            >
              K-Map Solver
            </button>

            <button
              className={toolMode === "gate" ? "tool-mode active" : "tool-mode"}
              onClick={() => switchToolMode("gate")}
            >
              Logic Gate Lab
            </button>
          </div>
            <div key={viewKey} className="view-transition">
              {toolMode === "gate" ? (
                <InteractiveLogicGateLab />
              ) : (
                <>
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
                  {config.rowVars.join("")}/{config.colVars.join("")}
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
              <h2>Boolean Simplification</h2>
              <p>Penyelesaian manual berbasis minterm dan grouping K-Map.</p>
            </div>
            <span className="badge">Step-by-step</span>
          </div>

          <div className="boolean-step-list">
            {booleanSteps.map((step, index) => (
              <details className="boolean-step-card" key={index} open={index === 0}>
                <summary>
                  <span>{index + 1}</span>
                  <b>{step.title}</b>
                </summary>

                <div className="boolean-step-content">
                  <code>{step.expression}</code>
                  <p>{step.reason}</p>
                </div>
              </details>
            ))}
          </div>
        </section>

    <section className="panel">
      <div className="panel-title stack-title">
        <div>
          <h2>Logic Circuit</h2>
          <p>Visualisasi circuit dengan bentuk gerbang logika asli dan line lurus.</p>
        </div>
        <span className="badge">{circuitMode === "original" ? "Original SOP" : "Simplified"}</span>
      </div>

      <div className="circuit-toolbar">
        <div className="circuit-mode-switch">
          <button
            className={circuitMode === "original" ? "circuit-tab active" : "circuit-tab"}
            onClick={() => setCircuitMode("original")}
          >
            Original SOP
          </button>

          <button
            className={circuitMode === "simplified" ? "circuit-tab active" : "circuit-tab"}
            onClick={() => setCircuitMode("simplified")}
          >
            Simplified
          </button>
        </div>

        <div className="zoom-controls">
          <button onClick={() => setCircuitZoom((z) => Math.max(0.55, Number((z - 0.1).toFixed(2))))}>
            −
          </button>
          <span>{Math.round(circuitZoom * 100)}%</span>
          <button onClick={() => setCircuitZoom((z) => Math.min(1.6, Number((z + 0.1).toFixed(2))))}>
            +
          </button>
          <button onClick={() => setCircuitZoom(1)}>Reset</button>
        </div>
      </div>

      <LogicCircuit
        activeMinterms={activeMinterms}
        result={result}
        config={config}
        mode={circuitMode}
        zoom={circuitZoom}
      />
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
      </>
    )}
</div>
      </div>
    </div>
  );
}