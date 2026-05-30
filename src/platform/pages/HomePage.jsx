import { useEffect, useMemo, useRef, useState } from "react";
import { Layout } from "../components/Layout";
import { Badge, Button, SubjectCard } from "../components/UI";
import { SITE_CONFIG, SUBJECTS } from "../siteConfig";

const SHOWCASE_POINTS = [
  {
    code: "01",
    title: "Visual reasoning",
    text: "Karnaugh maps and Boolean expressions become objects you can see, trace, and test.",
  },
  {
    code: "02",
    title: "Live signal flow",
    text: "Move from gates to digital circuits with realtime signal paths and interactive states.",
  },
  {
    code: "03",
    title: "Built for study",
    text: "An offline-first laboratory designed for academic exploration and portfolio work.",
  },
];


const PREVIEW_VIEW_META = {
  circuit: {
    code: "03",
    label: "Circuit",
    href: "/digital-electronics/circuit-ide",
    monitor: "Circuit monitor",
    action: "Open Circuit IDE",
  },
  map: {
    code: "01",
    label: "Map",
    href: "/digital-electronics/kmap",
    monitor: "Map monitor",
    action: "Open K-Map",
  },
  learn: {
    code: "02",
    label: "Learn",
    href: "/digital-electronics/logic-lab",
    monitor: "Learning monitor",
    action: "Open Learning",
  },
};

