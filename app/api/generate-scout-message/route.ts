import { NextRequest, NextResponse } from 'next/server';
import { generateScoutMessage } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    // リクエストからJSONデータを取得
    const data = await request.json();
    const { candidateInfo, companyInfo, position, senderName } = data;

    // パラメータ検証
    if (!candidateInfo) {
      return NextResponse.json({ error: '候補者情報が見つかりません' }, { status: 400 });
    }

    if (!companyInfo) {
      return NextResponse.json({ error: '企業情報を入力してください' }, { status: 400 });
    }

    // スカウトメッセージ生成
    const scoutResult = await generateScoutMessage(
      candidateInfo,
      companyInfo,
      position || '',
      senderName || ''
    );
    
    if (!scoutResult.success) {
      return NextResponse.json({ 
        error: 'スカウトメッセージの生成に失敗しました', 
        details: scoutResult.error 
      }, { status: 500 });
    }
    
    // レスポンスを返却
    return NextResponse.json(scoutResult);
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
} 