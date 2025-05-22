"use client";
import { useState } from "react";
import { BiUpload, BiCheckCircle, BiX, BiError } from "react-icons/bi";

type UploaderProps = {
  onFileChange: (file: File | null) => void;
  fileName?: string;
};

export default function CsvUploader({ onFileChange, fileName }: UploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // ドラッグイベントハンドラー
  function handleDrag(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }

  // ドロップイベントハンドラー
  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  }

  // ファイル選択イベントハンドラー
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  }

  // ファイルの検証と設定
  async function validateAndSetFile(file: File) {
    setFileError(null);
    setIsLoading(true);
    
    try {
      // CSVファイルかどうかチェック
      if (!file.name.endsWith('.csv')) {
        throw new Error("CSVファイルのみアップロードできます");
      }
      
      // サイズチェック (5MBまで)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("ファイルサイズは5MB以下にしてください");
      }
      
      // ファイルの内容を確認
      const text = await readFileContent(file);
      if (!text.trim()) {
        throw new Error("ファイルが空です");
      }
      
      // 基本的なCSV形式チェック
      const lines = text.split(/\r?\n/);
      if (lines.length < 2) {
        throw new Error("CSVファイルには少なくともヘッダー行と1行のデータが必要です");
      }
      
      const headerColumns = lines[0].split(',').length;
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() && lines[i].split(',').length !== headerColumns) {
          throw new Error(`行 ${i + 1} の列数がヘッダー行と一致しません`);
        }
      }
      
      onFileChange(file);
    } catch (error) {
      console.error('ファイル検証エラー:', error);
      setFileError(error instanceof Error ? error.message : "ファイルの検証に失敗しました");
      onFileChange(null);
    } finally {
      setIsLoading(false);
    }
  }

  // ファイルの内容を読み込む
  function readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target?.result) {
          resolve(event.target.result as string);
        } else {
          reject(new Error('ファイルの読み込みに失敗しました'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('ファイルの読み込み中にエラーが発生しました'));
      };
      
      reader.readAsText(file, 'UTF-8');
    });
  }

  // ファイル削除
  function handleClearFile() {
    onFileChange(null);
    setFileError(null);
  }

  return (
    <div className="w-full">
      {fileName ? (
        <div className="flex items-center justify-between p-4 border-2 border-green-500 bg-green-50 rounded-lg">
          <div className="flex items-center">
            <BiCheckCircle size={20} className="text-green-500 mr-2" />
            <span className="truncate max-w-xs">{fileName}</span>
          </div>
          <button 
            onClick={handleClearFile}
            className="text-red-500 hover:text-red-700"
            aria-label="ファイルを削除"
          >
            <BiX size={20} />
          </button>
        </div>
      ) : (
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center
            ${dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50"}
            ${fileError ? "border-red-500 bg-red-50" : ""}`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          {isLoading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
              <p className="text-gray-600">ファイルを検証中...</p>
            </div>
          ) : (
            <>
              <BiUpload size={40} color={dragActive ? "#3B82F6" : "#9CA3AF"} className="mb-2" />
              <p className="text-center mb-4">
                ここにCSVファイルをドラッグ&ドロップするか、
                <br />
                ファイルを選択してください
              </p>
              <label className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg cursor-pointer transition-colors">
                CSVファイルを選択
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </>
          )}
          
          {fileError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <BiError size={20} className="text-red-500 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-red-500 text-sm">{fileError}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 