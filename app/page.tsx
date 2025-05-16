"use client";
import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [requirements, setRequirements] = useState("");
  const [result, setResult] = useState<string[][] | null>(null);
  const [company, setCompany] = useState("");
  const [sender, setSender] = useState("");
  const [position, setPosition] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitForm() {
    if (!file) return alert("CSVを選択してください");
    
    setIsLoading(true);
    setError(null);
    
    try {
      const form = new FormData();
      form.append("csv", file);
      form.append("requirements", requirements);
      form.append("company", company);
      form.append("sender", sender);
      form.append("position", position);

      const res = await fetch("/api/process", {
        method: "POST",
        body: form,
      });
      
      const json = await res.json();
      setResult(json.result);
    } catch (err) {
      setError("エラーが発生しました。再度お試しください。");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-xl mb-2">CSVアップロード＆マッチング実行</h1>
      
      <div className="mb-2">
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="mb-2"
        />
      </div>
      
      <div className="mb-2">
        <textarea
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
          placeholder="企業要件を入力"
          className="border p-2 w-full h-24 mb-2"
        />
      </div>
      
      <div className="grid grid-cols-3 gap-2 mb-2">
        <input
          type="text"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="会社名"
          className="border p-2"
        />
        <input
          type="text"
          value={sender}
          onChange={(e) => setSender(e.target.value)}
          placeholder="送信者名"
          className="border p-2"
        />
        <input
          type="text"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          placeholder="役職"
          className="border p-2"
        />
      </div>
      
      <button
        onClick={submitForm}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-500 text-white disabled:bg-blue-300"
      >
        {isLoading ? "処理中..." : "送信"}
      </button>

      {error && (
        <div className="mt-4 p-2 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-4">
          <h2 className="font-bold mb-2">結果：</h2>
          <table className="table-auto border-collapse w-full">
            <thead>
              <tr>
                <th className="border px-2 py-1">Name</th>
                <th className="border px-2 py-1">Score</th>
                <th className="border px-2 py-1">Status</th>
                <th className="border px-2 py-1">Scout Text</th>
              </tr>
            </thead>
            <tbody>
              {result.map((columns, i) => {
                // columns: ["name", "score", "status", "scout_text"]
                const [name, score, status, scout] = columns;
                return (
                  <tr key={i}>
                    <td className="border px-2 py-1">{name}</td>
                    <td className="border px-2 py-1">{score}</td>
                    <td className={`border px-2 py-1 ${status === '合格' ? 'bg-green-100' : 'bg-red-100'}`}>
                      {status}
                    </td>
                    <td className="border px-2 py-1 whitespace-pre-wrap">
                      {scout}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
