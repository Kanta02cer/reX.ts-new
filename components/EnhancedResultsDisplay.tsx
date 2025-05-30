"use client";
import { useState, useMemo } from 'react';

interface Result {
  id: string;
  name: string;
  status: string;
  reasoning: string;
  scoutMessage: string;
}

interface EnhancedResultsDisplayProps {
  results: string[][] | null;
  isLoading?: boolean;
  error?: string | null;
}

export default function EnhancedResultsDisplay({ results, isLoading = false, error }: EnhancedResultsDisplayProps) {
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<'all' | '合格' | '要検討' | '不合格'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'status' | 'score'>('status');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  // ローディング状態
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <div className="mt-4 text-lg font-medium text-gray-900">分析を実行中...</div>
              <p className="mt-2 text-sm text-gray-500">候補者データを分析しています。しばらくお待ちください。</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // エラー状態
  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="mt-4 text-lg font-medium text-gray-900">分析エラー</div>
            <p className="mt-2 text-sm text-gray-500">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-lg">分析結果がありません</div>
        <p className="text-gray-500 mt-2">CSVファイルをアップロードして分析を実行してください</p>
      </div>
    );
  }

  // データ変換とメモ化
  const processedResults: Result[] = useMemo(() => 
    results.map(([id, name, status, reasoning, scoutMessage]) => ({
      id,
      name,
      status,
      reasoning,
      scoutMessage
    })), [results]
  );

  // フィルタリングとソート（メモ化）
  const filteredAndSortedResults = useMemo(() => {
    let filtered = processedResults.filter(result => {
      const matchesFilter = filter === 'all' || result.status === filter;
      const matchesSearch = searchQuery === '' || 
        result.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.reasoning.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });

    // ソート
    filtered.sort((a, b) => {
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

    return filtered;
  }, [processedResults, filter, sortBy, searchQuery]);

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
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case '要検討':
        return (
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case '不合格':
        return (
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const extractScore = (reasoning: string): number | null => {
    const match = reasoning.match(/(\d+)点/);
    return match ? parseInt(match[1]) : null;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // TODO: トースト通知を追加
    } catch (err) {
      console.error('コピーに失敗:', err);
    }
  };

  const downloadResults = () => {
    const csvContent = [
      ['ID', '氏名', '判定', '評価点', '評価理由'],
      ...filteredAndSortedResults.map(result => [
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

  const summaryStats = useMemo(() => ({
    total: processedResults.length,
    passed: processedResults.filter(r => r.status === '合格').length,
    consideration: processedResults.filter(r => r.status === '要検討').length,
    rejected: processedResults.filter(r => r.status === '不合格').length,
    averageScore: processedResults.reduce((acc, result) => {
      const score = extractScore(result.reasoning);
      return acc + (score || 0);
    }, 0) / processedResults.length
  }), [processedResults]);

  const toggleExpandAll = () => {
    if (expandedCards.size === filteredAndSortedResults.length) {
      setExpandedCards(new Set());
    } else {
      setExpandedCards(new Set(filteredAndSortedResults.map(r => r.id)));
    }
  };

  const resetFilters = () => {
    setFilter('all');
    setSortBy('status');
    setSearchQuery('');
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* サマリー統計 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 sm:p-6 border border-blue-200">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">分析サマリー</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <div className="bg-white rounded-lg p-3 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-gray-900">{summaryStats.total}</div>
            <div className="text-xs sm:text-sm text-gray-600">総候補者数</div>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-green-600">{summaryStats.passed}</div>
            <div className="text-xs sm:text-sm text-gray-600">合格</div>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-yellow-600">{summaryStats.consideration}</div>
            <div className="text-xs sm:text-sm text-gray-600">要検討</div>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-red-600">{summaryStats.rejected}</div>
            <div className="text-xs sm:text-sm text-gray-600">不合格</div>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4 text-center col-span-2 sm:col-span-1">
            <div className="text-xl sm:text-2xl font-bold text-blue-600">{Math.round(summaryStats.averageScore)}</div>
            <div className="text-xs sm:text-sm text-gray-600">平均スコア</div>
          </div>
        </div>
      </div>

      {/* コントロールパネル */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="space-y-4">
          {/* モバイル向けトグルボタン */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-medium text-gray-900">フィルターとソート</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsSearchVisible(!isSearchVisible)}
                className="sm:hidden inline-flex items-center px-2 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <button
                onClick={resetFilters}
                className="inline-flex items-center px-2 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                リセット
              </button>
            </div>
          </div>

          {/* 検索バー */}
          <div className={`${isSearchVisible || 'hidden sm:block'}`}>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="名前や評価理由で検索..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* フィルターとソート */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">フィルター</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="all">すべて ({summaryStats.total})</option>
                <option value="合格">合格 ({summaryStats.passed})</option>
                <option value="要検討">要検討 ({summaryStats.consideration})</option>
                <option value="不合格">不合格 ({summaryStats.rejected})</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">ソート</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="status">判定順</option>
                <option value="score">スコア順</option>
                <option value="name">名前順</option>
              </select>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-gray-200">
            <button
              onClick={downloadResults}
              className="inline-flex items-center justify-center px-3 py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              CSV出力
            </button>
            <button
              onClick={toggleExpandAll}
              className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-xs sm:text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {expandedCards.size === filteredAndSortedResults.length ? '全て閉じる' : '全て開く'}
            </button>
          </div>
        </div>
      </div>

      {/* 結果表示 */}
      <div className="space-y-3 sm:space-y-4">
        {filteredAndSortedResults.length > 0 && (
          <div className="text-sm text-gray-500 px-1">
            {filteredAndSortedResults.length}件の結果を表示中
            {searchQuery && ` (「${searchQuery}」で検索)`}
          </div>
        )}

        {filteredAndSortedResults.map((result) => {
          const isExpanded = expandedCards.has(result.id);
          const score = extractScore(result.reasoning);
          
          return (
            <div
              key={result.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-4 sm:p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
                    <div className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium border ${getStatusColor(result.status)} flex-shrink-0`}>
                      {getStatusIcon(result.status)}
                      <span className="ml-1 sm:ml-2">{result.status}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{result.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-500">ID: {result.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
                    {score && (
                      <div className="text-right hidden sm:block">
                        <div className="text-xl sm:text-2xl font-bold text-gray-900">{score}</div>
                        <div className="text-xs sm:text-sm text-gray-500">点</div>
                      </div>
                    )}
                    <button
                      onClick={() => toggleExpanded(result.id)}
                      className="p-1 sm:p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
                    >
                      <svg
                        className={`w-4 h-4 sm:w-5 sm:h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* モバイル用スコア表示 */}
                {score && (
                  <div className="sm:hidden mt-2 text-right">
                    <span className="text-lg font-bold text-gray-900">{score}点</span>
                  </div>
                )}

                <div className="mt-3 sm:mt-4">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {result.reasoning.length > 150 && !isExpanded
                      ? `${result.reasoning.substring(0, 150)}...`
                      : result.reasoning
                    }
                  </p>
                </div>

                {isExpanded && (
                  <div className="mt-4 sm:mt-6 space-y-4 border-t border-gray-200 pt-4">
                    {result.scoutMessage && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">スカウトメッセージ</h4>
                        <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                          <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                            {result.scoutMessage}
                          </pre>
                          <button
                            onClick={() => copyToClipboard(result.scoutMessage)}
                            className="mt-2 inline-flex items-center px-2 sm:px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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

      {filteredAndSortedResults.length === 0 && (
        <div className="text-center py-8 sm:py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <div className="mt-4 text-lg text-gray-400">該当する結果がありません</div>
          <p className="text-gray-500 mt-2">フィルター条件を変更するか、検索キーワードを変更してください</p>
          <button
            onClick={resetFilters}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100"
          >
            フィルターをリセット
          </button>
        </div>
      )}
    </div>
  );
} 