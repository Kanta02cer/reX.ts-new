# load_and_match.py
import os
import csv
import time
from typing import List, Dict
from google.generativeai import GenerativeModel, configure

class CandidateScoutSystem:
    def __init__(self):
        configure(api_key=os.getenv("AIzaSyDosn3ybHfEAV66TsG1fVlTfNQ-itHSFAI"))
        self.gemini = GenerativeModel('gemini-1.5')
        
    def load_candidates(self, file_path: str) -> List[Dict]:
        """
        CSVファイルから候補者データを読み込む
        Args:
            file_path (str): CSVファイルのパス
        Returns:
            List[Dict]: 候補者データのリスト
        """
        candidates = []
        try:
            with open(file_path, mode='r', encoding='utf-8') as file:
                reader = csv.DictReader(file)
                for row in reader:
                    # データ型の変換
                    row['experience'] = int(row['experience'])
                    row['skills'] = [s.strip() for s in row['skills'].split(',')]
                    candidates.append(row)
            return candidates
        except Exception as e:
            raise RuntimeError(f"CSV読み込みエラー: {str(e)}")

    def match_candidates(
        self,
        candidates: List[Dict],
        requirements: Dict
    ) -> List[Dict]:
        """
        候補者を条件にマッチング
        Args:
            candidates (List[Dict]): 候補者リスト
            requirements (Dict): マッチング条件
        Returns:
            List[Dict]: マッチした候補者リスト（スコア付き）
        """
        matched = []
        for candidate in candidates:
            score = self._calculate_match_score(candidate, requirements)
            if score >= requirements.get('min_score', 50):
                matched.append({
                    **candidate,
                    'match_score': score
                })
        # スコア降順でソート
        return sorted(matched, key=lambda x: x['match_score'], reverse=True)

    def _calculate_match_score(
        self,
        candidate: Dict,
        requirements: Dict
    ) -> int:
        """
        マッチングスコアを計算
        """
        score = 0
        # スキルマッチング
        required_skills = requirements.get('required_skills', [])
        for skill in required_skills:
            if skill in candidate['skills']:
                score += 30
        
        # 経験年数
        if candidate['experience'] >= requirements.get('min_experience', 3):
            score += 20
        
        # 希望職種マッチ
        if candidate['desiredPosition'] == requirements.get('target_position'):
            score += 50
            
        return score

    def generate_scout_messages(
        self,
        candidates: List[Dict],
        template: str = None,
        batch_size: int = 5
    ) -> List[Dict]:
        """
        Gemini APIを使用してスカウトメッセージを生成
        Args:
            candidates (List[Dict]): 候補者リスト
            template (str): メッセージテンプレート
            batch_size (int): API呼び出しバッチサイズ
        Returns:
            List[Dict]: スカウト文を含む候補者リスト
        """
        default_template = (
            "以下の候補者に適したスカウトメッセージを

