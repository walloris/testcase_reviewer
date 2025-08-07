const { useState } = React;

function App() {
  const [token, setToken] = useState("");
  const [results, setResults] = useState([]);
  const [processing, setProcessing] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const text = await file.text();
    const testCases = parseXml(text);
    setProcessing(true);
    const collected = [];
    for (const tc of testCases) {
      const response = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, test_case: tc }),
      });
      const data = await response.json();
      collected.push({ ...tc, review: data });
      setResults([...collected]);
    }
    setProcessing(false);
  };

  const parseXml = (xml) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, "application/xml");
    const nodes = Array.from(doc.getElementsByTagName("testcase"));
    return nodes.map((tc) => ({
      key: tc.getAttribute("key") || "",
      summary: tc.getElementsByTagName("summary")[0]?.textContent || "",
      objective: tc.getElementsByTagName("objective")[0]?.textContent || "",
      precondition: tc.getElementsByTagName("precondition")[0]?.textContent || "",
      steps: tc.getElementsByTagName("steps")[0]?.textContent || "",
      expected_result: tc.getElementsByTagName("expected_result")[0]?.textContent || "",
      priority: tc.getElementsByTagName("priority")[0]?.textContent || "",
      status: tc.getElementsByTagName("status")[0]?.textContent || "",
      labels: tc.getElementsByTagName("labels")[0]?.textContent || "",
    }));
  };

  const downloadResults = () => {
    const blob = new Blob([JSON.stringify(results, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "review.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h1>Test Case Reviewer</h1>
      <input
        type="text"
        placeholder="GigaChat token"
        value={token}
        onChange={(e) => setToken(e.target.value)}
      />
      <input type="file" accept=".xml" onChange={handleFile} />
      {processing && <p>Processing...</p>}
      <ul>
        {results.map((r, idx) => (
          <li key={idx}>
            <strong>{r.summary || r.key}</strong>
            <pre>{JSON.stringify(r.review, null, 2)}</pre>
          </li>
        ))}
      </ul>
      {results.length > 0 && !processing && (
        <button onClick={downloadResults}>Download Results</button>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
