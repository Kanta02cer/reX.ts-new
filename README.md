# reX.ts プロジェクト

## プロジェクト概要

reX.tsは候補者のキャリア情報を分析し、採用条件と照らし合わせて採用可否を判断するAIシステムです。採用判断が「採用」となった候補者には、パーソナライズされたスカウト文章も自動生成します。

## 主な機能

1. **候補者分析と採用判断**（`/api/analyze-career`）
   - 候補者情報と採用条件を分析し、採用可否を判断
   - 結果をJSON形式で構造化

2. **スカウト文章生成**（`/api/generate-scout-message`）
   - 採用判断が「採用」の候補者のみスカウト文章を生成

3. **統合API**（`/api/analyze-and-scout`）
   - 分析から採用判断、スカウト文章生成までを一括処理

## 技術スタック

- **バックエンド**: Node.js, Express
- **フロントエンド**: Next.js, React, Tailwind CSS
- **AI**: Google Gemini API
- **デプロイ**: Vercel

## デプロイ情報

本プロジェクトはVercelにデプロイされています。

- **本番環境URL**: [https://rex-vector-7n05yc5pg-kinouecertify-gmailcoms-projects.vercel.app/](https://rex-vector-7n05yc5pg-kinouecertify-gmailcoms-projects.vercel.app/)

## ドキュメント一覧

- [APIドキュメント](./API_DOCUMENTATION.md) - APIの使用方法と仕様
- [実装レポート](./IMPLEMENTATION_REPORT.md) - 実装の詳細と意思決定
- [デプロイガイド](./デプロイガイド.md) - デプロイ手順の詳細
- [デプロイ確認手順書](./デプロイ確認手順書.md) - デプロイ後の動作確認手順
- [Vercelデプロイ確認レポート](./Vercelデプロイ確認レポート.md) - 最新のデプロイ状況

## 開発環境のセットアップ

```bash
# リポジトリのクローン
git clone https://github.com/Kanta02cer/reX.ts-new.git
cd reX.ts-new

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

## 環境変数

`.env.local`ファイルを作成し、以下の環境変数を設定してください：

```
GOOGLE_API_KEY=あなたのGemini APIキー
```

## ライセンス

MIT

## デプロイURL
- フロントエンド: https://frontend-63713tcxx-kinouecertify-gmailcoms-projects.vercel.app/
- バックエンドAPI: https://backend-iqep5txo6-kinouecertify-gmailcoms-projects.vercel.app/
- GitHub Pages: https://kinouecertify-gmailcoms-projects.github.io/reX.ts/

## デプロイステータス
- ✅ フロントエンド: Vercelにデプロイ済み（パブリックアクセス設定済み）
- ✅ バックエンド: Vercelにデプロイ済み（CORSとパブリックアクセス設定済み）
- ✅ 接続エラー対応: タイムアウト検出と再試行機能を実装
- ✅ Vercel認証問題: Vercel.jsonの設定を更新し、`public: true`を追加して認証なしでアクセス可能に設定
- ✅ パッケージ更新: Gemini API SDKを0.24.1に更新し、最新機能に対応
- ✅ CORS対策: すべてのオリジンからのリクエストを許可するよう設定

## 目次
1. [GitHub Pagesへのアクセス](#github-pagesへのアクセス)
2. [環境変数](#環境変数)
3. [機能](#機能)
4. [技術スタック](#技術スタック)
5. [開発環境のセットアップ](#開発環境のセットアップ)
6. [本番環境へのデプロイ](#本番環境へのデプロイ)
7. [API エンドポイント](#api-エンドポイント)
8. [トラブルシューティング](#トラブルシューティング)
9. [コントリビューション](#コントリビューション)
10. [ライセンス](#ライセンス)
11. [開発の進捗状況](#開発の進捗状況)

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

### GitHub Pagesのトラブルシューティング
GitHub Pagesへのアクセスに問題がある場合：
1. ブラウザのキャッシュをクリアしてリロード
2. 別のブラウザでアクセスを試行
3. VPN接続を使用している場合は一時的に無効化
4. リポジトリ管理者に連絡して権限を確認

## 環境変数
プロジェクトに必要な環境変数:
```
DOCKER_HUB_USERNAME=<あなたのDockerHubユーザー名> 
DOCKER_HUB_TOKEN=<あなたのDockerHubトークン>
GOOGLE_API_KEY=<あなたのGoogle Gemini APIキー>
```

### APIキーの取得方法

1. [Google AI Studio](https://aistudio.google.com/)にアクセス
2. アカウント登録/ログイン
3. API Keyのセクションから新しいAPIキーを生成
4. 生成されたキーをコピー

### 環境変数の設定方法

#### 開発環境での設定

**バックエンド**:
バックエンドディレクトリに `.env` ファイルを作成し、以下の内容を記述：
```
PORT=3001
GOOGLE_API_KEY=your_gemini_api_key
```

**フロントエンド**:
プロジェクトルートディレクトリに `.env.local` ファイルを作成し、以下の内容を記述：
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

#### 本番環境での設定
本番環境では、ホスティングプラットフォームの環境変数設定機能を使用：
- **Vercel**: プロジェクト設定の「Environment Variables」セクション
- **Docker**: docker-compose.ymlファイルまたは-e オプションで指定

## 機能

- **スカウトメッセージ生成**: 候補者情報と求人内容に基づいてパーソナライズされたスカウトメッセージを自動生成
- **キャリア分析**: 候補者の履歴書と職務経験を分析し、求人との適合性を評価
- **AIチャット**: 採用プロセスに関する質問に答えるAIアシスタント

## 技術スタック

- **フロントエンド**: React, Next.js, TypeScript, Tailwind CSS
- **バックエンド**: Node.js, Express
- **AI**: Google Gemini API
- **インフラ**: Docker, GitHub Actions, Vercel

## 開発環境のセットアップ

### 必要なもの

- Node.js (v18以上)
- npm (v9以上)
- Git (最新版推奨)
- Google Gemini API キー

### 推奨開発環境
- **エディタ**: Visual Studio Code
- **ブラウザ**: Chrome（開発者ツール使用）

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
GOOGLE_API_KEY=your_gemini_api_key
```
※ `your_gemini_api_key` は実際のGemini APIキーに置き換えてください。

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

### 環境変数のテスト

環境変数が正しく設定されているか確認するには：

**バックエンド**:
```bash
cd backend
node -e "console.log('GOOGLE_API_KEY:', process.env.GOOGLE_API_KEY ? '設定済み' : '未設定')"
```

**フロントエンド**:
```bash
node -e "console.log('NEXT_PUBLIC_API_BASE_URL:', process.env.NEXT_PUBLIC_API_BASE_URL ? '設定済み' : '未設定')"
```

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

## 本番環境へのデプロイ

### デプロイ前提条件
- GitHubアカウント
- DockerHubアカウント
- 本番環境サーバー（Ubuntu 20.04 LTS以上推奨）
- ドメイン名（必要に応じて）

### GitHubシークレットの設定
GitHub Actionsを使用したCI/CDパイプラインを設定するために、以下のシークレットを設定：

1. リポジトリページで「Settings」→「Secrets and variables」→「Actions」に移動
2. 「New repository secret」で以下の項目を追加：
   - `DOCKER_HUB_USERNAME`: DockerHubのユーザー名
   - `DOCKER_HUB_TOKEN`: DockerHubのアクセストークン
   - `PRODUCTION_HOST`: 本番サーバーのIPアドレス
   - `PRODUCTION_USERNAME`: 本番サーバーのSSHユーザー名
   - `PRODUCTION_SSH_KEY`: 本番サーバーへのSSH秘密鍵
   - `GOOGLE_API_KEY`: Google Gemini APIのAPIキー
   - `SLACK_WEBHOOK`: Slackの通知用Webhook URL（オプション）

### 本番サーバーのセットアップ

1. セットアップスクリプトをサーバーにコピー:
```bash
scp production-server-setup.sh user@your-server-ip:~/
```

2. スクリプトを実行:
```bash
ssh user@your-server-ip "chmod +x ~/production-server-setup.sh && sudo ~/production-server-setup.sh"
```

3. 環境変数の設定:
```bash
ssh user@your-server-ip "sudo nano /opt/rex-deployment/.env"
```
以下の変数を設定:
```
DOCKER_USERNAME=your_docker_username
GOOGLE_API_KEY=your_google_api_key
```

### SSL証明書の設定（オプション）
Let's Encryptを使用してSSL証明書を設定:
```bash
ssh user@your-server-ip "sudo apt-get update && sudo apt-get install -y certbot python3-certbot-nginx && sudo certbot --nginx -d yourdomain.com"
```

### デプロイの実行
GitHub Actionsによる自動デプロイ:
- mainブランチにプッシュ
- または「Deploy to Production」ワークフローを手動実行

手動デプロイを行う場合:
```bash
ssh user@your-server-ip "cd /opt/rex-deployment && docker-compose pull && docker-compose up -d"
```

### デプロイの確認
- フロントエンド: https://yourdomain.com または指定されたURLにアクセス
- バックエンドAPI: https://api.yourdomain.com/health または指定されたAPI URLにアクセス

### モニタリングの設定（オプション）
1. モニタリングファイルの転送:
```bash
ssh user@your-server-ip "mkdir -p /opt/rex-monitoring"
scp monitoring-docker-compose.yml prometheus.yml blackbox.yml alertmanager.yml user@your-server-ip:/opt/rex-monitoring/
```

2. モニタリングスタックの起動:
```bash
ssh user@your-server-ip "cd /opt/rex-monitoring && sudo docker-compose -f monitoring-docker-compose.yml up -d"
```

3. Grafanaの設定:
   - http://your-server-ip:3030 にアクセス
   - デフォルト認証情報: admin/admin
   - パスワード変更と必要なダッシュボードのインポート

## API エンドポイント

- `POST /api/analyze-career`: 経歴書の分析
- `POST /api/generate-scout-message`: スカウトメッセージの生成
- `POST /api/chat`: AIチャット
- `GET /health`: システムのヘルスチェック

## トラブルシューティング

### 開発環境での問題

#### APIキー関連
- **問題**: APIキーが機能しない
- **解決策**: 
  - キーが正しく環境変数ファイルに設定されているか確認
  - キーの有効期限が切れていないか確認
  - API制限に達していないか確認

#### ポート関連
- **問題**: ポートが使用中
- **解決策**: 
  - `.env`ファイルでポート番号を変更
  - 既存のプロセスを終了: `npx kill-port 3000 3001`

#### 環境変数問題
- **問題**: "GOOGLE_API_KEY が設定されていません"エラー
- **解決策**: 
  - `.env`ファイルが正しい場所にあるか確認
  - 開発サーバーを再起動して環境変数を読み込む

### バックエンドAPIエラー

- **問題**: フロントエンドからバックエンドへのAPI呼び出しが失敗する
- **解決策**:
  1. バックエンドが起動しているか確認: `curl http://localhost:3001/health`
  2. CORS設定が正しいか確認
  3. 環境変数を確認: `NEXT_PUBLIC_API_BASE_URL`が正しいか
  4. ネットワーク接続問題の場合、VPN設定を確認
  5. APIタイムアウトの場合、タイムアウト設定を調整

### 接続エラーとVPN問題

- **問題**: APIリクエストがタイムアウトする
- **解決策**:
  1. ネットワーク接続を確認
  2. VPN使用時は、VPN設定がAPIアクセスを妨げていないか確認
  3. タイムアウト設定を調整:
     - apiService.tsの`timeout`設定を増加
     - バックエンドのリクエストタイムアウト設定を見直し
  4. "再接続を試みる"ボタンを使用

### Dockerデプロイ問題

- **問題**: Dockerコンテナが起動しない
- **解決策**:
  1. コンテナのログを確認: `docker-compose logs`
  2. 環境変数が正しく設定されているか確認
  3. ポートの競合がないか確認
  4. ディスク容量不足でないか確認: `df -h`

### 本番環境デプロイ問題

- **問題**: GitHub Actionsのデプロイが失敗する
- **解決策**:
  1. Actionsタブでログを確認
  2. GitHubシークレットが正しく設定されているか確認
  3. SSH接続設定を確認
  4. DockerHubの認証情報を確認

### Vercel認証問題

- **問題**: Vercelのデプロイで認証画面が表示される
- **解決策**:
  1. vercel.jsonに`"public": true`を追加して公開アクセスを許可する
  2. CORS設定を適切に設定する
  3. バックエンドAPIのルート設定でヘッダーを追加:
     ```json
     "routes": [
       {
         "src": "/(.*)",
         "dest": "index.js",
         "headers": {
           "Access-Control-Allow-Origin": "*",
           "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
           "Access-Control-Allow-Headers": "X-Requested-With, Content-Type, Accept"
         }
       }
     ]
     ```
  4. GitHub Pagesを代替デプロイ先として使用する

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

5. Vercel認証問題の解決
   - vercel.jsonでの公開アクセス設定
   - CORS設定の最適化
   - カスタムヘッダーによるクロスドメインリクエスト対応

6. パフォーマンス最適化
   - Gemini API SDK 0.24.1へのアップデート
   - Next.js 15.3.2への更新
   - キャッシング機能の導入検討

7. セキュリティ強化
   - Helmet設定のカスタマイズ
   - CORSポリシーの改善
   - 環境変数の安全な管理

# reX.ts ビルド結果レポート

## ビルド成功の確認

`npm run build` コマンドの実行により、正常にビルドが完了しました。

### 主な修正内容

1. `page.tsx` ファイルの修正
   - 重複していた `useState` のインポート宣言を削除
   - 重複していた HomePage コンポーネントの定義を統合
   - 適切なフォーム構造とイベントハンドラの実装

2. フォント設定の最適化
   - Inter と Source_Code_Pro フォントを使用

3. Tailwind CSS の設定修正
   - 適切な設定ファイルの作成と構成

### ビルド出力結果

```
> frontend@0.1.0 build
> next build

   ▲ Next.js 14.0.4
   - Environments: .env.local, .env

 ✓ Creating an optimized production build    
 ✓ Compiled successfully
 ✓ Linting and checking validity of types    
 ✓ Collecting page data    
 ✓ Generating static pages (5/5) 
 ✓ Collecting build traces    
 ✓ Finalizing page optimization    

Route (app)                                Size     First Load JS
┌ ○ /                                      5.13 kB          87 kB
└ ○ /_not-found                            875 B          82.7 kB
+ First Load JS shared by all              81.8 kB
  ├ chunks/938-5e061ba0d46125b1.js         26.7 kB
  ├ chunks/fd9d1056-735d320b4b8745cb.js    53.3 kB
  ├ chunks/main-app-04cbd43c16a48300.js    221 B
  └ chunks/webpack-03f9c6862bdfcf6a.js     1.64 kB

Route (pages)                              Size     First Load JS
─ λ /api/process                           0 B            78.5 kB
+ First Load JS shared by all              78.5 kB
  ├ chunks/framework-8883d1e9be70c3da.js   45 kB
  ├ chunks/main-d6b31e3cb47a03bc.js        31.6 kB
  ├ chunks/pages/_app-98cb51ec6f9f135f.js  195 B
  └ chunks/webpack-03f9c6862bdfcf6a.js     1.64 kB
```

## 動作検証結果

- HomePage コンポーネントが正常に表示されることを確認
- フォームの入力とイベントハンドリングが正しく機能
- Tailwind CSS スタイルが適切に適用されている

## デプロイ準備完了

これにより、アプリケーションはVercelへのデプロイ準備が整いました。
