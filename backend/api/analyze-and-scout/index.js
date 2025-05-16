/**
 * 候補者分析と合格者向けスカウト文章生成を一括処理するAPI
 */

const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Gemini APIの初期化
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

// 候補者分析プロンプトテンプレート
const analyzeCareerPrompt = (resumeData, jobRequirements) => `
あなたは人事採用のAIアシスタントです。以下の候補者のキャリア情報と採用条件を分析し、採用可否を判断してください。

【候補者情報】
${resumeData}

【採用条件】
${jobRequirements}

以下の形式でJSONレスポンスを生成してください：
{
  "skillAnalysis": {
    "technicalSkills": [候補者の技術スキルのリスト],
    "softSkills": [候補者のソフトスキルのリスト],
    "missingSkills": [採用条件に対して不足しているスキルのリスト]
  },
  "experienceAnalysis": {
    "relevantExperience": "関連業界・職種での経験の説明",
    "yearsOfExperience": 経験年数（数値）,
    "relevanceScore": 採用条件との関連度（0-100の数値）
  },
  "evaluationResult": {
    "overallScore": 総合評価スコア（0-100の数値）,
    "strengths": [候補者の強みのリスト（3点）],
    "concerns": [懸念点のリスト（あれば最大2点）],
    "interviewFocus": [面接で確認すべき事項のリスト]
  },
  "hiringDecision": {
    "decision": "採用" または "不採用" または "検討",
    "justification": "判断理由の説明",
    "recommendedPosition": "推奨ポジション（該当する場合）"
  }
}

採用可否判断基準:
- 「採用」: 総合評価スコアが80以上で、採用条件の必須スキルをほぼ満たしている
- 「検討」: 総合評価スコアが60-79で、不足しているスキルが補完可能
- 「不採用」: 総合評価スコアが60未満、または必須スキルが著しく不足

回答はJSON形式のみで出力し、余分な説明は不要です。
`;

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
    const { resumeData, jobRequirements } = req.body;
    
    if (!resumeData || !jobRequirements) {
      return res.status(400).json({ 
        error: '候補者情報と採用条件は必須です' 
      });
    }

    // 1. 候補者分析を実行
    const analysisPrompt = analyzeCareerPrompt(resumeData, jobRequirements);
    const analysisResult = await model.generateContent(analysisPrompt);
    const analysisResponse = analysisResult.response;
    let analysisText = analysisResponse.text();
    
    // JSON形式に変換（余分なテキストがある場合は削除）
    let analysisJson;
    try {
      // JSON部分を抽出 (バックティックや```jsonなどが含まれる場合に対応)
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisText = jsonMatch[0];
      }
      analysisJson = JSON.parse(analysisText);
    } catch (parseError) {
      console.error('JSON解析エラー:', parseError);
      return res.status(500).json({
        error: '分析結果の形式が不正です',
        rawText: analysisText
      });
    }
    
    // 採用判断の結果を取得
    const hiringDecision = analysisJson.hiringDecision || { decision: '不明' };
    const isHired = hiringDecision.decision === '採用';
    
    // レスポンスの準備
    const response = {
      analysis: analysisJson,
      isHired,
      isConsidered: hiringDecision.decision === '検討',
      decision: hiringDecision.decision,
      justification: hiringDecision.justification,
      timestamp: new Date().toISOString()
    };
    
    // 2. 採用の場合のみスカウト文章を生成
    if (isHired) {
      const scoutPrompt = generateScoutMessagePrompt(resumeData, jobRequirements, analysisJson);
      const scoutResult = await model.generateContent(scoutPrompt);
      const scoutResponse = scoutResult.response;
      const scoutMessage = scoutResponse.text();
      
      // スカウト文章を追加
      response.scoutMessage = scoutMessage;
      response.candidateName = extractCandidateName(resumeData);
    }
    
    res.json(response);
  } catch (error) {
    console.error('処理エラー:', error);
    res.status(500).json({
      error: '処理中にエラーが発生しました',
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