// データベース管理システム
// 現在はローカルストレージベースのシンプル実装
// 将来的にはPostgreSQL/MongoDB等への移行を想定

export interface User {
  id: string;
  email: string;
  companyName: string;
  industry: string;
  createdAt: string;
  lastLoginAt: string;
  subscription: 'free' | 'basic' | 'premium' | 'enterprise';
  settings: UserSettings;
}

export interface UserSettings {
  defaultEvaluationCriteria: EvaluationCriteria;
  notificationPreferences: NotificationSettings;
  dataRetentionDays: number;
  apiUsageLimit: number;
}

export interface EvaluationCriteria {
  skillsWeight: number;        // 0-100 (デフォルト: 40)
  experienceWeight: number;    // 0-100 (デフォルト: 30)
  educationWeight: number;     // 0-100 (デフォルト: 20)
  salaryWeight: number;        // 0-100 (デフォルト: 10)
  customCriteria: CustomCriterion[];
}

export interface CustomCriterion {
  id: string;
  name: string;
  weight: number;
  evaluationFunction: string; // JavaScript関数の文字列
}

export interface NotificationSettings {
  emailNotifications: boolean;
  analysisCompleteEmail: boolean;
  weeklyReports: boolean;
  criticalAlerts: boolean;
}

export interface AnalysisHistory {
  id: string;
  userId: string;
  jobTitle: string;
  companyName: string;
  requirements: string;
  candidateCount: number;
  passedCount: number;
  averageScore: number;
  createdAt: string;
  status: 'completed' | 'processing' | 'error';
  results: AnalysisResult[];
  metadata: AnalysisMetadata;
}

export interface AnalysisResult {
  candidateId: string;
  candidateName: string;
  status: 'passed' | 'consideration' | 'rejected';
  score: number;
  reasoning: string;
  scoutMessage: string;
  evaluationBreakdown: ScoreBreakdown;
}

export interface ScoreBreakdown {
  skillsScore: number;
  experienceScore: number;
  educationScore: number;
  salaryScore: number;
  customScores: { [criterionId: string]: number };
}

export interface AnalysisMetadata {
  processingTime: number;
  apiProvider: 'gemini' | 'mock';
  totalCost: number;
  qualityScore: number;
  version: string;
}

// ローカルストレージベースの簡易データベース
class LocalDatabase {
  private readonly USERS_KEY = 'reX_users';
  private readonly HISTORY_KEY = 'reX_analysis_history';
  private readonly SETTINGS_KEY = 'reX_user_settings';

  // ユーザー管理
  async createUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const users = this.getUsers();
    const user: User = {
      ...userData,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
    };
    
