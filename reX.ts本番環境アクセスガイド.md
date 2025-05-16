# reX.ts 本番環境アクセスガイド

このガイドでは、reX.tsシステムの本番環境にアクセスする手順を説明します。

## システム概要

reX.tsは候補者のキャリア情報を分析し、採用条件と照らし合わせて採用可否を判断するAIシステムです。採用判断が「採用」となった候補者には、パーソナライズされたスカウト文章も自動生成します。

## 現在の本番環境の状況

**重要**: 現在のVercel環境では認証が必要な状態になっています。以下にその対応方法を記載します。

### バックエンド環境

- **URL**: `https://backend-iqep5txo6-kinouecertify-gmailcoms-projects.vercel.app/api`
- **状態**: Vercel認証が必要（修正手順を以下に記載）
- **Gemini API SDK**: 最新バージョン（0.24.1）を使用

### フロントエンド環境

フロントエンドは現在、専用のデプロイがされていません。代わりに、以下のサンプルコードを使用して独自のフロントエンドを構築できます。

## システム検証結果

システムの検証を行った結果、以下の問題が発見されました：

1. **Vercel認証の問題**: バックエンドのVercel設定でpublic: trueが正しく設定されていますが、反映されていない可能性があります
2. **CORS設定**: 適切に設定されていますが、Vercel認証により確認できません
3. **API機能**: コードベースとしては正常に実装されています

## Vercel認証の修正手順

バックエンドのVercel認証問題を修正するには、以下の手順を実行してください：

1. **vercel.jsonの確認と修正**
   - `backend/vercel.json`に`"public": true`が設定されていることを確認
   - 設定されていない場合は追加して再デプロイ

2. **手動でのVercelプロジェクト設定**
   ```bash
   # Vercel CLIをインストール
   npm install -g vercel
   
   # プロジェクトディレクトリに移動
   cd backend
   
   # Vercelにログイン
   vercel login
   
   # プロジェクト設定を更新（認証を無効化）
   vercel project update --protection disabled
   
   # 再デプロイ
   vercel --prod
   ```

3. **Vercelダッシュボードからの更新**
   - Vercel管理画面（dashboard.vercel.com）にログイン
   - プロジェクト設定 > Security > Authentication Protection を「Disabled」に設定

## 代替手段：ローカル環境でAPIを実行

認証問題が解決されるまでの間、以下の手順でローカル環境にAPIを構築できます：

```bash
# リポジトリのクローン
git clone https://github.com/YOUR_GITHUB_USERNAME/reX.ts.git
cd reX.ts/backend

# 必要なパッケージのインストール
npm install

# .envファイルを作成してAPIキーを設定
echo "GOOGLE_API_KEY=YOUR_GOOGLE_API_KEY" > .env

# サーバーの起動
npm run dev
```

## APIの利用方法

### 1. 候補者分析API

```javascript
// 候補者分析のサンプルコード
async function analyzeCandidate(resumeData, jobRequirements) {
  try {
    const response = await fetch('YOUR_BACKEND_URL/api/analyze-career', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resumeData,
        jobRequirements,
      }),
    });
    
    if (!response.ok) throw new Error('API呼び出しに失敗しました');
    return await response.json();
  } catch (error) {
    console.error('エラー:', error);
    return null;
  }
}
```

### 2. 統合API（分析とスカウト文章生成）

```javascript
// 統合APIのサンプルコード
async function analyzeAndScout(resumeData, jobRequirements) {
  try {
    const response = await fetch('YOUR_BACKEND_URL/api/analyze-and-scout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resumeData,
        jobRequirements,
      }),
    });
    
    if (!response.ok) throw new Error('API呼び出しに失敗しました');
    return await response.json();
  } catch (error) {
    console.error('エラー:', error);
    return null;
  }
}
```

## フロントエンドの構築

Reactを使用したフロントエンドのサンプルが `frontend-example/analyze-scout-form.jsx` にあります。これを使用して、独自のフロントエンドアプリケーションを構築できます。

### サンプルフロントエンドの使用方法

1. Next.jsプロジェクトを作成
   ```bash
   npx create-next-app my-rex-frontend
   cd my-rex-frontend
   ```

2. 必要なパッケージをインストール
   ```bash
   npm install
   ```

3. サンプルコードを配置
   - `frontend-example/analyze-scout-form.jsx` を参考にコンポーネントを作成
   - `.env.local` ファイルにAPIのURLを設定:
     ```
     NEXT_PUBLIC_API_BASE_URL=YOUR_BACKEND_URL/api
     ```

4. アプリケーションを起動
   ```bash
   npm run dev
   ```

## トラブルシューティング

1. **Vercel認証画面が表示される場合**
   - 自社のサーバーにAPIをデプロイして使用する
   - または、ローカル環境でバックエンドを実行する
   - Vercel認証がない環境にデプロイし直す

2. **APIからのレスポンスがタイムアウトする場合**
   - 候補者データや採用条件のテキスト量を減らしてみる
   - APIの呼び出しタイムアウトを延長する（デフォルト: 60秒）

3. **エラーレスポンスが返ってくる場合**
   - リクエストパラメータの形式を確認する
   - APIキーの有効性を確認する
   - サーバーのログを確認する

## 完全なエンドツーエンドのテスト

システムの完全なテストを行うには：

1. バックエンドをローカルで起動するか、認証なしの環境にデプロイする
2. フロントエンドのサンプルコードを使用して簡易UI環境を構築
3. 以下のテストケースを実施：
   - 採用条件を満たす候補者情報 → 「採用」判定とスカウト文章
   - 採用条件を部分的に満たす候補者情報 → 「検討」判定
   - 採用条件を満たさない候補者情報 → 「不採用」判定

## APIドキュメント

詳細なAPI仕様については、リポジトリの `API_DOCUMENTATION.md` ファイルを参照してください。

## 開発者向け追加情報

実装しているAPIについては、以下のファイルで確認できます：
- `/backend/api/analyze-career/index.js` - 候補者分析API
- `/backend/api/generate-scout-message/index.js` - スカウト文章生成API
- `/backend/api/analyze-and-scout/index.js` - 統合API 