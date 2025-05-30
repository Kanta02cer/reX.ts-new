# reX.ts - AI採用スクリーニングシステム

> 企業向けAI採用支援プラットフォーム：効率的な候補者スクリーニングと客観的評価を実現

## 🚀 主要機能

### ✨ 核心機能
- **高度なCSVデータ処理** - 柔軟なカラム選択システム
- **手動候補者入力** - Webフォームでの直接入力対応
- **AI分析エンジン** - Gemini APIによる高精度評価
- **モバイル完全対応** - レスポンシブデザイン
- **リアルタイム結果表示** - 検索・フィルタリング機能

### 📊 業務課題解決
1. **大量応募の効率的スクリーニング** - バッチ処理で一括分析
2. **客観的評価基準** - AIによる標準化された評価
3. **スカウトメッセージ自動生成** - 個別最適化されたメッセージ
4. **構造化分析レポート** - 詳細な評価理由と改善提案

## 🛠 技術スタック

### フロントエンド
- **Next.js 14** - React基盤のフルスタックフレームワーク
- **TypeScript** - 型安全性の確保
- **Tailwind CSS** - 効率的なスタイリング
- **React Icons** - アイコンライブラリ

### バックエンド
- **Next.js API Routes** - サーバーサイド処理
- **Gemini AI API** - Google製生成AI
- **PapaParse** - CSV処理ライブラリ

### 開発・デプロイ
- **Vercel** - 本番環境デプロイ
- **Node.js** - ランタイム環境

## 📦 セットアップ

### 前提条件
- Node.js 18.0以上
- npm または yarn
- Gemini API キー（Google AI Studio）

### インストール手順

1. **リポジトリのクローン**
```bash
git clone <repository-url>
cd reX.ts-new
```

2. **依存関係のインストール**
```bash
npm install
```

3. **環境変数の設定**
```bash
cp .env.example .env.local
```

`.env.local`を編集してAPIキーを設定：
```env
NEXT_PUBLIC_GEMINI_API_KEY=your_actual_api_key_here
USE_MOCK_API=false  # 実際のAI分析を使用する場合
```

4. **開発サーバーの起動**
```bash
npm run dev
```

ブラウザで `http://localhost:3000` にアクセス

## 🎯 使用方法

### 基本フロー

1. **データ入力方法選択**
   - CSVファイルアップロード
   - 手動入力フォーム

2. **カラム選択（CSV使用時）**
   - 候補者名、ID、スキル、その他情報の役割設定
   - プレビュー機能で確認

3. **求人要件設定**
   - 企業名、ポジション名
   - 詳細要件の記述
   - 担当者情報

4. **AI分析実行**
   - 自動的な候補者評価
   - スコアリングと判定

5. **結果確認・活用**
   - 詳細な分析結果表示
   - フィルタリング・検索
   - CSV出力
   - スカウトメッセージコピー

### CSV形式について

#### 推奨フォーマット
```csv
name,skills,experience,education,additional_info
田中太郎,"JavaScript,React,Node.js",5年,大学卒業,フロントエンド開発経験
佐藤花子,"Python,Django,AWS",3年,修士課程,クラウド開発経験
```

#### 重要事項
- 1行目は必ずヘッダー行
- UTF-8エンコーディング
- カンマ区切り形式
- 複数スキルはカンマまたは「・」で区切り

## 🏗 アーキテクチャ

### ディレクトリ構造
```
reX.ts-new/
├── app/                    # Next.js App Router
│   ├── api/               # APIエンドポイント
│   │   ├── health/        # ヘルスチェック
│   │   └── process/       # メイン分析処理
│   ├── page.tsx           # メインページ
│   └── layout.tsx         # 共通レイアウト
├── components/            # Reactコンポーネント
│   ├── CSVColumnSelector.tsx      # カラム選択UI
│   ├── EnhancedResultsDisplay.tsx # 結果表示
│   ├── FileUpload.tsx             # ファイルアップロード
│   ├── ApplicantForm.tsx          # 申請者フォーム
│   └── Dashboard.tsx              # ダッシュボード
├── lib/                   # ユーティリティ・ロジック
│   ├── csvProcessor.ts    # CSV処理エンジン
│   ├── mockAnalyzer.ts    # モック分析システム
│   ├── advancedAnalyzer.ts # 高度分析エンジン
│   ├── database.ts        # データ管理システム
│   └── types.ts           # TypeScript型定義
└── public/                # 静的ファイル
```

### データフロー
1. **入力** → CSV/フォーム → 標準化処理
2. **処理** → AI分析 → スコアリング
3. **出力** → 構造化結果 → UI表示

## 📈 機能詳細

### AI分析機能
- **スキル適合度評価** (40%重み)
- **経験年数評価** (30%重み)  
- **学歴評価** (20%重み)
- **年収適合度** (10%重み)
- **総合判定** - 合格/要検討/不合格

### 結果表示機能
- **リアルタイム検索** - 名前・評価理由
- **高度フィルタリング** - ステータス別表示
- **ソート機能** - スコア順・名前順
- **CSV出力** - 結果データダウンロード
- **スカウトメッセージ** - ワンクリックコピー

### モバイル対応
- **レスポンシブデザイン** - 全デバイス対応
- **タッチ操作最適化** - スマートフォン・タブレット
- **高速表示** - パフォーマンス最適化

## 🔧 カスタマイズ

### 評価基準の調整
`lib/database.ts`の`defaultEvaluationCriteria`を編集：

```typescript
export const defaultEvaluationCriteria: EvaluationCriteria = {
  skillsWeight: 50,      // スキル重要度を50%に変更
  experienceWeight: 30,  // 経験重要度
  educationWeight: 15,   // 学歴重要度
  salaryWeight: 5,       // 年収重要度
  customCriteria: []     // カスタム基準
};
```

### モック/本番切り替え
`.env.local`で制御：
```env
USE_MOCK_API=true   # モック分析を使用
USE_MOCK_API=false  # 実際のGemini APIを使用
```

## 🚀 本番デプロイ

### Vercelデプロイ
1. Vercelアカウント作成
2. GitHub連携
3. 環境変数設定
4. 自動デプロイ

### 環境変数（本番）
```env
NEXT_PUBLIC_GEMINI_API_KEY=本番用APIキー
USE_MOCK_API=false
NODE_ENV=production
```

## 🤝 貢献

### 開発参加
1. Fork作成
2. フィーチャーブランチ作成
3. 変更実装
4. プルリクエスト作成

### バグレポート
- GitHub Issuesを使用
- 再現手順の詳細記載
- 環境情報の提供

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 🆘 サポート

### よくある質問

**Q: Gemini APIキーの取得方法は？**
A: Google AI Studio (https://ai.google.dev/) でAPIキーを取得してください。

**Q: CSVファイルが読み込めない**
A: UTF-8エンコーディング、ヘッダー行の存在を確認してください。

**Q: モバイルで操作が困難**
A: 最新のブラウザを使用し、画面の向きを確認してください。

### 技術サポート
- GitHub Issues
- ドキュメント: [プロジェクトWiki]
- 開発者: [連絡先情報]

---

**reX.ts** - Making recruitment more intelligent and efficient 🚀
