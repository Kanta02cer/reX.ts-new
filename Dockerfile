FROM node:18-alpine

WORKDIR /app

# パッケージファイルをコピー
COPY backend/package*.json ./

# 依存関係のインストール
RUN npm install

# curlとその他の必要なツールをインストール
RUN apk add --no-cache curl

# アプリケーションのソースをコピー
COPY backend ./

# 環境変数のデフォルト値を設定
ENV PORT=3001
ENV NODE_ENV=production
ENV API_TIMEOUT=60000

# ポートを公開
EXPOSE 3001

# ヘルスチェックエンドポイントを追加
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# アプリケーションを起動
CMD ["node", "index.js"] 