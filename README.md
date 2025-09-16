# URL短縮サービス（パラメータ対応）

シンプルなURL短縮サービスです。長いURLを短縮して、URLパラメータに基づいて動的にリダイレクト先を変更できます。

## 機能

- URLの短縮
- 自動リダイレクト
- **URLパラメータに基づく動的リダイレクト**
- クリック数の追跡

## パラメータベースリダイレクトの例

### 設定例
```
デフォルトURL: https://example.com
リダイレクトルール:
  utm_source:
    google → https://google-landing.com
    facebook → https://facebook-landing.com
  lang:
    en → https://english-site.com
    ja → https://japanese-site.com
```

### 使用例
```
短縮URL: https://yoursite.com/abc123

アクセス例:
- https://yoursite.com/abc123 → https://example.com (デフォルト)
- https://yoursite.com/abc123?utm_source=google → https://google-landing.com
- https://yoursite.com/abc123?utm_source=facebook → https://facebook-landing.com
- https://yoursite.com/abc123?lang=en → https://english-site.com
- https://yoursite.com/abc123?utm_source=google&lang=ja → https://google-landing.com (最初にマッチしたルール)
```

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Supabaseの設定

1. [Supabase](https://supabase.com)でプロジェクトを作成
2. `supabase-schema.sql`の内容をSupabaseのSQLエディタで実行
3. `.env.local`ファイルにSupabaseの設定を追加：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

## Vercelへのデプロイ

1. GitHubにプッシュ
2. [Vercel](https://vercel.com)でプロジェクトをインポート
3. 環境変数を設定
4. デプロイ

## 使用方法

1. ブラウザでアプリにアクセス
2. デフォルトURLを入力
3. （オプション）リダイレクトルールを設定
4. 「短縮URLを作成」をクリック
5. 生成された短縮URLをコピーして共有
6. パラメータ付きでアクセスすると、適切なページにリダイレクトされます

## データベース構造

```sql
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
```
