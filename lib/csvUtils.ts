/**
 * CSVファイルを解析して配列に変換する
 * @param csvText CSVテキスト
 * @returns 行と列に分割された2次元配列
 */
export function parseCSV(csvText: string): string[][] {
  try {
    // 行に分割（CRLFとLFの両方に対応）
    const rows = csvText.split(/\r?\n/).filter(row => row.trim() !== '');
    
    if (rows.length === 0) {
      console.warn('CSVファイルが空です');
      return [];
    }
    
    // 各行をカンマで分割（ダブルクォートで囲まれたカンマは除外）
    return rows.map((row, index) => {
      const cells: string[] = [];
      let inQuotes = false;
      let currentCell = '';
      
      for (let i = 0; i < row.length; i++) {
        const char = row[i];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          cells.push(currentCell.trim());
          currentCell = '';
        } else {
          currentCell += char;
        }
      }
      
      // 最後のセルを追加
      cells.push(currentCell.trim());
      
      // ヘッダー行の列数と一致するか確認
      if (index === 0) {
        console.log(`ヘッダー行の列数: ${cells.length}`);
      } else if (cells.length !== rows[0].split(',').length) {
        console.warn(`行 ${index + 1} の列数がヘッダー行と一致しません`);
      }
      
      return cells;
    });
  } catch (error) {
    console.error('CSVパースエラー:', error);
    throw new Error('CSVファイルの解析に失敗しました');
  }
}

/**
 * CSVデータからヘッダー行を取得する
 * @param csvData CSV2次元配列
 * @returns ヘッダー行
 */
export function getCSVHeaders(csvData: string[][]): string[] {
  if (csvData.length === 0) return [];
  return csvData[0];
}

/**
 * CSVデータから指定した列のデータを取得する
 * @param csvData CSV2次元配列
 * @param columnName 列名
 * @returns 指定した列のデータ配列
 */
export function getColumnData(csvData: string[][], columnName: string): string[] {
  if (csvData.length < 2) return [];
  
  const headers = csvData[0];
  const columnIndex = headers.findIndex(header => header === columnName);
  
  if (columnIndex === -1) return [];
  
  return csvData.slice(1).map(row => row[columnIndex] || '');
}

/**
 * CSVデータから各行をオブジェクトに変換する
 * @param csvData CSV2次元配列
 * @returns オブジェクトの配列
 */
export function csvToObjects(csvData: string[][]): Record<string, string>[] {
  if (csvData.length < 2) return [];
  
  const headers = csvData[0];
  
  return csvData.slice(1).map(row => {
    const obj: Record<string, string> = {};
    
    headers.forEach((header, index) => {
      obj[header] = row[index] || '';
    });
    
    return obj;
  });
}

/**
 * CSVファイルをJavaScriptで読み込む
 * @param file CSVファイル
 * @returns CSV内容のPromise
 */
export function readCSVFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        if (!event.target?.result) {
          throw new Error('ファイルの読み込みに失敗しました');
        }
        
        // 文字エンコーディングの自動判定
        const content = event.target.result as string;
        const encoding = detectEncoding(content);
        console.log(`検出されたエンコーディング: ${encoding}`);
        
        resolve(content);
      } catch (error) {
        console.error('ファイル読み込みエラー:', error);
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      console.error('FileReaderエラー:', error);
      reject(new Error('ファイルの読み込み中にエラーが発生しました'));
    };
    
    // UTF-8で読み込みを試みる
    reader.readAsText(file, 'UTF-8');
  });
}

/**
 * 文字列のエンコーディングを判定する
 * @param text 判定する文字列
 * @returns 検出されたエンコーディング
 */
function detectEncoding(text: string): string {
  // BOMの確認
  if (text.startsWith('\uFEFF')) {
    return 'UTF-8 with BOM';
  }
  
  // 文字化けの可能性をチェック
  const hasInvalidChars = /[\uFFFD\uFFFE\uFFFF]/.test(text);
  if (hasInvalidChars) {
    return 'Unknown (possibly corrupted)';
  }
  
  return 'UTF-8';
} 