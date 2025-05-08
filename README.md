# AI採用管理システム

Google Gemini APIを活用した採用管理システムです。候補者の履歴書分析、パーソナライズされたスカウトメッセージの自動生成、採用に関する質問への回答など、採用プロセス全体をサポートします。

## 機能

- **スカウトメッセージ生成**: 候補者情報と求人内容に基づいてパーソナライズされたスカウトメッセージを自動生成
- **キャリア分析**: 候補者の履歴書と職務経験を分析し、求人との適合性を評価
- **AIチャット**: 採用プロセスに関する質問に答えるAIアシスタント

## 技術スタック

- **フロントエンド**: React, Next.js, TypeScript, Tailwind CSS
- **バックエンド**: Node.js, Express
- **AI**: Google Gemini API

## セットアップ方法

### 必要なもの

- Node.js (v18以上)
- npm (v9以上)
- Google Gemini API キー

### インストール手順

1. リポジトリをクローン:
```
git clone <リポジトリURL>
cd ai-recruitment-system
```

2. フロントエンドの依存パッケージをインストール:
```
npm install
```

3. バックエンドの依存パッケージをインストール:
```
cd backend
npm install
cd ..
```

4. 環境変数の設定:

フロントエンドの `.env.local` ファイルを作成:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

バックエンドの `.env` ファイルを作成:
```
PORT=3001
GEMINI_API_KEY=your_gemini_api_key_here
```
※ `your_gemini_api_key_here` は実際のGemini APIキーに置き換えてください。

### 開発サーバーの起動

1. バックエンドサーバーを起動:
```
cd backend
npm run dev
```

2. 別のターミナルでフロントエンドサーバーを起動:
```
npm run dev
```

3. ブラウザで http://localhost:3000 にアクセス

## API エンドポイント

- `POST /api/analyze-career`: 経歴書の分析
- `POST /api/generate-scout-message`: スカウトメッセージの生成
- `POST /api/chat`: AIチャット

## 環境構築手順

1. Google AI StudioでGemini APIキーを取得
   - [Google AI Studio](https://aistudio.google.com/)にアクセス
   - APIキーを生成し、環境変数に設定

2. 開発環境のセットアップ
   - Node.jsとnpmをインストール
   - 依存パッケージをインストール
   - 環境変数を設定

## コントリビューション

プルリクエストやイシューは歓迎します。大きな変更を加える前には、まずイシューを開いて変更内容について議論してください。

## ライセンス

[MIT](https://choosealicense.com/licenses/mit/) 