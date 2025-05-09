"use client";
import { useState } from "react";

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const [requirements, setRequirements] = useState("");
  const [result, setResult] = useState<string[] | null>(null);

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
    <div className="p-4">
      <h1 className="text-xl mb-2">CSVアップロード＆マッチング実行</h1>
      <input
        type="file"
        accept=".csv"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="mb-2"
      />
      <textarea
        value={requirements}
        onChange={(e) => setRequirements(e.target.value)}
        placeholder="企業要件を入力"
        className="border p-2 w-full h-24 mb-2"
      />
      <button
        onClick={submitForm}
        className="px-4 py-2 bg-blue-500 text-white"
      >
        送信
      </button>

      {result && (
        <div className="mt-4">
          <h2 className="font-bold">結果：</h2>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

"use client";
import { useState } from "react";

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const [requirements, setRequirements] = useState("");
  const [result, setResult] = useState<string[][] | null>(null);

  async function submitForm() {
    if (!file) return alert("CSVを選択してください");
    const form = new FormData();
    form.append("csv", file);
    form.append("requirements", requirements);
    // ...company, sender, position も同様に

    const res = await fetch("/api/process", { method: "POST", body: form });
    const json = await res.json();
    setResult(json.result);
  }

  return (
    <div className="p-4">
      {/* ファイル選択＆要件入力フォーム省略 */}
      <button onClick={submitForm}>送信</button>

      {/* ここから表示部分 */}
      {result && (
        <table className="mt-4 table-auto border-collapse">
          <thead>
            <tr>
              <th className="border px-2">Name</th>
              <th className="border px-2">Score</th>
              <th className="border px-2">Status</th>
              <th className="border px-2">Scout Text</th>
            </tr>
          </thead>
          <tbody>
            {result.map((columns, i) => {
              // columns: ["name", "score", "status", "scout_text"]
              const [name, score, status, scout] = columns;
              return (
                <tr key={i}>
                  <td className="border px-2">{name}</td>
                  <td className="border px-2">{score}</td>
                  <td className={`border px-2 ${status==='合格'?'bg-green-100':'bg-red-100'}`}>
                    {status}
                  </td>
                  <td className="border px-2 whitespace-pre-wrap">
                    {scout}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

import { useState } from "react";

export default function HomePage() {
  // 既存の file, requirements, result に加えて
  const [company, setCompany]   = useState("");
  const [sender, setSender]     = useState("");
  const [position, setPosition] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]       = useState<string | null>(null);
  // …

