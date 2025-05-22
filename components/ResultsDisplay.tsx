"use client";
import React, { useState } from 'react';
import { HiDownload } from 'react-icons/hi';

interface ResultsDisplayProps {
  results: string[][] | null;
}

type Status = '採用' | '面接中' | '返答待ち' | 'オファー送付済み';

interface ResultRow {
  id: string;
  name: string;
  status: 'OK' | 'NG';
  reason: string;
  scoutMessage: string;
  hiringStatus: Status;
}

export default function ResultsDisplay({ results }: ResultsDisplayProps) {
  const [hiringStatuses, setHiringStatuses] = useState<{ [key: string]: Status }>({});

  if (!results) {
    return (
      <div className="text-center text-gray-500 py-8">
        分析結果がありません
      </div>
    );
  }

  const parsedResults: ResultRow[] = results.map(row => ({
    id: row[0],
    name: row[1],
    status: row[2] as 'OK' | 'NG',
    reason: row[3],
    scoutMessage: row[4],
    hiringStatus: hiringStatuses[row[0]] || '返答待ち'
  }));

  const handleStatusChange = (id: string, status: Status) => {
    setHiringStatuses(prev => ({
      ...prev,
      [id]: status
    }));
  };

  const exportToCSV = () => {
    const headers = ['ID', '名前', '判定結果', '判定要因', 'スカウト文章', '採用状況'];
    const csvContent = [
      headers.join(','),
      ...parsedResults.map(row => [
        row.id,
        row.name,
        row.status,
        row.reason,
        row.scoutMessage,
        row.hiringStatus
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `分析結果_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportToExcel = () => {
    // Excelファイルの生成（実際の実装では、xlsxライブラリなどを使用）
    alert('Excel形式でのエクスポート機能は準備中です');
  };

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">名前</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">判定結果</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">判定要因</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">スカウト文章</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">採用状況</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {parsedResults.map((row) => (
              <tr key={row.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    row.status === 'OK' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {row.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 max-w-md">{row.reason}</td>
                <td className="px-6 py-4 text-sm text-gray-900 max-w-lg">{row.scoutMessage}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={row.hiringStatus}
                    onChange={(e) => handleStatusChange(row.id, e.target.value as Status)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="採用">採用</option>
                    <option value="面接中">面接中</option>
                    <option value="返答待ち">返答待ち</option>
                    <option value="オファー送付済み">オファー送付済み</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
        <button
          onClick={exportToCSV}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <HiDownload className="mr-2 -ml-1 h-5 w-5" />
          CSVでダウンロード
        </button>
        <button
          onClick={exportToExcel}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <HiDownload className="mr-2 -ml-1 h-5 w-5" />
          Excelでダウンロード
        </button>
      </div>
    </div>
  );
} 