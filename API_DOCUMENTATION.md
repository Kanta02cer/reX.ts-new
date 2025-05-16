# reX.ts API ドキュメント

このドキュメントは、reX.tsシステムのAPIエンドポイントと使用方法を説明します。

## 基本情報

- **ベースURL**: `https://backend-iqep5txo6-kinouecertify-gmailcoms-projects.vercel.app/api`
- **認証**: 現在、API認証は実装されていません
- **応答形式**: すべてのAPIはJSONで応答します

## 1. 候補者分析と採用判断 API

候補者のキャリア情報を分析し、採用条件と照らし合わせて採用可否を判断します。

### エンドポイント

```
POST /api/analyze-career
```

### リクエストパラメータ

| パラメータ名 | 型 | 必須 | 説明 |
|------------|----|----|------|
| resumeData | string | はい | 候補者のキャリア情報（経歴書、職務経歴書など）のテキスト |
| jobRequirements | string | はい | 採用条件のテキスト（求める経験、スキル、資格など） |

### リクエスト例

```json
{
  "resumeData": "氏名：山田太郎\n年齢：35歳\n職種：フルスタックエンジニア\n経験年数：10年\nスキル：JavaScript, React, Node.js, Python, AWS\n職務経歴：\n- 株式会社テックソリューション（2015-現在）：フロントエンド開発リーダー\n- 株式会社ウェブシステム（2011-2015）：Webアプリケーション開発\n自己PR：チームリーダーとして複数のプロジェクトを成功に導いた経験があります。新しい技術の習得が早く、チームメンバーへの技術指導も得意です。",
  "jobRequirements": "【募集職種】シニアフロントエンドエンジニア\n【必須スキル】\n- JavaScript/TypeScriptでの開発経験5年以上\n- Reactを用いた開発経験3年以上\n- チームリーダーまたはテックリードの経験\n【歓迎スキル】\n- AWSの実務経験\n- CI/CD構築経験\n- バックエンド開発の経験（Node.js）\n【求める人物像】\n- 主体的に課題を発見し解決できる方\n- チームでの開発を円滑に進められるコミュニケーション能力がある方"
}
```

### レスポンス例

```json
{
  "analysis": {
    "skillAnalysis": {
      "technicalSkills": ["JavaScript", "React", "Node.js", "Python", "AWS"],
      "softSkills": ["リーダーシップ", "技術指導", "チームマネジメント"],
      "missingSkills": ["TypeScript", "CI/CD構築経験"]
    },
    "experienceAnalysis": {
      "relevantExperience": "フロントエンド開発リーダーとしての経験があり、Reactでの開発経験も十分",
      "yearsOfExperience": 10,
      "relevanceScore": 85
    },
    "evaluationResult": {
      "overallScore": 82,
      "strengths": [
        "フロントエンド開発のリーダー経験",
        "必須スキルであるJavaScriptとReactの十分な経験",
        "チームマネジメント能力"
      ],
      "concerns": [
        "TypeScriptの経験が明示されていない"
      ],
      "interviewFocus": [
        "TypeScriptの経験レベル",
        "CI/CD構築の経験",
        "リーダーとしての具体的な実績"
      ]
    },
    "hiringDecision": {
      "decision": "採用",
      "justification": "必須スキルを満たしており、総合評価も高いため",
      "recommendedPosition": "シニアフロントエンドエンジニア"
    }
  },
  "isHired": true,
  "isConsidered": false,
  "decision": "採用",
  "justification": "必須スキルを満たしており、総合評価も高いため",
  "timestamp": "2023-10-28T12:34:56.789Z"
}
```

## 2. スカウト文章生成 API

採用判断が「採用」となった候補者向けのスカウト文章を生成します。

### エンドポイント

```
POST /api/generate-scout-message
```

### リクエストパラメータ

| パラメータ名 | 型 | 必須 | 説明 |
|------------|----|----|------|
| candidateInfo | string | はい | 候補者のキャリア情報 |
| jobDescription | string | はい | 採用条件・募集内容 |
| analysis | object | いいえ | 分析結果（分析APIのレスポンスを流用可能） |
| hiringDecision | object | いいえ | 採用判断情報（分析APIのレスポンスを流用可能） |

### リクエスト例

```json
{
  "candidateInfo": "氏名：山田太郎\n年齢：35歳\n職種：フルスタックエンジニア\n経験年数：10年\nスキル：JavaScript, React, Node.js, Python, AWS\n職務経歴：\n- 株式会社テックソリューション（2015-現在）：フロントエンド開発リーダー\n- 株式会社ウェブシステム（2011-2015）：Webアプリケーション開発",
  "jobDescription": "【募集職種】シニアフロントエンドエンジニア\n【必須スキル】\n- JavaScript/TypeScriptでの開発経験5年以上\n- Reactを用いた開発経験3年以上\n- チームリーダーまたはテックリードの経験",
  "analysis": {
    "hiringDecision": {
      "decision": "採用"
    }
  }
}
```

