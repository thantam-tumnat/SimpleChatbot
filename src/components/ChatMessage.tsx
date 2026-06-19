import Avatar from "./ui/Avatar";
import Badge from "./ui/Badge";

interface Message {
  role: "user" | "assistant";
  content: string;
  thinking?: string;
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
        <Avatar role="assistant" isForgotten={message.isForgotten} />
      )}

      {/* Bubble with optional forgotten label */}
      <div className={`flex flex-col gap-1 max-w-[75%] ${isUser ? "items-end" : "items-start"}`}>
        {!isUser && message.thinking && (
          <details className={`w-full mb-1 rounded-xl border border-gray-200 bg-gray-50 text-xs text-gray-500 transition-all duration-300 ${message.isForgotten ? "opacity-35" : ""}`}>
            <summary className="cursor-pointer select-none px-3 py-1.5 font-medium hover:text-gray-700">
              Thinking...
            </summary>
            <p className="px-3 pb-2.5 leading-relaxed whitespace-pre-wrap break-words border-t border-gray-200 pt-2 text-gray-400">
              {message.thinking}
            </p>
          </details>
        )}
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
          <Badge variant="forgotten">
            ลืมแล้ว (นอกขอบเขตความจำ)
          </Badge>
        )}
      </div>

      {/* User avatar */}
      {isUser && (
        <Avatar role="user" isForgotten={message.isForgotten} />
      )}
    </div>
  );
}
