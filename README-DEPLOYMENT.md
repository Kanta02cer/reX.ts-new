# reX.ts 本番環境デプロイガイド

このドキュメントでは、AI採用管理システム「reX.ts」の本番環境へのデプロイ方法と、モニタリングの設定について説明します。

## 事前準備

- GitHubアカウント
- DockerHubアカウント
- 本番環境サーバー（Ubuntu 20.04 LTS以上推奨）
- ドメイン名（rexapp.example.comとapi.rexapp.example.com用）

## デプロイ方法

### 1. GitHubシークレットの設定

GitHub Actionsを使用したCI/CDパイプラインを設定するために、以下のシークレットをリポジトリに設定してください：

- `DOCKER_HUB_USERNAME`: DockerHubのユーザー名
- `DOCKER_HUB_TOKEN`: DockerHubのアクセストークン
- `PRODUCTION_HOST`: 本番サーバーのIPアドレスまたはホスト名
- `PRODUCTION_USERNAME`: 本番サーバーのSSHユーザー名
- `PRODUCTION_SSH_KEY`: 本番サーバーへのSSH秘密鍵
- `GOOGLE_API_KEY`: Google Gemini APIのAPIキー
- `SLACK_WEBHOOK`: SlackのWebhook URL（モニタリング通知用）

### 2. 本番サーバーのセットアップ

本リポジトリには、本番サーバーをセットアップするためのスクリプト `production-server-setup.sh` が含まれています。以下の手順で実行してください：

1. スクリプトをサーバーにコピー
   ```
   scp production-server-setup.sh user@your-server-ip:~/
   ```

2. スクリプトを実行
   ```
   ssh user@your-server-ip "chmod +x ~/production-server-setup.sh && sudo ~/production-server-setup.sh"
   ```

3. 環境変数の設定
   ```
   ssh user@your-server-ip "sudo nano /opt/rex-deployment/.env"
   ```
   
   以下の変数を設定してください：
   ```
   DOCKER_USERNAME=your_docker_username
   GOOGLE_API_KEY=your_google_api_key
   ```

### 3. SSL証明書の設定

Let's Encryptを使用してSSL証明書を設定します：

```
ssh user@your-server-ip "sudo apt-get update && sudo apt-get install -y certbot python3-certbot-nginx && sudo certbot --nginx -d rexapp.example.com -d api.rexapp.example.com"
```

### 4. デプロイの実行

mainブランチにプッシュするか、GitHub Actionsの「Deploy to Production」ワークフローを手動で実行することで、アプリケーションが自動的にデプロイされます。

手動でデプロイする場合は以下のコマンドを実行します：

```
ssh user@your-server-ip "cd /opt/rex-deployment && docker-compose pull && docker-compose up -d"
```

## モニタリングの設定

### 1. モニタリングスタックのデプロイ

本リポジトリには、Prometheus、Grafana、AlertManagerなどを含むモニタリングスタックをデプロイするための設定ファイルが含まれています。

```
ssh user@your-server-ip "mkdir -p /opt/rex-monitoring"
scp monitoring-docker-compose.yml prometheus.yml blackbox.yml alertmanager.yml user@your-server-ip:/opt/rex-monitoring/
ssh user@your-server-ip "cd /opt/rex-monitoring && sudo docker-compose -f monitoring-docker-compose.yml up -d"
```

### 2. Grafanaのセットアップ

1. ブラウザで `http://your-server-ip:3030` にアクセスします
2. デフォルトの認証情報（ユーザー名: admin、パスワード: admin）でログインします
3. パスワードを変更します
4. データソースとして Prometheus を追加します：
   - URL: `http://prometheus:9090`
   - アクセス: `Server (デフォルト)`

### 3. ダッシュボードのインポート

Grafanaで以下のダッシュボードをインポートすることをお勧めします：

- Node Exporter Full (ID: 1860)
- Docker and system monitoring (ID: 893)
- Blackbox Exporter (ID: 7587)

## 定期的なメンテナンス

### バックアップ

以下のコマンドを使用して、定期的なバックアップを実行することをお勧めします：

```
ssh user@your-server-ip "cd /opt/rex-deployment && docker-compose exec backend tar -czvf /app/logs/backup-\$(date '+%Y%m%d').tar.gz /app/logs"
```

### ログのローテーション

ログのローテーションは以下のように設定できます：

```
ssh user@your-server-ip "sudo nano /etc/logrotate.d/rex-app"
```

以下の内容を追加：

```
/opt/rex-deployment/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 root root
}
```

## トラブルシューティング

### コンテナログの確認

```
ssh user@your-server-ip "cd /opt/rex-deployment && docker-compose logs -f backend"
ssh user@your-server-ip "cd /opt/rex-deployment && docker-compose logs -f frontend"
```

### サービスの再起動

```
ssh user@your-server-ip "cd /opt/rex-deployment && docker-compose restart backend"
ssh user@your-server-ip "cd /opt/rex-deployment && docker-compose restart frontend"
```

### システムのステータス確認

```
ssh user@your-server-ip "cd /opt/rex-monitoring && docker-compose -f monitoring-docker-compose.yml ps"
```

## サポート情報

問題が発生した場合は、GitHub Issuesにて報告してください。サポートが必要な場合は以下の連絡先までお問い合わせください：

- 管理者メール: support@rexapp.example.com
- 技術サポート: tech-support@rexapp.example.com 