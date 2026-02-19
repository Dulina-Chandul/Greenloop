import { useState, useRef, useEffect, useCallback } from "react";
import {
  Bot,
  Send,
  Plus,
  Lightbulb,
  TrendingUp,
  X,
  ChevronRight,
  Leaf,
  Sparkles,
  Image as ImageIcon,
} from "lucide-react";
import { useAppSelector } from "@/redux/hooks/hooks";
import { selectUser } from "@/redux/slices/authSlice";
import {
  sendChatMessageAPI,
  type ChatMessage,
} from "@/apiservices/ai/chatbotAPI";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: "user" | "ecomate";
  text: string;
  timestamp: Date;
  imageDataUrl?: string; // base64 data URL to display in chat
}

interface AttachedImage {
  file: File;
  dataUrl: string; // base64 data URL for preview & display
  base64: string; // raw base64 (no prefix) for API
  mimeType: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TRENDING_QUESTIONS = [
  { question: "How to recycle pizza boxes?" },
  { question: "Is bubble wrap recyclable?" },
  { question: "Upcycling ideas for old denim jeans" },
];

const DID_YOU_KNOW = {
  icon: "🏛️",
  title: "Grease & Recycling",
  fact: "Pizza boxes with heavy grease stains cannot be recycled — the oil contaminates the pulp. Compost them instead!",
};

const QUICK_SUGGESTIONS = [
  "How to recycle plastic bottles?",
  "Upcycling ideas for glass jars",
  "What materials fetch the best prices?",
  "How to sort and prepare recyclables?",
];

const GREETING_MESSAGE: Message = {
  id: "greeting",
  role: "ecomate",
  text: "Hello! I'm **EcoMate**, your eco-friendly AI assistant 🌿\n\nI can help you with:\n- **Recycling tips** for any material\n- **Upcycling project ideas** with step-by-step guides\n- **Pricing advice** to get the best value for your recyclables\n- **Image analysis** — tap **+** to attach a photo of your waste, then ask me anything about it!\n\nWhat would you like to explore today?",
  timestamp: new Date(),
};

// ─── Markdown Renderer ────────────────────────────────────────────────────────

function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  const inlineFormat = (str: string, key: string): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
    let lastIndex = 0;
    let match;
    let idx = 0;
    while ((match = regex.exec(str)) !== null) {
      if (match.index > lastIndex)
        parts.push(str.slice(lastIndex, match.index));
      if (match[2])
        parts.push(
          <strong key={`${key}-b-${idx}`} className="text-white font-semibold">
            {match[2]}
          </strong>,
        );
      else if (match[3])
        parts.push(
          <em key={`${key}-i-${idx}`} className="text-gray-200 italic">
            {match[3]}
          </em>,
        );
      else if (match[4])
        parts.push(
          <code
            key={`${key}-c-${idx}`}
            className="bg-gray-700 px-1 py-0.5 rounded text-green-300 text-xs font-mono"
          >
            {match[4]}
          </code>,
        );
      lastIndex = match.index + match[0].length;
      idx++;
    }
    if (lastIndex < str.length) parts.push(str.slice(lastIndex));
    return parts.length === 1 && typeof parts[0] === "string" ? (
      parts[0]
    ) : (
      <>{parts}</>
    );
  };

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === "") {
      elements.push(<div key={`sp-${i}`} className="h-1.5" />);
      i++;
      continue;
    }

    if (line.startsWith("### ")) {
      elements.push(
        <p
          key={`h3-${i}`}
          className="text-green-400 font-bold text-sm mt-2 mb-1"
        >
          {inlineFormat(line.slice(4), `h3-${i}`)}
        </p>,
      );
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      elements.push(
        <p
          key={`h2-${i}`}
          className="text-white font-bold text-base mt-3 mb-1 border-b border-gray-600 pb-1"
        >
          {inlineFormat(line.slice(3), `h2-${i}`)}
        </p>,
      );
      i++;
      continue;
    }
    if (line.startsWith("# ")) {
      elements.push(
        <p key={`h1-${i}`} className="text-white font-bold text-lg mt-3 mb-1">
          {inlineFormat(line.slice(2), `h1-${i}`)}
        </p>,
      );
      i++;
      continue;
    }
    if (line.trim() === "---") {
      elements.push(<hr key={`hr-${i}`} className="border-gray-700 my-2" />);
      i++;
      continue;
    }

    if (/^(\s*[-*•]\s)/.test(line)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && /^(\s*[-*•]\s)/.test(lines[i])) {
        const indent = lines[i].match(/^(\s*)/)?.[1]?.length || 0;
        const content = lines[i].replace(/^\s*[-*•]\s/, "");
        items.push(
          <li
            key={`li-${i}`}
            className={`flex items-start gap-1.5 text-gray-200 ${indent > 0 ? "ml-4" : ""}`}
          >
            <span className="text-green-400 mt-0.5 shrink-0 text-xs">▸</span>
            <span>{inlineFormat(content, `li-${i}`)}</span>
          </li>,
        );
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="space-y-1 my-1">
          {items}
        </ul>,
      );
      continue;
    }

    if (/^\d+\.\s/.test(line)) {
      const items: React.ReactNode[] = [];
      let num = 1;
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        const content = lines[i].replace(/^\d+\.\s/, "");
        items.push(
          <li key={`nl-${i}`} className="flex items-start gap-2 text-gray-200">
            <span className="text-green-400 font-bold text-xs mt-0.5 shrink-0 w-4 text-right">
              {num}.
            </span>
            <span>{inlineFormat(content, `nl-${i}`)}</span>
          </li>,
        );
        i++;
        num++;
      }
      elements.push(
        <ol key={`ol-${i}`} className="space-y-1 my-1">
          {items}
        </ol>,
      );
      continue;
    }

    elements.push(
      <p key={`p-${i}`} className="text-gray-200 leading-relaxed">
        {inlineFormat(line, `p-${i}`)}
      </p>,
    );
    i++;
  }

  return elements;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTime(date: Date) {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDateHeader(date: Date) {
  const now = new Date();
  if (date.toDateString() === now.toDateString())
    return `Today, ${formatTime(date)}`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** Convert File to base64 (without data URI prefix) */
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip "data:image/xxx;base64," prefix
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ─── Typing Indicator ─────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-full bg-green-600 flex items-center justify-center shrink-0">
        <Bot size={18} className="text-white" />
      </div>
      <div className="bg-gray-800 border border-gray-700 rounded-2xl rounded-tl-none px-4 py-3">
        <div className="flex gap-1.5 items-center h-5">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce [animation-delay:0ms]" />
          <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce [animation-delay:150ms]" />
          <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function EcoMate() {
  const user = useAppSelector(selectUser);
  const userName = user?.firstName || user?.email?.split("@")[0] || "You";

  const [messages, setMessages] = useState<Message[]>([GREETING_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showDidYouKnow, setShowDidYouKnow] = useState(true);

  // Attached image (pending — not yet sent)
  const [attachedImage, setAttachedImage] = useState<AttachedImage | null>(
    null,
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const co2Saved = 12.5;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const buildHistory = useCallback((msgs: Message[]): ChatMessage[] => {
    return msgs
      .filter((m) => m.id !== "greeting")
      .map((m) => ({
        role: m.role === "ecomate" ? "model" : "user",
        text: m.text,
      }));
  }, []);

  // ── Send message (with optional attached image) ────────────────────────────

  const sendMessage = useCallback(
    async (text: string, imageOverride?: AttachedImage) => {
      const trimmed = text.trim();
      const imgToSend = imageOverride ?? attachedImage;

      if ((!trimmed && !imgToSend) || isLoading) return;

      const messageText =
        trimmed || (imgToSend ? "What can I do with this material?" : "");

      const userMsg: Message = {
        id: Date.now().toString(),
        role: "user",
        text: messageText,
        timestamp: new Date(),
        imageDataUrl: imgToSend?.dataUrl,
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setAttachedImage(null); // clear attachment after send
      setIsLoading(true);

      try {
        const history = buildHistory([...messages]);
        const data = await sendChatMessageAPI(
          history,
          messageText,
          imgToSend?.base64,
          imgToSend?.mimeType,
        );

        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "ecomate",
            text: data.reply,
            timestamp: new Date(),
          },
        ]);
      } catch (err: any) {
        console.error("[EcoMate] Chat API error:", err);
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "ecomate",
            text: "I'm having a bit of trouble connecting right now 🌿 Please try again in a moment!",
            timestamp: new Date(),
          },
        ]);
      } finally {
        setIsLoading(false);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    },
    [attachedImage, buildHistory, isLoading, messages],
  );

  // ── File selected → convert to base64 and attach (don't send yet) ─────────

  const onFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = ""; // reset so same file can be reselected

    try {
      const dataUrl = URL.createObjectURL(file);
      const base64 = await fileToBase64(file);
      setAttachedImage({
        file,
        dataUrl, // used for display
        base64, // used for Gemini API
        mimeType: file.type || "image/jpeg",
      });
      // Focus input so user can type caption
      setTimeout(() => inputRef.current?.focus(), 50);
    } catch (err) {
      console.error("Failed to read file:", err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="flex h-full overflow-hidden bg-gray-900">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileSelected}
      />

      {/* ── Chat Panel ──────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 border-r border-gray-700/50">
        {/* Header */}
        <div className="shrink-0 px-6 py-4 border-b border-gray-700/50 bg-gray-800/40 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-linear-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-900/30">
              <Bot size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-none">
                EcoMate
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-green-400 text-xs font-medium">
                  Online · AI Eco Assistant
                </span>
              </div>
            </div>
            <div className="ml-auto">
              <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded-full border border-gray-700">
                📎 Attach a photo, then ask anything
              </span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Date header */}
          <div className="flex justify-center">
            <span className="text-gray-500 text-xs bg-gray-800 px-3 py-1 rounded-full border border-gray-700">
              {formatDateHeader(messages[0].timestamp)}
            </span>
          </div>

          {messages.map((msg) => {
            const isUser = msg.role === "user";

            if (isUser) {
              return (
                <div
                  key={msg.id}
                  className="flex items-end gap-2 flex-row-reverse"
                >
                  <div className="w-9 h-9 rounded-full bg-linear-to-br from-teal-500 to-green-600 flex items-center justify-center shrink-0 text-white text-sm font-bold">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="max-w-[65%] flex flex-col items-end gap-1">
                    <span className="text-xs text-gray-500 mr-1">You</span>
                    {/* Image attached to this message */}
                    {msg.imageDataUrl && (
                      <div className="mb-1 rounded-2xl rounded-tr-none overflow-hidden border border-white/10 max-w-xs shadow-lg">
                        <img
                          src={msg.imageDataUrl}
                          alt="Attached waste photo"
                          className="w-full max-h-52 object-cover"
                        />
                      </div>
                    )}
                    {msg.text && (
                      <div className="bg-linear-to-br from-teal-500 to-green-500 text-white px-4 py-3 rounded-2xl rounded-br-none text-sm leading-relaxed shadow-lg shadow-green-900/20">
                        {msg.text}
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            // EcoMate message
            return (
              <div key={msg.id} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-linear-to-br from-green-500 to-emerald-600 flex items-center justify-center shrink-0 shadow-md">
                  <Bot size={18} className="text-white" />
                </div>
                <div className="max-w-[75%] flex flex-col gap-1">
                  <span className="text-xs text-gray-500 ml-1">EcoMate</span>
                  <div className="bg-gray-800 border border-gray-700/60 px-4 py-3 rounded-2xl rounded-tl-none text-sm">
                    <div className="space-y-1">{renderMarkdown(msg.text)}</div>
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips — only on first load */}
        {messages.length <= 2 && !isLoading && (
          <div className="shrink-0 px-6 pb-2">
            <div className="flex flex-wrap gap-2">
              {QUICK_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-xs bg-gray-800 border border-gray-600 text-gray-300 hover:border-green-500 hover:text-green-400 px-3 py-1.5 rounded-full transition-all duration-200"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Input Area ─────────────────────────────────────────── */}
        <div className="shrink-0 bg-gray-800/60 border-t border-gray-700/50">
          {/* Image attachment preview (shown ABOVE the input bar) */}
          {attachedImage && (
            <div className="px-4 pt-3 pb-1 flex items-start gap-3">
              <div className="relative group">
                <img
                  src={attachedImage.dataUrl}
                  alt="Attached"
                  className="h-20 w-24 object-cover rounded-xl border border-gray-600 shadow-md"
                />
                <button
                  onClick={() => setAttachedImage(null)}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-gray-700 hover:bg-red-600 border border-gray-600 rounded-full flex items-center justify-center transition-colors shadow"
                >
                  <X size={10} className="text-white" />
                </button>
              </div>
              <div className="flex flex-col justify-center gap-1 pt-1">
                <p className="text-green-400 text-xs font-medium flex items-center gap-1">
                  <ImageIcon size={12} />
                  Photo attached
                </p>
                <p className="text-gray-500 text-xs leading-relaxed">
                  Type your question below — ask for an analysis, creative
                  ideas, or anything else!
                </p>
              </div>
            </div>
          )}

          {/* Input bar */}
          <div className="px-4 py-3">
            <div className="flex items-center gap-2 bg-gray-800 border border-gray-600 hover:border-gray-500 focus-within:border-green-500 rounded-2xl px-4 py-2.5 transition-colors duration-200">
              {/* Attach image button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                title="Attach a waste photo"
                className={`shrink-0 p-1 transition-colors ${
                  attachedImage
                    ? "text-green-400"
                    : "text-gray-400 hover:text-blue-400"
                } disabled:opacity-40`}
              >
                <Plus size={20} />
              </button>

              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  attachedImage
                    ? "Ask about this photo — analyze it, get creative ideas..."
                    : "Ask EcoMate about recycling..."
                }
                disabled={isLoading}
                className="flex-1 bg-transparent text-gray-100 placeholder-gray-500 text-sm outline-none min-w-0 disabled:opacity-50"
              />

              <button
                onClick={() => sendMessage(input)}
                disabled={isLoading || (!input.trim() && !attachedImage)}
                className="w-9 h-9 rounded-xl bg-green-500 hover:bg-green-400 active:scale-95 flex items-center justify-center shrink-0 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-green-900/30"
              >
                <Send size={16} className="text-white" />
              </button>
            </div>
            <p className="text-center text-gray-600 text-xs mt-2">
              {attachedImage
                ? "📸 Photo ready — type your question and hit Send"
                : "Tap + to attach a waste photo · EcoMate AI can make mistakes"}
            </p>
          </div>
        </div>
      </div>

      {/* ── Quick Tips Sidebar ──────────────────────────────────────── */}
      <aside className="w-72 xl:w-80 shrink-0 flex flex-col overflow-y-auto bg-gray-900 px-4 py-5 gap-5">
        <div className="flex items-center gap-2">
          <Lightbulb size={18} className="text-green-400" />
          <h2 className="text-white font-bold text-base">Quick Tips</h2>
        </div>

        {/* Your Impact */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
          <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-3">
            Your Impact
          </p>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-white text-3xl font-bold">
                {co2Saved} <span className="text-lg">kg</span>
              </p>
              <p className="text-gray-400 text-xs mt-1 leading-relaxed">
                CO₂ saved this month through your recycling.
              </p>
            </div>
            <div className="p-2 bg-green-500/10 rounded-lg">
              <TrendingUp size={20} className="text-green-400" />
            </div>
          </div>
        </div>

        {/* Upload hint */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/30 hover:border-blue-400/60 hover:bg-blue-500/15 rounded-xl transition-all duration-200 text-left group disabled:opacity-50"
        >
          <div className="w-10 h-10 bg-blue-500/20 border border-blue-500/40 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <ImageIcon size={20} className="text-blue-400" />
          </div>
          <div>
            <p className="text-blue-300 font-semibold text-sm">
              Attach a Waste Photo
            </p>
            <p className="text-gray-500 text-xs mt-0.5">
              Then ask for analysis or creative ideas
            </p>
          </div>
        </button>

        {/* Trending Questions */}
        <div>
          <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-3">
            Trending Questions
          </p>
          <div className="flex flex-col gap-2">
            {TRENDING_QUESTIONS.map((item) => (
              <button
                key={item.question}
                onClick={() => sendMessage(item.question)}
                disabled={isLoading}
                className="bg-gray-800 border border-gray-700 hover:border-green-600/50 rounded-xl p-3 text-left group transition-all duration-200 disabled:opacity-50"
              >
                <p className="text-gray-200 text-sm font-medium group-hover:text-green-400 transition-colors leading-snug">
                  {item.question}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Did You Know */}
        {showDidYouKnow && (
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-3">
              Did You Know?
            </p>
            <div className="relative bg-gray-800 border border-gray-700 rounded-xl p-4">
              <button
                onClick={() => setShowDidYouKnow(false)}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-300 transition-colors"
              >
                <X size={14} />
              </button>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-blue-500/15 border border-blue-500/30 rounded-lg flex items-center justify-center shrink-0 text-lg">
                  {DID_YOU_KNOW.icon}
                </div>
                <div className="pr-4">
                  <p className="text-white font-semibold text-sm leading-tight">
                    {DID_YOU_KNOW.title}
                  </p>
                  <p className="text-gray-400 text-xs mt-1.5 leading-relaxed">
                    {DID_YOU_KNOW.fact}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Start */}
        <div>
          <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-3">
            Quick Start
          </p>
          <div className="flex flex-col gap-2">
            {[
              {
                icon: Leaf,
                text: "Get recycling tips",
                color: "text-green-400",
              },
              {
                icon: Sparkles,
                text: "Upcycling project ideas",
                color: "text-purple-400",
              },
              {
                icon: TrendingUp,
                text: "Best materials to sell",
                color: "text-blue-400",
              },
            ].map(({ icon: Icon, text, color }) => (
              <button
                key={text}
                onClick={() => sendMessage(text)}
                disabled={isLoading}
                className="flex items-center gap-3 px-3 py-2.5 bg-gray-800/60 hover:bg-gray-800 border border-gray-700/60 hover:border-gray-600 rounded-lg text-left text-gray-300 hover:text-white text-sm transition-all duration-200 group disabled:opacity-50"
              >
                <Icon size={15} className={color} />
                {text}
                <ChevronRight
                  size={13}
                  className="ml-auto text-gray-600 group-hover:text-gray-400"
                />
              </button>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