### レスポンス例

```json
{
  "scoutMessage": "山田太郎様\n\nテクノバンク株式会社の採用担当、鈴木と申します。\n\nあなたのご経歴とスキルセットに非常に興味を持ち、ご連絡させていただきました。特にフロントエンド開発リーダーとしての5年以上の経験と、ReactやJavaScriptの専門知識は、弊社が探しているシニアフロントエンドエンジニアのポジションにぴったりです。\n\n弊社では現在、次世代のWebアプリケーション開発プロジェクトを立ち上げており、あなたのようなリーダーシップ経験と技術力を兼ね備えた方を求めています。特に、チームをリードしながら高品質なフロントエンド開発を推進できる方は、弊社の技術チームにとって大きな戦力になると考えています。\n\nもしご興味がございましたら、詳細についてお話しさせていただきたく存じます。来週中でご都合の良い日時に、オンラインまたは対面での面談を設定させていただければ幸いです。\n\nご連絡をお待ちしております。\n\nテクノバンク株式会社\n採用担当 鈴木\nEmail: recruit@technobank.co.jp\nTel: 03-1234-5678",
  "candidateName": "山田太郎",
  "timestamp": "2023-10-28T12:34:56.789Z"
}
```

## 3. 候補者分析とスカウト文章生成の統合 API

候補者分析を行い、採用判断が「採用」の場合にはスカウト文章も自動生成する統合APIです。

### エンドポイント

```
POST /api/analyze-and-scout
```

### リクエストパラメータ

| パラメータ名 | 型 | 必須 | 説明 |
|------------|----|----|------|
| resumeData | string | はい | 候補者のキャリア情報（経歴書、職務経歴書など）のテキスト |
| jobRequirements | string | はい | 採用条件のテキスト（求める経験、スキル、資格など） |

### リクエスト例

```json
{
  "resumeData": "氏名：山田太郎\n年齢：35歳\n職種：フルスタックエンジニア\n経験年数：10年\nスキル：JavaScript, React, Node.js, Python, AWS\n職務経歴：\n- 株式会社テックソリューション（2015-現在）：フロントエンド開発リーダー\n- 株式会社ウェブシステム（2011-2015）：Webアプリケーション開発\n自己PR：チームリーダーとして複数のプロジェクトを成功に導いた経験があります。新しい技術の習得が早く、チームメンバーへの技術指導も得意です。",
  "jobRequirements": "【募集職種】シニアフロントエンドエンジニア\n【必須スキル】\n- JavaScript/TypeScriptでの開発経験5年以上\n- Reactを用いた開発経験3年以上\n- チームリーダーまたはテックリードの経験\n【歓迎スキル】\n- AWSの実務経験\n- CI/CD構築経験\n- バックエンド開発の経験（Node.js）\n【求める人物像】\n- 主体的に課題を発見し解決できる方\n- チームでの開発を円滑に進められるコミュニケーション能力がある方"
}
```

### レスポンス例

**採用判断が「採用」の場合（スカウト文章あり）**

```json
{
  "analysis": { /* 分析結果（analyze-career APIと同様） */ },
  "isHired": true,
  "isConsidered": false,
  "decision": "採用",
  "justification": "必須スキルを満たしており、総合評価も高いため",
  "scoutMessage": "山田太郎様\n\nテクノバンク株式会社の採用担当、鈴木と申します。\n\n...(スカウト文章)...",
  "candidateName": "山田太郎",
  "timestamp": "2023-10-28T12:34:56.789Z"
}
```

**採用判断が「採用」以外の場合（スカウト文章なし）**

```json
{
  "analysis": { /* 分析結果（analyze-career APIと同様） */ },
  "isHired": false,
  "isConsidered": true,
  "decision": "検討",
  "justification": "必須スキルの一部を満たしていないが、他の強みがある",
  "timestamp": "2023-10-28T12:34:56.789Z"
}
```

## エラーレスポンス

エラーが発生した場合、以下のような形式でレスポンスが返されます：

```json
{
  "error": "エラーメッセージ",
  "details": "詳細なエラー情報（ある場合）"
}
```

一般的なHTTPステータスコード：

- 200: リクエスト成功
- 400: リクエストパラメータが不正
- 500: サーバー内部エラー

## 使用上の注意

1. 大量データの処理には時間がかかる場合があります（タイムアウト：60秒）
2. APIキーの使用量制限にご注意ください
3. テキストデータは10MBまで受け付けます 