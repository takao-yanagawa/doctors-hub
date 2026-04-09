"use client";

export default function SettingsTab({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="h-full overflow-y-auto p-4">
      <h2 className="font-bold text-base text-slate-800 mb-1">設定</h2>
      <p className="text-xs text-slate-400 mb-6">アプリケーションの設定</p>

      {/* API Key Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-4">
        <h3 className="font-bold text-sm text-slate-700 mb-1">API設定</h3>
        <p className="text-xs text-slate-400 mb-3">
          Claude APIキーはサーバーの.env.localファイルで管理されています
        </p>
        <div className="bg-slate-50 rounded-xl p-3">
          <p className="text-xs text-slate-600 font-mono">
            ANTHROPIC_API_KEY=sk-ant-...
          </p>
          <p className="text-[10px] text-slate-400 mt-1">
            .env.local ファイルを編集してAPIキーを設定してください
          </p>
        </div>
      </div>

      {/* App Info */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-4">
        <h3 className="font-bold text-sm text-slate-700 mb-3">アプリ情報</h3>
        <div className="space-y-2">
          {[
            { label: "アプリ名", value: "DOCTORS HUB Clinical AI" },
            { label: "バージョン", value: "1.0.0" },
            { label: "AIモデル", value: "Claude Sonnet 4 (claude-sonnet-4-20250514)" },
            { label: "フレームワーク", value: "Next.js 14 (App Router)" },
          ].map((item) => (
            <div key={item.label} className="flex justify-between items-center py-1.5 border-b border-slate-50 last:border-0">
              <span className="text-xs text-slate-500">{item.label}</span>
              <span className="text-xs font-medium text-slate-700">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Data Sources */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-4">
        <h3 className="font-bold text-sm text-slate-700 mb-3">データソース</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2 py-1.5">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-xs text-slate-600">Anthropic Claude API</span>
          </div>
          <div className="flex items-center gap-2 py-1.5">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-xs text-slate-600">PubMed / NCBI E-Utilities</span>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4">
        <h3 className="font-bold text-sm text-red-700 mb-2">免責事項</h3>
        <p className="text-xs text-red-600 leading-relaxed">
          本アプリはAIによる臨床意思決定支援ツールです。
          AIの回答は参考情報であり、最終的な臨床判断は必ず担当医師が行ってください。
          AIの出力を直接的な診断・治療の根拠とすることは推奨しません。
          重要な臨床判断には、必ずガイドラインの原文を参照し、
          必要に応じて専門医へのコンサルテーションを行ってください。
        </p>
      </div>

      {/* Logout */}
      <button
        onClick={onLogout}
        className="w-full bg-white border border-red-200 text-red-600 rounded-2xl py-3 text-sm font-bold hover:bg-red-50 transition-colors"
      >
        ログアウト
      </button>
    </div>
  );
}
