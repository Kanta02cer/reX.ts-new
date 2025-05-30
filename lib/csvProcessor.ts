export interface ApplicantData {
  name: string;
  skills: string[];
  [key: string]: any; // その他の列データを保持
}

export interface ProcessedCSVData {
  [applicantId: string]: ApplicantData;
}

export interface CSVColumnInfo {
  index: number;
  name: string;
  sampleData: string[];
  isSkillColumn: boolean;
  isNameColumn: boolean;
  isIdColumn: boolean;
}

export interface CSVColumnSelection {
  nameColumn: number;
  idColumn?: number;
  skillColumns: number[];
  additionalColumns: number[];
}

// スキル情報を含む可能性のある列名のパターン
const SKILL_COLUMN_PATTERNS = [
  /スキル/i,
  /技術/i,
  /資格/i,
  /経験/i,
  /ability/i,
  /skill/i,
  /expertise/i,
  /proficiency/i,
  /competenc/i,
  /qualification/i
];

// 名前を含む可能性のある列名のパターン
const NAME_COLUMN_PATTERNS = [
  /氏名/i,
  /名前/i,
  /name/i,
  /姓名/i,
  /full.*name/i,
  /申請者名/i
];

// IDを含む可能性のある列名のパターン
const ID_COLUMN_PATTERNS = [
  /^id$/i,
  /申請者.*id/i,
  /candidate.*id/i,
  /user.*id/i,
  /識別子/i
];

// 列名がスキル情報を含むかどうかを判定
function isSkillColumn(columnName: string): boolean {
  return SKILL_COLUMN_PATTERNS.some(pattern => pattern.test(columnName));
}

// 列名が名前情報を含むかどうかを判定
function isNameColumn(columnName: string): boolean {
  return NAME_COLUMN_PATTERNS.some(pattern => pattern.test(columnName));
}

// 列名がID情報を含むかどうかを判定
function isIdColumn(columnName: string): boolean {
  return ID_COLUMN_PATTERNS.some(pattern => pattern.test(columnName));
}

// 文字列からスキル情報を抽出
function extractSkills(text: string): string[] {
  if (!text) return [];
  
  // 区切り文字のパターン（カンマ、読点、スラッシュ、セミコロンなど）
  const delimiters = /[,、/;]/;
  
  return text
    .split(delimiters)
    .map(skill => skill.trim())
    .filter(skill => skill !== '');
}

/**
 * CSVデータを解析してカラム情報を取得
 */
export function analyzeCSVColumns(csvText: string): CSVColumnInfo[] {
  try {
    const lines = csvText.trim().split(/\r?\n/);

    if (lines.length < 1) {
      throw new Error("CSVファイルが空または無効です。");
    }

    const header = lines[0].split(',').map(h => h.trim());
    const dataLines = lines.slice(1, Math.min(4, lines.length)); // 最大3行のサンプルデータ

    return header.map((columnName, index) => {
      const sampleData = dataLines
        .map(line => {
          const values = line.split(',');
          return values[index]?.trim() || '';
        })
        .filter(data => data !== '');

      return {
        index,
        name: columnName,
        sampleData: sampleData.slice(0, 3), // 最大3つのサンプル
        isSkillColumn: isSkillColumn(columnName),
        isNameColumn: isNameColumn(columnName),
        isIdColumn: isIdColumn(columnName)
      };
    });
  } catch (error) {
    console.error('CSV解析エラー:', error);
    throw new Error(`CSVファイルの解析に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
  }
}

/**
 * 指定されたカラム選択に基づいてCSVデータを処理
 */
export function processCSVDataWithSelection(
  csvText: string, 
  columnSelection: CSVColumnSelection
): ProcessedCSVData {
  try {
    const lines = csvText.trim().split(/\r?\n/);

    if (lines.length < 2) {
      throw new Error("CSVファイルにヘッダー行またはデータ行がありません。");
    }

    const header = lines[0].split(',').map(h => h.trim());
    
    // 選択された列のインデックスを検証
    const { nameColumn, idColumn, skillColumns, additionalColumns } = columnSelection;
    
    if (nameColumn < 0 || nameColumn >= header.length) {
      throw new Error("指定された名前列が無効です。");
    }

    if (idColumn !== undefined && (idColumn < 0 || idColumn >= header.length)) {
      throw new Error("指定されたID列が無効です。");
    }

    // 処理対象の列を特定
    const selectedColumns = new Set([
      nameColumn,
      ...(idColumn !== undefined ? [idColumn] : []),
      ...skillColumns,
      ...additionalColumns
    ]);

    console.log('選択されたカラム:', {
      total: header.length,
      selected: selectedColumns.size,
      nameColumn: header[nameColumn],
      idColumn: idColumn !== undefined ? header[idColumn] : '自動生成',
      skillColumns: skillColumns.map(i => header[i]),
      additionalColumns: additionalColumns.map(i => header[i])
    });

    const applicantsData: ProcessedCSVData = {};

    // データ行を処理
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim() === '') continue;

      const values = line.split(',');

      // IDの取得または生成
      let applicantId: string;
      if (idColumn !== undefined) {
        applicantId = values[idColumn]?.trim();
        if (!applicantId) {
          console.warn(`IDが空の行をスキップしました: 行 ${i + 1}`);
          continue;
        }
      } else {
        applicantId = `applicant_${i}`;
      }

      const applicantName = values[nameColumn]?.trim() || `申請者${i}`;
      
      // 選択された列のデータのみを保持
      const selectedData: { [key: string]: string } = {};
      selectedColumns.forEach(colIndex => {
        if (colIndex < header.length) {
          selectedData[header[colIndex]] = values[colIndex]?.trim() || '';
        }
      });

      // スキル情報を抽出（選択されたスキル列のみ）
      const allSkills: string[] = [];
      skillColumns.forEach(index => {
        if (index < values.length) {
          const skillsText = values[index]?.trim();
          if (skillsText) {
            allSkills.push(...extractSkills(skillsText));
          }
        }
      });

      applicantsData[applicantId] = {
        name: applicantName,
        skills: [...new Set(allSkills)], // 重複を除去
        ...selectedData // 選択された列データのみ保持
      };
    }

    console.log(`CSV処理完了: ${Object.keys(applicantsData).length}名の申請者データを処理しました`);
    return applicantsData;
  } catch (error) {
    console.error('CSV処理エラー:', error);
    throw new Error(`CSVデータの処理に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
  }
}

// 既存の関数は後方互換性のために保持
export function processCSVData(csvText: string): ProcessedCSVData {
  try {
    const columns = analyzeCSVColumns(csvText);
    
    // デフォルトの列選択を作成
    const nameColumnIndex = columns.findIndex(col => col.isNameColumn) !== -1 
      ? columns.findIndex(col => col.isNameColumn) 
      : 0;
    
    const idColumnIndex = columns.findIndex(col => col.isIdColumn);
    const skillColumnIndices = columns
      .filter(col => col.isSkillColumn)
      .map(col => col.index);
    
    const additionalColumnIndices = columns
      .filter((col, index) => 
        index !== nameColumnIndex && 
        index !== idColumnIndex && 
        !skillColumnIndices.includes(index)
      )
      .map(col => col.index);

    const columnSelection: CSVColumnSelection = {
      nameColumn: nameColumnIndex,
      idColumn: idColumnIndex !== -1 ? idColumnIndex : undefined,
      skillColumns: skillColumnIndices,
      additionalColumns: additionalColumnIndices
    };

    return processCSVDataWithSelection(csvText, columnSelection);
  } catch (error) {
    console.error('CSV処理エラー:', error);
    throw new Error(`CSVファイルの処理に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
  }
} 