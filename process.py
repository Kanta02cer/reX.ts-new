import os
import csv
import logging
import time
from pathlib import Path
from dataclasses import dataclass
from typing import List, Dict, Optional

from dotenv import load_dotenv
load_dotenv()

from google.generativeai import GenerativeModel, configure

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@dataclass
class ScoringConfig:
    skill_weight: int = 30
    experience_weight: int = 20
    position_weight: int = 50
    min_score: int = 60
    min_experience: int = 3

class CandidateScoutProcessor:
    def __init__(self):
        self._validate_api_key()
        configure(api_key=os.getenv("GOOGLE_API_KEY"))
        self.model = GenerativeModel('gemini-pro')
        self.scoring_config = ScoringConfig()

    def _validate_api_key(self):
        if not os.getenv("GOOGLE_API_KEY"):
            raise ValueError("GOOGLE_API_KEYが環境変数に設定されていません")

    def load_candidates(self, file_path: str) -> List[Dict]:
        self._validate_file_path(file_path)
        candidates = []
            with open(file_path, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row_num, row in enumerate(reader, 1):
                        processed = self._process_row(row)
                        candidates.append(processed)
                    except ValueError as e:
                        logger.warning(f"行 {row_num} をスキップ: {str(e)}")
            return candidates
        except Exception as e:
            logger.error(f"CSV読み込み失敗: {str(e)}")
            raise

    def _validate_file_path(self, file_path: str):
        if not Path(file_path).exists():
            raise FileNotFoundError(f"ファイルが見つかりません: {file_path}")
        if Path(file_path).suffix.lower() != '.csv':
            raise ValueError("CSVファイルのみ対応しています")

    def _process_row(self, row: Dict) -> Dict:
        required_fields = ['id', 'name', 'skills', 'experience', 'desiredPosition']
        for field in required_fields:
            if field not in row:
                raise ValueError(f"必須フィールド '{field}' が存在しません")
            experience = int(row['experience'])
            if experience < 0:
                raise ValueError("経験年数が負の値です")
        except ValueError:
            raise ValueError("経験年数が数値ではありません")
        return {
            'id': row['id'],
            'name': row['name'].strip(),
            'skills': [s.strip() for s in row['skills'].split(',')],
            'experience': experience,
            'desiredPosition': row['desiredPosition'].strip()
        }

    def match_candidates(self, candidates: List[Dict], requirements: Dict) -> List[Dict]:
        if not candidates:
            logger.warning("マッチング対象の候補者がいません")
            return []
        matched = []
        for candidate in candidates:
            score = self._calculate_score(candidate, requirements)
            if score >= self.scoring_config.min_score:
                matched.append({
                    **candidate,
                    'match_score': score,
                    'is_qualified': True
                })
        return sorted(matched, key=lambda x: x['match_score'], reverse=True)

    def _calculate_score(self, candidate: Dict, requirements: Dict) -> int:
        score = 0
        required_skills = requirements.get('required_skills', [])
        for skill in required_skills:
            if skill in candidate['skills']:
                score += self.scoring_config.skill_weight
        if candidate['experience'] >= self.scoring_config.min_experience:
            score += self.scoring_config.experience_weight
        if candidate['desiredPosition'] == requirements.get('target_position'):
            score += self.scoring_config.position_weight
        return score

    def generate_scout_messages(
        self,
        candidates: List[Dict],
        template: Optional[str] = None,
        batch_size: int = 3,
        retry_attempts: int = 3
    ) -> List[Dict]:
        if not candidates:
            logger.warning("メッセージ生成対象の候補者がいません")
            return []
        default_template = (
            "データサイエンス分野で活躍中の{name}様へ\n\n"
            "当社は{desiredPosition}ポジションでご活躍いただける人材を探しております。\n"
            "{experience}年のご経験と{skills}のスキルをお持ちの貴方に最適なポジションです。\n"
            "ぜひ一度お話しする機会を頂けますでしょうか？"
        )
        results = []
        for i in range(0, len(candidates), batch_size):
            batch = candidates[i:i+batch_size]
            for attempt in range(retry_attempts):
                    batch_results = self._process_batch(batch, template or default_template)
                    results.extend(batch_results)
                    time.sleep(1)
                    break
                except Exception as e:
                    logger.error(f"バッチ処理失敗 (試行 {attempt+1}/{retry_attempts}): {str(e)}")
                    if attempt == retry_attempts - 1:
                        logger.error("最大再試行回数に達しました。バッチをスキップします。")
        return results

    def _process_batch(self, batch: List[Dict], template: str) -> List[Dict]:
        """バッチ処理用内部メソッド"""
        batch_results = []
        for candidate in batch:
                prompt = template.format(
                    name=candidate['name'],
                    skills=', '.join(candidate['skills']),
                    experience=candidate['experience'],
                    desiredPosition=candidate['desiredPosition']
                )
                response = self.model.generate_content(prompt)
                candidate['scout_message'] = response.text
                candidate['generation_status'] = 'success'
                batch_results.append(candidate)
            except Exception as e:
                logger.error(f"メッセージ生成失敗: {candidate['id']} - {str(e)}")
                candidate['scout_message'] = ''
                candidate['generation_status'] = 'failed'
                batch_results.append(candidate)
        return batch_results

    def export_results(self, candidates: List[Dict], output_path: str) -> None:
        if not candidates:
            logger.warning("エクスポートするデータがありません")
            return
            output_dir = Path(output_path).parent
            output_dir.mkdir(parents=True, exist_ok=True)
            fieldnames = list(candidates[0].keys())
            with open(output_path, 'w', encoding='utf-8', newline='') as f:
                writer = csv.DictWriter(f, fieldnames=fieldnames)
                writer.writeheader()
                writer.writerows(candidates)
            logger.info(f"{len(candidates)}件のデータを {output_path} に保存しました")
        except csv.Error as e:
            logger.error(f"CSV書き込みエラー: {str(e)}")
            raise
        except PermissionError:
            logger.error("ファイル書き込み権限がありません")
            raise
        except Exception as e:
            logger.error(f"予期せぬエラー: {str(e)}")
            raise

if __name__ == "__main__":
        processor = CandidateScoutProcessor()
        candidates = processor.load_candidates("input.csv")
        requirements = {
            'required_skills': ['Python', '機械学習'],
            'target_position': 'データサイエンティスト'
        }
        matched = processor.match_candidates(candidates, requirements)
        scouted = processor.generate_scout_messages(matched)
        processor.export_results(scouted, "output/results.csv")
    except Exception as e:
        logger.critical(f"処理が異常終了しました: {str(e)}")
        exit(1)
