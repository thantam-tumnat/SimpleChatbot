import Avatar from "./ui/Avatar";
import Badge from "./ui/Badge";

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
        <Avatar role="assistant" isForgotten={message.isForgotten} />
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
