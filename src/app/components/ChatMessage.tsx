import { User, Sparkles } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  isForgotten?: boolean;
}

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex items-start gap-3 ${isUser ? "justify-end" : "justify-start"} transition-all duration-300`}>
      {/* AI avatar */}
      {!isUser && (
        <div className={`flex-shrink-0 w-7 h-7 rounded-full bg-black flex items-center justify-center mt-1 transition-opacity ${message.isForgotten ? "opacity-30" : ""}`}>
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
      )}

      {/* Bubble with optional forgotten label */}
      <div className={`flex flex-col gap-1 max-w-[75%] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`rounded-2xl px-4 py-2.5 transition-all duration-300 ${
            isUser
              ? "bg-black text-white rounded-br-sm"
              : "bg-white text-gray-900 border border-gray-200 rounded-bl-sm"
          } ${message.isForgotten ? "opacity-35 border-dashed border-gray-300" : ""}`}
        >
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>
        {message.isForgotten && (
          <span className="text-[10px] text-gray-400 font-medium px-1 select-none">
            ลืมแล้ว (นอกขอบเขตความจำ)
          </span>
        )}
      </div>

      {/* User avatar */}
      {isUser && (
        <div className={`flex-shrink-0 w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center mt-1 transition-opacity ${message.isForgotten ? "opacity-30" : ""}`}>
          <User className="w-3.5 h-3.5 text-gray-600" />
        </div>
      )}
    </div>
  );
}

