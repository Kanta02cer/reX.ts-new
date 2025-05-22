import { NextRequest, NextResponse } from 'next/server';
import { parseCSV, csvToObjects } from '@/lib/csvUtils';
import { analyzeCareer, generateScoutMessage } from '@/lib/gemini';
import { saveCandidateData } from '@/lib/supabase';
import { processCSVData } from '../../../lib/csvProcessor';
import { ApplicantInput } from '../../../lib/types';

export async function POST(request: Request) {
  try {
    // リクエストのContent-Typeを確認
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('multipart/form-data')) {
      return new NextResponse(
        JSON.stringify({ error: 'Content-Type must be multipart/form-data' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const formData = await request.formData();
    
    // 必須フィールドのバリデーション
    const requirements = formData.get('requirements') as string;
    const company = formData.get('company') as string;
    const sender = formData.get('sender') as string;
    const position = formData.get('position') as string;
    const inputMethod = formData.get('inputMethod') as 'csv' | 'text';

    // 入力値の検証
    if (!requirements?.trim()) {
      return new NextResponse(
        JSON.stringify({ error: '企業要件が入力されていません' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    if (!company?.trim()) {
      return new NextResponse(
        JSON.stringify({ error: '企業名が入力されていません' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    if (!sender?.trim()) {
      return new NextResponse(
        JSON.stringify({ error: '担当者名が入力されていません' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    if (!position?.trim()) {
      return new NextResponse(
        JSON.stringify({ error: '役職が入力されていません' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    if (!inputMethod || !['csv', 'text'].includes(inputMethod)) {
      return new NextResponse(
        JSON.stringify({ error: '入力方法が不正です' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
    
    let applicants: ApplicantInput[] = [];
    
    try {
      if (inputMethod === 'csv') {
        const csvFile = formData.get('csv') as File;
        if (!csvFile) {
          return new NextResponse(
            JSON.stringify({ error: 'CSVファイルが必要です' }),
            {
              status: 400,
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );
        }
        
        const csvText = await csvFile.text();
        if (!csvText.trim()) {
          return new NextResponse(
            JSON.stringify({ error: 'CSVファイルが空です' }),
            {
              status: 400,
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );
        }

        const processedData = processCSVData(csvText);
        if (Object.keys(processedData).length === 0) {
          return new NextResponse(
            JSON.stringify({ error: 'CSVファイルから有効なデータを読み取れませんでした' }),
            {
              status: 400,
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );
        }

        applicants = Object.entries(processedData).map(([id, data]) => ({
          id,
          name: data.name || '名前未設定',
          skills: data.skills || [],
          ...data
        }));
      } else {
        const applicantsJson = formData.get('applicants') as string;
        if (!applicantsJson) {
          return new NextResponse(
            JSON.stringify({ error: '申請者データが必要です' }),
            {
              status: 400,
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );
        }
        
        try {
          applicants = JSON.parse(applicantsJson);
          if (!Array.isArray(applicants) || applicants.length === 0) {
            return new NextResponse(
              JSON.stringify({ error: '申請者データが不正な形式です' }),
              {
                status: 400,
                headers: {
                  'Content-Type': 'application/json',
                },
              }
            );
          }
        } catch (e) {
          return new NextResponse(
            JSON.stringify({ error: '申請者データの解析に失敗しました' }),
            {
              status: 400,
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );
        }
      }

      // 申請者データの検証
      if (applicants.length === 0) {
        return new NextResponse(
          JSON.stringify({ error: '申請者データがありません' }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }

      // 各申請者の必須フィールドを検証
      for (const applicant of applicants) {
        if (!applicant.id || !applicant.name) {
          return new NextResponse(
            JSON.stringify({ error: '申請者データに必須フィールドが不足しています' }),
            {
              status: 400,
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );
        }
      }

      // 各申請者を分析
      const results = await Promise.all(applicants.map(async (applicant) => {
        try {
          // 申請者情報をテキスト形式に変換
          const applicantInfo = Object.entries(applicant)
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n');

          // 分析実行
          const analysisResult = await analyzeCareer(applicantInfo, requirements);
          
          if (!analysisResult.success) {
            return [
              applicant.id,
              applicant.name,
              'NG',
              '分析に失敗しました',
              ''
            ];
          }

          const { score, status, reasoning } = analysisResult.data;
          const isOK = status === '合格';

          // スカウト文生成（合格の場合のみ）
          let scoutMessage = '';
          if (isOK) {
            const scoutResult = await generateScoutMessage(
              applicantInfo,
              company,
              position,
              sender
            );
            
            if (scoutResult.success && scoutResult.message) {
              scoutMessage = scoutResult.message;
            }
          }

          return [
            applicant.id,
            applicant.name,
            isOK ? 'OK' : 'NG',
            reasoning.substring(0, 100), // 判定要因を100文字以内に制限
            scoutMessage.substring(0, 1000) // スカウト文を1000文字以内に制限
          ];
        } catch (error) {
          console.error(`Error analyzing applicant ${applicant.id}:`, error);
          return [
            applicant.id,
            applicant.name,
            'NG',
            '分析処理中にエラーが発生しました',
            ''
          ];
        }
      }));

      return new NextResponse(
        JSON.stringify({ result: results }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (error) {
      console.error('Error processing data:', error);
      return new NextResponse(
        JSON.stringify({ error: 'データの処理中にエラーが発生しました' }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return new NextResponse(
      JSON.stringify({ error: 'リクエストの処理中にエラーが発生しました' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
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