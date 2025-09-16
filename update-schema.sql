-- 既存のテーブルがある場合の更新用SQL

-- short_codeの長さ制限を拡張（既存テーブルの場合）
ALTER TABLE redirects ALTER COLUMN short_code TYPE VARCHAR(20);

-- redirect_rulesカラムを追加（存在しない場合のみ）
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'redirects' AND column_name = 'redirect_rules') THEN
        ALTER TABLE redirects ADD COLUMN redirect_rules JSONB;
    END IF;
END $$;

-- インデックスを再作成
DROP INDEX IF EXISTS idx_redirects_short_code;
CREATE INDEX idx_redirects_short_code ON redirects(short_code);
CREATE INDEX IF NOT EXISTS idx_redirects_is_active ON redirects(is_active);

-- RLSを有効化（既に有効な場合はスキップ）
ALTER TABLE redirects ENABLE ROW LEVEL SECURITY;

-- ポリシーを作成（存在しない場合のみ）
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'redirects' AND policyname = 'Anyone can read redirects') THEN
        CREATE POLICY "Anyone can read redirects" ON redirects FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'redirects' AND policyname = 'Anyone can insert redirects') THEN
        CREATE POLICY "Anyone can insert redirects" ON redirects FOR INSERT WITH CHECK (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'redirects' AND policyname = 'Anyone can update redirects') THEN
        CREATE POLICY "Anyone can update redirects" ON redirects FOR UPDATE USING (true);
    END IF;
END $$;

-- line_test01のリダイレクトを設定（UPSERT）
INSERT INTO redirects (short_code, original_url, click_count, is_active) 
VALUES ('line_test01', 'https://line.me/R/ti/p/%40500jdrxd', 0, true)
ON CONFLICT (short_code) 
DO UPDATE SET 
  original_url = EXCLUDED.original_url,
  updated_at = NOW();
