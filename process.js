import { IncomingForm } from 'formidable'
import { execFile } from 'child_process'
import fs from 'fs'
import path from 'path'

// Next.js のデフォルトボディパーサを無効化
export const config = {
  api: {
    bodyParser: false
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POSTのみ対応しています' })
  }

  // 1) フォームデータ（ファイル＋テキスト）をパース
  const form = new IncomingForm()
  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error('formidable parsing error:', err)
      return res.status(500).json({ error: 'フォームデータの解析に失敗しました' })
    }

    // 2) アップロードされた CSV のパスを取得
    const csvPath = files.csv.filepath
    // 3) 他のテキストフィールドを取得
    const requirements = fields.requirements || ''
    const company      = fields.company      || ''
    const sender       = fields.sender       || ''
    const position     = fields.position     || ''

    // 4) Python スクリプトを呼び出す引数配列を作成
    const scriptPath = path.resolve(process.cwd(), '../backend/process.py')
    const args = [ csvPath, requirements, company, sender, position ]

    // 5) execFile でプロセスを起動
    execFile('python3', [scriptPath, ...args], (error, stdout, stderr) => {
      // 一時ファイルは削除しておく
      fs.unlink(csvPath, () => {})

      if (error) {
        console.error('process.py error:', stderr)
        return res.status(500).json({ error: stderr || error.message })
      }

      // 6) 標準出力を行単位で分割し JSON で返却
      const lines = stdout.trim().split('\n')
      // ここで必要に応じてパースしてオブジェクト化しても OK
      return res.status(200).json({ result: lines })
    })
  })
}

