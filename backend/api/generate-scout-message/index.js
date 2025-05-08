/**
 * スカウトメッセージ生成APIルート
 */

const express = require('express');
const router = express.Router();
const geminiService = require('../../gemini/geminiService');

/**
 * スカウトメッセージ生成エンドポイント
 * @route POST /api/generate-scout-message
 */
router.post('/', async (req, res, next) => {
  try {
    const { candidateInfo, jobDetails, companyInfo } = req.body;
    
    // 必須フィールドのバリデーション
    if (!candidateInfo || !jobDetails || !companyInfo) {
      return res.status(400).json({ 
        error: '候補者情報、職務詳細、会社情報は必須です' 
      });
    }
    
    // candidateInfoのバリデーション
    if (!candidateInfo.name || !candidateInfo.skills || !candidateInfo.experience) {
      return res.status(400).json({ 
        error: '候補者情報には名前、スキル、経験が必要です' 
      });
    }
    
    // jobDetailsのバリデーション
    if (!jobDetails.title || !jobDetails.description) {
      return res.status(400).json({ 
        error: '職務詳細には職種名と職務内容が必要です' 
      });
    }
    
    // companyInfoのバリデーション
    if (!companyInfo.name) {
      return res.status(400).json({ 
        error: '会社情報には会社名が必要です' 
      });
    }
    
    // データの正規化（配列の確認など）
    const normalizedData = {
      candidateInfo: {
        ...candidateInfo,
        skills: Array.isArray(candidateInfo.skills) ? candidateInfo.skills : [candidateInfo.skills]
      },
      jobDetails: {
        ...jobDetails,
        benefits: Array.isArray(jobDetails.benefits) ? jobDetails.benefits : []
      },
      companyInfo
    };
    
    // スカウトメッセージ生成の実行
    const messageResult = await geminiService.generateScoutMessage(normalizedData);
    
    // クライアントに結果を返す
    res.json(messageResult);
  } catch (error) {
    console.error('スカウトメッセージ生成エラー:', error);
    next(error);
  }
});

module.exports = router; 