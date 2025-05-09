// レート制限の設定（例：1分間に最大10リクエスト）
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1分間
  max: 10, // 最大10リクエスト
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'リクエスト数の上限に達しました。しばらく経ってから再試行してください。' }
});

// ルーターの作成
router.use(apiLimiter);

router.post('/', async (req, res) => {
  try {
    const { resume, jobDescription } = req.body;
    
    // 入力検証
    if (!resume || !jobDescription) {
      return res.status(400).json({ error: '履歴書と求人情報は必須です' });
    }
    
    // 入力サイズの検証
    if (resume.length > 10000 || jobDescription.length > 5000) {
      return res.status(400).json({ error: '入力テキストが長すぎます' });
    }

    // Gemini APIでの分析
    const result = await geminiService.analyzeCareer(resume, jobDescription);
    
    // 結果の検証
    if (!result || !result.skillMatchPercentage) {
      throw new Error('AIによる分析に失敗しました');
    }
    
    res.json(result);
  } catch (error) {
    console.error('キャリア分析エラー:', error);
    
    // エラーの種類に応じたレスポンス
    if (error.message.includes('API key')) {
      res.status(401).json({ error: 'APIキー認証エラー' });
    } else if (error.message.includes('rate limit') || error.message.includes('quota')) {
      res.status(429).json({ error: 'APIレート制限に達しました。しばらく経ってから再試行してください。' });
    } else if (error.name === 'AbortError' || error.code === 'ECONNABORTED') {
      res.status(504).json({ error: 'APIリクエストがタイムアウトしました。しばらく経ってから再試行してください。' });
    } else {
      res.status(500).json({ error: 'キャリア分析中にエラーが発生しました' });
    }
  }
}); 