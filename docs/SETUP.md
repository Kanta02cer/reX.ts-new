# reX.ts セットアップガイド

> AI採用スクリーニングシステムの詳細セットアップ手順

## 📋 目次

1. [前提条件](#前提条件)
2. [環境変数設定](#環境変数設定)
3. [インストール手順](#インストール手順)
4. [開発環境の起動](#開発環境の起動)
5. [本番環境デプロイ](#本番環境デプロイ)
6. [トラブルシューティング](#トラブルシューティング)

## 🛠 前提条件

### 必須要件
- **Node.js**: 18.0以上
- **npm**: 9.0以上 または **yarn**: 1.22以上
- **Google AI Studio アカウント**: Gemini API使用のため

### 推奨環境
- **OS**: macOS, Linux, Windows (WSL推奨)
- **メモリ**: 8GB以上
- **ストレージ**: 1GB以上の空き容量

## 🔧 環境変数設定

### `.env.local` ファイルの作成

プロジェクトルートに `.env.local` ファイルを作成し、以下の内容を設定してください：

```bash
# ==============================================
# 必須設定（必ず設定してください）
# ==============================================

# Gemini AI API Key
NEXT_PUBLIC_GEMINI_API_KEY=your_actual_gemini_api_key_here

# アプリケーション環境
NODE_ENV=development

# ==============================================
# 基本設定
# ==============================================

# API設定
USE_MOCK_API=false

# アプリケーション情報
NEXT_PUBLIC_APP_NAME=reX.ts
NEXT_PUBLIC_APP_VERSION=1.0.0

# ==============================================
# セキュリティ設定
# ==============================================

# 暗号化キー（本番環境では必ず変更）
ENCRYPTION_KEY=reX-ts-secure-key-change-this-in-production

# レート制限
RATE_LIMIT_REQUESTS_PER_MINUTE=10
RATE_LIMIT_WINDOW_MS=60000

# ==============================================
# ファイル処理設定
# ==============================================

# ファイル制限
MAX_FILE_SIZE_MB=10
MAX_APPLICANTS_PER_REQUEST=100

# ==============================================
# パフォーマンス設定
# ==============================================

# 監視とログ
LOG_LEVEL=info
ENABLE_PERFORMANCE_MONITORING=true
ENABLE_ERROR_TRACKING=true

# キャッシュ
ENABLE_CACHE=true
CACHE_TTL_SECONDS=3600

# ==============================================
# 機能フラグ
# ==============================================

ENABLE_ADVANCED_ANALYTICS=true
ENABLE_BATCH_PROCESSING=true
ENABLE_EXPORT_FEATURES=true
ENABLE_DASHBOARD=true
```

### 🔑 Google AI Studio APIキーの取得

1. **Google AI Studio**にアクセス: https://ai.google.dev/
2. Googleアカウントでログイン
3. 新しいAPIキーを作成
4. 作成されたAPIキーをコピー
5. `.env.local`の`NEXT_PUBLIC_GEMINI_API_KEY`に設定

### 🚨 セキュリティ注意事項

- **APIキーの取り扱い**: 
  - `.env.local`ファイルをGitにコミットしないでください
  - APIキーを他者と共有しないでください
  - 定期的にAPIキーを更新してください

- **本番環境での設定**:
  - `ENCRYPTION_KEY`を十分に複雑な値に変更
  - `NODE_ENV=production`に設定
  - 適切なレート制限値を設定

## 📦 インストール手順

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd reX.ts-new
```

### 2. 依存関係のインストール

```bash
npm install
```

または

```bash
yarn install
```

### 3. 環境変数ファイルの設定

```bash
cp .env.example .env.local
# .env.localを上記の設定例に従って編集
```

### 4. ビルドテスト

```bash
npm run build
```

正常にビルドが完了することを確認してください。

## 🚀 開発環境の起動

### 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 にアクセスして動作を確認。

### 利用可能なスクリプト

- `npm run dev` - 開発サーバー起動
- `npm run build` - 本番ビルド
- `npm run start` - 本番サーバー起動
- `npm run lint` - コード品質チェック

## 🌐 本番環境デプロイ

### Vercelデプロイ（推奨）

1. **Vercelアカウント作成**: https://vercel.com/
2. **GitHub連携**でプロジェクトをインポート
3. **環境変数設定**:
   ```
   NEXT_PUBLIC_GEMINI_API_KEY=your_production_api_key
   NODE_ENV=production
   ENCRYPTION_KEY=your_secure_production_key
   ```
4. **自動デプロイ**が実行されます

### その他のプラットフォーム

- **Netlify**: ビルド設定 `npm run build && npm run export`
- **Railway**: Dockerfileを使用した自動デプロイ
- **Heroku**: Node.jsビルドパックを使用

## 🔍 動作確認

### 基本機能テスト

1. **ヘルスチェック**: http://localhost:3000/api/health
2. **CSVアップロード機能**:
   - サンプルCSVファイルをアップロード
   - カラム選択UIの動作確認
3. **手動入力機能**:
   - 申請者情報の手動入力
   - バリデーション動作確認
4. **AI分析機能**:
   - 実際の分析処理実行
   - 結果表示の確認

### パフォーマンステスト

```bash
# 複数の同時リクエストでテスト
curl -X GET http://localhost:3000/api/health
```

## 🛠 トラブルシューティング

### よくある問題と解決方法

#### 1. APIキーエラー
```
Error: Invalid API key
```

**解決方法**:
- `.env.local`のAPIキーを確認
- Google AI Studioでキーの有効性を確認
- ブラウザの再読み込み

#### 2. ビルドエラー
```
Error: Module not found
```

**解決方法**:
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### 3. ポート競合エラー
```
Error: Port 3000 is already in use
```

**解決方法**:
```bash
# 他のポートを指定
npm run dev -- -p 3001
```

#### 4. メモリ不足エラー
```
Error: JavaScript heap out of memory
```

**解決方法**:
```bash
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

#### 5. CSVファイル読み込みエラー

**解決方法**:
- ファイルがUTF-8エンコーディングか確認
- ファイルサイズが10MB以下か確認
- ヘッダー行が存在するか確認

### ログ確認方法

#### 開発環境
```bash
# コンソールログを確認
npm run dev
```

#### 本番環境
```bash
# Vercelの場合
vercel logs

# 他のプラットフォームの場合
# 各プラットフォームのログビューアーを使用
```

### デバッグモード

開発時の詳細デバッグを有効にする場合：

```bash
# .env.localに追加
ENABLE_DEBUG_MODE=true
LOG_LEVEL=debug
```

## 📞 サポート

### 技術サポート

- **GitHub Issues**: バグレポート・機能要望
- **ドキュメント**: プロジェクトWiki
- **コミュニティ**: DiscussionsやSlack

### 緊急時の対応

1. **システムダウン**: ヘルスチェックAPIを確認
2. **パフォーマンス低下**: ログを確認してボトルネックを特定
3. **セキュリティ問題**: 即座にAPIキーを無効化

## 🔄 アップデート手順

### 定期アップデート

```bash
# 最新コードの取得
git pull origin main

# 依存関係の更新
npm update

# ビルドテスト
npm run build

# 再起動
npm run dev
```

### 設定ファイルの更新

新しい環境変数が追加された場合は、`.env.example`を参考に`.env.local`を更新してください。

---

**reX.ts** - Making recruitment more intelligent and efficient 🚀 