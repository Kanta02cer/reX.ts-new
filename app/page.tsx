"use client";
import { useState, useCallback, useEffect } from "react";
import { HiOutlineRefresh, HiOutlineDocumentText, HiOutlineUserGroup } from "react-icons/hi";
import CsvUploader from "@/components/CsvUploader";
import RequirementsForm from "@/components/RequirementsForm";
import ResultsDisplay from "@/components/ResultsDisplay";
import { 
  processCSVData, 
  processCSVDataWithSelection, 
  analyzeCSVColumns, 
  ProcessedCSVData,
  CSVColumnInfo,
  CSVColumnSelection
} from '../lib/csvProcessor';
import CSVDataDisplay from '../components/CSVDataDisplay';
import CSVColumnSelector from '../components/CSVColumnSelector';
import DatasetManager from '../components/DatasetManager';
import TextInputForm from '../components/TextInputForm';
import { Dataset, ApplicantInput } from '../lib/types';
import FileUpload from '../components/FileUpload';
import ApplicantForm from '../components/ApplicantForm';
import EnhancedResultsDisplay from '../components/EnhancedResultsDisplay';

type FormData = {
  company: string;
  requirements: string;
  sender: string;
  senderKana: string;
  senderEnglish?: string;
  position: string;
  groupName?: string;
};

// エラー情報の型定義
interface ErrorInfo {
  message: string;
  code?: string;
  timestamp: string;
  stack?: string;
  context?: any;
  httpStatus?: number;
  requestId?: string;
}

// エラーログ管理
class ErrorLogger {
  private static logs: ErrorInfo[] = [];
  
  static log(error: ErrorInfo) {
    this.logs.push(error);
    // ローカルストレージに保存（最大100件）
    try {
      const storedLogs = this.logs.slice(-100);
      localStorage.setItem('errorLogs', JSON.stringify(storedLogs));
    } catch (e) {
      console.warn('エラーログの保存に失敗しました:', e);
    }
  }
  
  static getLogs(): ErrorInfo[] {
    return [...this.logs];
  }
  
  static clearLogs() {
    this.logs = [];
    try {
      localStorage.removeItem('errorLogs');
    } catch (e) {
      console.warn('エラーログの削除に失敗しました:', e);
    }
  }
  
  static loadLogs() {
    try {
      const stored = localStorage.getItem('errorLogs');
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('エラーログの読み込みに失敗しました:', e);
    }
  }
}

