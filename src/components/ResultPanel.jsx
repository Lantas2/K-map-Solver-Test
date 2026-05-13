export default function ResultPanel({ active }) {
  return (
    <div
      style={{
        background: "#1e293b",
        padding: "15px",
        borderRadius: "10px",
        marginBottom: "20px",
      }}
    >
      <h2>Minterm</h2>

      <p>Σm({active.sort((a, b) => a - b).join(",")})</p>
    </div>
  );
}