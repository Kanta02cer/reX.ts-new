export interface ApplicantData {
  name: string;
  skills: string[];
  [key: string]: any; // その他の列データを保持
}

export interface ProcessedCSVData {
  [applicantId: string]: ApplicantData;
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
  /proficiency/i
];

// 列名がスキル情報を含むかどうかを判定
function isSkillColumn(columnName: string): boolean {
  return SKILL_COLUMN_PATTERNS.some(pattern => pattern.test(columnName));
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

export function processCSVData(csvText: string): ProcessedCSVData {
  const lines = csvText.trim().split(/\r?\n/);

  if (lines.length < 2) {
    throw new Error("CSVファイルにヘッダー行またはデータ行がありません。");
  }

  const header = lines[0].split(',').map(h => h.trim());
  
  // ID列と氏名列のインデックスを特定
  const idColumnIndex = header.indexOf('ID');
  const nameColumnIndex = header.indexOf('氏名');

  if (idColumnIndex === -1) {
    throw new Error("CSVファイルに 'ID' カラムが見つかりません。");
  }

  // スキル情報を含む可能性のある列のインデックスを特定
  const skillColumnIndices = header
    .map((colName, index) => ({ colName, index }))
    .filter(({ colName }) => isSkillColumn(colName))
    .map(({ index }) => index);

  if (skillColumnIndices.length === 0) {
    console.warn("スキル情報を含む列が見つかりませんでした。");
  }

  const applicantsData: ProcessedCSVData = {};

  // データ行を処理
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === '') continue;

    const values = line.split(',');

    const applicantId = values[idColumnIndex]?.trim();
    if (!applicantId) {
      console.warn(`IDが空の行をスキップしました: 行 ${i + 1}`);
      continue;
    }

    const applicantName = nameColumnIndex !== -1 ? values[nameColumnIndex]?.trim() : 'N/A';
    
    // すべての列のデータを保持
    const allData: { [key: string]: string } = {};
    header.forEach((colName, index) => {
      allData[colName] = values[index]?.trim() || '';
    });

    // スキル情報を抽出
    const allSkills: string[] = [];
    skillColumnIndices.forEach(index => {
      const skillsText = values[index]?.trim();
      if (skillsText) {
        allSkills.push(...extractSkills(skillsText));
      }
    });

    applicantsData[applicantId] = {
      name: applicantName,
      skills: [...new Set(allSkills)], // 重複を除去
      ...allData // その他の列データも保持
    };
  }

  return applicantsData;
} 