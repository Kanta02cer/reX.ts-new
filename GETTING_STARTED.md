# 開発開始ガイド

このガイドでは、AI採用管理システムの開発を始めるための詳細な手順を説明します。

## 1. 環境準備

### 必要なツール
- **Node.js**: v18.x以上
- **npm**: v9.x以上
- **Git**: 最新版推奨

### 推奨開発環境
- **エディタ**: Visual Studio Code
- **ブラウザ**: Chrome（開発者ツール使用）

## 2. プロジェクトのセットアップ

### リポジトリのクローン
```bash
git clone <リポジトリURL>
cd ai-recruitment-system
```

### 依存パッケージのインストール

**フロントエンド**:
```bash
# プロジェクトルートディレクトリで
npm install
```

**バックエンド**:
```bash
cd backend
npm install
```

## 3. 環境変数の設定

### Google Gemini APIキーの取得
1. [Google AI Studio](https://aistudio.google.com/)にアクセス
2. アカウント登録/ログイン
3. API Keyのセクションから新しいAPIキーを生成
4. 生成されたキーをコピー

### 環境変数ファイルの作成

**フロントエンド** (プロジェクトルート):
```bash
# .env.local ファイルを作成
echo "NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api" > .env.local
```

**バックエンド** (/backend):
```bash
# .env ファイルを作成
cd backend
echo "PORT=3001\nGEMINI_API_KEY=your_gemini_api_key_here" > .env
```

※ `your_gemini_api_key_here` は実際のGemini APIキーに置き換えてください。

## 4. 開発サーバーの起動

### バックエンドサーバー
```bash
cd backend
npm run dev
```
バックエンドサーバーは http://localhost:3001 で起動します。

### フロントエンドサーバー
別のターミナルを開き、以下を実行:
```bash
# プロジェクトルートディレクトリで
npm run dev
```
フロントエンドは http://localhost:3000 で起動します。

## 5. 開発のヒント

### ディレクトリ構造
```
/
├── frontend/           # フロントエンドコード
│   ├── app/            # Next.js アプリケーション
│   ├── components/     # Reactコンポーネント
│   └── services/       # APIリクエスト処理
├── backend/            # バックエンドコード
│   ├── api/            # API エンドポイント
│   ├── gemini/         # Gemini API 連携
│   ├── services/       # ビジネスロジック
│   └── utils/          # ユーティリティ関数
└── .github/            # GitHub Actionsワークフロー
```

### テスト実行
**フロントエンドのテスト**:
```bash
npm test
```

**バックエンドのテスト**:
```bash
cd backend
npm test
```

### リント実行
```bash
npm run lint
```

### ビルド
```bash
npm run build
```

## 6. トラブルシューティング

### よくある問題

1. **APIキーが機能しない**:
   - キーが正しく環境変数ファイルに設定されているか確認
   - キーの有効期限が切れていないか確認

2. **ポートが使用中**:
   - `.env`ファイルでポート番号を変更
   - 既存のプロセスを終了: `npx kill-port 3000 3001`

3. **Node.jsバージョンの不一致**:
   - nodeバージョン管理ツール（nvm）を使用
   - package.jsonのエンジン指定を確認

### 開発ヘルプ
問題が解決しない場合は、GitHub Issuesを作成してください。 