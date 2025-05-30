// パフォーマンス最適化ユーティリティ
// reX.ts用のパフォーマンス向上機能

// バッチ処理のためのチャンク分割
export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

// 非同期処理のキューイング
export class AsyncQueue {
  private queue: (() => Promise<any>)[] = [];
  private processing = false;
  private concurrency: number;

  constructor(concurrency: number = 3) {
    this.concurrency = concurrency;
  }

  async add<T>(task: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await task();
          resolve(result);
          return result;
        } catch (error) {
          reject(error);
          throw error;
        }
      });

      this.process();
    });
  }

  private async process() {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;
    const concurrentTasks: Promise<any>[] = [];

    while (this.queue.length > 0 && concurrentTasks.length < this.concurrency) {
      const task = this.queue.shift();
      if (task) {
        concurrentTasks.push(
          task().catch((error) => {
            console.error('AsyncQueue task failed:', error);
          })
        );
      }
    }

    if (concurrentTasks.length > 0) {
      await Promise.allSettled(concurrentTasks);
    }

    this.processing = false;

    // 残りのタスクがある場合は再帰的に処理
    if (this.queue.length > 0) {
      setTimeout(() => this.process(), 0);
    }
  }
}

// Local Storage の安全な操作
export const safeLocalStorage = {
  setItem: (key: string, value: any): boolean => {
    if (typeof window === 'undefined') return false;
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn('LocalStorage write failed:', error);
      return false;
    }
  },

  getItem: <T>(key: string, defaultValue: T): T => {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn('LocalStorage read failed:', error);
      return defaultValue;
    }
  },

  removeItem: (key: string): boolean => {
    if (typeof window === 'undefined') return false;
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn('LocalStorage remove failed:', error);
      return false;
    }
  }
};

// CSVデータの最適化処理
export function optimizeCSVData(data: any[]): any[] {
  if (!Array.isArray(data) || data.length === 0) return data;

  return data.map(row => {
    const optimizedRow: any = {};
    
    Object.entries(row).forEach(([key, value]) => {
      // 空文字列や null を除外
      if (value !== null && value !== '' && value !== undefined) {
        // 文字列の場合は余分な空白を削除
        if (typeof value === 'string') {
          optimizedRow[key] = value.trim();
        } else {
          optimizedRow[key] = value;
        }
      }
    });
    
    return optimizedRow;
  });
}

// パフォーマンス監視
export class PerformanceMonitor {
  private static measurements: { [key: string]: number[] } = {};

  static start(label: string): string {
    const id = `${label}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    if (typeof performance !== 'undefined') {
      performance.mark(`${id}_start`);
    }
    return id;
  }

  static end(id: string): number {
    if (typeof performance === 'undefined') return 0;
    
    performance.mark(`${id}_end`);
    performance.measure(id, `${id}_start`, `${id}_end`);
    
    const measure = performance.getEntriesByName(id)[0];
    const duration = measure.duration;
    
    const label = id.split('_')[0];
    if (!this.measurements[label]) {
      this.measurements[label] = [];
    }
    this.measurements[label].push(duration);
    
    // 古い測定値を削除（最新100件のみ保持）
    if (this.measurements[label].length > 100) {
      this.measurements[label] = this.measurements[label].slice(-100);
    }
    
    return duration;
  }

  static getStats(label: string) {
    const measurements = this.measurements[label] || [];
    if (measurements.length === 0) return null;

    const sum = measurements.reduce((a, b) => a + b, 0);
    const avg = sum / measurements.length;
    const min = Math.min(...measurements);
    const max = Math.max(...measurements);
    
    return { avg, min, max, count: measurements.length };
  }

  static clear(label?: string) {
    if (label) {
      delete this.measurements[label];
    } else {
      this.measurements = {};
    }
  }
} 