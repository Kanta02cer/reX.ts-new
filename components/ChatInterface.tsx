// components/ChatInterface.tsx
"use client";
import { useState, useRef, useEffect } from "react";

// メッセージの型定義
type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatInterface() {
  // 状態の管理
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 新しいメッセージが追加されたら自動スクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 初回マウント時に挨拶メッセージを表示
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        { 
          role: "assistant", 
          content: "こんにちは！Gemini AIにどんなことでも質問してください。何かお手伝いできることはありますか？" 
        }
      ]);
    }
  }, []);

  // フォーム送信処理
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // エラーをリセット
    setError(null);
    
    // ユーザーメッセージを追加
    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // APIにメッセージを送信
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // AIの応答をチャットに追加
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.response },
        ]);
      } else {
        console.error("APIエラー:", data.error);
        setError(data.error || "エラーが発生しました");
        
        // エラーメッセージを表示
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `エラー: ${data.error || "応答の取得に失敗しました。もう一度お試しください。"}`,
          },
        ]);
      }
    } catch (error) {
      console.error("メッセージ送信失敗:", error);
      setError("ネットワークエラーが発生しました");
      
      // エラーメッセージを表示
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "ネットワークエラー: メッセージを送信できませんでした。インターネット接続を確認し、もう一度お試しください。",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-screen max-h-screen">
      {/* ヘッダー */}
      <div className="bg-gray-800 text-white p-4 shadow-md">
        <h1 className="text-xl font-bold">Gemini チャット</h1>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p>{error}</p>
        </div>
      )}

      {/* チャットエリア */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, i) => (
          <div
            key={i}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              <pre className="whitespace-pre-wrap font-sans">
                {message.content}
              </pre>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 入力フォーム */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-gray-300 p-4 flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="メッセージを入力..."
          className="flex-1 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isLoading ? "送信中..." : "送信"}
        </button>
      </form>
    </div>
  );
}
