"use client";
import { useState } from 'react';
import { ApplicantInput } from '../lib/types';

interface ApplicantFormProps {
  applicants: ApplicantInput[];
  onApplicantsChange: (applicants: ApplicantInput[]) => void;
}

export default function ApplicantForm({ applicants, onApplicantsChange }: ApplicantFormProps) {
  const [currentApplicant, setCurrentApplicant] = useState<ApplicantInput>({
    id: '',
    name: '',
    skills: [],
    experience: '',
    education: '',
    additionalInfo: ''
  });

  const [skillsText, setSkillsText] = useState<string>(''); // スキル入力用の文字列
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);

  const handleInputChange = (field: keyof ApplicantInput, value: string) => {
    if (field === 'skills') {
      setSkillsText(value);
      const skillsArray = value.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0);
      setCurrentApplicant(prev => ({
        ...prev,
        skills: skillsArray
      }));
    } else {
      setCurrentApplicant(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleAddApplicant = () => {
    if (!currentApplicant.name.trim()) {
      alert('申請者名を入力してください');
      return;
    }

    const newApplicant = {
      ...currentApplicant,
      id: currentApplicant.id || `applicant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    if (isEditing) {
      const updatedApplicants = [...applicants];
      updatedApplicants[editingIndex] = newApplicant;
      onApplicantsChange(updatedApplicants);
      setIsEditing(false);
      setEditingIndex(-1);
    } else {
      onApplicantsChange([...applicants, newApplicant]);
    }

    // フォームをリセット
    setCurrentApplicant({
      id: '',
      name: '',
      skills: [],
      experience: '',
      education: '',
      additionalInfo: ''
    });
    setSkillsText('');
  };

  const handleEditApplicant = (index: number) => {
    const applicant = applicants[index];
    setCurrentApplicant(applicant);
    setSkillsText(applicant.skills.join(', '));
    setIsEditing(true);
    setEditingIndex(index);
  };

  const handleDeleteApplicant = (index: number) => {
    if (window.confirm('この申請者を削除しますか？')) {
      const updatedApplicants = applicants.filter((_, i) => i !== index);
      onApplicantsChange(updatedApplicants);
    }
  };

  const handleCancelEdit = () => {
    setCurrentApplicant({
      id: '',
      name: '',
      skills: [],
      experience: '',
      education: '',
      additionalInfo: ''
    });
    setSkillsText('');
    setIsEditing(false);
    setEditingIndex(-1);
  };

  const addSampleData = () => {
    const sampleApplicants: ApplicantInput[] = [
      {
        id: 'sample_1',
        name: '田中太郎',
        skills: ['JavaScript', 'React', 'Node.js', 'TypeScript'],
        experience: '5年',
        education: '大学卒業',
        additionalInfo: 'フロントエンド開発のリードエンジニアとして3年の経験があります。'
      },
      {
        id: 'sample_2',
        name: '佐藤花子',
        skills: ['Python', 'Django', 'PostgreSQL', 'AWS'],
        experience: '3年',
        education: '修士課程修了',
        additionalInfo: 'バックエンド開発とクラウドインフラの構築経験があります。'
      },
      {
        id: 'sample_3',
        name: '山田次郎',
        skills: ['Java', 'Spring Boot', 'MySQL'],
        experience: '7年',
        education: '大学卒業',
        additionalInfo: 'エンタープライズシステムの開発経験が豊富です。'
      }
    ];

    onApplicantsChange([...applicants, ...sampleApplicants]);
  };

  return (
    <div className="space-y-6">
      {/* 申請者入力フォーム */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEditing ? '申請者情報を編集' : '申請者情報を入力'}
          </h2>
          {applicants.length === 0 && (
            <button
              onClick={addSampleData}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              サンプルデータを追加
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              申請者名 <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={currentApplicant.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="例: 田中太郎"
            />
          </div>

          <div>
            <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
              経験年数
            </label>
            <input
              id="experience"
              type="text"
              value={currentApplicant.experience}
              onChange={(e) => handleInputChange('experience', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="例: 5年"
            />
          </div>

          <div>
            <label htmlFor="education" className="block text-sm font-medium text-gray-700 mb-1">
              学歴
            </label>
            <input
              id="education"
              type="text"
              value={currentApplicant.education}
              onChange={(e) => handleInputChange('education', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="例: 大学卒業"
            />
          </div>

          <div>
            <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-1">
              スキル・技術
            </label>
            <input
              id="skills"
              type="text"
              value={skillsText}
              onChange={(e) => handleInputChange('skills', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="例: JavaScript, React, Node.js"
            />
          </div>
        </div>

        <div className="mt-4">
          <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700 mb-1">
            追加情報
          </label>
          <textarea
            id="additionalInfo"
            rows={3}
            value={currentApplicant.additionalInfo}
            onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="プロジェクト経験、特記事項など..."
          />
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          {isEditing && (
            <button
              onClick={handleCancelEdit}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              キャンセル
            </button>
          )}
          <button
            onClick={handleAddApplicant}
            disabled={!currentApplicant.name.trim()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isEditing ? '更新' : '追加'}
          </button>
        </div>
      </div>

      {/* 申請者一覧 */}
      {applicants.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              登録済み申請者一覧 ({applicants.length}名)
            </h3>
            <button
              onClick={() => onApplicantsChange([])}
              className="text-sm text-red-600 hover:text-red-800"
            >
              全て削除
            </button>
          </div>

          <div className="space-y-3">
            {applicants.map((applicant, index) => (
              <div
                key={applicant.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900">{applicant.name}</h4>
                    <div className="mt-1 text-sm text-gray-500 space-y-1">
                      {applicant.skills && (
                        <p><span className="font-medium">スキル:</span> {applicant.skills.join(', ')}</p>
                      )}
                      {applicant.experience && (
                        <p><span className="font-medium">経験:</span> {applicant.experience}</p>
                      )}
                      {applicant.education && (
                        <p><span className="font-medium">学歴:</span> {applicant.education}</p>
                      )}
                      {applicant.additionalInfo && (
                        <p><span className="font-medium">追加情報:</span> {applicant.additionalInfo}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleEditApplicant(index)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleDeleteApplicant(index)}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      削除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {applicants.length === 0 && (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">申請者が登録されていません</h3>
          <p className="mt-1 text-sm text-gray-500">上のフォームから申請者情報を入力してください</p>
        </div>
      )}
    </div>
  );
} 