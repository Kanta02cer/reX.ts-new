#!/bin/bash

# 手動デプロイスクリプト
set -e

# 環境変数の設定
export DOCKER_USERNAME=Kantacer02
export DOCKER_HUB_TOKEN=dckr_pat_F910MRUEKc1ncpGuJWwPafDt7Ek
export GOOGLE_API_KEY=AIzaSyDosn3ybHfEAV66TsG1fVlTfNQ-itHSFAI

echo "=== reX.ts デプロイスクリプト ==="
echo "1. バックエンドのビルドとプッシュ"
echo "2. フロントエンドのビルドとプッシュ"
echo "3. コンテナの実行"

# Docker Hubにログイン
echo "Docker Hubにログイン中..."
echo $DOCKER_HUB_TOKEN | docker login -u $DOCKER_USERNAME --password-stdin

# バックエンドのビルドとプッシュ
echo "バックエンドをビルド中..."
docker build -t $DOCKER_USERNAME/rex-backend:latest \
  --build-arg GOOGLE_API_KEY=$GOOGLE_API_KEY \
  -f Dockerfile .

echo "バックエンドをプッシュ中..."
docker push $DOCKER_USERNAME/rex-backend:latest

# フロントエンドのビルドとプッシュ
echo "フロントエンドをビルド中..."
docker build -t $DOCKER_USERNAME/rex-frontend:latest \
  --build-arg NEXT_PUBLIC_API_BASE_URL=http://backend:3001 \
  -f frontend/Dockerfile ./frontend

echo "フロントエンドをプッシュ中..."
docker push $DOCKER_USERNAME/rex-frontend:latest

# docker-composeで起動
echo "コンテナを起動中..."
docker-compose down || true
docker-compose up -d

echo "=== デプロイ完了 ==="
echo "フロントエンド: http://localhost:3000"
echo "バックエンドAPI: http://localhost:3001/health"

# デプロイ後の確認
echo "ヘルスチェック実行中..."
sleep 10
curl -f http://localhost:3001/health || echo "バックエンドのヘルスチェックに失敗しました"
curl -f http://localhost:3000 || echo "フロントエンドのヘルスチェックに失敗しました" 