"use client";
import { useState, useEffect } from 'react';
import { CSVColumnInfo, CSVColumnSelection } from '../lib/csvProcessor';

interface CSVColumnSelectorProps {
  columns: CSVColumnInfo[];
  onSelectionChange?: (selection: CSVColumnSelection) => void;
  onSelectionComplete?: (selection: CSVColumnSelection) => void;
  onBack?: () => void;
  initialSelection?: CSVColumnSelection;
}

export default function CSVColumnSelector({ 
  columns, 
  onSelectionChange,
  onSelectionComplete, 
  onBack,
  initialSelection 
}: CSVColumnSelectorProps) {
  const [selection, setSelection] = useState<CSVColumnSelection>(() => {
    if (initialSelection) return initialSelection;

    // デフォルト選択の作成
    const nameColumn = columns.findIndex(col => col.isNameColumn);
    const idColumn = columns.findIndex(col => col.isIdColumn);
    const skillColumns = columns
      .filter(col => col.isSkillColumn)
      .map(col => col.index);
    
    const additionalColumns = columns
      .filter((col, index) => 
        index !== (nameColumn !== -1 ? nameColumn : 0) && 
        index !== idColumn && 
        !skillColumns.includes(index)
      )
      .map(col => col.index);

    return {
      nameColumn: nameColumn !== -1 ? nameColumn : 0,
      idColumn: idColumn !== -1 ? idColumn : undefined,
      skillColumns,
      additionalColumns
    };
  });

  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(selection);
    }
  }, [selection, onSelectionChange]);

  const handleNameColumnChange = (columnIndex: number) => {
    setSelection(prev => ({ ...prev, nameColumn: columnIndex }));
  };

  const handleIdColumnChange = (columnIndex: number | undefined) => {
    setSelection(prev => ({ ...prev, idColumn: columnIndex }));
  };

  const handleSkillColumnToggle = (columnIndex: number) => {
    setSelection(prev => ({
      ...prev,
      skillColumns: prev.skillColumns.includes(columnIndex)
        ? prev.skillColumns.filter(i => i !== columnIndex)
        : [...prev.skillColumns, columnIndex]
    }));
  };

  const handleAdditionalColumnToggle = (columnIndex: number) => {
    setSelection(prev => ({
      ...prev,
      additionalColumns: prev.additionalColumns.includes(columnIndex)
        ? prev.additionalColumns.filter(i => i !== columnIndex)
        : [...prev.additionalColumns, columnIndex]
    }));
  };

  const getColumnTypeLabel = (column: CSVColumnInfo) => {
    if (column.isNameColumn) return '名前';
    if (column.isIdColumn) return 'ID';
    if (column.isSkillColumn) return 'スキル';
    return '一般';
  };

  const getColumnTypeColor = (column: CSVColumnInfo) => {
    if (column.isNameColumn) return 'bg-blue-100 text-blue-800';
    if (column.isIdColumn) return 'bg-green-100 text-green-800';
    if (column.isSkillColumn) return 'bg-purple-100 text-purple-800';
    return 'bg-gray-100 text-gray-800';
  };

  const isColumnSelected = (columnIndex: number) => {
    return (
      selection.nameColumn === columnIndex ||
      selection.idColumn === columnIndex ||
      selection.skillColumns.includes(columnIndex) ||
      selection.additionalColumns.includes(columnIndex)
    );
  };

  const getSelectedColumnsCount = () => {
    return (
      1 + // 名前列（必須）
      (selection.idColumn !== undefined ? 1 : 0) +
      selection.skillColumns.length +
      selection.additionalColumns.length
    );
  };

  const isNameColumnSelected = selection.nameColumn !== undefined;
  const hasRequiredColumns = isNameColumnSelected;

  const updateSelection = (newSelection: Partial<CSVColumnSelection>) => {
    const updated = { ...selection, ...newSelection };
    setSelection(updated);
  };

  const toggleIdColumn = (index: number) => {
    updateSelection({
      idColumn: selection.idColumn === index ? undefined : index
    });
  };

  const toggleSkillColumn = (index: number) => {
    const newSkillColumns = selection.skillColumns.includes(index)
      ? selection.skillColumns.filter(i => i !== index)
      : [...selection.skillColumns, index];
    updateSelection({ skillColumns: newSkillColumns });
  };

  const toggleAdditionalColumn = (index: number) => {
    const newAdditionalColumns = selection.additionalColumns.includes(index)
      ? selection.additionalColumns.filter(i => i !== index)
      : [...selection.additionalColumns, index];
    updateSelection({ additionalColumns: newAdditionalColumns });
  };

  const getColumnTypeText = (column: CSVColumnInfo) => {
    if (column.isNameColumn) return '名前列 (推奨)';
    if (column.isIdColumn) return 'ID列 (推奨)';
    if (column.isSkillColumn) return 'スキル列 (推奨)';
    return 'その他';
  };

  const getColumnBadgeColor = (column: CSVColumnInfo, isSelected: boolean) => {
    if (!isSelected) return 'bg-gray-100 text-gray-600';
    if (column.isNameColumn) return 'bg-blue-100 text-blue-800';
    if (column.isIdColumn) return 'bg-green-100 text-green-800';
    if (column.isSkillColumn) return 'bg-purple-100 text-purple-800';
    return 'bg-gray-100 text-gray-800';
  };

  const handleComplete = () => {
    if (onSelectionComplete && hasRequiredColumns) {
      onSelectionComplete(selection);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">カラム選択</h2>
          <p className="text-sm text-gray-500 mt-1">
            分析に使用するカラムを選択してください。名前列は必須です。
          </p>
        </div>
        {onBack && (
          <button
            onClick={onBack}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="mr-2 -ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
            </svg>
            戻る
          </button>
        )}
      </div>

      {/* 選択サマリー */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="text-sm font-medium text-blue-900 mb-2">選択サマリー</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-blue-700 font-medium">名前列:</span>
            <span className="ml-2 text-blue-800">
              {selection.nameColumn !== undefined ? columns[selection.nameColumn]?.name || '未選択' : '未選択'}
            </span>
          </div>
          <div>
            <span className="text-blue-700 font-medium">ID列:</span>
            <span className="ml-2 text-blue-800">
              {selection.idColumn !== undefined ? columns[selection.idColumn]?.name || '未選択' : '未選択'}
            </span>
          </div>
          <div>
            <span className="text-blue-700 font-medium">スキル列:</span>
            <span className="ml-2 text-blue-800">{selection.skillColumns.length}個</span>
          </div>
          <div>
            <span className="text-blue-700 font-medium">追加列:</span>
            <span className="ml-2 text-blue-800">{selection.additionalColumns.length}個</span>
          </div>
        </div>
      </div>

      {/* カラム一覧 */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-900">利用可能なカラム</h3>
        <div className="grid gap-3">
          {columns.map((column, index) => {
            const isNameColumn = selection.nameColumn === index;
            const isIdColumn = selection.idColumn === index;
            const isSkillColumn = selection.skillColumns.includes(index);
            const isAdditionalColumn = selection.additionalColumns.includes(index);
            const isSelected = isNameColumn || isIdColumn || isSkillColumn || isAdditionalColumn;

            return (
              <div
                key={index}
                className={`p-4 border rounded-lg transition-colors ${
                  isSelected
                    ? 'border-blue-300 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getColumnBadgeColor(column, isSelected)}`}>
                        {getColumnTypeText(column)}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{column.name}</h4>
                      <p className="text-xs text-gray-500">
                        サンプル: {column.sampleData.slice(0, 3).join(', ')}
                        {column.sampleData.length > 3 && '...'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {/* 名前列選択 */}
                    <button
                      onClick={() => updateSelection({ nameColumn: index })}
                      className={`px-3 py-1 text-xs font-medium rounded-md border ${
                        isNameColumn
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      名前
                    </button>
                    
                    {/* ID列選択 */}
                    <button
                      onClick={() => toggleIdColumn(index)}
                      className={`px-3 py-1 text-xs font-medium rounded-md border ${
                        isIdColumn
                          ? 'bg-green-600 text-white border-green-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      ID
                    </button>
                    
                    {/* スキル列選択 */}
                    <button
                      onClick={() => toggleSkillColumn(index)}
                      className={`px-3 py-1 text-xs font-medium rounded-md border ${
                        isSkillColumn
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      スキル
                    </button>
                    
                    {/* 追加列選択 */}
                    <button
                      onClick={() => toggleAdditionalColumn(index)}
                      className={`px-3 py-1 text-xs font-medium rounded-md border ${
                        isAdditionalColumn
                          ? 'bg-gray-600 text-white border-gray-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      追加
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* アクションボタン */}
      {onSelectionComplete && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleComplete}
            disabled={!hasRequiredColumns}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            次へ進む
            <svg className="ml-2 -mr-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      )}

      {!hasRequiredColumns && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">必須項目が選択されていません</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>名前列を選択してください。分析を実行するために必要です。</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 