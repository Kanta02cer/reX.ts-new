FROM node:18-alpine

WORKDIR /app

# パッケージファイルをコピー
COPY backend/package*.json ./

# 依存関係のインストール
RUN npm install

# アプリケーションのソースをコピー
COPY backend ./

# 環境変数のデフォルト値を設定
ENV PORT=3001
ENV NODE_ENV=production

# ポートを公開
EXPOSE 3001

# アプリケーションを起動
CMD ["node", "index.js"] 