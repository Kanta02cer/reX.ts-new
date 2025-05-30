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

type ColumnRole = 'none' | 'name' | 'id' | 'skill' | 'additional';

interface ColumnSelectionState {
  selected: boolean;
  role: ColumnRole;
}

export default function CSVColumnSelector({ 
  columns, 
  onSelectionChange,
  onSelectionComplete, 
  onBack,
  initialSelection 
}: CSVColumnSelectorProps) {
  const [columnStates, setColumnStates] = useState<ColumnSelectionState[]>(() => {
    return columns.map((col, index) => {
      if (initialSelection) {
        // 既存の選択から状態を復元
        if (initialSelection.nameColumn === index) {
          return { selected: true, role: 'name' };
        }
        if (initialSelection.idColumn === index) {
          return { selected: true, role: 'id' };
        }
        if (initialSelection.skillColumns.includes(index)) {
          return { selected: true, role: 'skill' };
        }
        if (initialSelection.additionalColumns.includes(index)) {
          return { selected: true, role: 'additional' };
        }
      }
      
      // デフォルト状態の設定
      if (col.isNameColumn) {
        return { selected: true, role: 'name' };
      }
      if (col.isIdColumn) {
        return { selected: true, role: 'id' };
      }
      if (col.isSkillColumn) {
        return { selected: true, role: 'skill' };
      }
      
      return { selected: false, role: 'none' };
    });
  });

  // カラム状態から選択情報を生成
  const generateSelection = (): CSVColumnSelection => {
    const nameColumns = columnStates
      .map((state, index) => state.role === 'name' && state.selected ? index : -1)
      .filter(index => index !== -1);
    
    const idColumns = columnStates
      .map((state, index) => state.role === 'id' && state.selected ? index : -1)
      .filter(index => index !== -1);
    
    const skillColumns = columnStates
      .map((state, index) => state.role === 'skill' && state.selected ? index : -1)
      .filter(index => index !== -1);
    
    const additionalColumns = columnStates
      .map((state, index) => state.role === 'additional' && state.selected ? index : -1)
      .filter(index => index !== -1);

    return {
      nameColumn: nameColumns[0] ?? 0, // 最初の名前カラムを使用、なければ最初のカラム
      idColumn: idColumns[0], // 最初のIDカラムを使用
      skillColumns,
      additionalColumns
    };
  };

  useEffect(() => {
    const selection = generateSelection();
    if (onSelectionChange) {
      onSelectionChange(selection);
    }
  }, [columnStates, onSelectionChange]);

  const updateColumnState = (index: number, updates: Partial<ColumnSelectionState>) => {
    setColumnStates(prev => prev.map((state, i) => 
      i === index ? { ...state, ...updates } : state
    ));
  };

  const toggleColumnSelection = (index: number) => {
    const currentState = columnStates[index];
    if (currentState.selected) {
      // 選択解除
      updateColumnState(index, { selected: false, role: 'none' });
    } else {
      // 選択 - デフォルトの役割を設定
      const column = columns[index];
      let defaultRole: ColumnRole = 'additional';
      
      if (column.isNameColumn) defaultRole = 'name';
      else if (column.isIdColumn) defaultRole = 'id';
      else if (column.isSkillColumn) defaultRole = 'skill';
      
      updateColumnState(index, { selected: true, role: defaultRole });
    }
  };

  const changeColumnRole = (index: number, role: ColumnRole) => {
    if (role === 'none') {
      updateColumnState(index, { selected: false, role: 'none' });
    } else {
      updateColumnState(index, { selected: true, role });
    }
  };

  const getRoleLabel = (role: ColumnRole) => {
    switch (role) {
      case 'name': return '名前';
      case 'id': return 'ID';
      case 'skill': return 'スキル';
      case 'additional': return 'その他';
      default: return '未選択';
    }
  };

  const getRoleColor = (role: ColumnRole) => {
    switch (role) {
      case 'name': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'id': return 'bg-green-100 text-green-800 border-green-300';
      case 'skill': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'additional': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-50 text-gray-500 border-gray-200';
    }
  };

  const getRecommendedRole = (column: CSVColumnInfo): ColumnRole => {
    if (column.isNameColumn) return 'name';
    if (column.isIdColumn) return 'id';
    if (column.isSkillColumn) return 'skill';
    return 'additional';
  };

  const selection = generateSelection();
  const selectedColumns = columnStates.filter(state => state.selected);
  const nameColumnSelected = selectedColumns.some(state => state.role === 'name');
  const isValid = nameColumnSelected && selectedColumns.length > 0;

  const getSelectionSummary = () => {
    const nameCount = selectedColumns.filter(state => state.role === 'name').length;
    const idCount = selectedColumns.filter(state => state.role === 'id').length;
    const skillCount = selectedColumns.filter(state => state.role === 'skill').length;
    const additionalCount = selectedColumns.filter(state => state.role === 'additional').length;
    
    return { nameCount, idCount, skillCount, additionalCount, total: selectedColumns.length };
  };

  const summary = getSelectionSummary();

  const handleComplete = () => {
    if (onSelectionComplete && isValid) {
      onSelectionComplete(selection);
    }
  };

  const selectAll = () => {
    setColumnStates(prev => prev.map((state, index) => {
      const column = columns[index];
      return {
        selected: true,
        role: getRecommendedRole(column)
      };
    }));
  };

  const clearAll = () => {
    setColumnStates(prev => prev.map(() => ({ selected: false, role: 'none' as ColumnRole })));
  };

  const selectRecommended = () => {
    setColumnStates(prev => prev.map((state, index) => {
      const column = columns[index];
      const shouldSelect = column.isNameColumn || column.isIdColumn || column.isSkillColumn;
      return {
        selected: shouldSelect,
        role: shouldSelect ? getRecommendedRole(column) : 'none'
      };
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">カラム選択</h2>
          <p className="text-sm text-gray-500 mt-1">
            分析に使用するカラムを選択し、各カラムの役割を設定してください
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

      {/* クイック選択ボタン */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 mb-3">クイック選択</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={selectRecommended}
            className="inline-flex items-center px-3 py-1 border border-blue-300 rounded-md text-sm text-blue-700 bg-blue-50 hover:bg-blue-100"
          >
            <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            推奨選択
          </button>
          <button
            onClick={selectAll}
            className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50"
          >
            すべて選択
          </button>
          <button
            onClick={clearAll}
            className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50"
          >
            すべて解除
          </button>
        </div>
      </div>

      {/* 選択サマリー */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="text-sm font-medium text-blue-900 mb-2">選択サマリー</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{summary.total}</div>
            <div className="text-blue-700">総選択数</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{summary.nameCount}</div>
            <div className="text-blue-700">名前</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{summary.idCount}</div>
            <div className="text-green-700">ID</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{summary.skillCount}</div>
            <div className="text-purple-700">スキル</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">{summary.additionalCount}</div>
            <div className="text-gray-700">その他</div>
          </div>
        </div>
      </div>

      {/* カラム一覧 */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-900 flex items-center">
          利用可能なカラム
          <span className="ml-2 text-xs text-gray-500">({columns.length}個)</span>
        </h3>
        
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {columns.map((column, index) => {
            const state = columnStates[index];
            const recommendedRole = getRecommendedRole(column);
            const isRecommended = state.role === recommendedRole && recommendedRole !== 'additional';

            return (
              <div
                key={index}
                className={`p-3 border rounded-lg transition-all ${
                  state.selected
                    ? 'border-blue-300 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    {/* チェックボックス */}
                    <input
                      type="checkbox"
                      checked={state.selected}
                      onChange={() => toggleColumnSelection(index)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    
                    {/* カラム情報 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {column.name}
                        </h4>
                        {isRecommended && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            推奨
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate">
                        サンプル: {column.sampleData.slice(0, 2).join(', ')}
                        {column.sampleData.length > 2 && '...'}
                      </p>
                    </div>
                  </div>
                  
                  {/* 役割選択 */}
                  <div className="flex items-center space-x-2">
                    <select
                      value={state.selected ? state.role : 'none'}
                      onChange={(e) => changeColumnRole(index, e.target.value as ColumnRole)}
                      disabled={!state.selected}
                      className={`text-xs px-2 py-1 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                        state.selected 
                          ? 'bg-white border-gray-300' 
                          : 'bg-gray-100 border-gray-200 text-gray-400'
                      }`}
                    >
                      <option value="none">未選択</option>
                      <option value="name">名前</option>
                      <option value="id">ID</option>
                      <option value="skill">スキル</option>
                      <option value="additional">その他</option>
                    </select>
                    
                    {state.selected && (
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getRoleColor(state.role)}`}>
                        {getRoleLabel(state.role)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* バリデーション警告 */}
      {!isValid && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">設定が不完全です</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <ul className="list-disc list-inside">
                  {!nameColumnSelected && (
                    <li>名前カラムを少なくとも1つ選択してください</li>
                  )}
                  {selectedColumns.length === 0 && (
                    <li>少なくとも1つのカラムを選択してください</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* アクションボタン */}
      {onSelectionComplete && (
        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {summary.total > 0 ? (
              `${summary.total}個のカラムが選択されています`
            ) : (
              'カラムが選択されていません'
            )}
          </div>
          <button
            onClick={handleComplete}
            disabled={!isValid}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            次へ進む
            <svg className="ml-2 -mr-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
} 