const PREVIEW_FACTS = {
  map: [
    { id: "m01", tag: "Purpose", title: "Visual minimisasi", text: "K-Map menyederhanakan fungsi Boolean dengan mengelompokkan minterm yang berdekatan." },
    { id: "m02", tag: "Order", title: "Gray-code grid", text: "Urutan 00, 01, 11, 10 memastikan hanya satu bit berubah tiap langkah." },
    { id: "m03", tag: "Edges", title: "Wrap-around", text: "Sisi kiri dan kanan peta dianggap berdampingan dalam proses grouping." },
    { id: "m04", tag: "Rules", title: "Power of two", text: "Grup valid selalu berukuran 1, 2, 4, 8, atau 16 sel." },
    { id: "m05", tag: "Strategy", title: "Pilih grup besar", text: "Grup lebih besar biasanya menghilangkan lebih banyak variabel." },
    { id: "m06", tag: "Output", title: "Bentuk SOP", text: "Pengelompokan nilai 1 digunakan untuk membangun ekspresi Sum of Products." },
    { id: "m07", tag: "Alternative", title: "Bentuk POS", text: "Pengelompokan nilai 0 dapat membantu membangun Product of Sums." },
    { id: "m08", tag: "Scale", title: "Dua variabel", text: "K-Map dua variabel hanya memiliki empat kombinasi input." },
    { id: "m09", tag: "Scale", title: "Empat variabel", text: "K-Map empat variabel merepresentasikan enam belas minterm." },
    { id: "m10", tag: "Topology", title: "Sudut bertemu", text: "Empat sel sudut dapat membentuk satu grup wrap-around." },
    { id: "m11", tag: "Coverage", title: "Overlap valid", text: "Satu minterm boleh ditutup lebih dari satu grup bila diperlukan." },
    { id: "m12", tag: "Optimization", title: "Don't-care", text: "Kondisi don't-care dapat dipakai untuk membentuk grup yang lebih besar." },
    { id: "m13", tag: "Adjacency", title: "Bukan diagonal", text: "Sel diagonal tidak dianggap tetangga pada Karnaugh Map." },
    { id: "m14", tag: "Term", title: "Prime implicant", text: "Grup yang tidak dapat diperbesar lagi disebut prime implicant." },
    { id: "m15", tag: "Term", title: "Essential term", text: "Term yang sendirian menutup minterm tertentu wajib dipertahankan." },
    { id: "m16", tag: "Notation", title: "Sigma minterm", text: "Notasi Σm mencatat indeks input yang menghasilkan keluaran satu." },
    { id: "m17", tag: "Hardware", title: "Gerbang lebih hemat", text: "Ekspresi lebih ringkas sering mengurangi kebutuhan gerbang logika." },
    { id: "m18", tag: "Learning", title: "Pattern visible", text: "K-Map efektif karena pola simplifikasi dapat terlihat langsung." },
    { id: "m19", tag: "Design", title: "Cost reduction", text: "Term lebih sedikit membantu rangkaian lebih sederhana dan mudah diuji." },
    { id: "m20", tag: "Connection", title: "Truth-table link", text: "Setiap sel pada K-Map berasal dari satu baris tabel kebenaran." },
  ],
  learn: [
    { id: "l01", tag: "Binary", title: "Dua keadaan", text: "Sinyal digital dasar dibaca sebagai 0 atau 1." },
    { id: "l02", tag: "AND", title: "Semua harus aktif", text: "Gerbang AND menghasilkan 1 hanya saat semua input bernilai 1." },
    { id: "l03", tag: "OR", title: "Satu cukup", text: "Gerbang OR menghasilkan 1 jika minimal satu input aktif." },
    { id: "l04", tag: "XOR", title: "Input berbeda", text: "XOR bernilai 1 ketika kedua input memiliki keadaan berbeda." },
    { id: "l05", tag: "NOT", title: "Pembalik nilai", text: "NOT mengubah 1 menjadi 0 dan 0 menjadi 1." },
    { id: "l06", tag: "NAND", title: "Universal gate", text: "Rangkaian logika apa pun dapat dibangun menggunakan NAND saja." },
    { id: "l07", tag: "NOR", title: "Universal gate", text: "NOR juga cukup untuk membangun fungsi Boolean lengkap." },
    { id: "l08", tag: "XNOR", title: "Pembanding", text: "XNOR aktif ketika input memiliki nilai yang sama." },
    { id: "l09", tag: "Table", title: "Truth table", text: "Tabel kebenaran mencatat output untuk seluruh kombinasi input." },
    { id: "l10", tag: "Signal", title: "High dan low", text: "High biasanya mewakili 1, sedangkan low mewakili 0." },
    { id: "l11", tag: "Composition", title: "Gate bertingkat", text: "Output satu gerbang dapat menjadi input gerbang berikutnya." },
    { id: "l12", tag: "Expression", title: "A·B", text: "Tanda perkalian Boolean sering dipakai untuk operasi AND." },
    { id: "l13", tag: "Expression", title: "A + B", text: "Tanda tambah Boolean sering dipakai untuk operasi OR." },
    { id: "l14", tag: "Expression", title: "A'", text: "Tanda apostrof menyatakan komplemen atau operasi NOT." },
    { id: "l15", tag: "Timing", title: "Propagation", text: "Perubahan input memerlukan waktu sebelum terlihat pada output nyata." },
    { id: "l16", tag: "Practice", title: "Toggle input", text: "Mengubah A dan B membantu memahami respons setiap gate." },
    { id: "l17", tag: "Design", title: "Combinational", text: "Output rangkaian kombinasi bergantung pada input saat ini." },
    { id: "l18", tag: "Memory", title: "Sequential", text: "Rangkaian sequential dapat menyimpan state dari waktu sebelumnya." },
    { id: "l19", tag: "Foundation", title: "Dari gate ke CPU", text: "Gerbang sederhana menjadi dasar blok digital yang jauh lebih besar." },
    { id: "l20", tag: "Reasoning", title: "Belajar visual", text: "Alur sinyal membuat alasan di balik output lebih mudah dilacak." },
  ],
  circuit: [
    { id: "c01", tag: "Workspace", title: "Rakit visual", text: "Circuit IDE menyusun komponen digital sebagai node yang terhubung." },
    { id: "c02", tag: "Wiring", title: "Signal path", text: "Wire membawa nilai output menuju port input komponen lain." },
    { id: "c03", tag: "Input", title: "Source node", text: "Input switch memberi kondisi awal untuk menguji rangkaian." },
    { id: "c04", tag: "Output", title: "Monitor node", text: "Output membantu membaca hasil simulasi rangkaian secara langsung." },
    { id: "c05", tag: "Editing", title: "Drag and place", text: "Komponen dapat diposisikan untuk membuat diagram lebih mudah dibaca." },
    { id: "c06", tag: "Inspection", title: "Component inspector", text: "Panel inspector menampilkan state dan properti node terpilih." },
    { id: "c07", tag: "Template", title: "Start faster", text: "Template mempercepat percobaan rangkaian yang umum dipelajari." },
    { id: "c08", tag: "Validation", title: "Floating input", text: "Input yang belum terhubung perlu diperiksa sebelum membaca hasil." },
    { id: "c09", tag: "Simulation", title: "Realtime state", text: "Perubahan input dapat langsung merambat melalui jaringan gate." },
    { id: "c10", tag: "Clock", title: "Edge driven", text: "Clock membantu menguji komponen yang menyimpan keadaan." },
    { id: "c11", tag: "Register", title: "State memory", text: "Register menyimpan bit agar sistem dapat mengingat nilai." },
    { id: "c12", tag: "Counter", title: "Urutan pulsa", text: "Counter berubah mengikuti pulsa clock yang diterimanya." },
    { id: "c13", tag: "Zoom", title: "Wide canvas", text: "Workspace luas membantu merancang rangkaian dengan banyak modul." },
    { id: "c14", tag: "Debug", title: "Trace signals", text: "Melihat jalur aktif mempermudah pencarian kesalahan rangkaian." },
    { id: "c15", tag: "Export", title: "Portable JSON", text: "Rangkaian dapat disimpan sebagai data untuk dibuka kembali." },
    { id: "c16", tag: "Offline", title: "Local simulator", text: "Eksperimen dasar dapat berjalan tanpa layanan AI eksternal." },
    { id: "c17", tag: "Scale", title: "Modular blocks", text: "Sub-rangkaian kecil dapat disusun menjadi sistem lebih kompleks." },
    { id: "c18", tag: "Display", title: "Logic levels", text: "Node dan wire dapat menunjukkan sinyal aktif atau tidak aktif." },
    { id: "c19", tag: "Design", title: "Readable layout", text: "Penempatan komponen yang rapi memperjelas aliran informasi." },
    { id: "c20", tag: "Learning", title: "Build to understand", text: "Merakit circuit membantu menghubungkan teori dengan perilaku sinyal." },
  ],
};

