import { useState } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';

export default function AnalyzeScoutForm() {
  const [resumeData, setResumeData] = useState('');
  const [jobRequirements, setJobRequirements] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/analyze-and-scout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeData,
          jobRequirements,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '分析処理中にエラーが発生しました');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error('API呼び出しエラー:', err);
      setError(err.message || '処理中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">候補者分析・スカウト文章生成</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-2 font-medium">
            候補者情報：
            <span className="text-gray-500 text-sm ml-2">（経歴書、職務経歴書など）</span>
          </label>
          <textarea
            value={resumeData}
            onChange={(e) => setResumeData(e.target.value)}
            className="w-full h-64 p-3 border rounded-md"
            placeholder="氏名：山田太郎&#10;年齢：35歳&#10;職種：フルスタックエンジニア&#10;経験年数：10年&#10;スキル：JavaScript, React, Node.js, Python, AWS&#10;職務経歴：&#10;- 株式会社テックソリューション（2015-現在）：フロントエンド開発リーダー&#10;- 株式会社ウェブシステム（2011-2015）：Webアプリケーション開発"
            required
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">
            採用条件：
            <span className="text-gray-500 text-sm ml-2">（求める経験、スキル、資格など）</span>
          </label>
          <textarea
            value={jobRequirements}
            onChange={(e) => setJobRequirements(e.target.value)}
            className="w-full h-64 p-3 border rounded-md"
            placeholder="【募集職種】シニアフロントエンドエンジニア&#10;【必須スキル】&#10;- JavaScript/TypeScriptでの開発経験5年以上&#10;- Reactを用いた開発経験3年以上&#10;- チームリーダーまたはテックリードの経験&#10;【歓迎スキル】&#10;- AWSの実務経験&#10;- CI/CD構築経験&#10;- バックエンド開発の経験"
            required
          />
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? '分析中...' : '分析・スカウト文章生成'}
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-6 p-4 bg-red-100 border border-red-400 rounded-md text-red-700">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-6 space-y-6">
          <div className="p-4 bg-gray-100 rounded-md">
            <h2 className="text-xl font-bold mb-2">分析結果</h2>
            <div className="mb-4">
              <span className="font-medium">採用判断：</span>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm ${
                  result.decision === '採用'
                    ? 'bg-green-100 text-green-800'
                    : result.decision === '検討'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {result.decision}
              </span>
            </div>
            <p><span className="font-medium">理由：</span> {result.justification}</p>
            
            {result.analysis && (
              <div className="mt-4">
                <h3 className="text-lg font-medium mb-2">詳細分析</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.analysis.skillAnalysis && (
                    <div>
                      <h4 className="font-medium">スキル分析</h4>
                      <ul className="list-disc list-inside">
                        {result.analysis.skillAnalysis.technicalSkills?.map((skill, i) => (
                          <li key={`tech-${i}`} className="text-sm">{skill}</li>
                        ))}
                      </ul>
                      {result.analysis.skillAnalysis.missingSkills?.length > 0 && (
                        <>
                          <h5 className="font-medium mt-2">不足スキル</h5>
                          <ul className="list-disc list-inside">
                            {result.analysis.skillAnalysis.missingSkills.map((skill, i) => (
                              <li key={`missing-${i}`} className="text-sm text-red-600">{skill}</li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  )}
                  
                  {result.analysis.evaluationResult && (
                    <div>
                      <h4 className="font-medium">評価結果</h4>
                      <p className="text-sm">
                        総合スコア: <span className="font-bold">{result.analysis.evaluationResult.overallScore}/100</span>
                      </p>
                      <h5 className="font-medium mt-2">強み</h5>
                      <ul className="list-disc list-inside">
                        {result.analysis.evaluationResult.strengths?.map((strength, i) => (
                          <li key={`strength-${i}`} className="text-sm text-green-600">{strength}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {result.scoutMessage && (
            <div className="p-4 bg-blue-50 rounded-md">
              <h2 className="text-xl font-bold mb-2">スカウト文章</h2>
              <div className="bg-white p-4 rounded-md border whitespace-pre-line">
                {result.scoutMessage}
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(result.scoutMessage);
                    alert('スカウト文章をクリップボードにコピーしました');
                  }}
                  className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  文章をコピー
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 