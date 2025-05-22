import { NextResponse } from 'next/server';
import Papa from 'papaparse';
import { ApplicantData } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const csvString = await request.text();

    if (!csvString) {
      return NextResponse.json({ error: 'CSVデータがありません。' }, { status: 400 });
    }

    const parseResult = Papa.parse<ApplicantData>(csvString, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      transformHeader: (header) => header.trim(),
      transform: (value) => value.trim()
    });

    if (parseResult.errors.length > 0) {
      return NextResponse.json({ error: 'CSVの解析に失敗しました。' }, { status: 400 });
    }

    return NextResponse.json({
      totalApplicants: parseResult.data.length,
      applicants: parseResult.data
    });
  } catch (error: any) {
    console.error('CSV処理エラー:', error);
    return NextResponse.json({ error: 'サーバーエラーが発生しました。' }, { status: 500 });
  }
} 