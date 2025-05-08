/**
 * Geminiチャット APIルート
 */

const express = require('express');
const router = express.Router();
const geminiService = require('../../gemini/geminiService');

/**
 * チャット会話エンドポイント
 * @route POST /api/chat
 */
router.post('/', async (req, res, next) => {
  try {
    const { messages } = req.body;
    
    // メッセージの検証
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ 
        error: 'メッセージは必須で、配列形式である必要があります' 
      });
    }
    
    // 最後のユーザーメッセージを取得
    const userMessages = messages.filter(msg => msg.role === 'user');
    if (userMessages.length === 0) {
      return res.status(400).json({ 
        error: 'ユーザーメッセージが含まれていません' 
      });
    }
    
    const lastUserMessage = userMessages[userMessages.length - 1].content;
    
    // コンテキスト構築
    const contextPrompt = messages
      .filter(msg => msg.role !== 'system')
      .map(msg => `${msg.role === 'user' ? 'ユーザー' : 'アシスタント'}: ${msg.content}`)
      .join('\n\n');
    
    // システムメッセージを取得
    const systemMessage = messages.find(msg => msg.role === 'system')?.content || 
      '採用管理に関する質問に答えるGemini AIアシスタントです。専門的で役立つ回答を提供します。';
    
    // プロンプト構築
    const prompt = `
${systemMessage}

以下の会話履歴を考慮して、最後のユーザーの質問に対して回答してください。
会話履歴:
${contextPrompt}

回答は日本語で、採用担当者に役立つ実用的な内容にしてください。
`;
    
    // Gemini APIでテキスト生成
    const messageText = await geminiService.generateText(prompt, {
      temperature: 0.7,
      maxTokens: 800
    });
    
    // クライアントにレスポンス
    res.json({
      message: messageText
    });
    
  } catch (error) {
    console.error('チャットメッセージ処理エラー:', error);
    next(error);
  }
});

module.exports = router; 