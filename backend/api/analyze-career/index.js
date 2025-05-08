/**
 * キャリアデータ分析APIルート
 */

const express = require('express');
const router = express.Router();
const geminiService = require('../../gemini/geminiService');

/**
 * キャリアデータ分析エンドポイント
 * @route POST /api/analyze-career
 */
router.post('/', async (req, res, next) => {
  try {
    const { resumeText, jobDescription, requiredSkills, preferredSkills } = req.body;
    
    // 必須フィールドのバリデーション
    if (!resumeText) {
      return res.status(400).json({ error: '履歴書テキストは必須です' });
    }
    
    if (!jobDescription) {
      return res.status(400).json({ error: '職務内容は必須です' });
    }
    
    // 配列が提供されていない場合は空の配列を使用
    const reqSkills = Array.isArray(requiredSkills) ? requiredSkills : [];
    const prefSkills = Array.isArray(preferredSkills) ? preferredSkills : [];
    
    // キャリアデータの分析実行
    const analysisResult = await geminiService.analyzeCareer({
      resumeText,
      jobDescription,
      requiredSkills: reqSkills,
      preferredSkills: prefSkills
    });
    
    // クライアントに結果を返す
    res.json(analysisResult);
  } catch (error) {
    console.error('キャリア分析エラー:', error);
    next(error);
  }
});

module.exports = router; 