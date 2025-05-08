/**
 * AIリクルートメントシステム バックエンドサーバー
 */

// 環境変数のロード
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// APIルーターのインポート
const analyzeCareerRouter = require('./api/analyze-career');
const generateScoutMessageRouter = require('./api/generate-scout-message');
const chatRouter = require('./api/chat');

// Expressアプリケーションの作成
const app = express();

// ミドルウェアの設定
app.use(helmet()); // セキュリティヘッダー設定
app.use(cors()); // CORS対応
app.use(morgan('dev')); // リクエストロギング
app.use(express.json()); // JSONパーサー

// APIエンドポイントの設定
app.use('/api/analyze-career', analyzeCareerRouter);
app.use('/api/generate-scout-message', generateScoutMessageRouter);
app.use('/api/chat', chatRouter);

// ヘルスチェックエンドポイント
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// エラーハンドリングミドルウェア
app.use((err, req, res, next) => {
  console.error('サーバーエラー:', err);
  res.status(500).json({ error: 'サーバー内部エラーが発生しました' });
});

// 404ハンドラー
app.use((req, res) => {
  res.status(404).json({ error: 'リクエストされたリソースが見つかりません' });
});

// サーバー起動
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`サーバー起動: http://localhost:${PORT}`);
  console.log(`環境: ${process.env.NODE_ENV || 'development'}`);
});

// 未処理の例外と拒否されたPromiseのハンドリング
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
}); 