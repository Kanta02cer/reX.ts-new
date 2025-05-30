# reX.ts デプロイメントガイド

## 推奨デプロイメントプラットフォーム

### 1. Vercel（最推奨）

**メリット:**
- Next.js専用最適化
- 自動ビルド・デプロイ
- 日本リージョン対応
- Edge Functions対応
- 無料プランあり

**手順:**

1. **Vercelアカウント作成**
   ```bash
   npm i -g vercel
   vercel login
   ```

2. **環境変数設定**
   ```bash
   vercel env add GEMINI_API_KEY
   # APIキーを入力
   ```

3. **デプロイ実行**
   ```bash
   vercel --prod
   ```

### 2. Netlify（代替案）

**メリット:**
- 無料プランが充実
- フォーム処理機能
- CDN最適化
- 継続的デプロイ

**手順:**

1. **Netlify CLI導入**
   ```bash
   npm install -g netlify-cli
   netlify login
   ```

2. **デプロイ実行**
   ```bash
   netlify deploy --prod --dir=.next
   ```

### 3. Railway（フルスタック対応）

**メリット:**
- データベース統合
- 環境変数管理
- モニタリング機能
- スケーリング対応

**手順:**

1. **Railway CLI導入**
   ```bash
   npm install -g @railway/cli
   railway login
   ```

2. **プロジェクト初期化**
   ```bash
   railway init
   railway add
   ```

## 環境変数設定

すべてのプラットフォームで以下の環境変数が必要：

```env
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

## デプロイ前チェックリスト

- [ ] `npm run build` が成功する
- [ ] `npm start` でローカル動作確認
- [ ] 環境変数がすべて設定済み
- [ ] APIエンドポイントの動作確認
- [ ] セキュリティ設定の確認
- [ ] .gitignoreの設定確認

## パフォーマンス最適化

### ビルド時最適化
```bash
# 依存関係の最適化
npm audit fix
npm run build

# バンドルサイズ分析
npx @next/bundle-analyzer
```

### 本番環境設定
```javascript
// next.config.js
module.exports = {
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  experimental: {
    optimizeCss: true
  }
}
```

## モニタリング設定

### Vercel Analytics
```bash
npm install @vercel/analytics
```

### Sentry エラートラッキング
```bash
npm install @sentry/nextjs
```

## トラブルシューティング

### ビルドエラー
```bash
# 依存関係リセット
rm -rf node_modules package-lock.json
npm install

# Next.jsキャッシュクリア
rm -rf .next
npm run build
```

### API エラー
- CORS設定確認
- 環境変数確認  
- タイムアウト設定確認

### パフォーマンス問題
- Image最適化設定
- コードスプリッティング
- 不要な依存関係削除

## セキュリティ考慮事項

- API キーの適切な管理
- HTTPS必須設定
- CSP（Content Security Policy）設定
- レート制限の実装

## 継続的インテグレーション

### GitHub Actions設定例
```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## バックアップ・復旧手順

1. **データバックアップ**
   - ローカルストレージデータのエクスポート
   - 設定ファイルのバックアップ

2. **復旧手順**
   - 最新コードのクローン
   - 環境変数再設定
   - 依存関係インストール
   - デプロイ実行

## サポート・ドキュメント

- [Vercel公式ドキュメント](https://vercel.com/docs)
- [Next.js公式ガイド](https://nextjs.org/docs/deployment)
- [プロジェクト README](../README.md)
- [開発環境セットアップ](./SETUP.md) 