function pickPreviewFacts(view, previousIds = []) {
  const pool = PREVIEW_FACTS[view];
  const fresh = pool.filter((fact) => !previousIds.includes(fact.id));
  const candidates = [...(fresh.length >= 3 ? fresh : pool)];
  const picks = [];

  while (picks.length < 3 && candidates.length) {
    const position = Math.floor(Math.random() * candidates.length);
    picks.push(candidates.splice(position, 1)[0]);
  }

  return picks;
}

function RibbonSculpture() {
  return (
    <div className="cit-ribbon-sculpture" aria-hidden="true">
      <div className="cit-ribbon ribbon-one" />
      <div className="cit-ribbon ribbon-two" />
      <div className="cit-ribbon ribbon-three" />
      <div className="cit-glass-pearl" />
    </div>
  );
}

function computeCircuit(view, a, b, gate) {
  if (view === "learn") {
    if (gate === "AND") return a & b;
    if (gate === "OR") return a | b;
    return a ^ b;
  }

  return a ^ b;
}

function PreviewCircuit({ a, b, onToggle }) {
  const q = a ^ b;

  return (
    <svg className="cit-product-circuit" viewBox="0 0 720 386" role="img" aria-label="Interactive digital circuit preview">
      <defs>
        <linearGradient id="citActiveLine" x1="0" y1="0" x2="1" y2="0">
          <stop stopColor="#ff4b91" />
          <stop offset="0.48" stopColor="#f36c77" />
          <stop offset="1" stopColor="#42d5e7" />
        </linearGradient>
        <linearGradient id="citCardFill" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#ffffff" stopOpacity=".98" />
          <stop offset="1" stopColor="#f5f4f2" stopOpacity=".9" />
        </linearGradient>
        <filter id="citSoftGlow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="7" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="citNodeShadow" x="-30%" y="-30%" width="180%" height="180%">
          <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#151316" floodOpacity=".08" />
        </filter>
      </defs>
      <path className="cit-wire-base" d="M154 144L286 188" />
      <path className="cit-wire-base" d="M154 255L286 211" />
      <path className="cit-wire-base" d="M414 199L552 199" />
      <path className="cit-wire-active" filter="url(#citSoftGlow)" d="M154 144L286 188M414 199L552 199" />

      <g className="cit-canvas-node interactive" filter="url(#citNodeShadow)" onClick={() => onToggle("a")}>
        <rect x="54" y="112" width="100" height="64" rx="22" />
        <text x="80" y="151">A</text><text className="hot" x="119" y="151">{a}</text>
        <circle className={`port ${a ? "hot" : ""}`} cx="154" cy="144" r="4" />
      </g>
      <g className="cit-canvas-node interactive" filter="url(#citNodeShadow)" onClick={() => onToggle("b")}>
        <rect x="54" y="223" width="100" height="64" rx="22" />
        <text x="80" y="262">B</text><text className={b ? "hot" : ""} x="119" y="262">{b}</text>
        <circle className={`port ${b ? "hot" : ""}`} cx="154" cy="255" r="4" />
      </g>
      <g className="cit-canvas-gate" filter="url(#citNodeShadow)">
        <rect x="286" y="164" width="128" height="70" rx="25" />
        <text x="350" y="207">XOR</text>
      </g>
      <g className="cit-canvas-node output" filter="url(#citNodeShadow)">
        <rect x="552" y="165" width="112" height="68" rx="24" />
        <text x="578" y="206">Q</text><text className="hot" x="626" y="206">{q}</text>
        <circle className={`port ${q ? "hot" : ""}`} cx="552" cy="199" r="4" />
      </g>
    </svg>
  );
}

