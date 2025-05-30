export interface AnalysisResult {
  score: number;
  status: '合格' | '不合格' | '要検討';
  reasoning: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export interface ScoutMessageResult {
  success: boolean;
  message?: string;
  error?: string;
}

// スキルマッチング分析
function analyzeSkillMatch(candidateSkills: string[], requirements: string): number {
  const reqSkills = extractRequiredSkills(requirements);
  let matchScore = 0;
  let totalRequiredSkills = reqSkills.length;

  if (totalRequiredSkills === 0) {
    // 要件にスキルが明記されていない場合、候補者のスキル数で評価
    return Math.min(candidateSkills.length * 20, 100);
  }

  reqSkills.forEach(reqSkill => {
    const normalizedReqSkill = reqSkill.toLowerCase().trim();
    const hasSkill = candidateSkills.some(candidateSkill => 
      candidateSkill.toLowerCase().includes(normalizedReqSkill) ||
      normalizedReqSkill.includes(candidateSkill.toLowerCase())
    );
    if (hasSkill) {
      matchScore += 100 / totalRequiredSkills;
    }
  });

  return Math.round(matchScore);
}

// 経験年数分析
function analyzeExperience(candidateData: any, requirements: string): number {
  const experienceYears = extractNumber(candidateData['経験年数']) || 
                         extractNumber(candidateData['経験']) || 
                         extractNumber(candidateData['年数']) || 0;
  
  const requiredYears = extractRequiredYears(requirements);
  
  if (requiredYears === 0) {
    // 経験年数の要件がない場合、経験に応じて評価
    if (experienceYears >= 5) return 90;
    if (experienceYears >= 3) return 80;
    if (experienceYears >= 1) return 70;
    return 50;
  }

  const ratio = experienceYears / requiredYears;
  if (ratio >= 1.2) return 100;
  if (ratio >= 1.0) return 90;
  if (ratio >= 0.8) return 75;
  if (ratio >= 0.6) return 60;
  return 40;
}

// 学歴・資格評価
function analyzeQualifications(candidateData: any): number {
  const education = candidateData['学歴'] || '';
  const certification = candidateData['資格'] || '';
  
  let score = 50; // ベーススコア
  
  // 学歴評価
  const topUniversities = ['東京大学', '京都大学', '大阪大学', '東京工業大学', '一橋大学', '北海道大学', '東北大学', '名古屋大学', '九州大学', '早稲田大学', '慶應義塾大学'];
  const goodUniversities = ['上智大学', '立教大学', '青山学院大学', '中央大学', '法政大学', '関西大学', '関西学院大学', '同志社大学', '立命館大学'];
  
  if (topUniversities.some(uni => education.includes(uni))) {
    score += 30;
  } else if (goodUniversities.some(uni => education.includes(uni))) {
    score += 20;
  } else if (education.includes('大学')) {
    score += 10;
  }
  
  // 資格評価
  const technicalCerts = ['情報処理', 'AWS', 'Azure', 'GCP', 'CCNA', 'CCNP', 'PMP', 'ORACLE', 'Java', 'Python'];
  const certCount = technicalCerts.filter(cert => 
    certification.toLowerCase().includes(cert.toLowerCase())
  ).length;
  
  score += Math.min(certCount * 5, 20);
  
  return Math.min(score, 100);
}

// 年収・ポジションレベル分析
function analyzeSalaryFit(candidateData: any, requirements: string): number {
  const hopedSalary = extractNumber(candidateData['希望年収']) || 
                     extractNumber(candidateData['年収']) || 0;
  
  const budgetSalary = extractBudgetSalary(requirements);
  
  if (budgetSalary === 0 || hopedSalary === 0) {
    return 70; // 情報がない場合はニュートラル
  }
  
  const ratio = hopedSalary / budgetSalary;
  if (ratio <= 0.8) return 100; // 予算以下
  if (ratio <= 1.0) return 90;   // 予算内
  if (ratio <= 1.2) return 70;   // 予算少しオーバー
  if (ratio <= 1.5) return 50;   // 予算大幅オーバー
  return 30;
}

// 要件からスキルを抽出
function extractRequiredSkills(requirements: string): string[] {
  const skillPatterns = [
    /JavaScript/gi, /TypeScript/gi, /React/gi, /Vue\.?js/gi, /Angular/gi,
    /Node\.?js/gi, /Python/gi, /Java\b/gi, /C\+\+/gi, /C#/gi,
    /HTML/gi, /CSS/gi, /SQL/gi, /MongoDB/gi, /MySQL/gi,
    /AWS/gi, /Azure/gi, /GCP/gi, /Docker/gi, /Kubernetes/gi,
    /Git/gi, /Linux/gi, /API/gi, /REST/gi, /GraphQL/gi,
    /機械学習/gi, /AI/gi, /データサイエンス/gi, /統計/gi,
    /UI\/UX/gi, /Figma/gi, /Photoshop/gi, /Illustrator/gi,
    /プロジェクト管理/gi, /アジャイル/gi, /スクラム/gi
  ];
  
  const foundSkills: string[] = [];
  skillPatterns.forEach(pattern => {
    const matches = requirements.match(pattern);
    if (matches) {
      foundSkills.push(...matches.map(match => match.replace(/\./g, '')));
    }
  });
  
  return [...new Set(foundSkills)];
}

// 数値抽出（経験年数、年収など）
function extractNumber(text: string | number): number {
  if (typeof text === 'number') return text;
  if (!text) return 0;
  
  const match = text.toString().match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

// 要求経験年数を抽出
function extractRequiredYears(requirements: string): number {
  const yearMatches = requirements.match(/(\d+)年以上|(\d+)年間|経験(\d+)年/);
  if (yearMatches) {
    return parseInt(yearMatches[1] || yearMatches[2] || yearMatches[3], 10);
  }
  return 0;
}

// 予算年収を抽出
function extractBudgetSalary(requirements: string): number {
  const salaryMatches = requirements.match(/年収(\d+)万|(\d+)万円|予算(\d+)万/);
  if (salaryMatches) {
    return parseInt(salaryMatches[1] || salaryMatches[2] || salaryMatches[3], 10) * 10000;
  }
  return 0;
}

// 総合分析
export function analyzeCandidateProfile(candidateData: any, requirements: string): AnalysisResult {
  const candidateSkills = candidateData.skills || [];
  
  // 各項目のスコア計算
  const skillScore = analyzeSkillMatch(candidateSkills, requirements);
  const experienceScore = analyzeExperience(candidateData, requirements);
  const qualificationScore = analyzeQualifications(candidateData);
  const salaryScore = analyzeSalaryFit(candidateData, requirements);
  
  // 重み付け計算（業務課題に応じて調整可能）
  const weightedScore = Math.round(
    skillScore * 0.4 +           // スキルマッチ 40%
    experienceScore * 0.3 +      // 経験 30%
    qualificationScore * 0.2 +   // 学歴・資格 20%
    salaryScore * 0.1            // 年収適合度 10%
  );
  
  // 判定基準
  let status: '合格' | '不合格' | '要検討';
  if (weightedScore >= 80) {
    status = '合格';
  } else if (weightedScore >= 60) {
    status = '要検討';
  } else {
    status = '不合格';
  }
  
  // 強み・弱み・推奨事項の分析
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const recommendations: string[] = [];
  
  if (skillScore >= 80) {
    strengths.push('要求スキルとの高い適合性');
  } else if (skillScore < 50) {
    weaknesses.push('要求スキルとのミスマッチ');
    recommendations.push('追加スキル研修の検討');
  }
  
  if (experienceScore >= 80) {
    strengths.push('豊富な実務経験');
  } else if (experienceScore < 60) {
    weaknesses.push('経験年数不足');
    recommendations.push('メンタリング体制の整備');
  }
  
  if (qualificationScore >= 80) {
    strengths.push('優秀な学歴・資格保有');
  } else if (qualificationScore < 60) {
    recommendations.push('継続学習機会の提供');
  }
  
  if (salaryScore < 60) {
    weaknesses.push('年収期待値が高い');
    recommendations.push('給与体系・昇進制度の説明');
  }
  
  // 詳細な理由文生成
  const reasoning = generateDetailedReasoning(
    candidateData,
    skillScore,
    experienceScore,
    qualificationScore,
    salaryScore,
    weightedScore
  );
  
  return {
    score: weightedScore,
    status,
    reasoning,
    strengths,
    weaknesses,
    recommendations
  };
}

function generateDetailedReasoning(
  candidateData: any,
  skillScore: number,
  experienceScore: number,
  qualificationScore: number,
  salaryScore: number,
  totalScore: number
): string {
  const parts: string[] = [];
  
  parts.push(`【総合評価: ${totalScore}点】`);
  
  // スキル評価
  if (skillScore >= 80) {
    parts.push(`✅ スキル適合度が非常に高く（${skillScore}点）、即戦力として期待できます。`);
  } else if (skillScore >= 60) {
    parts.push(`⚪ スキル適合度は標準的（${skillScore}点）で、育成により戦力化が可能です。`);
  } else {
    parts.push(`⚠️ スキル適合度が低く（${skillScore}点）、大幅な研修が必要です。`);
  }
  
  // 経験評価
  const experience = candidateData['経験年数'] || candidateData['経験'] || '不明';
  if (experienceScore >= 80) {
    parts.push(`✅ ${experience}年の豊富な経験（${experienceScore}点）があり、即座にチームに貢献できます。`);
  } else if (experienceScore >= 60) {
    parts.push(`⚪ ${experience}年の経験（${experienceScore}点）で、サポートがあれば活躍できます。`);
  } else {
    parts.push(`⚠️ 経験年数（${experienceScore}点）が不足しており、手厚いサポートが必要です。`);
  }
  
  // 学歴・資格評価
  const education = candidateData['学歴'] || '不明';
  const certification = candidateData['資格'] || '不明';
  if (qualificationScore >= 80) {
    parts.push(`✅ ${education}出身、${certification}保有で学習能力が高いです。`);
  } else {
    parts.push(`⚪ 学歴：${education}、資格：${certification}で標準的な基礎力です。`);
  }
  
  // 年収評価
  const salary = candidateData['希望年収'] || candidateData['年収'] || '不明';
  if (salaryScore >= 80) {
    parts.push(`✅ 希望年収（${salary}万円）が予算内で調整しやすいです。`);
  } else if (salaryScore >= 60) {
    parts.push(`⚪ 希望年収（${salary}万円）は要調整ですが交渉可能範囲です。`);
  } else {
    parts.push(`⚠️ 希望年収（${salary}万円）が予算を大幅に超過しており要検討です。`);
  }
  
  return parts.join(' ');
}

// スカウトメッセージ生成
export function generateScoutMessage(
  candidateData: any,
  company: string,
  position: string,
  sender: string,
  analysisResult: AnalysisResult
): ScoutMessageResult {
  try {
    const name = candidateData.name || '候補者様';
    const skills = candidateData.skills || [];
    const experience = candidateData['経験年数'] || candidateData['経験'] || '';
    
    let messageTemplate = '';
    
    if (analysisResult.status === '合格') {
      messageTemplate = `${name}様

いつもお世話になっております。
${company}の${sender}と申します。

この度、弊社の${position}のポジションにつきまして、${name}様の優れた${skills.length > 0 ? skills.slice(0, 3).join('、') + 'のスキル' : '経験'}と${experience ? experience + '年の実務経験' : '豊富な経験'}に深く感銘を受けており、是非一度お話しをお聞かせいただければと思います。

【${name}様の魅力ポイント】
${analysisResult.strengths.map(strength => `• ${strength}`).join('\n')}

弊社では、技術力の高い方に長期的にご活躍いただける環境を整えており、${name}様のキャリアビジョンの実現をサポートさせていただけると確信しております。

まずはカジュアルにお話しできる機会をいただけますでしょうか。
ご都合の良い日時をお教えいただければ、オンラインまたはお近くのカフェなどでお時間をいただければと思います。

何かご質問等ございましたら、お気軽にお声かけください。
お忙しい中恐縮ですが、ご検討のほどよろしくお願いいたします。

${company}
${sender}`;
    } else if (analysisResult.status === '要検討') {
      messageTemplate = `${name}様

いつもお世話になっております。
${company}の${sender}と申します。

この度、弊社の${position}のポジションについて、${name}様のご経験に興味を持ちご連絡させていただきました。

${name}様の${skills.length > 0 ? skills.slice(0, 2).join('、') : '経験'}と成長意欲を拝見し、弊社でさらなるスキルアップを目指していただけるのではないかと考えております。

弊社では充実した研修制度と先輩エンジニアによるメンタリング体制を整えており、${name}様のキャリア成長をしっかりとサポートいたします。

まずはお話しする機会をいただき、${name}様のキャリアビジョンや弊社での可能性について相談させていただければと思います。

ご興味をお持ちいただけましたら、お気軽にご返信ください。

${company}
${sender}`;
    } else {
      // 不合格の場合はスカウトメッセージを生成しない
      return {
        success: true,
        message: ''
      };
    }
    
    return {
      success: true,
      message: messageTemplate
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '不明なエラー'
    };
  }
} 