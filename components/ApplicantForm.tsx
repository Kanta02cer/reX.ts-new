"use client";
import { useState } from 'react';
import { ApplicantInput } from '../lib/types';

interface ApplicantFormProps {
  applicants: ApplicantInput[];
  onApplicantsChange: (applicants: ApplicantInput[]) => void;
}

export default function ApplicantForm({ applicants, onApplicantsChange }: ApplicantFormProps) {
  const [isAddingApplicant, setIsAddingApplicant] = useState(false);
  const [newApplicant, setNewApplicant] = useState<ApplicantInput>({
    id: '',
    name: '',
    skills: []
  });

  const addApplicant = () => {
    if (newApplicant.name.trim()) {
      const applicant = {
        ...newApplicant,
        id: `applicant_${Date.now()}`,
        skills: newApplicant.skills.filter(skill => skill.trim() !== '')
      };
      onApplicantsChange([...applicants, applicant]);
      setNewApplicant({ id: '', name: '', skills: [] });
      setIsAddingApplicant(false);
    }
  };

  const removeApplicant = (id: string) => {
    onApplicantsChange(applicants.filter(a => a.id !== id));
  };

  const updateApplicant = (id: string, field: keyof ApplicantInput, value: any) => {
    onApplicantsChange(applicants.map(a => 
      a.id === id ? { ...a, [field]: value } : a
    ));
  };

  const addSkill = (applicantId: string) => {
    const applicant = applicants.find(a => a.id === applicantId);
    if (applicant) {
      updateApplicant(applicantId, 'skills', [...applicant.skills, '']);
    }
  };

  const updateSkill = (applicantId: string, skillIndex: number, value: string) => {
    const applicant = applicants.find(a => a.id === applicantId);
    if (applicant) {
      const newSkills = [...applicant.skills];
      newSkills[skillIndex] = value;
      updateApplicant(applicantId, 'skills', newSkills);
    }
  };

  const removeSkill = (applicantId: string, skillIndex: number) => {
    const applicant = applicants.find(a => a.id === applicantId);
    if (applicant) {
      const newSkills = applicant.skills.filter((_, index) => index !== skillIndex);
      updateApplicant(applicantId, 'skills', newSkills);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">候補者情報の入力</h2>
        <button
          onClick={() => setIsAddingApplicant(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg className="mr-2 -ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          候補者を追加
        </button>
      </div>

      {/* 新規候補者追加フォーム */}
      {isAddingApplicant && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h3 className="text-sm font-medium text-gray-900 mb-4">新規候補者</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                氏名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newApplicant.name}
                onChange={(e) => setNewApplicant({...newApplicant, name: e.target.value})}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="例: 田中太郎"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">スキル</label>
              <div className="space-y-2">
                {newApplicant.skills.map((skill, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={skill}
                      onChange={(e) => {
                        const newSkills = [...newApplicant.skills];
                        newSkills[index] = e.target.value;
                        setNewApplicant({...newApplicant, skills: newSkills});
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="例: JavaScript"
                    />
                    <button
                      onClick={() => {
                        const newSkills = newApplicant.skills.filter((_, i) => i !== index);
                        setNewApplicant({...newApplicant, skills: newSkills});
                      }}
                      className="p-2 text-red-600 hover:text-red-800"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setNewApplicant({...newApplicant, skills: [...newApplicant.skills, '']})}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50"
                >
                  <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  スキルを追加
                </button>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsAddingApplicant(false);
                  setNewApplicant({ id: '', name: '', skills: [] });
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                onClick={addApplicant}
                disabled={!newApplicant.name.trim()}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                追加
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 既存候補者一覧 */}
      {applicants.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-900">登録済み候補者 ({applicants.length}名)</h3>
          {applicants.map((applicant) => (
            <div key={applicant.id} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <input
                      type="text"
                      value={applicant.name}
                      onChange={(e) => updateApplicant(applicant.id, 'name', e.target.value)}
                      className="text-sm font-medium text-gray-900 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
                    />
                  </div>
                </div>
                <button
                  onClick={() => removeApplicant(applicant.id)}
                  className="p-1 text-red-600 hover:text-red-800"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">スキル</label>
                <div className="space-y-2">
                  {applicant.skills.map((skill, skillIndex) => (
                    <div key={skillIndex} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={skill}
                        onChange={(e) => updateSkill(applicant.id, skillIndex, e.target.value)}
                        className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="スキル名"
                      />
                      <button
                        onClick={() => removeSkill(applicant.id, skillIndex)}
                        className="p-1 text-red-600 hover:text-red-800"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addSkill(applicant.id)}
                    className="inline-flex items-center px-2 py-1 border border-gray-300 rounded text-xs text-gray-600 bg-white hover:bg-gray-50"
                  >
                    <svg className="mr-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    スキル追加
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {applicants.length === 0 && !isAddingApplicant && (
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">候補者が登録されていません</h3>
          <p className="mt-1 text-sm text-gray-500">「候補者を追加」ボタンをクリックして候補者情報を入力してください。</p>
        </div>
      )}
    </div>
  );
} 