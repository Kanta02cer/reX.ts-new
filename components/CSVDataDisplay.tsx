import React from 'react';
import { ProcessedCSVData } from '../lib/csvProcessor';

interface CSVDataDisplayProps {
  data: ProcessedCSVData;
  isLoading: boolean;
  error: string | null;
}

export default function CSVDataDisplay({ data, isLoading, error }: CSVDataDisplayProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center my-10 p-6 bg-white rounded-xl shadow-md">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
        <p className="text-lg text-gray-700">CSVファイルを処理中...</p>
        <p className="text-sm text-gray-500">大規模なファイルの場合、少し時間がかかることがあります。</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow-md text-center">
        <strong className="font-bold">エラー:</strong>
        <span className="block sm:inline ml-2">{error}</span>
      </div>
    );
  }

  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="mt-8 text-center p-6 bg-yellow-50 border border-yellow-300 rounded-lg shadow-md">
        <p className="text-yellow-700 text-lg">
          CSVファイルから有効な求職者データが抽出できませんでした。
        </p>
        <p className="text-yellow-600 text-sm mt-1">
          ファイルの形式を確認してください。
        </p>
      </div>
    );
  }

  // スキル情報を含む列名を取得
  const skillColumns = Object.keys(data).reduce((columns: string[], applicantId) => {
    const applicantData = data[applicantId];
    Object.keys(applicantData).forEach(key => {
      if (key !== 'name' && key !== 'skills' && !columns.includes(key)) {
        columns.push(key);
      }
    });
    return columns;
  }, []);

  return (
    <section className="mt-8">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center sm:text-left">
        整理された求職者情報
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(data).map(([applicantId, applicantData]) => (
          <div key={applicantId} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-semibold text-blue-700 mb-1">
              ID: <span className="font-bold">{applicantId}</span>
            </h3>
            <p className="text-md text-gray-600 mb-3">氏名: {applicantData.name || 'N/A'}</p>
            
            {applicantData.skills.length > 0 ? (
              <>
                <h4 className="text-sm font-medium text-gray-700 mb-1">抽出されたスキル情報:</h4>
                <ul className="list-none space-y-1">
                  {applicantData.skills.map((skill, index) => (
                    <li key={index} className="flex items-center text-gray-700 bg-blue-50 px-3 py-1.5 rounded-md text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-blue-500 flex-shrink-0"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                      {skill}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-gray-600 italic bg-gray-100 p-3 rounded-md">スキル情報はありません。</p>
            )}

            {skillColumns.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">その他の情報:</h4>
                <div className="space-y-2">
                  {skillColumns.map(column => (
                    applicantData[column] && (
                      <div key={column} className="text-sm">
                        <span className="font-medium text-gray-600">{column}:</span>
                        <span className="ml-2 text-gray-700">{applicantData[column]}</span>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
} 