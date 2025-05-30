// エラーハンドリングとログ管理システム
// reX.ts用の包括的エラー管理

export enum ErrorType {
  VALIDATION = 'VALIDATION',
  FILE_PROCESSING = 'FILE_PROCESSING',
  API_ERROR = 'API_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  SYSTEM_ERROR = 'SYSTEM_ERROR',
  USER_ERROR = 'USER_ERROR'
}

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface ErrorInfo {
  id: string;
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  code?: string;
  timestamp: string;
  stack?: string;
  context?: any;
  httpStatus?: number;
  requestId?: string;
  userId?: string;
  userAgent?: string;
  url?: string;
}

export interface ErrorGuide {
  title: string;
  description: string;
  solutions: string[];
  preventionTips?: string[];
  relatedLinks?: { title: string; url: string }[];
}

// エラー処理クラス
export class ReXError extends Error {
  public readonly type: ErrorType;
  public readonly severity: ErrorSeverity;
  public readonly code?: string;
  public readonly context?: any;
  public readonly httpStatus?: number;
  public readonly requestId?: string;

  constructor(
    message: string,
    type: ErrorType = ErrorType.SYSTEM_ERROR,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    options: {
      code?: string;
      context?: any;
      httpStatus?: number;
      requestId?: string;
      cause?: Error;
    } = {}
  ) {
    super(message);
    this.name = 'ReXError';
    this.type = type;
    this.severity = severity;
    this.code = options.code;
    this.context = options.context;
    this.httpStatus = options.httpStatus;
    this.requestId = options.requestId;

    if (options.cause) {
      this.stack = options.cause.stack;
    }
  }

