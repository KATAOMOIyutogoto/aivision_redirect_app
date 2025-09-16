import { redirect } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default async function RedirectPage({ 
  params, 
  searchParams 
}: { 
  params: { shortCode: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  try {
    // 短縮コードからリダイレクト情報を取得
    const { data, error } = await supabase
      .from('redirects')
      .select('original_url, redirect_rules, click_count')
      .eq('short_code', params.shortCode)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      // デバッグ情報を表示（3秒後にホームにリダイレクト）
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">リダイレクトエラー</h1>
            <div className="text-left bg-gray-100 p-4 rounded mb-4">
              <p><strong>Short Code:</strong> {params.shortCode}</p>
              <p><strong>Error:</strong> {error?.message || 'No data found'}</p>
              <p><strong>Data:</strong> {JSON.stringify(data)}</p>
            </div>
            <Link href="/" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              ホームに戻る
            </Link>
            <script dangerouslySetInnerHTML={{
              __html: `setTimeout(() => { window.location.href = '/'; }, 3000);`
            }} />
          </div>
        </div>
      );
    }

    let targetUrl = data.original_url;

    // リダイレクトルールがある場合、パラメータに基づいてURLを変更
    if (data.redirect_rules && Object.keys(searchParams).length > 0) {
      const rules = data.redirect_rules;
      
      // パラメータに基づくリダイレクトルールを適用
      for (const [paramKey, paramValue] of Object.entries(searchParams)) {
        if (typeof paramValue === 'string' && rules[paramKey]) {
          const rule = rules[paramKey];
          
          // パラメータ値に基づいてリダイレクト先を決定
          if (rule[paramValue]) {
            targetUrl = rule[paramValue];
            break; // 最初にマッチしたルールを使用
          }
        }
      }
    }

    // クリック数を増加（シンプルな方法）
    await supabase
      .from('redirects')
      .update({ click_count: data.click_count + 1 })
      .eq('short_code', params.shortCode);

    // 元のURLにリダイレクト
    redirect(targetUrl);
  } catch (error) {
    // エラー情報を表示（3秒後にホームにリダイレクト）
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">サーバーエラー</h1>
          <div className="text-left bg-gray-100 p-4 rounded mb-4">
            <p><strong>Error:</strong> {String(error)}</p>
          </div>
          <Link href="/" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            ホームに戻る
          </Link>
          <script dangerouslySetInnerHTML={{
            __html: `setTimeout(() => { window.location.href = '/'; }, 3000);`
          }} />
        </div>
      </div>
    );
  }
}
