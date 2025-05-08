/**
 * AIリクルートメントシステム バックエンドサーバー
 */

// 環境変数のロード
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const promClient = require('prom-client');

// APIルーターのインポート
const analyzeCareerRouter = require('./api/analyze-career');
const generateScoutMessageRouter = require('./api/generate-scout-message');
const chatRouter = require('./api/chat');

// Prometheusメトリクスの設定
const collectDefaultMetrics = promClient.collectDefaultMetrics;
const Registry = promClient.Registry;
const register = new Registry();
collectDefaultMetrics({ register });

// カスタムメトリクスの定義
const httpRequestDurationMicroseconds = new promClient.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.1, 5, 15, 50, 100, 200, 300, 400, 500, 1000, 2000, 5000, 10000]
});
register.registerMetric(httpRequestDurationMicroseconds);

const apiRequestCounter = new promClient.Counter({
  name: 'api_requests_total',
  help: 'Total number of API requests',
  labelNames: ['method', 'endpoint', 'status']
});
register.registerMetric(apiRequestCounter);

// Expressアプリケーションの作成
const app = express();

// ミドルウェアの設定
app.use(helmet()); // セキュリティヘッダー設定
app.use(cors()); // CORS対応
app.use(morgan('dev')); // リクエストロギング
app.use(express.json()); // JSONパーサー

// リクエスト時間計測ミドルウェア
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const route = req.route ? req.route.path : req.path;
    
    httpRequestDurationMicroseconds
      .labels(req.method, route, res.statusCode)
      .observe(duration);
      
    apiRequestCounter
      .labels(req.method, req.originalUrl, res.statusCode)
      .inc();
  });
  
  next();
});

// APIエンドポイントの設定
app.use('/api/analyze-career', analyzeCareerRouter);
app.use('/api/generate-scout-message', generateScoutMessageRouter);
app.use('/api/chat', chatRouter);

// Prometheusメトリクスエンドポイント
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    console.error('Prometheus metrics generation error:', err);
    res.status(500).send('Internal Server Error');
  }
});

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
  console.log(`メトリクス利用可能: http://localhost:${PORT}/metrics`);
});

// 未処理の例外と拒否されたPromiseのハンドリング
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
}); 