/**
 * Gemini API連携サービス
 * 
 * このモジュールはGoogle Gemini APIとの連携機能を提供します。
 * キャリアデータ分析、スカウトメッセージ生成などの機能に必要なAIモデルとの
 * 通信を一元管理します。
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

// 環境変数からAPIキーを取得
const apiKey = process.env.GOOGLE_API_KEY;

// APIキーが設定されているか確認
if (!apiKey) {
  console.error('GOOGLE_API_KEY が設定されていません。環境変数を確認してください。');
}

// Gemini API クライアントの初期化
const genAI = new GoogleGenerativeAI(apiKey || '');

// 利用可能なモデルの配列 - 優先順位順
const AVAILABLE_MODELS = [
  "gemini-1.5-flash",
  "gemini-1.5-pro",
  "gemini-pro",
  "gemini-pro-vision"
];

/**
 * 利用可能なGeminiモデルを探す
 * @returns {Promise<string>} 利用可能なモデル名
 */
async function findWorkingModel() {
  for (const modelName of AVAILABLE_MODELS) {
    try {
      console.log(`モデル ${modelName} をテスト中...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      // 簡単なテストリクエスト
      await model.generateContent("test");
      console.log(`モデル ${modelName} が利用可能です`);
      return modelName;
    } catch (error) {
      console.error(`モデル ${modelName} は利用できません:`, error.message || "不明なエラー");
    }
  }
  throw new Error("利用可能なGeminiモデルが見つかりませんでした");
}

// モデル名の初期値（findWorkingModelで上書きされる）
let workingModelName = 'gemini-1.5-pro';

// 初期化時に利用可能なモデルを検索
findWorkingModel()
  .then(modelName => {
    workingModelName = modelName;
    console.log(`デフォルトモデルを ${workingModelName} に設定しました`);
  })
  .catch(error => {
    console.error('モデル初期化エラー:', error);
  });

/**
 * 指数バックオフによるリトライ実行
 * @param {Function} fn 実行する非同期関数
 * @param {number} maxRetries 最大リトライ回数
 * @param {number} baseDelay 基本待機時間（ミリ秒）
 * @returns {Promise<any>} 実行結果
 */
async function withRetry(fn, maxRetries = 3, baseDelay = 1000) {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // 最終試行でエラーの場合はそのままエラーを投げる
      if (attempt === maxRetries) {
        throw error;
      }
      
      // リトライすべきエラーか判断
      const shouldRetry = 
        error.message.includes('429') || // レート制限
        error.message.includes('500') || // サーバーエラー
        error.message.includes('503') || // サービス利用不可
        error.message.includes('timeout'); // タイムアウト
      
      if (!shouldRetry) {
        throw error; // リトライ不要なエラーはそのまま投げる
      }
      
      // 待機時間を計算（指数バックオフ）
      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`APIエラー発生: ${error.message}. ${delay}ms後に再試行します (${attempt + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // 念のためのフォールバック
  throw lastError;
}

/**
 * テキスト生成のための共通関数
 * @param {string} prompt 生成のためのプロンプト
 * @param {Object} options 生成オプション
 * @returns {Promise<string>} 生成されたテキスト
 */
async function generateText(prompt, options = {}) {
  const requestId = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  
  console.log(`リクエスト開始 [${requestId}]: プロンプト長=${prompt.length}文字, モデル=${options.modelName || workingModelName}`);
  
  try {
    return await withRetry(async () => {
      const model = genAI.getGenerativeModel({
        model: options.modelName || workingModelName,
        generationConfig: {
          temperature: options.temperature || 0.7,
          maxOutputTokens: options.maxTokens || 1000,
          topP: options.topP || 0.8,
          topK: options.topK || 40,
        },
      });

      const startTime = Date.now();
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const elapsedTime = Date.now() - startTime;
      
      console.log(`リクエスト成功 [${requestId}]: 応答長=${response.text().length}文字, 処理時間=${elapsedTime}ms`);
      
      return response.text();
    });
  } catch (error) {
    console.error(`テキスト生成エラー [${requestId}]:`, error);
    console.error(`エラー詳細 [${requestId}]:`, JSON.stringify({
      errorType: error.name,
      errorMessage: error.message,
      stack: error.stack,
      promptLength: prompt.length,
      model: options.modelName || workingModelName,
      timestamp: new Date().toISOString()
    }));
    
    throw new Error(`Gemini APIエラー: ${error.message || "不明なエラー"}`);
  }
}

/**
 * キャリアデータを分析する
 * @param {Object} data 分析用データ
 * @returns {Promise<Object>} 分析結果
 */
async function analyzeCareer(data) {
  const { resumeText, jobDescription, requiredSkills, preferredSkills } = data;
  
  const prompt = `
# 候補者のキャリアデータ分析

## 履歴書テキスト:
${resumeText}

## 職務内容:
${jobDescription}

## 必須スキル:
${requiredSkills.join(', ')}

## 歓迎スキル:
${preferredSkills.join(', ')}

---

候補者の履歴書と職務要件を照らし合わせて、以下の形式で詳細な分析を行ってください:
1. 総合評価スコア (0-100): 職務との適合度を数値で表現
2. スキル分析: 持っているスキルと不足しているスキルのリスト
3. 経験評価: 職務に関連する経験の評価
4. 強み: 候補者の顕著な強み (3-5点)
5. 弱み: 改善が必要な領域 (3-5点)
6. 推薦コメント: 採用担当者向けのコメント

分析結果はJSON形式で返してください。
  `;

  try {
    const analysisText = await generateText(prompt, { temperature: 0.2 });
    let analysis;
    
    try {
      // JSONレスポンスの抽出を試みる
      const jsonMatch = analysisText.match(/```json\n([\s\S]*?)\n```/) || 
                        analysisText.match(/\{[\s\S]*\}/);
      
      const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : analysisText;
      analysis = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('JSON解析エラー:', parseError);
      console.log('原文:', analysisText);
      
      // 構造化されたテキストを返す
      return {
        rawAnalysis: analysisText,
        error: '応答の解析に失敗しました',
      };
    }
    
    return analysis;
  } catch (error) {
    console.error('キャリア分析エラー:', error);
    throw error;
  }
}

/**
 * スカウトメッセージを生成する
 * @param {Object} data スカウトデータ
 * @returns {Promise<Object>} 生成結果
 */
async function generateScoutMessage(data) {
  const requestId = Date.now().toString(36);
  console.log(`スカウトメッセージ生成開始 [${requestId}]`);
  
  try {
    // 入力データのバリデーションと正規化
    const { candidateInfo, jobDetails, companyInfo } = data;
    
    // 詳細なデバッグ情報をログ
    console.log(`スカウトメッセージ入力データ [${requestId}]:`, JSON.stringify({
      candidateInfoLength: JSON.stringify(candidateInfo).length,
      jobDetailsLength: JSON.stringify(jobDetails).length,
      companyInfoLength: JSON.stringify(companyInfo).length
    }));

    // プロンプトの最適化 - 長さと構造を改善
    const prompt = _buildOptimizedScoutMessagePrompt(candidateInfo, jobDetails, companyInfo);
    
    // 最適化されたプロンプトで生成を実行（温度を少し下げて安定性を高める）
    const messageText = await generateText(prompt, { 
      temperature: 0.6,
      maxTokens: 800,  // トークン数を制限して不要な出力を防ぐ
    });
    
    let messageData;
    
    try {
      // JSONレスポンスの抽出を試みる
      const jsonMatch = messageText.match(/```json\n([\s\S]*?)\n```/) || 
                         messageText.match(/\{[\s\S]*\}/);
      
      const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : messageText;
      messageData = JSON.parse(jsonStr);
      
      console.log(`スカウトメッセージ生成成功 [${requestId}]`);
    } catch (parseError) {
      console.error(`JSON解析エラー [${requestId}]:`, parseError);
      
      // エラー時のフォールバック処理 - 構造化データを手動で抽出
      console.log(`フォールバック処理実行 [${requestId}] - 生成テキストから手動で構造を抽出`);
      
      // メッセージ本文の抽出を試みる
      const messageBody = messageText
        .replace(/```json[\s\S]*?```/g, '')
        .replace(/```[\s\S]*?```/g, '')
        .trim();
      
      messageData = {
        message: messageBody,
        variations: [],
        error: '応答の解析に失敗しました',
        rawResponse: messageText.substring(0, 500) + '...' // デバッグ用に一部を保存
      };
    }
    
    return messageData;
  } catch (error) {
    console.error(`スカウトメッセージ生成エラー [${requestId}]:`, error);
    
    // エラーの種類を特定して適切なメッセージを返す
    let errorMessage = 'スカウトメッセージの生成に失敗しました';
    let errorCode = 'GENERATION_FAILED';
    
    if (error.message.includes('429')) {
      errorMessage = 'APIリクエスト数の上限に達しました。しばらく経ってから再試行してください。';
      errorCode = 'RATE_LIMIT_EXCEEDED';
    } else if (error.message.includes('invalid')) {
      errorMessage = '入力データが不正です。データ形式を確認してください。';
      errorCode = 'INVALID_INPUT';
    } else if (error.message.includes('timeout')) {
      errorMessage = 'リクエストがタイムアウトしました。処理時間が長すぎる可能性があります。';
      errorCode = 'REQUEST_TIMEOUT';
    }
    
    throw {
      message: errorMessage,
      code: errorCode,
      originalError: error.message,
      requestId
    };
  }
}

/**
 * スカウトメッセージ用の最適化されたプロンプトを構築
 * @private
 */
function _buildOptimizedScoutMessagePrompt(candidateInfo, jobDetails, companyInfo) {
  // スキル配列の適切な処理
  const skills = Array.isArray(candidateInfo.skills) 
    ? candidateInfo.skills.join(', ') 
    : candidateInfo.skills || '';
    
  // 福利厚生配列の適切な処理
  const benefits = Array.isArray(jobDetails.benefits) 
    ? jobDetails.benefits.join(', ') 
    : jobDetails.benefits || '';

  return `
# スカウトメッセージ生成

## 候補者情報:
- 名前: ${candidateInfo.name || '候補者'}
- スキル: ${skills}
- 経験: ${candidateInfo.experience || '不明'}
- 現職: ${candidateInfo.currentPosition || '不明'}

## 募集情報:
- 職種: ${jobDetails.title || '募集職種'}
- 職務内容: ${jobDetails.description || ''}
- 待遇・福利厚生: ${benefits}

## 会社情報:
- 会社名: ${companyInfo.name || ''}
- 企業文化: ${companyInfo.culture || ''}
- 強み・特徴: ${companyInfo.usp || ''}

---

上記の情報に基づいて、候補者へのパーソナライズされたスカウトメッセージを作成してください。以下の点に注意してください:
1. 候補者の経験やスキルに言及し、なぜこの求人に適しているかを説明する
2. 会社の強みやポジションの魅力を具体的に伝える
3. 丁寧かつ専門的な日本語で、誠実な印象を与える文章
4. 適切な長さ（300-400文字程度）に収める
5. カジュアルなトーンと丁寧なトーンの2種類のバリエーションを作成する

次の形式のJSONオブジェクトのみを返してください:
{
  "message": "メインのスカウトメッセージ（丁寧なトーン）",
  "variations": [
    "カジュアルなトーンのバリエーション"
  ]
}
  `;
}

module.exports = {
  generateText,
  analyzeCareer,
  generateScoutMessage,
  findWorkingModel
}; 