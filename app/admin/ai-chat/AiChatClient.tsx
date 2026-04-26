"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, Scale } from "lucide-react";

type Source = { title: string; source: string; year: number; type: string };
type Message = {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
};

const TYPE_LABELS: Record<string, string> = {
  law:        "قانون",
  cassation:  "نقض",
  regulation: "لائحة",
  decree:     "مرسوم",
};

export default function AiChatClient() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input,    setInput]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async () => {
    const question = input.trim();
    if (!question || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res  = await fetch("/api/chat", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ question }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "حدث خطأ");
        return;
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer, sources: data.sources },
      ]);
    } catch {
      setError("تعذّر الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className="flex flex-col h-[calc(100vh-140px)]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-5 pb-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="bg-[#C8A96A]/10 border border-[#C8A96A]/20 rounded-2xl p-10 max-w-sm text-center">
              <Scale className="text-[#C8A96A] mx-auto mb-4" size={44} />
              <h3 className="text-white font-semibold text-lg mb-2">
                المساعد القانوني
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                اطرح سؤالاً قانونياً وسأجيب بناءً على المحتوى المُدخل في
                النظام
              </p>
            </div>
          </div>
        )}

        {messages.map((msg, i) =>
          msg.role === "user" ? (
            <div key={i} className="flex justify-end">
              <div className="bg-[#C8A96A]/10 border border-[#C8A96A]/20 rounded-2xl rounded-tl-sm px-4 py-3 max-w-xl">
                <p className="text-white text-sm leading-relaxed">
                  {msg.content}
                </p>
              </div>
            </div>
          ) : (
            <div key={i} className="space-y-2.5">
              <div className="flex items-start gap-3">
                <div className="bg-[#C8A96A]/10 border border-[#C8A96A]/20 rounded-xl p-2 mt-1 shrink-0">
                  <Bot size={15} className="text-[#C8A96A]" />
                </div>
                <div className="bg-[#0A1628] border border-white/10 rounded-2xl rounded-tr-sm px-4 py-3 max-w-xl">
                  <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </p>
                </div>
              </div>

              {msg.sources && msg.sources.length > 0 && (
                <div className="mr-11 space-y-1.5">
                  <p className="text-xs text-gray-500">المصادر المُستخدمة:</p>
                  <div className="flex flex-wrap gap-2">
                    {msg.sources.map((s, j) => (
                      <span
                        key={j}
                        className="bg-[#0A1628] border border-[#C8A96A]/20 text-[#C8A96A] rounded-lg px-3 py-1 text-xs"
                      >
                        {TYPE_LABELS[s.type] ?? s.type} · {s.title} · {s.year}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        )}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="bg-[#C8A96A]/10 border border-[#C8A96A]/20 rounded-xl p-2 mt-1 shrink-0">
              <Bot size={15} className="text-[#C8A96A]" />
            </div>
            <div className="bg-[#0A1628] border border-white/10 rounded-2xl rounded-tr-sm px-4 py-4">
              <div className="flex gap-1.5 items-center">
                {[0, 150, 300].map((d) => (
                  <span
                    key={d}
                    style={{ animationDelay: `${d}ms` }}
                    className="w-2 h-2 bg-[#C8A96A] rounded-full animate-bounce"
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-900/30 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-sm">
            {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-white/10 pt-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) handleSend();
            }}
            placeholder="اكتب سؤالك القانوني هنا..."
            disabled={loading}
            className="flex-1 bg-[#0A1628] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#C8A96A]/50 transition disabled:opacity-60"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="bg-[#C8A96A] hover:bg-[#b8934e] disabled:opacity-40 text-[#0B1F3A] p-3 rounded-xl transition"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
