import { redirect } from 'next/navigation';
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
      redirect('/');
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
    redirect('/');
  }
}
