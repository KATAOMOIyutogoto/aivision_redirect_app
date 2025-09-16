-- short_codeの長さ制限を拡張
ALTER TABLE redirects ALTER COLUMN short_code TYPE VARCHAR(20);

-- インデックスを再作成
DROP INDEX IF EXISTS idx_redirects_short_code;
CREATE INDEX idx_redirects_short_code ON redirects(short_code);
