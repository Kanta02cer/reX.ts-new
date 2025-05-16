/**
 * 合格者向けスカウト文章生成API
 */

const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Gemini APIの初期化
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

// スカウト文章生成プロンプトテンプレート
const generateScoutMessagePrompt = (candidateInfo, jobDescription, analysis) => `
あなたは採用担当者です。以下の合格となった候補者情報と採用条件、分析結果を基に、パーソナライズされたスカウトメッセージを日本語で作成してください。

【候補者情報】
${candidateInfo}

【採用条件】
${jobDescription}

【分析結果】
${JSON.stringify(analysis, null, 2)}

【作成するスカウトメッセージの条件】
- 候補者の強みと採用条件との関連性を具体的に言及する
- 候補者が持つ特定のスキルや経験を評価する内容を含める
- 丁寧かつプロフェッショナルなトーンで書く
- 300〜500文字程度
- 結びには面接への招待と明確な次のステップを提案する
- 会社名としては「テクノバンク株式会社」を使用する

スカウトメッセージのみを出力し、余分な説明は不要です。
`;

router.post('/', async (req, res) => {
  try {
    const { candidateInfo, jobDescription, analysis, hiringDecision } = req.body;
    
    // 必須パラメータの検証
    if (!candidateInfo || !jobDescription) {
      return res.status(400).json({ 
        error: '候補者情報と採用条件は必須です' 
      });
    }
    
    // 採用判断の検証（合格者のみスカウト文を生成）
    const decision = hiringDecision?.decision || analysis?.hiringDecision?.decision;
    if (decision !== '採用' && !req.query.force) {
      return res.status(400).json({
        error: 'スカウト文章は採用判断が「採用」の候補者にのみ生成できます',
        decision: decision || '不明'
      });
    }

    const prompt = generateScoutMessagePrompt(candidateInfo, jobDescription, analysis);
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    const scoutMessage = response.text();
    
    res.json({
      scoutMessage,
      candidateName: extractCandidateName(candidateInfo),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('スカウト文章生成エラー:', error);
    res.status(500).json({
      error: 'スカウト文章の生成中にエラーが発生しました',
      details: error.message
    });
  }
});

// 候補者名を抽出する補助関数
function extractCandidateName(candidateInfo) {
  // 「名前：」または「氏名：」などのパターンを検索
  const nameMatch = candidateInfo.match(/(?:名前|氏名)[:：]\s*([^\n,，]+)/);
  if (nameMatch && nameMatch[1]) {
    return nameMatch[1].trim();
  }
  // デフォルト値
  return '候補者様';
}

module.exports = router; 