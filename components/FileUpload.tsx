"use client";
import { useState, useRef } from 'react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  error?: string | null;
}

export default function FileUpload({ onFileSelect, error }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        onFileSelect(file);
      } else {
        alert('CSVファイルを選択してください');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">CSVファイルアップロード</h2>
        
        {/* ドラッグ&ドロップエリア */}
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragOver
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <div className="space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-900">
                CSVファイルをドラッグ&ドロップ、またはクリックして選択
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                候補者データが含まれたCSVファイルをアップロードしてください
              </p>
            </div>
          </div>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">CSVファイルの処理エラー</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CSVファイル形式の説明 */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h4 className="text-sm font-medium text-blue-900 mb-2">CSVファイル形式について</h4>
          <div className="text-sm text-blue-700 space-y-2">
            <p>以下の形式でCSVファイルを準備してください：</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>1行目はヘッダー行（カラム名）を含める</li>
              <li>候補者名、スキル、経験年数等の情報を含める</li>
              <li>文字エンコーディングはUTF-8で保存</li>
              <li>カンマ区切りの形式で保存</li>
            </ul>
            <div className="mt-3 p-3 bg-white rounded border">
              <p className="font-mono text-xs text-gray-600">
                例: name,skills,experience,education<br />
                田中太郎,JavaScript・React・Node.js,5,大学卒<br />
                佐藤花子,Python・Django・SQL,3,修士課程
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 