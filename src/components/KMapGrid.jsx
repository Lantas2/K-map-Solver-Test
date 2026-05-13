const cells = [0, 1, 3, 2, 4, 5, 7, 6];

export default function KMapGrid({ active, setActive }) {
  function toggleCell(value) {
    if (active.includes(value)) {
      setActive(active.filter((v) => v !== value));
    } else {
      setActive([...active, value]);
    }
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 80px)",
        gap: "10px",
        marginBottom: "20px",
      }}
    >
      {cells.map((cell) => {
        const isActive = active.includes(cell);

        return (
          <button
            key={cell}
            onClick={() => toggleCell(cell)}
            style={{
              height: "80px",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              background: isActive ? "#6366f1" : "#1e293b",
              color: "white",
              fontSize: "20px",
            }}
          >
            m{cell}
          </button>
        );
      })}
    </div>
  );
}