  toErrorInfo(): ErrorInfo {
    return {
      id: this.requestId || `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: this.type,
      severity: this.severity,
      message: this.message,
      code: this.code,
      timestamp: new Date().toISOString(),
      stack: this.stack,
      context: this.context,
      httpStatus: this.httpStatus,
      requestId: this.requestId
    };
  }
}

// エラーガイドマップ
export const ERROR_GUIDES: Record<string, ErrorGuide> = {
  CSV_PARSING_ERROR: {
    title: 'CSVファイルの解析エラー',
    description: 'アップロードされたCSVファイルの形式に問題があります。',
    solutions: [
      'ファイルがUTF-8エンコーディングで保存されているか確認してください',
      '1行目にヘッダー行（カラム名）が含まれているか確認してください',
      'カンマ区切り形式で保存されているか確認してください',
      'ファイルサイズが10MB以下であることを確認してください'
    ],
    preventionTips: [
      'Excelで保存する際は「CSV UTF-8（カンマ区切り）」を選択',
      'テキストエディタで内容を確認してから保存',
      '特殊文字や改行が含まれていないか確認'
    ],
    relatedLinks: [
      { title: 'CSV形式ガイド', url: '/docs/csv-format' },
      { title: 'エンコーディング設定', url: '/docs/encoding' }
    ]
  },

  GEMINI_API_ERROR: {
    title: 'AI分析エラー',
    description: 'Gemini AIとの通信でエラーが発生しました。',
    solutions: [
      'APIキーが正しく設定されているか確認してください',
      'ネットワーク接続を確認してください',
      'しばらく時間をおいて再度お試しください',
      '入力データの量を減らして再度お試しください'
    ],
    preventionTips: [
      'APIキーの有効期限を定期的に確認',
      '大量データは小分けして処理',
      'API使用制限を監視'
    ]
  },

  VALIDATION_ERROR: {
    title: '入力検証エラー',
    description: '入力されたデータに不備があります。',
    solutions: [
      '必須項目がすべて入力されているか確認してください',
      '文字数制限を超えていないか確認してください',
      '適切な形式で入力されているか確認してください'
    ],
    preventionTips: [
      '入力前にフォームガイドを確認',
      '自動保存機能を活用',
      'サンプルデータで動作確認'
    ]
  },

  NETWORK_ERROR: {
    title: 'ネットワークエラー',
    description: 'インターネット接続に問題があります。',
    solutions: [
      'インターネット接続を確認してください',
      'VPNを使用している場合は一時的に無効にしてください',
      'ブラウザを再起動してください',
      'しばらく時間をおいて再度お試しください'
    ],
    preventionTips: [
      '安定したネットワーク環境で使用',
      'ファイアウォール設定の確認',
      'プロキシ設定の確認'
    ]
  },

  FILE_SIZE_ERROR: {
    title: 'ファイルサイズエラー',
    description: 'アップロードされたファイルのサイズが制限を超えています。',
    solutions: [
      'ファイルサイズを10MB以下に削減してください',
      '不要な列やデータを削除してください',
      'データを複数のファイルに分割してください'
    ],
    preventionTips: [
      'アップロード前にファイルサイズを確認',
      '必要最小限のデータのみを含める',
      '画像や添付ファイルは除外'
    ]
  },

  COLUMN_MAPPING_ERROR: {
    title: 'カラムマッピングエラー',
    description: 'CSVのカラム設定に問題があります。',
    solutions: [
      '必須カラム（名前）が正しく選択されているか確認してください',
      'カラムの役割設定を見直してください',
      'データプレビューで内容を確認してください'
    ],
    preventionTips: [
      'カラム選択時にプレビューを活用',
      '推奨選択機能を使用',
      'サンプルデータで動作確認'
    ]
  }
};

// エラーログ管理
export class ErrorLogger {
  private static logs: ErrorInfo[] = [];
  private static readonly MAX_LOGS = 1000;
  private static readonly STORAGE_KEY = 'reX_error_logs';

  static log(error: ReXError | Error | ErrorInfo, context?: any): void {
    let errorInfo: ErrorInfo;

    if (error instanceof ReXError) {
      errorInfo = error.toErrorInfo();
    } else if (error instanceof Error) {
      errorInfo = {
        id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: ErrorType.SYSTEM_ERROR,
        severity: ErrorSeverity.MEDIUM,
        message: error.message,
        timestamp: new Date().toISOString(),
        stack: error.stack,
        context
      };
    } else {
      errorInfo = error;
    }

    // ログに追加
    this.logs.unshift(errorInfo);
    if (this.logs.length > this.MAX_LOGS) {
      this.logs = this.logs.slice(0, this.MAX_LOGS);
    }

    // ローカルストレージに保存
    this.saveToStorage();

    // 重要度が高い場合はコンソールにも出力
    if (errorInfo.severity === ErrorSeverity.HIGH || errorInfo.severity === ErrorSeverity.CRITICAL) {
      console.error('ReX Critical Error:', errorInfo);
    }

    // 開発環境では詳細情報をコンソールに出力
    if (process.env.NODE_ENV === 'development') {
      console.warn('ReX Error Logged:', errorInfo);
    }
  }

  static getLogs(filter?: {
    type?: ErrorType;
    severity?: ErrorSeverity;
    limit?: number;
    since?: string;
  }): ErrorInfo[] {
    let filteredLogs = [...this.logs];

    if (filter) {
      if (filter.type) {
        filteredLogs = filteredLogs.filter(log => log.type === filter.type);
      }
      if (filter.severity) {
        filteredLogs = filteredLogs.filter(log => log.severity === filter.severity);
      }
      if (filter.since) {
        const sinceDate = new Date(filter.since);
        filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= sinceDate);
      }
      if (filter.limit) {
        filteredLogs = filteredLogs.slice(0, filter.limit);
      }
    }

    return filteredLogs;
  }

  static getStats(): {
    total: number;
    byType: Record<ErrorType, number>;
    bySeverity: Record<ErrorSeverity, number>;
    last24Hours: number;
  } {
    const stats = {
      total: this.logs.length,
      byType: {} as Record<ErrorType, number>,
      bySeverity: {} as Record<ErrorSeverity, number>,
      last24Hours: 0
    };

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    this.logs.forEach(log => {
      // 種類別カウント
      stats.byType[log.type] = (stats.byType[log.type] || 0) + 1;
      
      // 重要度別カウント
      stats.bySeverity[log.severity] = (stats.bySeverity[log.severity] || 0) + 1;
      
      // 24時間以内のエラー
      if (new Date(log.timestamp) >= oneDayAgo) {
        stats.last24Hours++;
      }
    });

    return stats;
  }

  static clearLogs(): void {
    this.logs = [];
    this.saveToStorage();
  }

  private static saveToStorage(): void {
    try {
      const logsToSave = this.logs.slice(0, 100); // 最新100件のみ保存
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(logsToSave));
    } catch (error) {
      console.warn('エラーログの保存に失敗:', error);
    }
  }

  private static loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('エラーログの読み込みに失敗:', error);
      this.logs = [];
    }
  }

  // 初期化時にストレージからログを読み込み
  static initialize(): void {
    this.loadFromStorage();
  }
}

// ユーティリティ関数
export function getErrorGuide(code?: string): ErrorGuide | null {
  if (!code) return null;
  return ERROR_GUIDES[code] || null;
}

export function formatErrorForUser(error: ReXError | Error): {
  message: string;
  guide?: ErrorGuide;
  severity: ErrorSeverity;
} {
  if (error instanceof ReXError) {
    return {
      message: error.message,
      guide: getErrorGuide(error.code) || undefined,
      severity: error.severity
    };
  }

  return {
    message: '予期しないエラーが発生しました。再度お試しください。',
    severity: ErrorSeverity.MEDIUM
  };
}

export function createApiError(
  message: string,
  httpStatus: number,
  code?: string,
  context?: any
): ReXError {
  return new ReXError(
    message,
    ErrorType.API_ERROR,
    httpStatus >= 500 ? ErrorSeverity.HIGH : ErrorSeverity.MEDIUM,
    {
      code,
      context,
      httpStatus,
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
  );
}

export function createValidationError(
  field: string,
  message: string,
  value?: any
): ReXError {
  return new ReXError(
    message,
    ErrorType.VALIDATION,
    ErrorSeverity.LOW,
    {
      code: 'VALIDATION_ERROR',
      context: { field, value }
    }
  );
}

export function createFileProcessingError(
  message: string,
  fileName?: string,
  fileSize?: number
): ReXError {
  return new ReXError(
    message,
    ErrorType.FILE_PROCESSING,
    ErrorSeverity.MEDIUM,
    {
      code: 'FILE_PROCESSING_ERROR',
      context: { fileName, fileSize }
    }
  );
}

// 初期化
if (typeof window !== 'undefined') {
  ErrorLogger.initialize();
} 