function PreviewMap({ activeCells, onToggleCell }) {
  const cells = [0, 1, 3, 2, 4, 5, 7, 6];

  return (
    <div className="cit-preview-map-board" role="group" aria-label="Interactive K-Map preview">
      <div className="cit-preview-map-labels">
        <span>A/BC</span>
        <b>00</b>
        <b>01</b>
        <b>11</b>
        <b>10</b>
      </div>
      <div className="cit-preview-map-row">
        <span>0</span>
        {cells.slice(0, 4).map((cell) => (
          <button
            type="button"
            key={cell}
            className={activeCells.includes(cell) ? "is-on" : ""}
            onClick={() => onToggleCell(cell)}
          >
            <strong>{activeCells.includes(cell) ? 1 : 0}</strong>
            <small>m{cell}</small>
          </button>
        ))}
      </div>
      <div className="cit-preview-map-row">
        <span>1</span>
        {cells.slice(4).map((cell) => (
          <button
            type="button"
            key={cell}
            className={activeCells.includes(cell) ? "is-on" : ""}
            onClick={() => onToggleCell(cell)}
          >
            <strong>{activeCells.includes(cell) ? 1 : 0}</strong>
            <small>m{cell}</small>
          </button>
        ))}
      </div>
    </div>
  );
}

function PreviewLearning({ a, b, gate, onToggle, onSetGate }) {
  const q = computeCircuit("learn", a, b, gate);

  const gateItems = [
    ["AND", "Foundation"],
    ["OR", "Decision"],
    ["XOR", "Difference"],
  ];

  function keyboardActivate(event, action) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      action();
    }
  }

  return (
    <div className="cit-learnfix" aria-label="Interactive learning mode preview">
      <div className="cit-learnfix-switches">
        <button
          type="button"
          className={a ? "is-on" : ""}
          onClick={() => onToggle("a")}
        >
          <span>A</span>
          <b>{a}</b>
        </button>

        <button
          type="button"
          className={b ? "is-on" : ""}
          onClick={() => onToggle("b")}
        >
          <span>B</span>
          <b>{b}</b>
        </button>
      </div>

      <div className="cit-learnfix-workbench">
        <div className="cit-learnfix-picker">
          {gateItems.map(([item, description]) => (
            <button
              key={item}
              type="button"
              className={gate === item ? "active" : ""}
              onClick={() => onSetGate(item)}
            >
              <strong>{item}</strong>
              <small>{description}</small>
            </button>
          ))}
        </div>

        <div className="cit-learnfix-diagram">
          <svg
            className="cit-learnfix-svg"
            viewBox="0 0 560 260"
            role="img"
            aria-label={`${gate} gate interactive preview`}
          >
            <defs>
              <linearGradient id="citLearnFixSignal" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#ff4f98" />
                <stop offset="0.5" stopColor="#aa72ff" />
                <stop offset="1" stopColor="#3ecfe4" />
              </linearGradient>

              <linearGradient id="citLearnFixNodeFill" x1="0" y1="0" x2="0" y2="1">
                <stop stopColor="#ffffff" stopOpacity="0.98" />
                <stop offset="1" stopColor="#fbfaff" stopOpacity="0.82" />
              </linearGradient>

              <filter id="citLearnFixShadow" x="-30%" y="-40%" width="170%" height="190%">
                <feDropShadow
                  dx="0"
                  dy="12"
                  stdDeviation="12"
                  floodColor="#68718d"
                  floodOpacity="0.12"
                />
              </filter>

              <filter id="citLearnFixGlow" x="-30%" y="-40%" width="170%" height="190%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Base connection routes */}
            <path
              className="cit-learnfix-wire-base"
              d="M98 72 H150 Q176 72 192 91 L230 116 H258"
            />
            <path
              className="cit-learnfix-wire-base"
              d="M98 190 H150 Q176 190 192 173 L230 151 H258"
            />
            <path
              className="cit-learnfix-wire-base"
              d="M382 134 H452"
            />

            {/* Active signal routes */}
            {a ? (
              <path
                className="cit-learnfix-wire-live"
                d="M98 72 H150 Q176 72 192 91 L230 116 H258"
              />
            ) : null}

            {b ? (
              <path
                className="cit-learnfix-wire-live"
                d="M98 190 H150 Q176 190 192 173 L230 151 H258"
              />
            ) : null}

            {q ? (
              <path
                className="cit-learnfix-wire-live output"
                d="M382 134 H452"
              />
            ) : null}

            {/* Input A */}
            <g
              className={`cit-learnfix-node input ${a ? "is-on" : ""}`}
              role="button"
              tabIndex="0"
              onClick={() => onToggle("a")}
              onKeyDown={(event) => keyboardActivate(event, () => onToggle("a"))}
              filter="url(#citLearnFixShadow)"
            >
              <rect x="12" y="42" width="86" height="60" rx="20" />
              <text x="35" y="73">A</text>
              <text className="value" x="71" y="73">{a}</text>
              <circle cx="98" cy="72" r="4" />
            </g>

            {/* Input B */}
            <g
              className={`cit-learnfix-node input ${b ? "is-on" : ""}`}
              role="button"
              tabIndex="0"
              onClick={() => onToggle("b")}
              onKeyDown={(event) => keyboardActivate(event, () => onToggle("b"))}
              filter="url(#citLearnFixShadow)"
            >
              <rect x="12" y="160" width="86" height="60" rx="20" />
              <text x="35" y="191">B</text>
              <text className="value" x="71" y="191">{b}</text>
              <circle cx="98" cy="190" r="4" />
            </g>

            {/* Gate */}
            <g className="cit-learnfix-node gate" filter="url(#citLearnFixShadow)">
              <rect x="258" y="94" width="124" height="80" rx="28" />
              <circle className={`gate-port ${a ? "is-on" : ""}`} cx="258" cy="116" r="3.5" />
              <circle className={`gate-port ${b ? "is-on" : ""}`} cx="258" cy="151" r="3.5" />
              <circle className={`gate-port ${q ? "is-on" : ""}`} cx="382" cy="134" r="3.5" />
              <text x="320" y="135">{gate}</text>
            </g>

            {/* Output Q */}
            <g
              className={`cit-learnfix-node output ${q ? "is-on" : ""}`}
              filter="url(#citLearnFixShadow)"
            >
              <rect x="452" y="105" width="94" height="59" rx="20" />
              <circle cx="452" cy="134" r="4" />
              <text x="478" y="135">Q</text>
              <text className="value" x="521" y="135">{q}</text>
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}

