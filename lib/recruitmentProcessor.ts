import { ApplicantData } from './types';

export function mainRecruitmentProcess(applicants: ApplicantData[]) {
  // ここに採用処理ロジックを実装
  return applicants.map(applicant => ({
    ...applicant,
    合否判定: '未判定'
  }));
} 