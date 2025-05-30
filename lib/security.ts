// セキュリティ強化ユーティリティ
// reX.ts用のセキュリティ向上機能

// 入力サニタイゼーション
export class InputSanitizer {
  // HTMLタグを除去
  static stripHtml(input: string): string {
    return input.replace(/<[^>]*>/g, '');
  }

  // 特殊文字をエスケープ
  static escapeHtml(input: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;'
    };
    return input.replace(/[&<>"'/]/g, (s) => map[s]);
  }

  // SQLインジェクション対策
  static escapeSql(input: string): string {
    return input.replace(/'/g, "''");
  }

  // CSVインジェクション対策
  static escapeCsv(input: string): string {
    // 危険な文字で始まる場合はシングルクォートを追加
    if (/^[=+\-@]/.test(input)) {
      return `'${input}`;
    }
    return input;
  }

  // ファイル名サニタイゼーション
  static sanitizeFilename(filename: string): string {
    return filename
      .replace(/[<>:"/\\|?*]/g, '_')
      .replace(/\.\./g, '_')
      .replace(/^\./, '_')
      .substring(0, 255);
  }

  // 包括的なサニタイゼーション
  static sanitizeInput(input: string, options: {
    stripHtml?: boolean;
    escapeHtml?: boolean;
    maxLength?: number;
    allowedChars?: RegExp;
  } = {}): string {
    let result = input.trim();

    if (options.stripHtml) {
      result = this.stripHtml(result);
    }

    if (options.escapeHtml) {
      result = this.escapeHtml(result);
    }

    if (options.maxLength) {
      result = result.substring(0, options.maxLength);
    }

    if (options.allowedChars) {
      result = result.replace(options.allowedChars, '');
    }

    return result;
  }
}

// レート制限管理
export class RateLimiter {
  private static requests: Map<string, number[]> = new Map();
  private static readonly cleanupInterval = 60000; // 1分
  private static cleanupTimer: NodeJS.Timeout | null = null;

  static init() {
    if (!this.cleanupTimer) {
      this.cleanupTimer = setInterval(() => {
        this.cleanup();
      }, this.cleanupInterval);
    }
  }

  static check(
    identifier: string,
    limit: number,
    windowMs: number = 60000
  ): { allowed: boolean; remainingRequests: number; resetTime: number } {
    const now = Date.now();
    const windowStart = now - windowMs;

    if (!this.requests.has(identifier)) {
      this.requests.set(identifier, []);
    }

    const userRequests = this.requests.get(identifier)!;
    
    // 古いリクエストを削除
    const validRequests = userRequests.filter(time => time > windowStart);
    
    const remainingRequests = Math.max(0, limit - validRequests.length);
    const allowed = remainingRequests > 0;

    if (allowed) {
      validRequests.push(now);
      this.requests.set(identifier, validRequests);
    }

    return {
      allowed,
      remainingRequests: allowed ? remainingRequests - 1 : 0,
      resetTime: windowStart + windowMs
    };
  }

  private static cleanup() {
    const now = Date.now();
    const cutoff = now - 3600000; // 1時間前

    for (const [identifier, requests] of this.requests.entries()) {
      const validRequests = requests.filter(time => time > cutoff);
      if (validRequests.length === 0) {
        this.requests.delete(identifier);
      } else {
        this.requests.set(identifier, validRequests);
      }
    }
  }

  static destroy() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.requests.clear();
  }
}

// データ暗号化（簡易版）
export class DataEncryption {
  private static readonly key = 'reX-ts-encryption-key-2024';

  // 簡易暗号化（Base64エンコーディング + XOR）
  static encrypt(data: string): string {
    try {
      const encrypted = data
        .split('')
        .map((char, index) => {
          const keyChar = this.key.charCodeAt(index % this.key.length);
          return String.fromCharCode(char.charCodeAt(0) ^ keyChar);
        })
        .join('');
      
      return btoa(encrypted);
    } catch (error) {
      console.warn('Encryption failed:', error);
      return data;
    }
  }

  // 簡易復号化
  static decrypt(encryptedData: string): string {
    try {
      const decoded = atob(encryptedData);
      return decoded
        .split('')
        .map((char, index) => {
          const keyChar = this.key.charCodeAt(index % this.key.length);
          return String.fromCharCode(char.charCodeAt(0) ^ keyChar);
        })
        .join('');
    } catch (error) {
      console.warn('Decryption failed:', error);
      return encryptedData;
    }
  }

  // ローカルストレージの暗号化保存
  static setSecureItem(key: string, value: any): boolean {
    try {
      const jsonString = JSON.stringify(value);
      const encrypted = this.encrypt(jsonString);
      localStorage.setItem(key, encrypted);
      return true;
    } catch (error) {
      console.warn('Secure storage failed:', error);
      return false;
    }
  }

  // ローカルストレージの暗号化読み取り
  static getSecureItem<T>(key: string, defaultValue: T): T {
    try {
      const encrypted = localStorage.getItem(key);
      if (!encrypted) return defaultValue;

      const decrypted = this.decrypt(encrypted);
      return JSON.parse(decrypted);
    } catch (error) {
      console.warn('Secure retrieval failed:', error);
      return defaultValue;
    }
  }
}

// セキュリティヘッダー管理
export class SecurityHeaders {
  static generateCSPHeader(): string {
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self' https://generativelanguage.googleapis.com",
      "frame-ancestors 'none'",
      "base-uri 'self'"
    ].join('; ');
  }

  static generateSecurityHeaders(): Record<string, string> {
    return {
      'Content-Security-Policy': this.generateCSPHeader(),
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
    };
  }
}

// 入力検証
export class InputValidator {
  // メールアドレス検証
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // URL検証
  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // ファイルタイプ検証
  static isValidFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.includes(file.type) || 
           allowedTypes.some(type => file.name.toLowerCase().endsWith(type));
  }

  // ファイルサイズ検証
  static isValidFileSize(file: File, maxSizeBytes: number): boolean {
    return file.size <= maxSizeBytes;
  }

  // 文字列長検証
  static isValidLength(value: string, min: number, max: number): boolean {
    return value.length >= min && value.length <= max;
  }

  // 特殊文字検証
  static containsOnlyAllowedChars(value: string, allowedChars: RegExp): boolean {
    return allowedChars.test(value);
  }

  // SQL/NoSQLインジェクション検出
  static detectSqlInjection(input: string): boolean {
    const sqlPatterns = [
      /(\bunion\b|\bselect\b|\bdrop\b|\binsert\b|\bupdate\b|\bdelete\b)/i,
      /(\bor\b|\band\b)\s+\w+\s*=\s*\w+/i,
      /['";]|--|\/\*/,
      /\bxp_\w+/i
    ];
    return sqlPatterns.some(pattern => pattern.test(input));
  }

  // XSS検出
  static detectXss(input: string): boolean {
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe\b/i,
      /<object\b/i,
      /<embed\b/i
    ];
    return xssPatterns.some(pattern => pattern.test(input));
  }

  // 包括的な入力検証
  static validate(input: string, rules: {
    maxLength?: number;
    minLength?: number;
    allowedChars?: RegExp;
    preventSqlInjection?: boolean;
    preventXss?: boolean;
    required?: boolean;
  } = {}): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (rules.required && !input.trim()) {
      errors.push('入力は必須です');
    }

    if (rules.minLength && input.length < rules.minLength) {
      errors.push(`最低${rules.minLength}文字必要です`);
    }

    if (rules.maxLength && input.length > rules.maxLength) {
      errors.push(`最大${rules.maxLength}文字までです`);
    }

    if (rules.allowedChars && !this.containsOnlyAllowedChars(input, rules.allowedChars)) {
      errors.push('許可されていない文字が含まれています');
    }

    if (rules.preventSqlInjection && this.detectSqlInjection(input)) {
      errors.push('不正なSQL文字列が検出されました');
    }

    if (rules.preventXss && this.detectXss(input)) {
      errors.push('不正なスクリプトが検出されました');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// セッション管理
export class SessionManager {
  private static readonly SESSION_KEY = 'reX_session';
  private static readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30分

  static createSession(userId: string): string {
    const sessionId = this.generateSessionId();
    const session = {
      id: sessionId,
      userId,
      createdAt: Date.now(),
      lastActivity: Date.now()
    };

    DataEncryption.setSecureItem(this.SESSION_KEY, session);
    return sessionId;
  }

  static validateSession(): boolean {
    const session: any = DataEncryption.getSecureItem(this.SESSION_KEY, null);
    if (!session) return false;

    const now = Date.now();
    if (now - session.lastActivity > this.SESSION_TIMEOUT) {
      this.destroySession();
      return false;
    }

    // アクティビティ時間を更新
    session.lastActivity = now;
    DataEncryption.setSecureItem(this.SESSION_KEY, session);
    return true;
  }

  static getSession(): any {
    return DataEncryption.getSecureItem(this.SESSION_KEY, null);
  }

  static destroySession(): void {
    localStorage.removeItem(this.SESSION_KEY);
  }

  private static generateSessionId(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
}

// 初期化
if (typeof window !== 'undefined') {
  RateLimiter.init();
} 