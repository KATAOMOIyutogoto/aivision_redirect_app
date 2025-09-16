'use client';

import { useState } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [rules, setRules] = useState<{[key: string]: {[key: string]: string}}>({});

  const addRule = () => {
    const newRules = { ...rules };
    const paramName = prompt('パラメータ名を入力してください（例: utm_source）:');
    if (paramName) {
      newRules[paramName] = {};
      setRules(newRules);
    }
  };

  const addRuleValue = (paramName: string) => {
    const value = prompt('パラメータ値を入力してください（例: google）:');
    const redirectUrl = prompt('リダイレクト先URLを入力してください:');
    
    if (value && redirectUrl) {
      const newRules = { ...rules };
      newRules[paramName][value] = redirectUrl;
      setRules(newRules);
    }
  };

  const removeRule = (paramName: string) => {
    const newRules = { ...rules };
    delete newRules[paramName];
    setRules(newRules);
  };

  const removeRuleValue = (paramName: string, value: string) => {
    const newRules = { ...rules };
    delete newRules[paramName][value];
    setRules(newRules);
  };

  const createShortUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    try {
      const response = await fetch('/api/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url, 
          redirect_rules: Object.keys(rules).length > 0 ? rules : null 
        }),
      });
      
      const data = await response.json();
      if (data.shortUrl) {
        setShortUrl(data.shortUrl);
      } else {
        alert('エラー: ' + data.error);
      }
    } catch (error) {
      alert('エラーが発生しました');
    }
    setLoading(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortUrl);
    alert('コピーしました！');
  };

  const generateExampleUrl = () => {
    if (!shortUrl) return '';
    
    const firstParam = Object.keys(rules)[0];
    if (firstParam) {
      const firstValue = Object.keys(rules[firstParam])[0];
      return `${shortUrl}?${firstParam}=${firstValue}`;
    }
    return shortUrl;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">
          URL短縮サービス（パラメータ対応）
        </h1>
        
        <form onSubmit={createShortUrl} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              デフォルトURL *
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <button
              type="button"
              onClick={() => setShowRules(!showRules)}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              {showRules ? 'リダイレクトルールを隠す' : 'リダイレクトルールを設定（オプション）'}
            </button>
          </div>

          {showRules && (
            <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
              <h3 className="font-medium mb-3">リダイレクトルール</h3>
              <p className="text-sm text-gray-600 mb-4">
                URLパラメータに基づいて異なるページにリダイレクトできます
              </p>
              
              {Object.keys(rules).map(paramName => (
                <div key={paramName} className="mb-4 p-3 bg-white rounded border">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">パラメータ: {paramName}</span>
                    <button
                      type="button"
                      onClick={() => removeRule(paramName)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      削除
                    </button>
                  </div>
                  
                  {Object.entries(rules[paramName]).map(([value, redirectUrl]) => (
                    <div key={value} className="flex justify-between items-center mb-1 text-sm">
                      <span>{value} → {redirectUrl}</span>
                      <button
                        type="button"
                        onClick={() => removeRuleValue(paramName, value)}
                        className="text-red-600 hover:text-red-800"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={() => addRuleValue(paramName)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    + 値を追加
                  </button>
                </div>
              ))}
              
              <button
                type="button"
                onClick={addRule}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
              >
                + パラメータを追加
              </button>
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '作成中...' : '短縮URLを作成'}
          </button>
        </form>

        {shortUrl && (
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-gray-100 rounded-md">
              <p className="text-sm text-gray-600 mb-2">短縮URL:</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shortUrl}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white"
                />
                <button
                  onClick={copyToClipboard}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                >
                  コピー
                </button>
              </div>
            </div>

            {Object.keys(rules).length > 0 && (
              <div className="p-4 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-800 mb-2">使用例:</p>
                <div className="space-y-1 text-sm">
                  <div className="font-mono bg-white p-2 rounded border">
                    {generateExampleUrl()}
                  </div>
                  <p className="text-gray-600">
                    このURLにアクセスすると、パラメータに基づいて適切なページにリダイレクトされます
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
