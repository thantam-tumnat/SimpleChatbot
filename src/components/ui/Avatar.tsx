import { User, Sparkles } from "lucide-react";

interface AvatarProps {
  role: "user" | "assistant";
  isForgotten?: boolean;
  className?: string;
}

export default function Avatar({
  role,
  isForgotten = false,
  className = "",
}: AvatarProps) {
  const isUser = role === "user";

  const baseStyle = "flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-1 transition-all duration-200";
  const roleStyles = isUser
    ? "bg-gray-200 text-gray-600"
    : "bg-black text-white";
  const forgottenStyle = isForgotten ? "opacity-30 scale-95" : "";

  return (
    <div className={`${baseStyle} ${roleStyles} ${forgottenStyle} ${className}`}>
      {isUser ? (
        <User className="w-3.5 h-3.5" />
      ) : (
        <Sparkles className="w-3.5 h-3.5" />
      )}
    </div>
  );
}
