"use client";
import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState(null);
  const [requirements, setRequirements] = useState("");
  const [result, setResult] = useState(null);

  async function submitForm() {
　　console.log("▶ submitForm called");
    if (!file) return alert("CSVを選択してください");
    const form = new FormData();
    form.append("csv", file);
    form.append("requirements", requirements);
    form.append("company", "YourCompany");
    form.append("sender", "YourName");
    form.append("position", "Engineer");

    const res = await fetch("/api/process", {
      method: "POST",
      body: form,
    });
    const json = await res.json();
    setResult(json.result);
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>CSVアップロード＆マッチング実行</h1>
      <input
        type="file"
        accept=".csv"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <br />
      <textarea
        value={requirements}
        onChange={(e) => setRequirements(e.target.value)}
        placeholder="企業要件を入力"
        rows={6}
        cols={60}
      />
      <br />
      <button onClick={submitForm}>送信</button>

      {result && (
        <div style={{ marginTop: 20 }}>
          <h2>結果：</h2>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

