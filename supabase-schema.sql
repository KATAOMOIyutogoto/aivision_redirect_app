-- リダイレクトテーブルを作成
CREATE TABLE redirects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  short_code VARCHAR(10) UNIQUE NOT NULL,
  original_url TEXT NOT NULL,
  redirect_rules JSONB, -- パラメータベースのリダイレクトルール
  click_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックスを作成（パフォーマンス向上）
CREATE INDEX idx_redirects_short_code ON redirects(short_code);
CREATE INDEX idx_redirects_is_active ON redirects(is_active);

-- RLS（Row Level Security）を有効化
ALTER TABLE redirects ENABLE ROW LEVEL SECURITY;

-- 全ユーザーが読み取り可能
CREATE POLICY "Anyone can read redirects" ON redirects
  FOR SELECT USING (true);

-- 全ユーザーが挿入可能
CREATE POLICY "Anyone can insert redirects" ON redirects
  FOR INSERT WITH CHECK (true);

-- 全ユーザーが更新可能
CREATE POLICY "Anyone can update redirects" ON redirects
  FOR UPDATE USING (true);

-- 例：リダイレクトルールのサンプルデータ
-- INSERT INTO redirects (short_code, original_url, redirect_rules) VALUES 
-- ('test123', 'https://default-site.com', 
--  '{"utm_source": {"google": "https://google-landing.com", "facebook": "https://facebook-landing.com"}, "lang": {"en": "https://english-site.com", "ja": "https://japanese-site.com"}}');

-- line_test01のリダイレクトを設定
INSERT INTO redirects (short_code, original_url, click_count, is_active) 
VALUES ('line_test01', 'https://line.me/R/ti/p/%40500jdrxd', 0, true)
ON CONFLICT (short_code) 
DO UPDATE SET 
  original_url = EXCLUDED.original_url,
  updated_at = NOW();
