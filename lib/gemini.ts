import { GoogleGenerativeAI } from '@google/generative-ai';

// 環境変数の型定義
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_GOOGLE_API_KEY?: string;
      GOOGLE_API_KEY?: string;
    }
  }
}

// 設定定数
const TIMEOUT_MS = 30000; // 30秒タイムアウト
const MAX_RETRIES = 3; // 最大リトライ回数
const RETRY_DELAY_MS = 1000; // リトライ間隔

// 環境変数からAPIキーを取得
const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || process.env.GOOGLE_API_KEY;

// APIキーの検証
if (!apiKey) {
  console.error('Gemini APIキーが設定されていません。環境変数を確認してください。');
}

// Gemini APIクライアントの初期化
let genAI: GoogleGenerativeAI | null = null;
let defaultModel: any = null;

try {
  if (apiKey) {
    genAI = new GoogleGenerativeAI(apiKey);
    defaultModel = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro-latest",
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    });
  }
} catch (error) {
  console.error('Gemini API初期化エラー:', error);
}

// タイムアウト付きのPromise実行
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error(`操作がタイムアウトしました（${timeoutMs}ms）`)), timeoutMs)
    )
  ]);
}

// 指数バックオフでのリトライ機能
async function withRetry<T>(
  fn: () => Promise<T>, 
  maxRetries: number = MAX_RETRIES,
  baseDelay: number = RETRY_DELAY_MS
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // 指数バックオフ（1秒、2秒、4秒...）
      const delay = baseDelay * Math.pow(2, attempt);
      console.warn(`API呼び出し失敗（試行 ${attempt + 1}/${maxRetries + 1}）。${delay}ms後にリトライします:`, lastError.message);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

/**
 * 候補者のキャリア情報を分析して評価する
 * @param candidateInfo 候補者のキャリア情報
 * @param requirements 求人要件
 * @returns 分析結果（スコアと合否判定）
 */
export async function analyzeCareer(candidateInfo: string, requirements: string) {
  try {
    // APIキーの確認
    if (!apiKey || !defaultModel) {
      throw new Error('Gemini APIが初期化されていません。API設定を確認してください。');
    }

    // 入力値の検証
    if (!candidateInfo?.trim()) {
      throw new Error('候補者情報が空です');
    }

    if (!requirements?.trim()) {
      throw new Error('求人要件が空です');
    }

    console.log('キャリア分析を開始:', { 
      candidateLength: candidateInfo.length, 
      requirementsLength: requirements.length 
    });

    // プロンプトの作成
    const prompt = `
あなたは採用担当者の意思決定を支援するAIアシスタントです。
以下の候補者情報をもとに、求人要件に対する適合度を評価し、正確なJSONフォーマットで回答してください。

# 求人要件
${requirements}

# 候補者情報
${candidateInfo}

# 出力形式（必ずこのJSONフォーマットで回答してください）
{
  "score": 数値（0〜100の整数）,
  "status": "合格" または "不合格",
  "reasoning": "判断の根拠を150字以内で簡潔に説明"
}

# 評価基準
- 90以上: 非常に優れた適合性
- 70-89: 良好な適合性  
- 50-69: 平均的な適合性
- 30-49: やや不十分な適合性
- 30未満: 不適合

スコアが70以上の場合は「合格」、70未満の場合は「不合格」としてください。
必ずJSON形式のみで回答し、説明文は含めないでください。
`;

    // APIリクエストをタイムアウトとリトライ付きで実行
    const result = await withRetry(async () => {
      return await withTimeout(
        defaultModel.generateContent(prompt),
        TIMEOUT_MS
      );
    }) as any;

    const text = result.response.text();
    console.log('Gemini APIレスポンス受信:', { responseLength: text.length });

    // JSONレスポンスの解析
    try {
      // JSONブロックを抽出（```json や余分なテキストを除去）
      let jsonText = text.trim();
      
      // マークダウンのコードブロックを除去
      jsonText = jsonText.replace(/```json\s*\n?/g, '').replace(/```\s*$/g, '');
      
      // JSONオブジェクトのみを抽出
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('有効なJSONが見つかりません');
      }

      const analysis = JSON.parse(jsonMatch[0]);
      
      // レスポンスの検証
      if (typeof analysis.score !== 'number' || 
          analysis.score < 0 || analysis.score > 100 ||
          !['合格', '不合格'].includes(analysis.status) || 
          typeof analysis.reasoning !== 'string' ||
          analysis.reasoning.length === 0) {
        throw new Error('APIレスポンスの形式が不正です');
      }

      console.log('キャリア分析完了:', { 
        score: analysis.score, 
        status: analysis.status 
      });

      return {
        success: true,
        data: {
          score: Math.round(analysis.score), // 整数に丸める
          status: analysis.status,
          reasoning: analysis.reasoning.trim()
        }
      };
    } catch (parseError) {
      console.error('JSON解析エラー:', parseError);
      console.error('受信したレスポンス:', text);
      throw new Error(`APIレスポンスの解析に失敗しました: ${parseError instanceof Error ? parseError.message : '不明なエラー'}`);
    }
  } catch (error) {
    console.error('キャリア分析エラー:', error);
    const errorMessage = error instanceof Error ? error.message : '不明なエラーが発生しました';
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * スカウトメッセージを生成する
 * @param candidateInfo 候補者のキャリア情報
 * @param company 企業名
 * @param position ポジション
 * @param sender 送信者名
 * @returns 生成されたスカウトメッセージ
 */
export async function generateScoutMessage(
  candidateInfo: string,
  company: string,
  position: string,
  sender: string
) {
  try {
    // APIキーの確認
    if (!apiKey || !defaultModel) {
      throw new Error('Gemini APIが初期化されていません。API設定を確認してください。');
    }

    // 入力値の検証
    if (!candidateInfo?.trim()) {
      throw new Error('候補者情報が空です');
    }

    const companyName = company?.trim() || '当社';
    const positionName = position?.trim() || '募集ポジション';
    const senderName = sender?.trim() || '採用担当者';

    console.log('スカウトメッセージ生成を開始:', { 
      company: companyName, 
      position: positionName,
      sender: senderName
    });

    // プロンプトの作成
    const prompt = `
あなたは経験豊富な採用担当者です。
以下の情報をもとに、候補者への魅力的なスカウトメッセージを生成してください。

# 候補者情報
${candidateInfo}

# 企業情報
企業名: ${companyName}
ポジション: ${positionName}
送信者: ${senderName}

# メッセージ要件
以下の要素を含む、丁寧で誠実なスカウトメッセージを800字程度で作成してください：

1. 適切な挨拶
2. 候補者の経験・スキルへの具体的な言及と評価
3. 企業の魅力や特徴の紹介
4. ポジションの詳細と期待する役割
5. 候補者にとってのメリットや成長機会
6. 次のステップの具体的な提案
7. 丁寧な締めの挨拶

# 注意事項
- 候補者の経験を具体的に言及し、なぜその人を選んだかを明確にする
- 過度な営業的表現は避け、誠実で信頼できるトーンを保つ
- 段落分けを適切に行い、読みやすくする
- 敬語を正しく使用する

プレーンテキストで回答し、余分な説明は含めないでください。
`;

    // APIリクエストをタイムアウトとリトライ付きで実行
    const result = await withRetry(async () => {
      return await withTimeout(
        defaultModel.generateContent(prompt),
        TIMEOUT_MS
      );
    }) as any;

    const message = result.response.text().trim();
    console.log('スカウトメッセージ生成完了:', { messageLength: message.length });

    if (!message || message.length < 50) {
      throw new Error('生成されたメッセージが短すぎます');
    }

    return {
      success: true,
      message
    };
  } catch (error) {
    console.error('スカウトメッセージ生成エラー:', error);
    const errorMessage = error instanceof Error ? error.message : '不明なエラーが発生しました';
    
    return {
      success: false,
      error: errorMessage,
      message: null
    };
  }
} 