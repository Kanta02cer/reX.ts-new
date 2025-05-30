"use client";
import { useState, useEffect, useMemo } from 'react';
import { database, sessionManager, AnalysisHistory, User } from '../lib/database';

interface DashboardProps {
  onNavigate: (section: string) => void;
}

interface DashboardStats {
  totalAnalyses: number;
  totalCandidates: number;
  averagePassRate: number;
  averageScore: number;
  monthlyUsage: { month: string; count: number }[];
  topJobTitles: { title: string; count: number }[];
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentHistory, setRecentHistory] = useState<AnalysisHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'settings'>('overview');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const session = sessionManager.getSession();
      if (!session) {
        onNavigate('login');
        return;
      }

      const userData = await database.getUserByEmail(session.email);
      if (!userData) {
        sessionManager.clearSession();
        onNavigate('login');
        return;
      }

      setUser(userData);
      
      const [userStats, history] = await Promise.all([
        database.getUserStats(userData.id),
        database.getAnalysisHistory(userData.id, 10)
      ]);
      
      setStats(userStats);
      setRecentHistory(history);
    } catch (error) {
      console.error('ダッシュボードデータの読み込みエラー:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    sessionManager.clearSession();
    onNavigate('login');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">完了</span>;
      case 'processing':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">処理中</span>;
      case 'error':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">エラー</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">不明</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <div className="mt-4 text-lg font-medium text-gray-900">データを読み込み中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">reX.ts Dashboard</h1>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {user?.subscription}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500 hidden sm:block">{user?.companyName}</span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* タブナビゲーション */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {[
              { id: 'overview', name: '概要', icon: '📊' },
              { id: 'history', name: '履歴', icon: '📋' },
              { id: 'settings', name: '設定', icon: '⚙️' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* 概要タブ */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            {/* 統計カード */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                        <span className="text-white text-sm">📊</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">総分析数</dt>
                        <dd className="text-2xl font-bold text-gray-900">{stats.totalAnalyses}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                        <span className="text-white text-sm">👥</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">総候補者数</dt>
                        <dd className="text-2xl font-bold text-gray-900">{stats.totalCandidates}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                        <span className="text-white text-sm">📈</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">平均合格率</dt>
                        <dd className="text-2xl font-bold text-gray-900">{stats.averagePassRate.toFixed(1)}%</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                        <span className="text-white text-sm">⭐</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">平均スコア</dt>
                        <dd className="text-2xl font-bold text-gray-900">{stats.averageScore.toFixed(0)}点</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 最近の分析 */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">最近の分析</h3>
                  <button
                    onClick={() => onNavigate('analysis')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  >
                    新しい分析を開始
                  </button>
                </div>
                
                {recentHistory.length > 0 ? (
                  <div className="space-y-3">
                    {recentHistory.slice(0, 5).map((history) => (
                      <div key={history.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">{history.jobTitle}</h4>
                          <p className="text-xs text-gray-500">{formatDate(history.createdAt)}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-sm text-gray-500">{history.candidateCount}名</span>
                          {getStatusBadge(history.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">分析履歴がありません</h3>
                    <p className="mt-1 text-sm text-gray-500">初回の分析を開始してデータを蓄積しましょう</p>
                  </div>
                )}
              </div>
            </div>

            {/* 人気求人タイトル */}
            {stats.topJobTitles.length > 0 && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">人気求人タイトル</h3>
                  <div className="space-y-2">
                    {stats.topJobTitles.slice(0, 5).map((item, index) => (
                      <div key={item.title} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                          <span className="text-sm text-gray-900">{item.title}</span>
                        </div>
                        <span className="text-sm text-gray-500">{item.count}回</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 履歴タブ */}
        {activeTab === 'history' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">分析履歴</h3>
              {recentHistory.length > 0 ? (
                <div className="overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">求人タイトル</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">候補者数</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">合格者数</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">平均スコア</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日時</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ステータス</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {recentHistory.map((history) => (
                          <tr key={history.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {history.jobTitle}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {history.candidateCount}名
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {history.passedCount}名
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {history.averageScore.toFixed(0)}点
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(history.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusBadge(history.status)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">分析履歴がありません</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 設定タブ */}
        {activeTab === 'settings' && user && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">アカウント情報</h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">企業名</label>
                    <div className="mt-1 text-sm text-gray-900">{user.companyName}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">業界</label>
                    <div className="mt-1 text-sm text-gray-900">{user.industry}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">メールアドレス</label>
                    <div className="mt-1 text-sm text-gray-900">{user.email}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">プラン</label>
                    <div className="mt-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {user.subscription}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">評価基準設定</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">スキル重要度</label>
                    <div className="mt-1 text-sm text-gray-900">{user.settings.defaultEvaluationCriteria.skillsWeight}%</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">経験重要度</label>
                    <div className="mt-1 text-sm text-gray-900">{user.settings.defaultEvaluationCriteria.experienceWeight}%</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">学歴重要度</label>
                    <div className="mt-1 text-sm text-gray-900">{user.settings.defaultEvaluationCriteria.educationWeight}%</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">年収適合度</label>
                    <div className="mt-1 text-sm text-gray-900">{user.settings.defaultEvaluationCriteria.salaryWeight}%</div>
                  </div>
                </div>
                <div className="mt-6">
                  <button
                    onClick={() => onNavigate('settings')}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    設定を編集
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 