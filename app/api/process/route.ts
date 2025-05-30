import { NextRequest, NextResponse } from 'next/server';
import { parseCSV, csvToObjects } from '@/lib/csvUtils';
import { analyzeCareer, generateScoutMessage } from '@/lib/gemini';
import { saveCandidateData } from '@/lib/supabase';
import { processCSVData, processCSVDataWithSelection, CSVColumnSelection } from '../../../lib/csvProcessor';
import { ApplicantInput } from '../../../lib/types';
import { analyzeCandidateProfile, generateScoutMessage as generateMockScoutMessage } from '../../../lib/mockAnalyzer';

// デバッグ用のヘルパー関数
function createErrorResponse(message: string, code: string, status: number = 400, context?: any) {
  const timestamp = new Date().toISOString();
  const requestId = Math.random().toString(36).substr(2, 9);
  
  console.error(`[${timestamp}] API Error [${requestId}]:`, {
    message,
    code,
    status,
    context
  });

  return new NextResponse(
    JSON.stringify({ 
      error: message,
      code,
      timestamp,
      requestId,
      ...(process.env.NODE_ENV === 'development' && { context })
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        'x-request-id': requestId
      },
    }
  );
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(2, 15);
  
  try {
    const formData = await request.formData();
    
    // フォームデータの取得
    const csvFile = formData.get('csv') as File | null;
    const company = formData.get('company') as string;
    const requirements = formData.get('requirements') as string;
    const sender = formData.get('sender') as string;
    const position = formData.get('position') as string;
    const inputMethod = formData.get('inputMethod') as string;
    const applicantsJson = formData.get('applicants') as string;
    const columnSelectionJson = formData.get('columnSelection') as string;

    if (process.env.NODE_ENV === 'development') {
      console.log('=== API Request Debug Info ===');
      console.log('Request ID:', requestId);
      console.log('Input method:', inputMethod);
      console.log('Has CSV file:', !!csvFile);
      console.log('Has applicants JSON:', !!applicantsJson);
      console.log('Has column selection:', !!columnSelectionJson);
      console.log('Company:', company?.substring(0, 50));
      console.log('Requirements length:', requirements?.length);
      console.log('Sender:', sender?.substring(0, 30));
      console.log('Position:', position?.substring(0, 50));
    }

    // 入力検証
    if (!company?.trim()) {
      return createErrorResponse(
        '企業名が指定されていません',
        'MISSING_COMPANY',
        400,
        { company }
      );
    }

    if (!requirements?.trim()) {
      return createErrorResponse(
        '求人要件が指定されていません',
        'MISSING_REQUIREMENTS',
        400,
        { requirements }
      );
    }

    if (!sender?.trim()) {
      return createErrorResponse(
        '送信者名が指定されていません',
        'MISSING_SENDER',
        400,
        { sender }
      );
    }

    if (!position?.trim()) {
      return createErrorResponse(
        'ポジション名が指定されていません',
        'MISSING_POSITION',
        400,
        { position }
      );
    }

    let applicantsData: any = {};

    // 申請者データの処理
    if (inputMethod === 'csv' && csvFile) {
      try {
        const csvText = await csvFile.text();
        
        if (!csvText.trim()) {
          return createErrorResponse(
            'CSVファイルが空です',
            'EMPTY_CSV_FILE',
            400,
            { fileSize: csvFile.size }
          );
        }

        // カラム選択が指定されている場合はそれを使用
        if (columnSelectionJson) {
          try {
            const columnSelection: CSVColumnSelection = JSON.parse(columnSelectionJson);
            
            if (process.env.NODE_ENV === 'development') {
              console.log('Column selection:', {
                nameColumn: columnSelection.nameColumn,
                idColumn: columnSelection.idColumn,
                skillColumnsCount: columnSelection.skillColumns.length,
                additionalColumnsCount: columnSelection.additionalColumns.length
              });
            }
            
            applicantsData = processCSVDataWithSelection(csvText, columnSelection);
          } catch (selectionError) {
            console.error('カラム選択処理エラー:', selectionError);
            return createErrorResponse(
              `カラム選択の処理に失敗しました: ${selectionError instanceof Error ? selectionError.message : '不明なエラー'}`,
              'COLUMN_SELECTION_ERROR',
              400,
              { 
                columnSelectionJson,
                error: selectionError instanceof Error ? selectionError.message : '不明なエラー'
              }
            );
          }
        } else {
          // カラム選択が指定されていない場合はデフォルト処理
          applicantsData = processCSVData(csvText);
        }

        if (process.env.NODE_ENV === 'development') {
          console.log('CSV処理完了:', {
            applicantsCount: Object.keys(applicantsData).length,
            sampleApplicant: Object.keys(applicantsData)[0] ? {
              id: Object.keys(applicantsData)[0],
              name: applicantsData[Object.keys(applicantsData)[0]]?.name,
              skillsCount: applicantsData[Object.keys(applicantsData)[0]]?.skills?.length
            } : null
          });
        }

      } catch (csvError) {
        console.error('CSV処理エラー:', csvError);
        return createErrorResponse(
          `CSVファイルの処理に失敗しました: ${csvError instanceof Error ? csvError.message : '不明なエラー'}`,
          'CSV_PROCESSING_ERROR',
          400,
          { 
            fileName: csvFile.name,
            fileSize: csvFile.size,
            error: csvError instanceof Error ? csvError.message : '不明なエラー'
          }
        );
      }
    } else if (applicantsJson) {
      try {
        const applicantsArray = JSON.parse(applicantsJson);
        
        if (!Array.isArray(applicantsArray)) {
          return createErrorResponse(
            '申請者データの形式が不正です（配列である必要があります）',
            'INVALID_APPLICANTS_FORMAT',
            400,
            { applicantsType: typeof applicantsArray }
          );
        }

        if (applicantsArray.length === 0) {
          return createErrorResponse(
            '申請者データが空です',
            'EMPTY_APPLICANTS_DATA',
            400,
            { applicantsCount: 0 }
          );
        }

        // 配列形式から辞書形式に変換
        applicantsData = {};
        applicantsArray.forEach((applicant: any, index: number) => {
          const id = applicant.id || `applicant_${index + 1}`;
          applicantsData[id] = {
            name: applicant.name || `申請者${index + 1}`,
            skills: applicant.skills || [],
            ...applicant
          };
        });

        if (process.env.NODE_ENV === 'development') {
          console.log('テキスト入力処理完了:', {
            applicantsCount: Object.keys(applicantsData).length,
            sampleApplicant: Object.keys(applicantsData)[0] ? {
              id: Object.keys(applicantsData)[0],
              name: applicantsData[Object.keys(applicantsData)[0]]?.name,
              skillsCount: applicantsData[Object.keys(applicantsData)[0]]?.skills?.length
            } : null
          });
        }

      } catch (jsonError) {
        console.error('申請者JSONデータ解析エラー:', jsonError);
        return createErrorResponse(
          `申請者データの解析に失敗しました: ${jsonError instanceof Error ? jsonError.message : '不明なエラー'}`,
          'APPLICANTS_JSON_PARSE_ERROR',
          400,
          { 
            applicantsJson: applicantsJson.substring(0, 200),
            error: jsonError instanceof Error ? jsonError.message : '不明なエラー'
          }
        );
      }
    } else {
      return createErrorResponse(
        'CSVファイルまたは申請者データが必要です',
        'NO_APPLICANTS_DATA',
        400,
        { inputMethod, hasCsvFile: !!csvFile, hasApplicantsJson: !!applicantsJson }
      );
    }

    // 申請者データの最終検証
    const applicantIds = Object.keys(applicantsData);
    if (applicantIds.length === 0) {
      return createErrorResponse(
        '有効な申請者データが見つかりませんでした',
        'NO_VALID_APPLICANTS',
        400,
        { 
          totalApplicants: applicantIds.length,
          dataType: typeof applicantsData
        }
      );
    }

    // 各申請者の詳細検証
    for (const applicantId of applicantIds) {
      const applicant = applicantsData[applicantId];
      
      if (!applicant.name?.trim()) {
        return createErrorResponse(
          `申請者「${applicantId}」の名前が無効です`,
          'INVALID_APPLICANT_NAME',
          400,
          { 
            applicantId,
            name: applicant.name,
            applicantData: applicant
          }
        );
      }
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('申請者データ検証完了:', {
        validApplicants: applicantIds.length,
        processingTime: Date.now() - startTime
      });
    }

    // 以降の処理は既存のまま...
    const results: string[][] = [];

    for (const applicantId of applicantIds) {
      const applicant = applicantsData[applicantId];
      
      try {
        // 申請者情報の構築
        const candidateInfo = `
申請者ID: ${applicantId}
氏名: ${applicant.name}
スキル・技術: ${Array.isArray(applicant.skills) ? applicant.skills.join(', ') : applicant.skills || 'なし'}
${Object.entries(applicant)
  .filter(([key]) => !['name', 'skills'].includes(key))
  .map(([key, value]) => `${key}: ${value}`)
  .join('\n')}
        `.trim();

        if (process.env.NODE_ENV === 'development') {
          console.log(`申請者 ${applicantId} の分析開始`);
        }

        let analysisResult;
        let scoutMessage = '';

        try {
          // まずGemini APIで分析を試行
          const geminiResult = await analyzeCareer(candidateInfo, requirements);
          
          if (geminiResult.success && geminiResult.data) {
            const { score, status, reasoning } = geminiResult.data;
            
            // スカウトメッセージ生成（合格者のみ）
            if (status === '合格') {
              const messageResult = await generateScoutMessage(
                candidateInfo,
                company,
                position,
                sender
              );
              
              if (messageResult.success) {
                scoutMessage = messageResult.message || '';
              }
            }

            results.push([
              applicantId,
              applicant.name,
              status,
              reasoning,
              scoutMessage
            ]);

            if (process.env.NODE_ENV === 'development') {
              console.log(`申請者 ${applicantId} のGemini分析完了:`, { score, status });
            }
            continue;
          }
        } catch (geminiError) {
          console.warn(`申請者 ${applicantId} のGemini分析に失敗、モック分析に切り替え:`, geminiError);
        }

        // Gemini APIが失敗した場合、モック分析を使用
        if (process.env.NODE_ENV === 'development') {
          console.log(`申請者 ${applicantId} のモック分析開始`);
        }

        const mockAnalysisResult = analyzeCandidateProfile(applicant, requirements);
        
        // モックスカウトメッセージ生成
        const mockScoutResult = generateMockScoutMessage(
          applicant,
          company,
          position,
          sender,
          mockAnalysisResult
        );
        
        scoutMessage = mockScoutResult.success ? (mockScoutResult.message || '') : '';

        results.push([
          applicantId,
          applicant.name,
          mockAnalysisResult.status,
          mockAnalysisResult.reasoning,
          scoutMessage
        ]);

        if (process.env.NODE_ENV === 'development') {
          console.log(`申請者 ${applicantId} のモック分析完了:`, { 
            score: mockAnalysisResult.score, 
            status: mockAnalysisResult.status,
            strengths: mockAnalysisResult.strengths.length,
            weaknesses: mockAnalysisResult.weaknesses.length
          });
        }

      } catch (error) {
        console.error(`申請者 ${applicantId} の処理中にエラーが発生:`, error);
        
        results.push([
          applicantId,
          applicant.name,
          'エラー',
          `処理エラー: ${error instanceof Error ? error.message : '不明なエラー'}`,
          ''
        ]);
      }
    }

    const processingTime = Date.now() - startTime;

    if (process.env.NODE_ENV === 'development') {
      console.log('=== API Processing Complete ===');
      console.log('Total processing time:', processingTime, 'ms');
      console.log('Results count:', results.length);
      console.log('Success rate:', `${results.filter(r => r[2] !== 'エラー').length}/${results.length}`);
    }

    return NextResponse.json({
      result: results,
      metadata: {
        processingTime,
        requestId,
        totalApplicants: applicantIds.length,
        successfulAnalyses: results.filter(r => r[2] !== 'エラー').length,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('API処理中の予期しないエラー:', error);
    
    return createErrorResponse(
      `内部サーバーエラーが発生しました: ${error instanceof Error ? error.message : '不明なエラー'}`,
      'INTERNAL_SERVER_ERROR',
      500,
      {
        error: error instanceof Error ? error.message : '不明なエラー',
        stack: error instanceof Error ? error.stack : undefined,
        processingTime: Date.now() - startTime
      }
    );
  }
}

async function analyzeApplicants(requirements: string, applicants: ApplicantInput[]): Promise<string[][]> {
  // ここでAIによる分析を実行
  // 実際の実装では、OpenAI APIなどを使用して分析を行う
  return applicants.map(applicant => [
    applicant.id,
    applicant.name,
    applicant.skills.join(', '),
    '80%', // マッチング率（仮の値）
    'スキルセットが要件と一致', // コメント（仮の値）
  ]);
} 