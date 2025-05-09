# reX.ts プロジェクト

Google Gemini APIを活用した採用管理システムです。候補者の履歴書分析、パーソナライズされたスカウトメッセージの自動生成、採用に関する質問への回答など、採用プロセス全体をサポートします。

## デプロイURL
- フロントエンド: https://frontend-63713tcxx-kinouecertify-gmailcoms-projects.vercel.app/
- バックエンドAPI: https://backend-iqep5txo6-kinouecertify-gmailcoms-projects.vercel.app/
- GitHub Pages: https://kinouecertify-gmailcoms-projects.github.io/reX.ts/

## デプロイステータス
- ✅ フロントエンド: Vercelにデプロイ済み
- ✅ バックエンド: Vercelにデプロイ済み
- ✅ 接続エラー対応: タイムアウト検出と再試行機能を実装
- ✅ Vercel認証問題: GitHub Pagesによる代替デプロイを用意

## GitHub Pagesへのアクセス

### アクセス方法
1. ブラウザで以下のURLにアクセスしてください：
   https://kinouecertify-gmailcoms-projects.github.io/reX.ts/

2. 初回アクセス時は、GitHub認証が必要な場合があります。GitHubアカウントでログインしてください。

### 権限設定
プロジェクトへの閲覧・編集権限が必要な場合は、以下の手順で設定します：

1. リポジトリへのアクセス権限
   - リポジトリオーナーにGitHubユーザー名を共有してください
   - オーナーがリポジトリ設定の「Collaborators and teams」からユーザーを追加します

2. GitHub Pages設定の確認方法（管理者向け）
   - リポジトリの「Settings」タブを開く
   - 左側メニューの「Pages」を選択
   - Source が `gh-pages` ブランチに設定されていることを確認

3. デプロイ状況の確認
   - リポジトリの「Actions」タブでデプロイワークフローの実行状況を確認できます
   - 最新のデプロイが成功していれば、GitHub Pagesにアクセス可能です

### トラブルシューティング
GitHub Pagesへのアクセスに問題がある場合：
1. ブラウザのキャッシュをクリアしてリロード
2. 別のブラウザでアクセスを試行
3. VPN接続を使用している場合は一時的に無効化
4. リポジトリ管理者に連絡して権限を確認

## 環境変数
```
DOCKER_HUB_USERNAME=Kantacer02 
DOCKER_HUB_TOKEN=dckr_pat_F910MRUEKc1ncpGuJWwPafDt7Ek
GOOGLE_API_KEY=AIzaSyDosn3ybHfEAV66TsG1fVlTfNQ-itHSFAI
```

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

## 開発の進捗状況
1. プロジェクト構造の整理
   - フロントエンド(Next.js)とバックエンド(Express)の分離
   - GitHub Actions CI/CDの設定

2. バックエンド開発
   - Gemini API連携サービスの実装
   - キャリアデータ分析APIエンドポイントの実装
   - スカウトメッセージ生成APIエンドポイントの実装

3. フロントエンド開発
   - ナビゲーションコンポーネントの作成
   - ホームページの実装
   - キャリア分析ページの実装
   - スカウトメッセージ生成ページの実装
   - チャットインターフェースの改善

4. Gemini API連携
   - 複数のモデル(gemini-1.5-flash, gemini-1.5-pro, gemini-pro, gemini-pro-vision)に対応
   - エラーハンドリングの強化
   - プロンプトエンジニアリングの最適化

## トラブルシューティング
接続問題やデプロイエラーが発生した場合は、以下の対応を行ってください：

1. ネットワーク接続を確認
2. VPN設定を確認
3. API接続タイムアウトの設定を調整
4. フロントエンドの「再接続を試みる」ボタンを使用

詳細は「トラブルシューティングガイド.md」を参照してください。 