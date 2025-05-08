# 環境変数設定ガイド

このプロジェクトでは、Google Gemini APIを使用するために環境変数の設定が必要です。以下の手順に従って設定してください。

## 必要な環境変数

1. **GOOGLE_API_KEY**: Google Gemini APIにアクセスするためのAPIキー

## APIキーの取得方法

1. [Google AI Studio](https://aistudio.google.com/)にアクセス
2. アカウント登録/ログイン
3. API Keyのセクションから新しいAPIキーを生成
4. 生成されたキーをコピー

## 環境変数の設定方法

### 開発環境での設定

#### バックエンド

バックエンドディレクトリに `.env` ファイルを作成し、以下の内容を記述します：

```
PORT=3001
GOOGLE_API_KEY=your_gemini_api_key_here
```

`your_gemini_api_key_here` の部分を実際のAPIキーに置き換えてください。

#### フロントエンド

プロジェクトルートディレクトリに `.env.local` ファイルを作成し、以下の内容を記述します：

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
GOOGLE_API_KEY=your_gemini_api_key_here
```

`your_gemini_api_key_here` の部分を実際のAPIキーに置き換えてください。

### 本番環境での設定

本番環境では、ホスティングプラットフォームの環境変数設定機能を使用してください。

- **Vercel**: プロジェクト設定の「Environment Variables」セクション
- **Heroku**: ダッシュボードの「Settings」タブ内「Config Vars」セクション
- **Docker**: docker-compose.ymlファイルまたは-e オプションで指定

## 環境変数のテスト

環境変数が正しく設定されているかテストするには：

### バックエンド

```bash
cd backend
node -e "console.log('GOOGLE_API_KEY:', process.env.GOOGLE_API_KEY ? '設定済み' : '未設定')"
```

### フロントエンド

```bash
cd frontend
node -e "console.log('GOOGLE_API_KEY:', process.env.GOOGLE_API_KEY ? '設定済み' : '未設定')"
```

## トラブルシューティング

- **API呼び出しエラー**: 「GOOGLE_API_KEY が設定されていません」というエラーが表示される場合は、環境変数が正しく設定されていません。
- **「利用可能なGeminiモデルが見つかりませんでした」エラー**: APIキーが有効であることを確認してください。また、APIキーに適切な権限が付与されていることも確認してください。
- **「GEMINI_API_KEY vs GOOGLE_API_KEY」**: 本システムでは `GOOGLE_API_KEY` を使用しています。ドキュメントの指示と異なる場合は `GOOGLE_API_KEY` を優先してください。 