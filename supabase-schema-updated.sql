-- リダイレクトテーブルを作成
CREATE TABLE redirects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  short_code VARCHAR(20) UNIQUE NOT NULL,
  original_url TEXT NOT NULL,
  redirect_rules JSONB,
  click_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックスを作成
CREATE INDEX idx_redirects_short_code ON redirects(short_code);
CREATE INDEX idx_redirects_is_active ON redirects(is_active);

-- RLSを有効化
ALTER TABLE redirects ENABLE ROW LEVEL SECURITY;

-- ポリシーを作成
CREATE POLICY "Anyone can read redirects" ON redirects FOR SELECT USING (true);
CREATE POLICY "Anyone can insert redirects" ON redirects FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update redirects" ON redirects FOR UPDATE USING (true);

-- クリック数を増加するRPC関数を作成
CREATE OR REPLACE FUNCTION increment_click_count(short_code TEXT)
RETURNS void AS $$
BEGIN
  UPDATE redirects 
  SET click_count = click_count + 1 
  WHERE redirects.short_code = increment_click_count.short_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- line_test01のリダイレクトを設定
INSERT INTO redirects (short_code, original_url, click_count, is_active) 
VALUES ('line_test01', 'https://line.me/R/ti/p/%40500jdrxd', 0, true);
