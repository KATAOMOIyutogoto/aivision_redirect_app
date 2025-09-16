-- line_test01のリダイレクトを設定（修正版）
INSERT INTO redirects (short_code, original_url, click_count, is_active) 
VALUES ('line_test01', 'https://line.me/R/ti/p/%40500jdrxd', 0, true)
ON CONFLICT (short_code) 
DO UPDATE SET 
  original_url = EXCLUDED.original_url,
  updated_at = NOW();
