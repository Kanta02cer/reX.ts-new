import React, { useState } from 'react';
import { ApplicantInput } from '../lib/types';

interface TextInputFormProps {
  onApplicantsChange: (applicants: ApplicantInput[]) => void;
}

export default function TextInputForm({ onApplicantsChange }: TextInputFormProps) {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const parseText = () => {
    try {
      const lines = text.trim().split('\n');
      const applicants: ApplicantInput[] = [];
      let currentApplicant: Partial<ApplicantInput> = {};

      for (const line of lines) {
        if (line.trim() === '') {
          if (Object.keys(currentApplicant).length > 0) {
            if (!currentApplicant.id) {
              currentApplicant.id = `temp_${Date.now()}_${applicants.length}`;
            }
            if (!currentApplicant.name) {
              currentApplicant.name = '名前未設定';
            }
            if (!currentApplicant.skills) {
              currentApplicant.skills = [];
            }
            applicants.push(currentApplicant as ApplicantInput);
            currentApplicant = {};
          }
          continue;
        }

        const [key, ...values] = line.split(':').map(s => s.trim());
        const value = values.join(':').trim();

        if (key.toLowerCase() === 'id') {
          currentApplicant.id = value;
        } else if (key.toLowerCase() === '名前' || key.toLowerCase() === 'name') {
          currentApplicant.name = value;
        } else if (key.toLowerCase() === 'スキル' || key.toLowerCase() === 'skills') {
          currentApplicant.skills = value.split(/[,、]/).map(s => s.trim()).filter(s => s);
        } else {
          currentApplicant[key] = value;
        }
      }

      // 最後の申請者を追加
      if (Object.keys(currentApplicant).length > 0) {
        if (!currentApplicant.id) {
          currentApplicant.id = `temp_${Date.now()}_${applicants.length}`;
        }
        if (!currentApplicant.name) {
          currentApplicant.name = '名前未設定';
        }
        if (!currentApplicant.skills) {
          currentApplicant.skills = [];
        }
        applicants.push(currentApplicant as ApplicantInput);
      }

      if (applicants.length === 0) {
        throw new Error('有効な申請者データが見つかりませんでした。');
      }

      onApplicantsChange(applicants);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'データの解析中にエラーが発生しました。');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="applicantText" className="block text-sm font-medium text-gray-700">
          申請者データ（テキスト形式）
        </label>
        <div className="mt-1">
          <textarea
            id="applicantText"
            rows={10}
            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
            placeholder={`ID: 1
名前: 山田太郎
スキル: Java, Python, SQL

ID: 2
名前: 鈴木花子
スキル: JavaScript, React, TypeScript`}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
        <p className="mt-2 text-sm text-gray-500">
          各申請者の情報を空行で区切って入力してください。
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
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
      )}

      <button
        type="button"
        onClick={parseText}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        データを解析
      </button>
    </div>
  );
} 