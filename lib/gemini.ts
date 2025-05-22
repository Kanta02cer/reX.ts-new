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

// 環境変数からAPIキーを取得
const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || process.env.GOOGLE_API_KEY;

// APIキーの検証
if (!apiKey) {
  throw new Error('Gemini APIキーが設定されていません。環境変数 GOOGLE_API_KEY または NEXT_PUBLIC_GOOGLE_API_KEY を設定してください。');
}

// Gemini APIクライアントの初期化
const genAI = new GoogleGenerativeAI(apiKey);

// デフォルトのGeminiモデル
const defaultModel = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

/**
 * 候補者のキャリア情報を分析して評価する
 * @param candidateInfo 候補者のキャリア情報
 * @param requirements 求人要件
 * @returns 分析結果（スコアと合否判定）
 */
export async function analyzeCareer(candidateInfo: string, requirements: string) {
  try {
    // 入力値の検証
    if (!candidateInfo || !requirements) {
      throw new Error('候補者情報と求人要件は必須です');
    }

    // プロンプトの作成
    const prompt = `
    あなたは採用担当者の意思決定を支援するAIアシスタントです。
    以下の候補者情報をもとに、求人要件に対する適合度を評価し、0～100の数値スコアと合否判定を出力してください。

    # 求人要件
    ${requirements}

    # 候補者情報
    ${candidateInfo}

    # 出力形式
    {
      "score": 数値（0〜100）,
      "status": "合格" または "不合格",
      "reasoning": "判断の根拠を3行程度で簡潔に説明"
    }

    評価基準:
    - 90以上: 非常に優れた適合性
    - 70-89: 良好な適合性
    - 50-69: 平均的な適合性
    - 30-49: やや不十分な適合性
    - 30未満: 不適合

    スコアが70以上の場合は「合格」、70未満の場合は「不合格」としてください。
    JSONフォーマットのみで回答してください。
    `;

    // APIリクエスト
    const result = await defaultModel.generateContent(prompt);
    const text = result.response.text();

    // JSONレスポンスの解析
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('APIレスポンスがJSON形式ではありません');
      }

      const analysis = JSON.parse(jsonMatch[0]);
      
      // レスポンスの検証
      if (typeof analysis.score !== 'number' || 
          !['合格', '不合格'].includes(analysis.status) || 
          typeof analysis.reasoning !== 'string') {
        throw new Error('APIレスポンスの形式が不正です');
      }

      return {
        success: true,
        data: analysis
      };
    } catch (parseError) {
      console.error('JSON解析エラー:', parseError);
      console.error('APIレスポンス:', text);
      throw new Error('APIレスポンスの解析に失敗しました');
    }
  } catch (error) {
    console.error('キャリア分析エラー:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '不明なエラーが発生しました'
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
    // 入力値の検証
    if (!candidateInfo) {
      throw new Error('候補者情報は必須です');
    }

    // プロンプトの作成
    const prompt = `
    あなたは採用担当者のアシスタントです。
    以下の情報をもとに、候補者へのスカウトメッセージを生成してください。

    # 候補者情報
    ${candidateInfo}

    # 企業情報
    企業名: ${company || '当社'}
    ポジション: ${position || '募集ポジション'}
    送信者: ${sender || '採用担当者'}

    以下の形式でメッセージを生成してください：
    1. 冒頭の挨拶
    2. 企業の特徴や魅力の紹介
    3. 候補者の経験やスキルへの言及
    4. ポジションの説明と期待
    5. 次のステップの提案
    6. 締めの挨拶

    メッセージは丁寧で誠実なトーンで、候補者の経験やスキルを具体的に言及してください。
    文字数は800字程度で、段落分けを適切に行ってください。
    `;

    // APIリクエスト
    const result = await defaultModel.generateContent(prompt);
    const message = result.response.text();

    return {
      success: true,
      message
    };
  } catch (error) {
    console.error('スカウトメッセージ生成エラー:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '不明なエラーが発生しました'
    };
  }
} 