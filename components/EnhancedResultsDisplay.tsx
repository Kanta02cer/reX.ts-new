"use client";
import { useState } from 'react';

interface Result {
  id: string;
  name: string;
  status: string;
  reasoning: string;
  scoutMessage: string;
}

interface EnhancedResultsDisplayProps {
  results: string[][] | null;
}

export default function EnhancedResultsDisplay({ results }: EnhancedResultsDisplayProps) {
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<'all' | '合格' | '要検討' | '不合格'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'status' | 'score'>('status');

  if (!results || results.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-lg">分析結果がありません</div>
        <p className="text-gray-500 mt-2">CSVファイルをアップロードして分析を実行してください</p>
      </div>
    );
  }

  // データ変換
  const processedResults: Result[] = results.map(([id, name, status, reasoning, scoutMessage]) => ({
    id,
    name,
    status,
    reasoning,
    scoutMessage
  }));

  // フィルタリング
  const filteredResults = processedResults.filter(result => 
    filter === 'all' || result.status === filter
  );

  // ソート
  const sortedResults = [...filteredResults].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'status':
        const statusOrder = { '合格': 0, '要検討': 1, '不合格': 2, 'エラー': 3 };
        return (statusOrder[a.status as keyof typeof statusOrder] ?? 99) - 
               (statusOrder[b.status as keyof typeof statusOrder] ?? 99);
      case 'score':
        const getScore = (reasoning: string) => {
          const match = reasoning.match(/(\d+)点/);
          return match ? parseInt(match[1]) : 0;
        };
        return getScore(b.reasoning) - getScore(a.reasoning);
      default:
        return 0;
    }
  });

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCards(newExpanded);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '合格':
        return 'bg-green-100 text-green-800 border-green-200';
      case '要検討':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case '不合格':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case '合格':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case '要検討':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case '不合格':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const extractScore = (reasoning: string): number | null => {
    const match = reasoning.match(/(\d+)点/);
    return match ? parseInt(match[1]) : null;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadResults = () => {
    const csvContent = [
      ['ID', '氏名', '判定', '評価点', '評価理由'],
      ...sortedResults.map(result => [
        result.id,
        result.name,
        result.status,
        extractScore(result.reasoning)?.toString() || '',
        result.reasoning.replace(/,/g, '，')
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `分析結果_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const summaryStats = {
    total: processedResults.length,
    passed: processedResults.filter(r => r.status === '合格').length,
    consideration: processedResults.filter(r => r.status === '要検討').length,
    rejected: processedResults.filter(r => r.status === '不合格').length,
    averageScore: processedResults.reduce((acc, result) => {
      const score = extractScore(result.reasoning);
      return acc + (score || 0);
    }, 0) / processedResults.length
  };

  return (
    <div className="space-y-6">
      {/* サマリー統計 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">分析サマリー</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{summaryStats.total}</div>
            <div className="text-sm text-gray-600">総候補者数</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{summaryStats.passed}</div>
            <div className="text-sm text-gray-600">合格</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{summaryStats.consideration}</div>
            <div className="text-sm text-gray-600">要検討</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{summaryStats.rejected}</div>
            <div className="text-sm text-gray-600">不合格</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{Math.round(summaryStats.averageScore)}</div>
            <div className="text-sm text-gray-600">平均スコア</div>
          </div>
        </div>
      </div>

      {/* コントロールパネル */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">フィルター</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="all">すべて ({processedResults.length})</option>
                <option value="合格">合格 ({summaryStats.passed})</option>
                <option value="要検討">要検討 ({summaryStats.consideration})</option>
                <option value="不合格">不合格 ({summaryStats.rejected})</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ソート</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="status">判定順</option>
                <option value="score">スコア順</option>
                <option value="name">名前順</option>
              </select>
            </div>
          </div>
          <button
            onClick={downloadResults}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="mr-2 -ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            CSV出力
          </button>
        </div>
      </div>

      {/* 結果表示 */}
      <div className="space-y-4">
        {sortedResults.map((result) => {
          const isExpanded = expandedCards.has(result.id);
          const score = extractScore(result.reasoning);
          
          return (
            <div
              key={result.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(result.status)}`}>
                      {getStatusIcon(result.status)}
                      <span className="ml-2">{result.status}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{result.name}</h3>
                      <p className="text-sm text-gray-500">ID: {result.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    {score && (
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">{score}</div>
                        <div className="text-sm text-gray-500">点</div>
                      </div>
                    )}
                    <button
                      onClick={() => toggleExpanded(result.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
                    >
                      <svg
                        className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {result.reasoning.length > 200 && !isExpanded
                      ? `${result.reasoning.substring(0, 200)}...`
                      : result.reasoning
                    }
                  </p>
                </div>

                {isExpanded && (
                  <div className="mt-6 space-y-4 border-t border-gray-200 pt-4">
                    {result.scoutMessage && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">スカウトメッセージ</h4>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                            {result.scoutMessage}
                          </pre>
                          <button
                            onClick={() => copyToClipboard(result.scoutMessage)}
                            className="mt-2 inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <svg className="mr-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                            </svg>
                            コピー
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredResults.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg">該当する結果がありません</div>
          <p className="text-gray-500 mt-2">フィルター条件を変更してください</p>
        </div>
      )}
    </div>
  );
} 