// エラー表示コンポーネント
function ErrorDisplay({ error, onReload }: { error: ErrorInfo | null; onReload: () => void }) {
  const [showDetails, setShowDetails] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!error) return null;

  const handleCopyError = () => {
    const errorText = `
エラー情報:
メッセージ: ${error.message}
エラーコード: ${error.code || 'N/A'}
発生時刻: ${error.timestamp}
HTTPステータス: ${error.httpStatus || 'N/A'}
リクエストID: ${error.requestId || 'N/A'}
${error.stack ? `スタックトレース:\n${error.stack}` : ''}
${error.context ? `コンテキスト:\n${JSON.stringify(error.context, null, 2)}` : ''}
    `.trim();
    
    navigator.clipboard.writeText(errorText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getErrorGuidance = (error: ErrorInfo) => {
    const message = error.message.toLowerCase();
    const code = error.code?.toLowerCase() || '';
    
    // HTTPステータスコードによる分類
    if (error.httpStatus) {
      switch (error.httpStatus) {
        case 400:
          return '入力データの形式を確認してください。必須項目が不足している可能性があります。';
        case 401:
          return 'API認証に失敗しました。環境変数の設定を確認してください。';
        case 403:
          return 'アクセス権限がありません。APIキーの権限を確認してください。';
        case 404:
          return 'リクエストされたリソースが見つかりません。URLを確認してください。';
        case 429:
          return 'API利用制限に達しました。しばらく時間をおいて再度お試しください。';
        case 500:
          return 'サーバー内部エラーが発生しました。しばらく時間をおいて再度お試しください。';
        case 502:
        case 503:
        case 504:
          return 'サーバーが一時的に利用できません。しばらく時間をおいて再度お試しください。';
      }
    }
    
    // エラーメッセージによる分類
    if (message.includes('content-type') || message.includes('json')) {
      return 'サーバーからの応答形式が不正です。ブラウザを更新するか、しばらく時間をおいて再度お試しください。';
    }
    if (message.includes('csv') || message.includes('ファイル')) {
      return 'CSVファイルの形式を確認してください。ヘッダー行が含まれ、UTF-8エンコーディングで保存されている必要があります。';
    }
    if (message.includes('申請者') || message.includes('データ')) {
      return '入力データの形式を確認してください。必須項目（名前、スキルなど）が正しく入力されているか確認してください。';
    }
    if (message.includes('network') || message.includes('fetch')) {
      return 'ネットワーク接続を確認してください。インターネット接続が安定していることを確認してください。';
    }
    if (message.includes('timeout')) {
      return 'リクエストがタイムアウトしました。データ量を減らすか、しばらく時間をおいて再度お試しください。';
    }
    if (message.includes('gemini') || message.includes('api')) {
      return 'AI APIとの通信に問題があります。API設定を確認するか、しばらく時間をおいて再度お試しください。';
    }
    
    return '入力内容を確認し、再度お試しください。問題が続く場合は、ページを再読み込みしてください。';
  };

  const getSeverityColor = (error: ErrorInfo) => {
    if (error.httpStatus && error.httpStatus >= 500) return 'red';
    if (error.httpStatus && error.httpStatus >= 400) return 'orange';
    if (error.message.toLowerCase().includes('warning')) return 'yellow';
    return 'red';
  };

  const severityColor = getSeverityColor(error);
  const colorClasses = {
    red: {
      bg: 'bg-red-50',
      border: 'border-red-500',
      text: 'text-red-700',
      icon: 'text-red-400'
    },
    orange: {
      bg: 'bg-orange-50',
      border: 'border-orange-500',
      text: 'text-orange-700',
      icon: 'text-orange-400'
    },
    yellow: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-500',
      text: 'text-yellow-700',
      icon: 'text-yellow-400'
    }
  };

  const colors = colorClasses[severityColor];

  return (
    <div className="mb-6 space-y-4">
      {/* メインエラー表示 */}
      <div className={`${colors.bg} border-l-4 ${colors.border} p-4 rounded-md`}>
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className={`h-5 w-5 ${colors.icon}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className={`text-sm font-medium ${colors.text}`}>
              エラーが発生しました
              {error.code && (
                <span className="ml-2 text-xs font-mono bg-gray-200 px-2 py-1 rounded">
                  {error.code}
                </span>
              )}
            </h3>
            <p className={`mt-1 text-sm ${colors.text}`}>{error.message}</p>
            <div className="mt-2 text-xs text-gray-500">
              発生時刻: {error.timestamp}
              {error.httpStatus && ` | HTTPステータス: ${error.httpStatus}`}
              {error.requestId && ` | リクエストID: ${error.requestId}`}
            </div>
          </div>
        </div>
      </div>

      {/* 解決策の提案 */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-700">推奨される対応</h3>
            <p className="mt-1 text-sm text-blue-700">{getErrorGuidance(error)}</p>
          </div>
        </div>
      </div>

      {/* アクションボタン */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={onReload}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg className="mr-2 -ml-1 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          ページを再読み込み
        </button>

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg className="mr-2 -ml-1 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          詳細情報
        </button>

        <button
          onClick={() => setShowLogs(!showLogs)}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg className="mr-2 -ml-1 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          エラーログ ({ErrorLogger.getLogs().length})
        </button>

        <button
          onClick={handleCopyError}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {copied ? (
            <>
              <svg className="mr-2 -ml-1 h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              コピー完了
            </>
          ) : (
            <>
              <svg className="mr-2 -ml-1 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              詳細をコピー
            </>
          )}
        </button>
      </div>

      {/* 詳細情報表示 */}
      {showDetails && (
        <div className="mt-4 bg-gray-50 border border-gray-200 rounded-md">
          <div className="px-4 py-3 border-b border-gray-200">
            <h4 className="text-sm font-medium text-gray-900">詳細情報</h4>
          </div>
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">エラーコード:</span>
                <span className="ml-2 font-mono text-gray-600">{error.code || 'N/A'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">HTTPステータス:</span>
                <span className="ml-2 font-mono text-gray-600">{error.httpStatus || 'N/A'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">発生時刻:</span>
                <span className="ml-2 text-gray-600">{error.timestamp}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">リクエストID:</span>
                <span className="ml-2 font-mono text-gray-600">{error.requestId || 'N/A'}</span>
              </div>
            </div>
            
            {error.context && (
              <div>
                <span className="font-medium text-gray-700">コンテキスト:</span>
                <pre className="mt-2 text-xs text-gray-600 bg-white p-3 rounded border overflow-x-auto">
                  {JSON.stringify(error.context, null, 2)}
                </pre>
              </div>
            )}
            
            {error.stack && (
              <div>
                <span className="font-medium text-gray-700">スタックトレース:</span>
                <pre className="mt-2 text-xs text-gray-600 bg-white p-3 rounded border overflow-x-auto whitespace-pre-wrap">
                  {error.stack}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* エラーログ表示 */}
      {showLogs && (
        <div className="mt-4 bg-gray-50 border border-gray-200 rounded-md">
          <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
            <h4 className="text-sm font-medium text-gray-900">エラーログ履歴</h4>
            <button
              onClick={() => {
                ErrorLogger.clearLogs();
                setShowLogs(false);
              }}
              className="text-xs text-red-600 hover:text-red-800"
            >
              ログをクリア
            </button>
          </div>
          <div className="p-4 max-h-64 overflow-y-auto">
            {ErrorLogger.getLogs().length === 0 ? (
              <p className="text-sm text-gray-500">エラーログはありません</p>
            ) : (
              <div className="space-y-2">
                {ErrorLogger.getLogs().slice(-10).reverse().map((log, index) => (
                  <div key={index} className="text-xs bg-white p-2 rounded border">
                    <div className="flex justify-between items-start">
                      <span className="font-medium text-gray-700">{log.message}</span>
                      <span className="text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    {log.code && (
                      <div className="mt-1 text-gray-600">コード: {log.code}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<FormData>({
    company: "",
    requirements: "",
    sender: "",
    senderKana: "",
    senderEnglish: "",
    position: "",
    groupName: ""
  });
  const [result, setResult] = useState<string[][] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ErrorInfo | null>(null);
  const [activeTab, setActiveTab] = useState<'form' | 'results'>('form');
  const [csvData, setCsvData] = useState<ProcessedCSVData | null>(null);
  const [csvColumns, setCsvColumns] = useState<CSVColumnInfo[]>([]);
  const [columnSelection, setColumnSelection] = useState<CSVColumnSelection | null>(null);
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [csvText, setCsvText] = useState<string>('');
  const [selectedDatasets, setSelectedDatasets] = useState<Dataset[]>([]);
  const [applicants, setApplicants] = useState<ApplicantInput[]>([]);
  const [inputMethod, setInputMethod] = useState<'csv' | 'text'>('csv');
  const [currentStep, setCurrentStep] = useState<'input' | 'column_selection' | 'form' | 'results'>('input');
  const [csvAnalysisError, setCsvAnalysisError] = useState<string | null>(null);

  // エラーログの初期化
  useEffect(() => {
    ErrorLogger.loadLogs();
  }, []);

  // テスト用のサンプルデータを生成する関数
  const generateSampleData = () => {
    return [
      ['1', '田中太郎', 'OK', 'JavaScript、React、Node.jsの豊富な経験があり、技術要件と高い適合性を示しています。', 'この度はお忙しい中、ご挨拶の機会をいただき誠にありがとうございます。弊社の技術ポジションにつきまして、田中様の豊富なフロントエンド開発経験に深く感銘を受けており、是非一度お話をお聞かせいただければと思います。'],
      ['2', '佐藤花子', 'OK', 'データ分析とPythonスキルが優秀で、分析要件に合致しています。', 'この度は貴重なお時間をいただき、誠にありがとうございます。佐藤様のデータサイエンス分野での実績を拝見し、弊社のデータ分析ポジションに最適な方だと確信いたします。'],
      ['3', '山田次郎', 'NG', '経験年数は豊富ですが、求められる技術スタックとのミスマッチがあります。', '']
    ];
  };

  const handleCSVUpload = async (file: File) => {
    setFile(file);
    setCsvAnalysisError(null);
    
    try {
      const text = await file.text();
      const columns = analyzeCSVColumns(text);
      setCsvColumns(columns);
      setCurrentStep('column_selection');
    } catch (error) {
      console.error('CSV解析エラー:', error);
      setCsvAnalysisError(error instanceof Error ? error.message : '不明なエラー');
      setError({
        error: `CSVファイルの解析に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`,
        code: 'CSV_ANALYSIS_ERROR'
      });
    }
  };

  const handleColumnSelectionChange = useCallback(async (selection: CSVColumnSelection) => {
    setColumnSelection(selection);
    
    if (!csvText) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('カラム選択に基づいてCSV処理を開始:', selection);
      
      const processedData = processCSVDataWithSelection(csvText, selection);
      setCsvData(processedData);
      setApplicants(Object.entries(processedData).map(([id, data]) => ({
        id,
        ...data
      })));
      
      console.log('CSV処理完了:', {
        totalApplicants: Object.keys(processedData).length,
        selectedColumns: {
          name: csvColumns[selection.nameColumn]?.name,
          id: selection.idColumn !== undefined ? csvColumns[selection.idColumn]?.name : '自動生成',
          skills: selection.skillColumns.map(i => csvColumns[i]?.name),
          additional: selection.additionalColumns.map(i => csvColumns[i]?.name)
        }
      });
    } catch (err) {
      console.error("CSV処理エラー:", err);
      const errorInfo: ErrorInfo = {
        message: `選択されたカラムでの処理中にエラーが発生しました: ${err instanceof Error ? err.message : '不明なエラー'}`,
        code: 'CSV_COLUMN_PROCESSING_ERROR',
        timestamp: new Date().toISOString(),
        stack: err instanceof Error ? err.stack : undefined,
        context: { 
          columnSelection: selection,
          csvLength: csvText.length
        }
      };
      ErrorLogger.log(errorInfo);
      setError(errorInfo);
      setCsvData(null);
      setApplicants([]);
    } finally {
      setIsLoading(false);
    }
  }, [csvText, csvColumns]);

  const handleDatasetSelect = (datasets: Dataset[]) => {
    setSelectedDatasets(datasets);
    if (datasets.length > 0) {
      const lastDataset = datasets[datasets.length - 1];
      setFormData({
        company: lastDataset.company || '',
        requirements: lastDataset.requirements || '',
        sender: lastDataset.sender || '',
        senderKana: lastDataset.senderKana || '',
        senderEnglish: lastDataset.senderEnglish || '',
        position: lastDataset.position || '',
        groupName: lastDataset.groupName || ''
      });
    }
  };

  const handleApplicantsChange = (newApplicants: ApplicantInput[]) => {
    setApplicants(newApplicants);
  };

  const resetCSV = () => {
    if (!window.confirm('CSVファイルの入力をリセットしますか？')) {
      return;
    }
    setFile(null);
    setCsvData(null);
    setCsvColumns([]);
    setColumnSelection(null);
    setShowColumnSelector(false);
    setCsvText('');
    setApplicants([]);
    setError(null);
    setCsvAnalysisError(null);
  };

  const isFormValid = () => {
    return (
      selectedDatasets.length > 0 &&
      applicants.length > 0 &&
      !isLoading
    );
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const formDataToSend = new FormData();
      
      // 基本情報の追加
      formDataToSend.append('company', formData.company);
      formDataToSend.append('requirements', formData.requirements);
      formDataToSend.append('sender', formData.sender);
      formDataToSend.append('senderKana', formData.senderKana);
      formDataToSend.append('senderEnglish', formData.senderEnglish || '');
      formDataToSend.append('position', formData.position);
      formDataToSend.append('groupName', formData.groupName || '');
      formDataToSend.append('inputMethod', inputMethod);

      if (inputMethod === 'csv' && file) {
        formDataToSend.append('csv', file);
        
        // カラム選択情報を追加
        if (columnSelection) {
          formDataToSend.append('columnSelection', JSON.stringify(columnSelection));
        }
      } else if (inputMethod === 'text') {
        formDataToSend.append('applicants', JSON.stringify(applicants));
      }

      console.log('Making API request to /api/process');

      const res = await fetch("/api/process", {
        method: "POST",
        body: formDataToSend,
      });
      
      console.log('API response received:', {
        status: res.status,
        statusText: res.statusText,
        contentType: res.headers.get('content-type')
      });

      const contentType = res.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        const textResponse = await res.text();
        const errorInfo: ErrorInfo = {
          message: 'サーバーからの応答が不正な形式です。ページを再読み込みして再度お試しください。',
          code: 'INVALID_RESPONSE_TYPE',
          timestamp: new Date().toISOString(),
          httpStatus: res.status,
          requestId: res.headers.get('x-request-id') || undefined,
          context: { 
            expectedContentType: 'application/json',
            receivedContentType: contentType,
            responsePreview: textResponse.substring(0, 200)
          }
        };
        ErrorLogger.log(errorInfo);
        throw errorInfo;
      }
      
      let json;
      try {
        json = await res.json();
        console.log('JSON response parsed:', {
          hasResult: !!json.result,
          hasError: !!json.error,
          hasCode: !!json.code
        });
      } catch (parseError) {
        const errorInfo: ErrorInfo = {
          message: 'サーバーからの応答の解析に失敗しました',
          code: 'JSON_PARSE_ERROR',
          timestamp: new Date().toISOString(),
          httpStatus: res.status,
          context: { 
            parseError: parseError instanceof Error ? parseError.message : 'Unknown parse error'
          }
        };
        ErrorLogger.log(errorInfo);
        throw errorInfo;
      }
      
      if (!res.ok) {
        const errorInfo: ErrorInfo = {
          message: json.error || `サーバーエラーが発生しました (HTTP ${res.status})`,
          code: json.code || 'SERVER_ERROR',
          timestamp: json.timestamp || new Date().toISOString(),
          httpStatus: res.status,
          requestId: json.requestId || res.headers.get('x-request-id') || undefined,
          context: json.context || {
            url: res.url,
            status: res.status,
            statusText: res.statusText
          }
        };
        ErrorLogger.log(errorInfo);
        throw errorInfo;
      }
      
      if (!json.result || !Array.isArray(json.result)) {
        const errorInfo: ErrorInfo = {
          message: '分析結果の形式が不正です',
          code: 'INVALID_RESPONSE_FORMAT',
          timestamp: new Date().toISOString(),
          context: { 
            hasResult: !!json.result,
            resultType: typeof json.result,
            isArray: Array.isArray(json.result),
            responseKeys: Object.keys(json)
          }
        };
        ErrorLogger.log(errorInfo);
        throw errorInfo;
      }
      
      console.log('Analysis completed successfully:', {
        resultCount: json.result.length,
        processingTime: json.metadata?.processingTime
      });

      setResult(json.result);
      setActiveTab('results');
    } catch (err) {
      console.error('Submit form error:', err);
      
      let errorInfo: ErrorInfo;
      
      // ErrorInfoオブジェクトかどうかを判定
      if (err && typeof err === 'object' && 'message' in err && 'timestamp' in err) {
        // 既にErrorInfo形式のエラー
        errorInfo = err as ErrorInfo;
      } else if (err instanceof TypeError && err.message.includes('fetch')) {
        // ネットワークエラー
        errorInfo = {
          message: "ネットワークエラーが発生しました。インターネット接続を確認して再度お試しください。",
          code: 'NETWORK_ERROR',
          timestamp: new Date().toISOString(),
          stack: err.stack,
          context: { 
            errorName: err.name,
            originalMessage: err.message
          }
        };
      } else if (err instanceof Error) {
        // 通常のErrorオブジェクト
        errorInfo = {
          message: err.message || "予期しないエラーが発生しました",
          code: 'UNKNOWN_ERROR',
          timestamp: new Date().toISOString(),
          stack: err.stack,
          context: { 
            errorName: err.name,
            errorConstructor: err.constructor.name
          }
        };
      } else {
        // その他のエラー
        errorInfo = {
          message: "予期しないエラーが発生しました。再度お試しください。",
          code: 'UNEXPECTED_ERROR',
          timestamp: new Date().toISOString(),
          context: { 
            originalError: err,
            errorType: typeof err
          }
        };
      }
      
      ErrorLogger.log(errorInfo);
      setError(errorInfo);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setCurrentStep('input');
    setInputMethod('csv');
    setFile(null);
    setCsvData(null);
    setCsvColumns([]);
    setColumnSelection(null);
    setShowColumnSelector(false);
    setCsvText('');
    setApplicants([]);
    setError(null);
    setCsvAnalysisError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">reX.ts - AI採用スクリーニングシステム</h1>
            {currentStep !== 'input' && (
              <button
                onClick={handleReset}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="mr-2 -ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                最初からやり直す
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ステップインディケーター */}
        <div className="mb-8">
          <nav aria-label="Progress">
            <ol className="flex items-center">
              <li className={`relative ${currentStep === 'input' ? 'text-blue-600' : 'text-gray-500'}`}>
                <div className={`flex items-center ${currentStep === 'input' ? 'text-blue-600' : 'text-gray-500'}`}>
                  <span className={`h-8 w-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                    currentStep === 'input' 
                      ? 'border-blue-600 bg-blue-600 text-white' 
                      : ['column_selection', 'form', 'results'].includes(currentStep)
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-gray-300 bg-white text-gray-500'
                  }`}>
                    1
                  </span>
                  <span className="ml-3 text-sm font-medium">データ入力</span>
                </div>
              </li>

              <li className={`relative ml-8 ${['column_selection', 'form', 'results'].includes(currentStep) ? 'text-blue-600' : 'text-gray-500'}`}>
                <div className="flex items-center">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className={`h-0.5 w-full ${['column_selection', 'form', 'results'].includes(currentStep) ? 'bg-blue-600' : 'bg-gray-200'}`} />
                  </div>
                  <div className="relative">
                    <span className={`h-8 w-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                      currentStep === 'column_selection'
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : ['form', 'results'].includes(currentStep)
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-gray-300 bg-white text-gray-500'
                    }`}>
                      2
                    </span>
                  </div>
                  <span className="ml-3 text-sm font-medium">カラム選択</span>
                </div>
              </li>

              <li className={`relative ml-8 ${['form', 'results'].includes(currentStep) ? 'text-blue-600' : 'text-gray-500'}`}>
                <div className="flex items-center">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className={`h-0.5 w-full ${['form', 'results'].includes(currentStep) ? 'bg-blue-600' : 'bg-gray-200'}`} />
                  </div>
                  <div className="relative">
                    <span className={`h-8 w-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                      currentStep === 'form'
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : currentStep === 'results'
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-gray-300 bg-white text-gray-500'
                    }`}>
                      3
                    </span>
                  </div>
                  <span className="ml-3 text-sm font-medium">求人設定</span>
                </div>
              </li>

              <li className={`relative ml-8 ${currentStep === 'results' ? 'text-blue-600' : 'text-gray-500'}`}>
                <div className="flex items-center">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className={`h-0.5 w-full ${currentStep === 'results' ? 'bg-blue-600' : 'bg-gray-200'}`} />
                  </div>
                  <div className="relative">
                    <span className={`h-8 w-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                      currentStep === 'results'
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-gray-300 bg-white text-gray-500'
                    }`}>
                      4
                    </span>
                  </div>
                  <span className="ml-3 text-sm font-medium">分析結果</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">エラーが発生しました</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error.message}</p>
                  {error.code && (
                    <p className="mt-1 text-xs text-red-600">エラーコード: {error.code}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* メインコンテンツ */}
        {currentStep === 'input' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">データ入力方法を選択</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setInputMethod('csv')}
                    className={`flex-1 p-4 border rounded-lg text-left transition-colors ${
                      inputMethod === 'csv'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center">
                      <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div>
                        <h3 className="font-medium">CSVファイル</h3>
                        <p className="text-sm text-gray-500">CSVファイルから候補者データを読み込む</p>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => setInputMethod('text')}
                    className={`flex-1 p-4 border rounded-lg text-left transition-colors ${
                      inputMethod === 'text'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center">
                      <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <div>
                        <h3 className="font-medium">テキスト入力</h3>
                        <p className="text-sm text-gray-500">手動で候補者情報を入力する</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {inputMethod === 'csv' ? (
              <FileUpload 
                onFileSelect={handleCSVUpload} 
                error={csvAnalysisError}
              />
            ) : (
              <div className="space-y-6">
                <ApplicantForm 
                  applicants={applicants} 
                  onApplicantsChange={handleApplicantsChange} 
                />
                {applicants.length > 0 && (
                  <div className="flex justify-end">
                    <button
                      onClick={() => setCurrentStep('form')}
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      次へ進む
                      <svg className="ml-2 -mr-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {currentStep === 'column_selection' && (
          <CSVColumnSelector
            columns={csvColumns}
            onSelectionComplete={handleColumnSelectionChange}
            onBack={() => setCurrentStep('input')}
          />
        )}

        {currentStep === 'form' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">求人要件の設定</h2>
              {inputMethod === 'csv' && (
                <button
                  onClick={() => setCurrentStep('column_selection')}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="mr-2 -ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                  </svg>
                  カラム選択に戻る
                </button>
              )}
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                    企業名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="company"
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="例: 株式会社テックイノベーション"
                  />
                </div>
                <div>
                  <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
                    募集ポジション <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="position"
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({...formData, position: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="例: シニアフロントエンドエンジニア"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-1">
                  求人要件 <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="requirements"
                  rows={6}
                  value={formData.requirements}
                  onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="例: React/Vue.js経験3年以上、TypeScript必須、チーム開発経験、年収600-900万円"
                />
                <p className="mt-1 text-sm text-gray-500">
                  必要なスキル、経験年数、年収レンジなどを詳しく記載してください
                </p>
              </div>

              <div>
                <label htmlFor="sender" className="block text-sm font-medium text-gray-700 mb-1">
                  担当者名 <span className="text-red-500">*</span>
                </label>
                <input
                  id="sender"
                  type="text"
                  value={formData.sender}
                  onChange={(e) => setFormData({...formData, sender: e.target.value})}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="例: 田中太郎"
                />
                <p className="mt-1 text-sm text-gray-500">
                  スカウトメッセージに記載される担当者名
                </p>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setCurrentStep(inputMethod === 'csv' ? 'column_selection' : 'input')}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="mr-2 -ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                  </svg>
                  戻る
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isLoading || !formData.company || !formData.requirements || !formData.sender || !formData.position}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      分析中...
                    </>
                  ) : (
                    <>
                      AI分析を開始
                      <svg className="ml-2 -mr-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'results' && <EnhancedResultsDisplay results={result} />}
      </main>
    </div>
  );
}
