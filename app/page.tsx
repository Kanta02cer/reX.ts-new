"use client";
import { useState, useCallback } from "react";
import { HiOutlineRefresh, HiOutlineDocumentText, HiOutlineUserGroup } from "react-icons/hi";
import CsvUploader from "@/components/CsvUploader";
import RequirementsForm from "@/components/RequirementsForm";
import ResultsDisplay from "@/components/ResultsDisplay";
import { processCSVData, ProcessedCSVData } from '../lib/csvProcessor';
import CSVDataDisplay from '../components/CSVDataDisplay';
import DatasetManager from '../components/DatasetManager';
import TextInputForm from '../components/TextInputForm';
import { Dataset, ApplicantInput } from '../lib/types';

type FormData = {
  company: string;
  requirements: string;
  sender: string;
  senderKana: string;
  senderEnglish?: string;
  position: string;
  groupName?: string;
};

// エラー表示コンポーネント
function ErrorDisplay({ error, onReload }: { error: string | null; onReload: () => void }) {
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!error) return null;

  const handleCopyError = () => {
    navigator.clipboard.writeText(error);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getErrorGuidance = (error: string) => {
    if (error.includes('Content-Type')) {
      return 'ブラウザを最新の状態に更新してください。';
    }
    if (error.includes('CSVファイル')) {
      return 'CSVファイルの形式を確認し、再度アップロードしてください。';
    }
    if (error.includes('申請者データ')) {
      return '入力データの形式を確認し、必須項目が入力されているか確認してください。';
    }
    if (error.includes('サーバーエラー')) {
      return 'しばらく時間をおいて再度お試しください。';
    }
    return '入力内容を確認し、再度お試しください。';
  };

  return (
    <div className="mb-6 space-y-4">
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
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

      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">推奨される対応：{getErrorGuidance(error)}</p>
          </div>
        </div>
      </div>

      <div className="flex space-x-4">
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
          詳しく
        </button>
      </div>

      {showDetails && (
        <div className="mt-4 bg-gray-50 p-4 rounded-md">
          <div className="flex justify-between items-start">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap break-all">{error}</pre>
            <button
              onClick={handleCopyError}
              className="ml-4 inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
                  コピー
                </>
              )}
            </button>
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
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'form' | 'results'>('form');
  const [csvData, setCsvData] = useState<ProcessedCSVData | null>(null);
  const [selectedDatasets, setSelectedDatasets] = useState<Dataset[]>([]);
  const [applicants, setApplicants] = useState<ApplicantInput[]>([]);
  const [inputMethod, setInputMethod] = useState<'csv' | 'text'>('csv');

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsLoading(true);
    setError(null);
    setCsvData(null);
    setInputMethod('csv');

    try {
      const csvText = await selectedFile.text();
      const processedData = processCSVData(csvText);
      setCsvData(processedData);
      setApplicants(Object.entries(processedData).map(([id, data]) => ({
        id,
        name: data.name,
        skills: data.skills,
        ...data
      })));
    } catch (err) {
      console.error("CSV処理エラー:", err);
      setError(`エラーが発生しました: ${err instanceof Error ? err.message : '不明なエラー'}`);
      setCsvData(null);
      setApplicants([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

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
    setInputMethod('text');
  };

  const resetCSV = () => {
    if (!window.confirm('CSVファイルの入力をリセットしますか？')) {
      return;
    }
    setFile(null);
    setCsvData(null);
    setApplicants([]);
    setError(null);
  };

  const isFormValid = () => {
    return (
      selectedDatasets.length > 0 &&
      applicants.length > 0 &&
      !isLoading
    );
  };

  async function submitForm() {
    if (!isFormValid()) {
      setError("必要な情報が不足しています。データセットと申請者データを確認してください。");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const form = new FormData();
      if (file) {
        form.append("csv", file);
      }
      form.append("company", formData.company?.trim() || '');
      form.append("requirements", formData.requirements?.trim() || '');
      form.append("sender", formData.sender?.trim() || '');
      form.append("senderKana", formData.senderKana?.trim() || '');
      form.append("senderEnglish", formData.senderEnglish?.trim() || '');
      form.append("position", formData.position?.trim() || '');
      form.append("groupName", formData.groupName?.trim() || '');
      form.append("applicants", JSON.stringify(applicants));
      form.append("inputMethod", inputMethod);

      const res = await fetch("/api/process", {
        method: "POST",
        headers: {
          'Accept': 'application/json',
        },
        body: form,
      });
      
      const contentType = res.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        throw new Error('サーバーからの応答が不正な形式です');
      }
      
      const json = await res.json();
      
      if (!res.ok) {
        throw new Error(json.error || `サーバーエラー: ${res.status}`);
      }
      
      if (!json.result || !Array.isArray(json.result)) {
        throw new Error('分析結果の形式が不正です');
      }
      
      setResult(json.result);
      setActiveTab('results');
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "エラーが発生しました。再度お試しください。");
    } finally {
      setIsLoading(false);
    }
  }

  async function resetForm() {
    if (!window.confirm('入力内容をすべてリセットしますか？')) {
      return;
    }

    setFile(null);
    setFormData({
      company: "",
      requirements: "",
      sender: "",
      senderKana: "",
      senderEnglish: "",
      position: "",
      groupName: ""
    });
    setResult(null);
    setError(null);
    setActiveTab('form');
    setCsvData(null);
    setApplicants([]);
    setSelectedDatasets([]);
    setInputMethod('csv');

    try {
      localStorage.removeItem('companyInfo');
      localStorage.removeItem('formData');
    } catch (error) {
      console.error('ローカルストレージのクリアに失敗しました:', error);
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <header className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">reX.ts - AI採用支援システム</h1>
        <p className="text-gray-600">候補者のデータをアップロードして、AIによるマッチング分析を実行します</p>
      </header>
      
      {error && <ErrorDisplay error={error} onReload={() => window.location.reload()} />}
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('form')}
              className={`py-4 px-6 border-b-2 font-medium text-sm flex items-center ${
                activeTab === 'form'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <HiOutlineDocumentText className="mr-2 h-5 w-5" />
              データ入力
            </button>
            <button
              onClick={() => setActiveTab('results')}
              disabled={!result}
              className={`py-4 px-6 border-b-2 font-medium text-sm flex items-center ${
                activeTab === 'results'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } ${!result ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <HiOutlineUserGroup className="mr-2 h-5 w-5" />
              結果表示
            </button>
          </nav>
        </div>
        
        <div className="p-6">
          {activeTab === 'form' ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">データセット選択</h2>
                <DatasetManager
                  onSelect={handleDatasetSelect}
                  selectedDatasets={selectedDatasets}
                  currentData={formData}
                />
              </div>

              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">申請者データ入力</h2>
                <div className="space-y-4">
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setInputMethod('csv')}
                      className={`px-4 py-2 rounded-md ${
                        inputMethod === 'csv'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      CSVファイル
                    </button>
                    <button
                      onClick={() => setInputMethod('text')}
                      className={`px-4 py-2 rounded-md ${
                        inputMethod === 'text'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      テキスト入力
                    </button>
                  </div>

                  {inputMethod === 'csv' ? (
                    <div>
                      <div className="flex items-center space-x-4">
                        <input
                          type="file"
                          accept=".csv"
                          onChange={handleFileChange}
                          className="block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-md file:border-0
                            file:text-sm file:font-semibold
                            file:bg-blue-50 file:text-blue-700
                            hover:file:bg-blue-100"
                        />
                        {file && (
                          <button
                            onClick={resetCSV}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <svg className="mr-2 -ml-1 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            リセット
                          </button>
                        )}
                      </div>
                      {file && (
                        <p className="mt-2 text-sm text-gray-500">
                          選択されたファイル: {file.name}
                        </p>
                      )}
                    </div>
                  ) : (
                    <TextInputForm onApplicantsChange={handleApplicantsChange} />
                  )}
                </div>
              </div>
              
              {csvData && (
                <div className="mb-6">
                  <CSVDataDisplay
                    data={csvData}
                    isLoading={isLoading}
                    error={error}
                  />
                </div>
              )}
              
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
                  onClick={submitForm}
                  disabled={!isFormValid()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      処理中...
                    </>
                  ) : '分析実行'}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium text-gray-900">分析結果</h2>
                <button
                  onClick={() => setActiveTab('form')}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  入力に戻る
                </button>
              </div>
              
              <ResultsDisplay results={result} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
