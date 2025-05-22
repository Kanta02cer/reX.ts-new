import { createClient } from '@supabase/supabase-js';

// 環境変数から接続情報を取得
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Supabaseクライアントを初期化
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 候補者データを保存する関数
export async function saveCandidateData(candidateData: {
  name: string;
  score: number;
  status: string;
  scoutText?: string;
  requirements: string;
  company: string;
}) {
  try {
    const { data, error } = await supabase
      .from('candidates')
      .insert([
        {
          name: candidateData.name,
          score: candidateData.score,
          status: candidateData.status,
          scout_text: candidateData.scoutText || null,
          requirements: candidateData.requirements,
          company: candidateData.company,
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) throw error;
    
    return { data, success: true };
  } catch (error) {
    console.error('Error saving to Supabase:', error);
    return { success: false, error };
  }
}

// 過去の候補者データを取得する関数
export async function getCandidates(limit = 20) {
  try {
    const { data, error } = await supabase
      .from('candidates')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    
    return { data, success: true };
  } catch (error) {
    console.error('Error fetching from Supabase:', error);
    return { success: false, error, data: [] };
  }
}

// 会社ごとの候補者を取得する関数
export async function getCandidatesByCompany(company: string) {
  try {
    const { data, error } = await supabase
      .from('candidates')
      .select('*')
      .eq('company', company)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return { data, success: true };
  } catch (error) {
    console.error('Error fetching from Supabase:', error);
    return { success: false, error, data: [] };
  }
}

// 企業情報をクリアする関数
export async function clearCompanyData(company: string) {
  try {
    const { error } = await supabase
      .from('candidates')
      .delete()
      .eq('company', company);

    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error clearing company data from Supabase:', error);
    return { success: false, error };
  }
} 