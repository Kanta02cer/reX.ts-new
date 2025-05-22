import { NextRequest, NextResponse } from 'next/server';
import { analyzeCareer, generateScoutMessage } from '@/lib/gemini';
import { saveCandidateData } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    // リクエストからJSONデータを取得
    const data = await request.json();
    const { candidateInfo, requirements, company, position, sender } = data;

    // パラメータ検証
    if (!candidateInfo) {
      return NextResponse.json({ error: '候補者情報が見つかりません' }, { status: 400 });
    }

    if (!requirements) {
      return NextResponse.json({ error: '企業要件を入力してください' }, { status: 400 });
    }

    // 1. 候補者分析を実行
    const analysisResult = await analyzeCareer(candidateInfo, requirements);
    
    if (!analysisResult.success) {
      return NextResponse.json({ 
        error: '分析に失敗しました', 
        details: analysisResult.error 
      }, { status: 500 });
    }

    const { score, status, reasoning } = analysisResult.data;
    
    // 候補者名を取得
    let name = '不明';
    
    // candidateInfoからの名前抽出を試みる
    const nameMatch = candidateInfo.match(/名前[：:]\s*([^\n]+)/);
    const fullNameMatch = candidateInfo.match(/氏名[：:]\s*([^\n]+)/);
    if (nameMatch) name = nameMatch[1].trim();
    else if (fullNameMatch) name = fullNameMatch[1].trim();
    
    // 2. 「合格」の場合のみスカウトメッセージを生成
    let scoutText = '';
    
    if (status === '合格') {
      const scoutResult = await generateScoutMessage(
        candidateInfo,
        company || '',
        position || '',
        sender || ''
      );
      
      if (scoutResult.success && scoutResult.message) {
        scoutText = scoutResult.message;
      }
    }
    
    // 3. Supabaseに結果を保存（設定されている場合）
    let saveResult = null;
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      try {
        saveResult = await saveCandidateData({
          name,
          score: typeof score === 'number' ? score : parseInt(score),
          status,
          scoutText,
          requirements,
          company: company || ''
        });
      } catch (error) {
        console.error('Failed to save to Supabase:', error);
      }
    }
    
    // 4. レスポンスを返却
    return NextResponse.json({ 
      success: true,
      analysis: analysisResult.data,
      scoutMessage: scoutText,
      saved: !!saveResult?.success,
      candidateName: name
    });
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
} 