const PREVIEW_VIEW_ORDER = ["circuit", "map", "learn"];

function ProductStage({ onNavigate, motionReduced, ambientPaused }) {
  const [activeView, setActiveView] = useState("circuit");
  const [renderedView, setRenderedView] = useState("circuit");
  const [transitionPhase, setTransitionPhase] = useState("idle");
  const [transitionDirection, setTransitionDirection] = useState("forward");
  const [circuitA, setCircuitA] = useState(1);
  const [circuitB, setCircuitB] = useState(0);
  const [learningGate, setLearningGate] = useState("AND");
  const [mapActive, setMapActive] = useState([2, 3, 4, 5, 6]);
  const [insightCards, setInsightCards] = useState(() => pickPreviewFacts("circuit"));
  const [introPlaying, setIntroPlaying] = useState(() => !motionReduced);
  const factHistoryRef = useRef({ circuit: [], map: [], learn: [] });
  const transitionTimersRef = useRef([]);

  const viewMeta = PREVIEW_VIEW_META[renderedView];

  useEffect(() => {
    factHistoryRef.current.circuit = insightCards.map((fact) => fact.id);

    if (motionReduced) {
      setIntroPlaying(false);
      return () => transitionTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    }

    const introTimer = window.setTimeout(() => setIntroPlaying(false), 2620);

    return () => {
      window.clearTimeout(introTimer);
      transitionTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    };
    // Initial random Circuit cards are recorded once; later picks are updated on view changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [motionReduced]);

  const statusText = useMemo(() => {
    if (renderedView === "map") return `${mapActive.length} active minterms`;
    if (renderedView === "learn") return `${learningGate} gate / guided study`;
    return `Q = A ⊕ B → ${circuitA ^ circuitB}`;
  }, [renderedView, mapActive, learningGate, circuitA, circuitB]);

  const open = (event, href) => {
    event.preventDefault();
    onNavigate(href);
  };

  const toggleBit = (key) => {
    if (key === "a") {
      setCircuitA((prev) => (prev ? 0 : 1));
      return;
    }

    setCircuitB((prev) => (prev ? 0 : 1));
  };

  const toggleMapCell = (cell) => {
    setMapActive((prev) => (
      prev.includes(cell) ? prev.filter((item) => item !== cell) : [...prev, cell].sort((a, b) => a - b)
    ));
  };

  const changePreviewView = (view) => {
    if (view === activeView || transitionPhase !== "idle") return;

    setIntroPlaying(false);
    const currentIndex = PREVIEW_VIEW_ORDER.indexOf(renderedView);
    const nextIndex = PREVIEW_VIEW_ORDER.indexOf(view);
    const direction = nextIndex > currentIndex ? "forward" : "backward";

    setActiveView(view);
    setTransitionDirection(direction);
    setTransitionPhase("exiting");

    transitionTimersRef.current.push(window.setTimeout(() => {
      const nextFacts = pickPreviewFacts(view, factHistoryRef.current[view]);
      factHistoryRef.current[view] = nextFacts.map((fact) => fact.id);

      setRenderedView(view);
      setInsightCards(nextFacts);
      setTransitionPhase("entering");

      transitionTimersRef.current.push(window.setTimeout(() => {
        setTransitionPhase("idle");
      }, 520));
    }, 215));
  };

  return (
    <div
      className={`cit-product-stage ${introPlaying ? "is-intro" : "is-ready"} view-${renderedView} selected-${activeView} transition-${transitionPhase} direction-${transitionDirection} motion-${motionReduced ? "reduced" : "full"} ${ambientPaused ? "ambient-paused" : ""}`}
      data-intro={introPlaying ? "playing" : "complete"}
      data-preview-view={activeView}
      data-ambient-state={ambientPaused ? "paused" : "running"}
    >
      <RibbonSculpture />
      <div className="cit-stage-light" aria-hidden="true" />
      <div className="cit-stage-shadow" aria-hidden="true" />

      <article className="cit-product-window">
        <header className="cit-window-header">
          <span className="cit-window-word">CITools</span>
          <div className="cit-window-tabs" aria-label="Preview mode tabs" role="tablist">
            <span className="cit-tab-glider" aria-hidden="true" />
            {[
              ["circuit", "Circuit"],
              ["map", "Map"],
              ["learn", "Learn"],
            ].map(([id, label]) => (
              <button
                type="button"
                key={id}
                className={activeView === id ? "active" : ""}
                data-preview-id={id}
                onClick={() => changePreviewView(id)}
                disabled={transitionPhase !== "idle"}
                role="tab"
                aria-selected={activeView === id}
                aria-controls="cit-live-preview"
              >
                {label}
              </button>
            ))}
          </div>
          <span className="cit-status-dot">Live</span>
        </header>
        <div className="cit-window-canvas" id="cit-live-preview" aria-busy={transitionPhase !== "idle"}>
          <span className="cit-window-label">DIGITAL ELECTRONICS / INTERACTIVE PREVIEW</span>
          <div className={`cit-preview-swap phase-${transitionPhase} swipe-${transitionDirection}`} key={renderedView}>
            {renderedView === "circuit" ? (
              <PreviewCircuit a={circuitA} b={circuitB} onToggle={toggleBit} />
            ) : renderedView === "map" ? (
              <PreviewMap activeCells={mapActive} onToggleCell={toggleMapCell} />
            ) : (
              <PreviewLearning a={circuitA} b={circuitB} gate={learningGate} onToggle={toggleBit} onSetGate={setLearningGate} />
            )}
          </div>
        </div>
        <footer className="cit-window-footer">
          <div className={`cit-window-footer-status phase-${transitionPhase} swipe-${transitionDirection}`} key={`status-${renderedView}`}>
            <span>{viewMeta.monitor}</span>
            <strong className={introPlaying && renderedView === "circuit" ? "is-booting" : ""}>{introPlaying && renderedView === "circuit" ? "SYSTEM INITIALIZING..." : statusText}</strong>
          </div>
          <div className="cit-window-footer-actions">
            <a href={viewMeta.href} onClick={(event) => open(event, viewMeta.href)}>{viewMeta.action} ↗</a>
          </div>
        </footer>
      </article>

      <section
        className={`cit-floating-facts facts-${renderedView} phase-${transitionPhase} swipe-${transitionDirection}`}
        aria-label={`${viewMeta.label} insight cards`}
        aria-live="polite"
      >
        {insightCards.map((fact, index) => (
          <article className={`cit-fact-card fact-slot-${index + 1}`} key={`${renderedView}-${fact.id}`}>
            <span>{viewMeta.code} / {viewMeta.label} / {fact.tag}</span>
            <strong>{fact.title}</strong>
            <p>{fact.text}</p>
          </article>
        ))}
      </section>
    </div>
  );
}


function useHomeMotionPreference() {
  const readPreference = () => {
    const savedMotion = window.localStorage.getItem("citools-motion");
    return ["auto", "full", "reduced"].includes(savedMotion) ? savedMotion : "full";
  };

  const readSystemPreference = () => (
    typeof window.matchMedia === "function"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false
  );

  const [preference, setPreference] = useState(readPreference);
  const [systemReduced, setSystemReduced] = useState(readSystemPreference);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return undefined;

    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleQueryChange = (event) => setSystemReduced(event.matches);
    const handleStorage = (event) => {
      if (event.key === "citools-motion") setPreference(readPreference());
    };

    if (typeof query.addEventListener === "function") {
      query.addEventListener("change", handleQueryChange);
    } else {
      query.addListener?.(handleQueryChange);
    }

    window.addEventListener("storage", handleStorage);

    return () => {
      if (typeof query.removeEventListener === "function") {
        query.removeEventListener("change", handleQueryChange);
      } else {
        query.removeListener?.(handleQueryChange);
      }

      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  return preference === "reduced" || (preference === "auto" && systemReduced);
}

function useHomeSectionReveal(motionReduced) {
  const flowRef = useRef(null);

  useEffect(() => {
    const flow = flowRef.current;
    if (!flow) return undefined;

    const sections = Array.from(flow.querySelectorAll("[data-home-reveal]"));

    if (motionReduced) {
      flow.classList.remove("is-motion-observed");
      sections.forEach((section) => section.classList.add("is-in-view"));
      return undefined;
    }

    flow.classList.add("is-motion-observed");

    if (!("IntersectionObserver" in window)) {
      sections.forEach((section) => section.classList.add("is-in-view"));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in-view");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.14,
        rootMargin: "0px 0px -12% 0px",
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [motionReduced]);

  return flowRef;
}


function useHomeStageActivity() {
  const stageRef = useRef(null);
  const [stageVisible, setStageVisible] = useState(true);
  const [documentVisible, setDocumentVisible] = useState(() => (
    typeof document === "undefined" || document.visibilityState !== "hidden"
  ));

  useEffect(() => {
    const stage = stageRef.current;
    const handleVisibilityChange = () => {
      setDocumentVisible(document.visibilityState !== "hidden");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    if (!stage || !("IntersectionObserver" in window)) {
      return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setStageVisible(entry.isIntersecting);
      },
      {
        threshold: 0.01,
        rootMargin: "160px 0px 160px 0px",
      }
    );

    observer.observe(stage);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return {
    stageRef,
    ambientPaused: !stageVisible || !documentVisible,
  };
}

export default function HomePage({ onNavigate }) {
  const motionReduced = useHomeMotionPreference();
  const motionFlowRef = useHomeSectionReveal(motionReduced);
  const { stageRef, ambientPaused } = useHomeStageActivity();

  return (
    <Layout
      onNavigate={onNavigate}
      pageClassName={`cit-home-showcase motion-${motionReduced ? "reduced" : "full"}`}
    >
      <div className="cit-home-motion-flow" ref={motionFlowRef}>
      <section className="cit-showcase-hero">
        <div className="cit-showcase-copy">
          <div className="cit-g1-rise cit-intro-badge">
            <Badge variant="active">CIT / Learning Product Collection</Badge>
          </div>
          <p className="cit-minimal-eyebrow cit-g1-rise cit-intro-eyebrow">Cokroaminoto informatika tool — academic prototype 2026</p>
          <h1 className="cit-cinematic-title" aria-label="Concepts become interactive objects.">
            <span className="cit-title-mask line-1"><span className="cit-title-line cit-title-primary">Concepts</span></span>
            <span className="cit-title-mask line-2"><span className="cit-title-line cit-title-primary">become</span></span>
            <span className="cit-title-mask line-3"><span className="cit-title-line cit-title-accent">interactive</span></span>
            <span className="cit-title-mask line-4"><span className="cit-title-line cit-title-accent">objects.</span></span>
          </h1>
          <p className="cit-showcase-lead cit-g1-rise cit-intro-lead">
            Platform pembelajaran visual untuk memahami informatika, elektronika digital,
            struktur data, algoritma, dan teknologi komputer melalui alat yang dapat disentuh dan diuji.
          </p>
          <div className="cit-showcase-actions cit-g1-rise cit-intro-actions">
            <Button href="/digital-electronics" onNavigate={onNavigate}>Explore tools</Button>
            <Button href={SITE_CONFIG.githubUrl} variant="secondary" external>View GitHub</Button>
          </div>
        </div>

        <div className="cit-stage-wrap cit-g1-stage-wrap" ref={stageRef}>
          <ProductStage
            onNavigate={onNavigate}
            motionReduced={motionReduced}
            ambientPaused={ambientPaused}
          />
        </div>
      </section>

      <section className="cit-collection-section cit-home-scroll-section" id="tools" data-home-reveal="collection">
        <div className="cit-editorial-head">
          <div>
            <Badge>Course Collection</Badge>
            <h2>Learning instruments,<br /><em>curated by subject.</em></h2>
          </div>
          <p>
            Mulai dari Elektronika Digital sebagai ruang eksperimen pertama. Modul berikutnya disiapkan
            sebagai koleksi visual untuk pembelajaran informatika yang lebih luas.
          </p>
        </div>
        <div className="cit-product-collection">
          {SUBJECTS.map((subject, index) => (
            <SubjectCard key={subject.id} subject={subject} index={index} onNavigate={onNavigate} />
          ))}
        </div>
      </section>

      <section className="cit-showcase-method cit-home-scroll-section" data-home-reveal="method">
        <div className="cit-method-title">
          <span className="cit-method-count">02</span>
          <h2>Designed for<br /><em>seeing systems.</em></h2>
        </div>
        <div className="cit-method-panels">
          {SHOWCASE_POINTS.map((point) => (
            <article className="cit-method-panel" key={point.code}>
              <span>{point.code}</span>
              <h3>{point.title}</h3>
              <p>{point.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="cit-showcase-cta cit-home-scroll-section" id="creator" data-home-reveal="cta">
        <div className="cit-cta-object" aria-hidden="true"><i /><i /><i /></div>
        <Badge variant="active">Academic Portfolio / UNCP</Badge>
        <h2>Start with a signal.<br /><em>Build an idea.</em></h2>
        <p>
          Created by <strong>{SITE_CONFIG.creator}</strong> as an independent academic project
          connected to {SITE_CONFIG.university}.
        </p>
        <div className="cit-showcase-actions">
          <Button href="/digital-electronics" onNavigate={onNavigate}>Open Elektronika Digital</Button>
          <Button href="/academic-origin" variant="secondary" onNavigate={onNavigate}>Academic Origin</Button>
        </div>
      </section>
      </div>
    </Layout>
  );
}
