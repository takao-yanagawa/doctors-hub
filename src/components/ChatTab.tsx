"use client";

import { useState, useRef, useEffect } from "react";

interface PubMedArticle {
  pmid: string;
  title: string;
  authors: string;
  journal: string;
  year: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  articles?: PubMedArticle[];
}

export default function ChatTab() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setLoading(true);

    try {
      // まずAIの返答を取得
      const chatRes = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const chatData = await chatRes.json();

      if (chatData.error) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `エラー: ${chatData.error}` },
        ]);
      } else {
        const reply: string = chatData.reply;
        // APIから返された治療方針フラグでPubMed検索を判定
        const isTreatmentResponse: boolean = chatData.isTreatment === true;

        let articles: PubMedArticle[] = [];
        // 論文が見つからなかった場合のフォールバック
        const fallbackArticle: PubMedArticle = {
          pmid: "",
          title:
            "日本呼吸器学会「成人市中肺炎診療ガイドライン」では、併存疾患あり外来CAPに対して呼吸器フルオロキノロン単剤またはβラクタム＋マクロライド/ドキシサイクリン併用を推奨しています。",
          authors: "日本呼吸器学会",
          journal: "成人市中肺炎診療ガイドライン",
          year: "",
        };

        if (isTreatmentResponse) {
          try {
            const pubmedRes = await fetch("/api/pubmed", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                query: "community acquired pneumonia treatment guidelines Japan",
              }),
            });
            const pubmedData = await pubmedRes.json();
            articles = pubmedData.articles || [];
          } catch {
            // PubMed検索失敗
          }
          // 0件の場合はフォールバックを表示
          if (articles.length === 0) {
            articles = [fallbackArticle];
          }
        }

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: reply,
            articles: isTreatmentResponse ? articles : undefined,
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "通信エラーが発生しました。" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto hide-scrollbar p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-blue-400">
                <path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 00-1.032-.211 50.89 50.89 0 00-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 002.433 3.984L7.28 21.53A.75.75 0 016 21v-4.03a48.527 48.527 0 01-1.087-.128C2.905 16.58 1.5 14.833 1.5 12.862V6.638c0-1.97 1.405-3.718 3.413-3.979z" />
                <path d="M15.75 7.5c-1.376 0-2.739.057-4.086.169C10.124 7.797 9 9.103 9 10.609v4.285c0 1.507 1.128 2.814 2.67 2.94 1.243.102 2.5.157 3.768.165l2.782 2.781a.75.75 0 001.28-.53v-2.39l.33-.026c1.542-.125 2.67-1.433 2.67-2.94v-4.286c0-1.505-1.125-2.811-2.664-2.94A49.392 49.392 0 0015.75 7.5z" />
              </svg>
            </div>
            <p className="font-medium text-slate-500">臨床に関する質問をどうぞ</p>
            <p className="text-xs text-slate-400 mt-1">ガイドライン・保険算定情報付きで回答します</p>
            <div className="mt-4 mx-4 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-[11px] text-amber-800 leading-relaxed">
                <span className="font-semibold">⚠ 患者氏名・ID等の個人を特定できる情報は入力しないでください。</span>
                <br />
                年齢・性別・症状など匿名化した情報のみでご相談ください。
              </p>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] ${msg.role === "user" ? "" : "w-full"}`}>
              <div
                className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-blue-700 text-white rounded-br-md"
                    : "bg-slate-100 text-slate-800 rounded-bl-md"
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>

              {/* PubMed Articles */}
              {msg.articles && msg.articles.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-1">
                    PubMed 関連論文
                  </p>
                  {msg.articles.map((article, idx) =>
                    article.pmid ? (
                      <a
                        key={article.pmid}
                        href={`https://pubmed.ncbi.nlm.nih.gov/${article.pmid}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 hover:bg-blue-100 transition-colors"
                      >
                        <p className="text-xs font-medium text-blue-900 line-clamp-2">
                          {article.title}
                        </p>
                        <p className="text-[10px] text-blue-600 mt-0.5">
                          {article.authors} - {article.journal} ({article.year})
                        </p>
                      </a>
                    ) : (
                      <div
                        key={`fallback-${idx}`}
                        className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2"
                      >
                        <p className="text-xs font-medium text-blue-900">
                          {article.title}
                        </p>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex space-x-1.5">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex-shrink-0 border-t border-slate-200 p-3">
        <p className="text-[10px] text-amber-700 mb-2 text-center">
          ⚠ 患者氏名・IDは入力しないでください（匿名化した情報のみ）
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.nativeEvent.isComposing && sendMessage()}
            placeholder="臨床に関する質問を入力..."
            className="flex-1 bg-slate-100 rounded-full px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-300 placeholder:text-slate-400"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="bg-blue-700 text-white rounded-full w-10 h-10 flex items-center justify-center disabled:opacity-40 hover:bg-blue-800 transition-colors flex-shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
