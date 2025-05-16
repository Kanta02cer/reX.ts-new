# デプロイガイド

このガイドでは、採用判断・スカウト文章生成システムを本番環境にデプロイする手順を説明します。

## 1. コードの変更をプッシュしてデプロイをトリガー

### 1.1 自動デプロイ（GitHub Actionsを使用）

1. 変更をコミットしてプッシュします：
   ```bash
   git add .
   git commit -m "説明的なコミットメッセージ"
   git push origin main
   ```

2. GitHub Actionsが自動的に開始され、CI/CDパイプラインが実行されます。

3. デプロイの進行状況は、GitHubリポジトリの「Actions」タブで確認できます。

### 1.2 手動デプロイの実行

GitHub Actionsを手動でトリガーする場合：

1. GitHubリポジトリにアクセスします。
2. 「Actions」タブをクリックします。
3. 左側の「CI/CD Pipeline」ワークフローを選択します。
4. 「Run workflow」ボタンをクリックします。
5. ブランチ（通常は「main」）を選択し、「Run workflow」をクリックします。

## 2. デプロイの確認

### 2.1 バックエンドのデプロイ確認

1. ヘルスチェックエンドポイントにアクセスして、バックエンドの状態を確認します：
   ```bash
   curl https://backend-iqep5txo6-kinouecertify-gmailcoms-projects.vercel.app/health
   ```

2. 正常に動作している場合、以下のようなレスポンスが返されます：
   ```json
   {
     "status": "ok",
     "timestamp": "2023-10-28T12:34:56.789Z",
     "version": "1.0.0",
     "apiEndpoints": ["/api/analyze-career", "/api/generate-scout-message", "/api/analyze-and-scout", "/api/chat", "/health", "/metrics"]
   }
   ```

### 2.2 APIエンドポイントのテスト

APIが正常に動作しているか確認するためのサンプルリクエスト：

```bash
# 候補者分析と採用判断のテスト
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "resumeData": "氏名：山田太郎\n職種：フロントエンドエンジニア\n経験年数：5年\nスキル：JavaScript, React, HTML, CSS",
    "jobRequirements": "【募集職種】フロントエンドエンジニア\n【必須スキル】\n- JavaScript\n- React\n- HTML/CSS"
  }' \
  https://backend-iqep5txo6-kinouecertify-gmailcoms-projects.vercel.app/api/analyze-career
```

## 3. エラーとトラブルシューティング

### 3.1 デプロイ失敗時の対応

デプロイが失敗した場合、以下の手順で対応します：

1. GitHub Actionsのログを確認して、エラーの原因を特定します。
2. 一般的なエラー：
   - 環境変数の設定ミス
   - テストの失敗
   - Vercel APIのレート制限

3. エラーを修正し、再度コミット・プッシュしてデプロイをトリガーします。

### 3.2 フォールバックデプロイ

Vercelデプロイが失敗した場合、自動的にGitHub Pagesへのフォールバックデプロイが試行されます：

1. GitHub Pagesの状態を確認：
   ```
   https://kinouecertify-gmailcoms-projects.github.io/reX.ts/
   ```

2. GitHub Pagesデプロイワークフローを手動で実行することもできます：
   ```bash
   gh workflow run "Deploy to GitHub Pages" --ref main
   ```

## 4. 環境変数の管理

### 4.1 Vercel環境変数の設定

Vercelプロジェクト設定で以下の環境変数を確認・設定します：

1. バックエンドプロジェクト：
   - `GOOGLE_API_KEY`: Google Gemini APIキー
   - `NODE_ENV`: `production`
   - `API_TIMEOUT`: `60000`（60秒）

2. フロントエンドプロジェクト：
   - `NEXT_PUBLIC_API_BASE_URL`: バックエンドAPIのURL

### 4.2 GitHub Secrets の管理

GitHub Actionsで使用するシークレットを設定・確認します：

1. リポジトリページで「Settings」→「Secrets and variables」→「Actions」に移動
2. 以下のシークレットが設定されていることを確認：
   - `VERCEL_TOKEN`: Vercelのアクセストークン
   - `VERCEL_BACKEND_PROJECT_ID`: バックエンドのプロジェクトID
   - `VERCEL_FRONTEND_PROJECT_ID`: フロントエンドのプロジェクトID
   - `VERCEL_ORG_ID`: VercelのOrg ID
   - `GOOGLE_API_KEY`: Google Gemini APIキー

## 5. リリースノートの作成

新しいバージョンをデプロイした後、リリースノートを作成することをお勧めします：

1. GitHubリポジトリの「Releases」セクションに移動
2. 「Draft a new release」ボタンをクリック
3. タグとリリースタイトルを設定
4. 変更点を詳細に記述
5. 「Publish release」をクリック 