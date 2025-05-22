import React, { useState, useEffect } from 'react';
import { Dataset } from '../lib/types';

type DatasetManagerProps = {
  onSelect: (datasets: Dataset[]) => void;
  selectedDatasets: Dataset[];
  currentData: {
    company: string;
    sender: string;
    senderKana: string;
    senderEnglish?: string;
    position: string;
    groupName?: string;
  };
};

type TabType = 'recruiter' | 'position' | 'requirements';

export default function DatasetManager({ onSelect, selectedDatasets, currentData }: DatasetManagerProps) {
  const [recruiterDatasets, setRecruiterDatasets] = useState<Dataset[]>([]);
  const [positionDatasets, setPositionDatasets] = useState<Dataset[]>([]);
  const [requirementsDatasets, setRequirementsDatasets] = useState<Dataset[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('recruiter');
  const [newDataset, setNewDataset] = useState<Partial<Dataset>>({
    company: '',
    requirements: '',
    sender: '',
    senderKana: '',
    senderEnglish: '',
    position: '',
    groupName: ''
  });

  useEffect(() => {
    const savedRecruiterDatasets = localStorage.getItem('recruiterDatasets');
    const savedPositionDatasets = localStorage.getItem('positionDatasets');
    const savedRequirementsDatasets = localStorage.getItem('requirementsDatasets');
    
    if (savedRecruiterDatasets) {
      setRecruiterDatasets(JSON.parse(savedRecruiterDatasets));
    }
    if (savedPositionDatasets) {
      setPositionDatasets(JSON.parse(savedPositionDatasets));
    }
    if (savedRequirementsDatasets) {
      setRequirementsDatasets(JSON.parse(savedRequirementsDatasets));
    }
  }, []);

  useEffect(() => {
    if (selectedDatasets.length > 0) {
      const lastDataset = selectedDatasets[selectedDatasets.length - 1];
      setNewDataset({
        company: lastDataset.company,
        requirements: lastDataset.requirements || '',
        sender: lastDataset.sender || '',
        senderKana: lastDataset.senderKana || '',
        senderEnglish: lastDataset.senderEnglish || '',
        position: lastDataset.position || '',
        groupName: lastDataset.groupName || ''
      });
    }
  }, [selectedDatasets]);

  useEffect(() => {
    const currentDatasets = getCurrentDatasets();
    const selectedDataset = currentDatasets.find(ds => 
      selectedDatasets.some(selected => selected.company === ds.company)
    );

    if (selectedDataset) {
      setNewDataset({
        company: selectedDataset.company,
        requirements: selectedDataset.requirements || '',
        sender: selectedDataset.sender || '',
        senderKana: selectedDataset.senderKana || '',
        senderEnglish: selectedDataset.senderEnglish || '',
        position: selectedDataset.position || '',
        groupName: selectedDataset.groupName || ''
      });
    } else {
      setNewDataset({
        company: '',
        requirements: '',
        sender: '',
        senderKana: '',
        senderEnglish: '',
        position: '',
        groupName: ''
      });
    }
  }, [activeTab, recruiterDatasets, positionDatasets, requirementsDatasets, selectedDatasets]);

  const getCurrentDatasets = () => {
    switch (activeTab) {
      case 'recruiter':
        return recruiterDatasets;
      case 'position':
        return positionDatasets;
      case 'requirements':
        return requirementsDatasets;
      default:
        return recruiterDatasets;
    }
  };

  const saveDataset = () => {
    if (activeTab === 'recruiter') {
      if (!newDataset.company || !newDataset.sender || !newDataset.senderKana) {
        alert('必須項目を入力してください');
        return;
      }
    } else if (activeTab === 'position') {
      if (!newDataset.company || !newDataset.position) {
        alert('必須項目を入力してください');
        return;
      }
    } else if (activeTab === 'requirements') {
      if (!newDataset.company || !newDataset.requirements) {
        alert('必須項目を入力してください');
        return;
      }
    }

    const datasetToSave = {
      ...newDataset,
      createdAt: new Date().toISOString()
    } as Dataset;

    switch (activeTab) {
      case 'recruiter':
        const updatedRecruiterDatasets = [...recruiterDatasets, datasetToSave];
        setRecruiterDatasets(updatedRecruiterDatasets);
        localStorage.setItem('recruiterDatasets', JSON.stringify(updatedRecruiterDatasets));
        break;
      case 'position':
        const updatedPositionDatasets = [...positionDatasets, datasetToSave];
        setPositionDatasets(updatedPositionDatasets);
        localStorage.setItem('positionDatasets', JSON.stringify(updatedPositionDatasets));
        break;
      case 'requirements':
        const updatedRequirementsDatasets = [...requirementsDatasets, datasetToSave];
        setRequirementsDatasets(updatedRequirementsDatasets);
        localStorage.setItem('requirementsDatasets', JSON.stringify(updatedRequirementsDatasets));
        break;
    }

    setNewDataset({
      company: '',
      requirements: '',
      sender: '',
      senderKana: '',
      senderEnglish: '',
      position: '',
      groupName: ''
    });
  };

  const deleteDataset = (index: number) => {
    if (!window.confirm('このデータセットを削除しますか？')) {
      return;
    }

    switch (activeTab) {
      case 'recruiter':
        const updatedRecruiterDatasets = recruiterDatasets.filter((_, i) => i !== index);
        setRecruiterDatasets(updatedRecruiterDatasets);
        localStorage.setItem('recruiterDatasets', JSON.stringify(updatedRecruiterDatasets));
        break;
      case 'position':
        const updatedPositionDatasets = positionDatasets.filter((_, i) => i !== index);
        setPositionDatasets(updatedPositionDatasets);
        localStorage.setItem('positionDatasets', JSON.stringify(updatedPositionDatasets));
        break;
      case 'requirements':
        const updatedRequirementsDatasets = requirementsDatasets.filter((_, i) => i !== index);
        setRequirementsDatasets(updatedRequirementsDatasets);
        localStorage.setItem('requirementsDatasets', JSON.stringify(updatedRequirementsDatasets));
        break;
    }
  };

  const toggleDatasetSelection = (dataset: Dataset) => {
    const isSelected = selectedDatasets.some(d => d.company === dataset.company);
    let updatedSelection: Dataset[];

    if (isSelected) {
      updatedSelection = selectedDatasets.filter(d => d.company !== dataset.company);
    } else {
      updatedSelection = [...selectedDatasets, dataset];
    }

    onSelect(updatedSelection);
  };

  const currentDatasets = getCurrentDatasets();

  return (
    <div className="space-y-4">
      <div className="flex space-x-4 mb-4">
        <button
          onClick={() => setActiveTab('recruiter')}
          className={`px-4 py-2 rounded-md ${
            activeTab === 'recruiter'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          採用担当者
        </button>
        <button
          onClick={() => setActiveTab('position')}
          className={`px-4 py-2 rounded-md ${
            activeTab === 'position'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          スカウトポジション
        </button>
        <button
          onClick={() => setActiveTab('requirements')}
          className={`px-4 py-2 rounded-md ${
            activeTab === 'requirements'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          企業要件
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {activeTab === 'recruiter' 
            ? '採用担当者データセット' 
            : activeTab === 'position'
              ? 'スカウトポジションデータセット'
              : '企業要件データセット'}
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">企業名 <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={newDataset.company}
              onChange={(e) => setNewDataset({ ...newDataset, company: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="企業名を入力"
            />
          </div>

          {activeTab === 'requirements' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">企業要件 <span className="text-red-500">*</span></label>
              <textarea
                value={newDataset.requirements}
                onChange={(e) => setNewDataset({ ...newDataset, requirements: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                rows={3}
                placeholder="企業要件を入力"
              />
            </div>
          )}

          {activeTab === 'recruiter' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">採用担当者名（漢字） <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={newDataset.sender}
                  onChange={(e) => setNewDataset({ ...newDataset, sender: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="例：中野太郎"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">採用担当者名（カタカナ） <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={newDataset.senderKana}
                  onChange={(e) => setNewDataset({ ...newDataset, senderKana: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="例：ナカノタロウ"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">採用担当者氏名（English Name）</label>
                <input
                  type="text"
                  value={newDataset.senderEnglish}
                  onChange={(e) => setNewDataset({ ...newDataset, senderEnglish: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Sample: Nakano Taro"
                />
              </div>
            </>
          )}

          {activeTab === 'position' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">スカウトポジション <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={newDataset.position}
                  onChange={(e) => setNewDataset({ ...newDataset, position: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="スカウトポジションを入力"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">グループ名</label>
                <input
                  type="text"
                  value={newDataset.groupName}
                  onChange={(e) => setNewDataset({ ...newDataset, groupName: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="グループ名を入力"
                />
              </div>
            </>
          )}

          <button
            onClick={saveDataset}
            className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            データセットを保存
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">保存済みデータセット</h3>
        <div className="space-y-2">
          {currentDatasets.map((dataset, index) => (
            <div
              key={index}
              className={`p-3 rounded-md border transition-all duration-300 ${
                selectedDatasets.some(d => d.company === dataset.company)
                  ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 shadow-md'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedDatasets.some(d => d.company === dataset.company)}
                    onChange={() => toggleDatasetSelection(dataset)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors duration-200"
                  />
                  <div>
                    <h4 className="font-medium text-gray-900">{dataset.company}</h4>
                    {activeTab === 'recruiter' && (
                      <p className="text-sm text-gray-500 mt-1">
                        {dataset.sender} ({dataset.senderKana})
                      </p>
                    )}
                    {activeTab === 'position' && (
                      <p className="text-sm text-gray-500 mt-1">
                        {dataset.position}
                      </p>
                    )}
                    {activeTab === 'requirements' && (
                      <div className="mt-2">
                        <h5 className="text-sm font-medium text-gray-700">企業要件</h5>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {dataset.requirements}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => deleteDataset(index)}
                  className="text-red-600 hover:text-red-800 text-sm transition-colors duration-200"
                >
                  削除
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 