    users.push(user);
    this.saveUsers(users);
    return user;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const users = this.getUsers();
    return users.find(u => u.email === email) || null;
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === userId);
    
    if (index === -1) return null;
    
    users[index] = { ...users[index], ...updates };
    this.saveUsers(users);
    return users[index];
  }

  // 分析履歴管理
  async saveAnalysisHistory(history: Omit<AnalysisHistory, 'id' | 'createdAt'>): Promise<AnalysisHistory> {
    const histories = this.getAnalysisHistories();
    const record: AnalysisHistory = {
      ...history,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
    };
    
    histories.push(record);
    this.saveAnalysisHistories(histories);
    return record;
  }

  async getAnalysisHistory(userId: string, limit = 50, offset = 0): Promise<AnalysisHistory[]> {
    const histories = this.getAnalysisHistories();
    return histories
      .filter(h => h.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(offset, offset + limit);
  }

  async searchAnalysisHistory(
    userId: string, 
    query: string, 
    filters: {
      dateRange?: { start: string; end: string };
      status?: string;
      jobTitle?: string;
    } = {}
  ): Promise<AnalysisHistory[]> {
    const histories = this.getAnalysisHistories();
    
    return histories.filter(h => {
      if (h.userId !== userId) return false;
      
      if (query) {
        const searchText = `${h.jobTitle} ${h.companyName} ${h.requirements}`.toLowerCase();
        if (!searchText.includes(query.toLowerCase())) return false;
      }
      
      if (filters.status && h.status !== filters.status) return false;
      if (filters.jobTitle && !h.jobTitle.toLowerCase().includes(filters.jobTitle.toLowerCase())) return false;
      
      if (filters.dateRange) {
        const createdDate = new Date(h.createdAt);
        const startDate = new Date(filters.dateRange.start);
        const endDate = new Date(filters.dateRange.end);
        if (createdDate < startDate || createdDate > endDate) return false;
      }
      
      return true;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async deleteAnalysisHistory(userId: string, historyId: string): Promise<boolean> {
    const histories = this.getAnalysisHistories();
    const index = histories.findIndex(h => h.id === historyId && h.userId === userId);
    
    if (index === -1) return false;
    
    histories.splice(index, 1);
    this.saveAnalysisHistories(histories);
    return true;
  }

  // 統計データ
  async getUserStats(userId: string): Promise<{
    totalAnalyses: number;
    totalCandidates: number;
    averagePassRate: number;
    averageScore: number;
    monthlyUsage: { month: string; count: number }[];
    topJobTitles: { title: string; count: number }[];
  }> {
    const histories = this.getAnalysisHistories().filter(h => h.userId === userId);
    
    const totalAnalyses = histories.length;
    const totalCandidates = histories.reduce((sum, h) => sum + h.candidateCount, 0);
    const totalPassed = histories.reduce((sum, h) => sum + h.passedCount, 0);
    const averagePassRate = totalCandidates > 0 ? (totalPassed / totalCandidates) * 100 : 0;
    const averageScore = histories.reduce((sum, h) => sum + h.averageScore, 0) / totalAnalyses || 0;
    
    // 月別使用状況
    const monthlyUsage = this.getMonthlyUsage(histories);
    
    // 人気求人タイトル
    const jobTitleCounts = histories.reduce((acc, h) => {
      acc[h.jobTitle] = (acc[h.jobTitle] || 0) + 1;
      return acc;
    }, {} as { [title: string]: number });
    
    const topJobTitles = Object.entries(jobTitleCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([title, count]) => ({ title, count }));
    
    return {
      totalAnalyses,
      totalCandidates,
      averagePassRate,
      averageScore,
      monthlyUsage,
      topJobTitles
    };
  }

  // プライベートメソッド
  private getUsers(): User[] {
    try {
      const data = localStorage.getItem(this.USERS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveUsers(users: User[]): void {
    try {
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    } catch (error) {
      console.error('ユーザーデータの保存に失敗:', error);
    }
  }

  private getAnalysisHistories(): AnalysisHistory[] {
    try {
      const data = localStorage.getItem(this.HISTORY_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveAnalysisHistories(histories: AnalysisHistory[]): void {
    try {
      localStorage.setItem(this.HISTORY_KEY, JSON.stringify(histories));
    } catch (error) {
      console.error('分析履歴の保存に失敗:', error);
    }
  }

  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getMonthlyUsage(histories: AnalysisHistory[]): { month: string; count: number }[] {
    const monthCounts = histories.reduce((acc, h) => {
      const month = new Date(h.createdAt).toISOString().substr(0, 7); // YYYY-MM
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as { [month: string]: number });
    
    return Object.entries(monthCounts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({ month, count }));
  }
}

// セッション管理
class SessionManager {
  private readonly SESSION_KEY = 'reX_session';
  private readonly SESSION_DURATION = 24 * 60 * 60 * 1000; // 24時間

  setSession(user: User): void {
    const session = {
      userId: user.id,
      email: user.email,
      companyName: user.companyName,
      subscription: user.subscription,
      expiresAt: Date.now() + this.SESSION_DURATION
    };
    
    try {
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    } catch (error) {
      console.error('セッションの保存に失敗:', error);
    }
  }

  getSession(): { userId: string; email: string; companyName: string; subscription: string } | null {
    try {
      const data = localStorage.getItem(this.SESSION_KEY);
      if (!data) return null;
      
      const session = JSON.parse(data);
      if (Date.now() > session.expiresAt) {
        this.clearSession();
        return null;
      }
      
      return session;
    } catch {
      this.clearSession();
      return null;
    }
  }

  clearSession(): void {
    try {
      localStorage.removeItem(this.SESSION_KEY);
    } catch (error) {
      console.error('セッションのクリアに失敗:', error);
    }
  }

  isAuthenticated(): boolean {
    return this.getSession() !== null;
  }
}

// エクスポート
export const database = new LocalDatabase();
export const sessionManager = new SessionManager();

// デフォルト評価基準
export const defaultEvaluationCriteria: EvaluationCriteria = {
  skillsWeight: 40,
  experienceWeight: 30,
  educationWeight: 20,
  salaryWeight: 10,
  customCriteria: []
};

// デフォルト設定
export const defaultUserSettings: UserSettings = {
  defaultEvaluationCriteria,
  notificationPreferences: {
    emailNotifications: true,
    analysisCompleteEmail: true,
    weeklyReports: false,
    criticalAlerts: true
  },
  dataRetentionDays: 365,
  apiUsageLimit: 1000
}; 