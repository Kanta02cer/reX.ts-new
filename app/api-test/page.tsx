"use client";
import { useState } from "react";
import { HiOutlineRefresh, HiOutlineDocumentText } from "react-icons/hi";
import { sampleData } from "./data-samples";

export default function ApiTestPage() {
  const [endpoint, setEndpoint] = useState<string>("/api/health");
  const [method, setMethod] = useState<string>("GET");
  const [requestBody, setRequestBody] = useState<string>("");
  const [response, setResponse] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function testApi() {
    setIsLoading(true);
    setError(null);
    
    try {
      let requestOptions: RequestInit = {
        method,
        headers: {
          "Content-Type": "application/json",
        },
      };
      
      // POSTリクエストの場合はボディを追加
      if (method === "POST" && requestBody) {
        try {
          // JSONとして解析してバリデーション
          const parsedBody = JSON.parse(requestBody);
          requestOptions.body = JSON.stringify(parsedBody);
        } catch (err) {
          setError("リクエストボディが有効なJSONではありません");
          setIsLoading(false);
          return;
        }
      }
      
      const res = await fetch(endpoint, requestOptions);
      const data = await res.json();
      
      setResponse(JSON.stringify(data, null, 2));
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "APIリクエスト中にエラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  }

  function resetForm() {
    setRequestBody("");
    setResponse("");
    setError(null);
  }

  function loadSampleData() {
    switch (endpoint) {
      case "/api/analyze-career":
        setRequestBody(JSON.stringify(sampleData.analyzeCareer, null, 2));
        break;
      case "/api/generate-scout-message":
        setRequestBody(JSON.stringify(sampleData.generateScoutMessage, null, 2));
        break;
      case "/api/analyze-and-scout":
        setRequestBody(JSON.stringify(sampleData.analyzeAndScout, null, 2));
        break;
      default:
        setRequestBody("");
        break;
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <header className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">API テスト</h1>
        <p className="text-gray-600">各APIエンドポイントをテストして応答を確認します</p>
      </header>
      
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">API設定</h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="endpoint" className="block text-sm font-medium text-gray-700 mb-1">
                    エンドポイント
                  </label>
                  <select
                    id="endpoint"
                    value={endpoint}
                    onChange={(e) => {
                      setEndpoint(e.target.value);
                      if (e.target.value === "/api/health") {
                        setMethod("GET");
                      } else {
                        setMethod("POST");
                      }
                    }}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="/api/health">ヘルスチェック</option>
                    <option value="/api/analyze-career">キャリア分析</option>
                    <option value="/api/generate-scout-message">スカウトメッセージ生成</option>
                    <option value="/api/analyze-and-scout">分析とスカウト</option>
                    <option value="/api/process">CSVプロセス</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="method" className="block text-sm font-medium text-gray-700 mb-1">
                    HTTPメソッド
                  </label>
                  <select
                    id="method"
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                  </select>
                </div>
                
                {method === "POST" && (
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label htmlFor="requestBody" className="block text-sm font-medium text-gray-700">
                        リクエストボディ (JSON)
                      </label>
                      {endpoint !== "/api/health" && endpoint !== "/api/process" && (
                        <button
                          onClick={loadSampleData}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          サンプルデータを読み込む
                        </button>
                      )}
                    </div>
                    <textarea
                      id="requestBody"
                      value={requestBody}
                      onChange={(e) => setRequestBody(e.target.value)}
                      placeholder="{ ... }"
                      className="w-full h-40 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    />
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-between pt-4 border-t border-gray-200">
              <button
                onClick={resetForm}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <HiOutlineRefresh className="mr-2 -ml-1 h-5 w-5 text-gray-400" />
                リセット
              </button>
              
              <button
                onClick={testApi}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    送信中...
                  </>
                ) : 'APIリクエスト送信'}
              </button>
            </div>
          </div>
          
          {response && (
            <div className="mt-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">レスポンス</h2>
              <div className="bg-gray-50 p-4 rounded-md">
                <pre className="text-sm text-gray-800 font-mono whitespace-pre-wrap overflow-auto max-h-96">
                  {response}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 