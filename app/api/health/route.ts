import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      apiEndpoints: [
        '/api/process',
        '/api/analyze-career',
        '/api/generate-scout-message',
        '/api/analyze-and-scout',
        '/api/health'
      ]
    });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
} 