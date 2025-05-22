#!/bin/bash

# reX.ts デプロイスクリプト

# 色の定義
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}reX.ts デプロイスクリプトを実行します${NC}"

# 環境変数が設定されているか確認
if [ -z "$GOOGLE_API_KEY" ]; then
  echo -e "${RED}エラー: GOOGLE_API_KEY 環境変数が設定されていません${NC}"
  echo "export GOOGLE_API_KEY=your-api-key を実行してください"
  exit 1
fi

# ビルド開始
echo -e "\n${GREEN}1. 依存パッケージのインストール${NC}"
npm install
if [ $? -ne 0 ]; then
  echo -e "${RED}依存パッケージのインストールに失敗しました${NC}"
  exit 1
fi

echo -e "\n${GREEN}2. 本番用ビルドの実行${NC}"
npm run build
if [ $? -ne 0 ]; then
  echo -e "${RED}ビルドに失敗しました${NC}"
  exit 1
fi

# Vercelへのデプロイ
echo -e "\n${GREEN}3. Vercelへのデプロイ準備${NC}"

if ! command -v vercel &> /dev/null; then
  echo -e "${YELLOW}Vercel CLIがインストールされていません。インストールします...${NC}"
  npm install -g vercel
fi

echo -e "\n${GREEN}4. Vercelへのデプロイを実行${NC}"
echo -e "${YELLOW}注意: Vercelのアカウントにログインするよう求められる場合があります${NC}"

# 環境変数をVercelに設定
echo -e "\n${GREEN}環境変数を設定しています...${NC}"
cat > .vercel/.env.production.local << EOL
GOOGLE_API_KEY=${GOOGLE_API_KEY}
NEXT_PUBLIC_GOOGLE_API_KEY=${GOOGLE_API_KEY}
EOL

# プロダクションデプロイの実行
vercel --prod

if [ $? -ne 0 ]; then
  echo -e "${RED}デプロイに失敗しました${NC}"
  exit 1
fi

echo -e "\n${GREEN}デプロイが完了しました！${NC}"
echo -e "Vercelダッシュボードでデプロイを確認してください: https://vercel.com/dashboard" 