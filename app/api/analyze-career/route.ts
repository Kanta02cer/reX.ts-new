import { NextRequest, NextResponse } from 'next/server';
import { analyzeCareer } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    // リクエストからJSONデータを取得
    const data = await request.json();
    const { candidateInfo, requirements } = data;

    // パラメータ検証
    if (!candidateInfo) {
      return NextResponse.json(
        { error: '候補者情報が見つかりません' },
        { status: 400 }
      );
    }

    if (!requirements) {
      return NextResponse.json(
        { error: '企業要件を入力してください' },
        { status: 400 }
      );
    }

    // 分析実行
    const analysisResult = await analyzeCareer(candidateInfo, requirements);
    
    if (!analysisResult.success) {
      console.error('分析エラー:', analysisResult.error);
      return NextResponse.json(
        { 
          error: '分析に失敗しました',
          details: analysisResult.error
        },
        { status: 500 }
      );
    }
    
    // レスポンスを返却
    return NextResponse.json({
      success: true,
      data: analysisResult.data
    });
    
  } catch (error) {
    console.error('API error:', error);
    
    // エラーの種類に応じたレスポンス
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'リクエストのJSON形式が不正です' },
        { status: 400 }
      );
    }
    
    if (error instanceof Error && error.message.includes('APIキー')) {
      return NextResponse.json(
        { error: 'APIキーの設定が必要です' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
} 