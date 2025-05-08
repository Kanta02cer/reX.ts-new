#!/bin/bash

# 本番環境のセットアップスクリプト
set -e

# スーパーユーザー権限を確認
if [ "$EUID" -ne 0 ]; then
  echo "このスクリプトはroot権限で実行してください"
  exit 1
fi

# システム更新
echo "システムを更新中..."
apt-get update
apt-get upgrade -y

# 必要なパッケージのインストール
echo "必要なツールをインストール中..."
apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    git \
    ufw \
    fail2ban

# Docker のインストール
echo "Docker をインストール中..."
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo \
  "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io

# Docker Compose のインストール
echo "Docker Compose をインストール中..."
curl -L "https://github.com/docker/compose/releases/download/v2.17.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# アプリケーションディレクトリの作成
echo "アプリケーションディレクトリを作成中..."
mkdir -p /opt/rex-deployment
cd /opt/rex-deployment

# docker-compose.yml をコピー
cat > /opt/rex-deployment/docker-compose.yml << 'EOL'
version: '3'

services:
  backend:
    image: ${DOCKER_USERNAME}/rex-backend:latest
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - GOOGLE_API_KEY=${GOOGLE_API_KEY}
    restart: always
    volumes:
      - backend_logs:/app/logs

  frontend:
    image: ${DOCKER_USERNAME}/rex-frontend:latest
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_BASE_URL=http://backend:3001/api
    depends_on:
      - backend
    restart: always

volumes:
  backend_logs:
EOL

# .env ファイルの作成 (プレースホルダー)
cat > /opt/rex-deployment/.env << 'EOL'
DOCKER_USERNAME=your_docker_username
GOOGLE_API_KEY=your_google_api_key
EOL

echo "環境変数設定ファイルを作成しました。/opt/rex-deployment/.env を正しい値で更新してください。"

# Nginx のインストールとセットアップ
echo "Nginx をインストール中..."
apt-get install -y nginx

# Nginx 設定
cat > /etc/nginx/sites-available/rex-app << 'EOL'
server {
    listen 80;
    server_name rexapp.example.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 80;
    server_name api.rexapp.example.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOL

# シンボリックリンクを作成して Nginx 設定を有効化
ln -s /etc/nginx/sites-available/rex-app /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Nginx 構文チェック
nginx -t

# Nginx を再起動
systemctl restart nginx

# ファイアウォールの設定
echo "ファイアウォールを設定中..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

# Fail2ban の設定
echo "Fail2ban を設定中..."
systemctl enable fail2ban
systemctl start fail2ban

echo "セットアップが完了しました！"
echo "1. /opt/rex-deployment/.env ファイルを編集して正しい認証情報を設定してください"
echo "2. DNSをrexapp.example.comとapi.rexapp.example.comに設定してください"
echo "3. SSL証明書を設定するには、次のコマンドを実行してください:"
echo "   certbot --nginx -d rexapp.example.com -d api.rexapp.example.com"
echo "4. 以下のコマンドでアプリケーションを起動できます:"
echo "   cd /opt/rex-deployment && docker-compose up -d" 