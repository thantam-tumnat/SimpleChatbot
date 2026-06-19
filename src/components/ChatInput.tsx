"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, Trash2 } from "lucide-react";
import ChatMessage from "./ChatMessage";
import Button from "./ui/Button";
import Progress from "./ui/Progress";

interface Message {
  role: "user" | "assistant";
  content: string;
  thinking?: string;
  isForgotten?: boolean;
}

const TOKEN_LIMIT = 8000;

function parseReply(raw: string): { thinking?: string; content: string } {
  const thinkMatch = raw.match(/^<think>([\s\S]*?)<\/think>\s*/);
  if (thinkMatch) {
    const content = raw.slice(thinkMatch[0].length).trim();
    return { thinking: thinkMatch[1].trim(), content: content || raw };
  }
  return { content: raw };
}

function estimateTokens(text: string): number {
  // Approximate tokens for a mix of Thai and English text:
  // Thai characters: ~1.8 characters per token
  // English/others: ~4 characters per token
  const thaiRegex = /[\u0e00-\u0e7f]/g;
  const thaiMatches = text.match(thaiRegex);
  const thaiCharCount = thaiMatches ? thaiMatches.length : 0;
  
  const otherText = text.replace(thaiRegex, '');
  const otherCharCount = otherText.length;
  
  return Math.ceil(thaiCharCount / 1.8) + Math.ceil(otherCharCount / 4);
}

function estimateMessageTokens(msg: Message): number {
  return estimateTokens(msg.content) + 4; // Add 4 tokens overhead for role/formatting
}

function updateMessageContext(msgs: Message[]): Message[] {
  let totalTokens = 0;
  const updated = msgs.map(m => ({ ...m, isForgotten: false }));
  
  let cutoffIndex = -1;
  // Evaluate from newest to oldest
  for (let i = updated.length - 1; i >= 0; i--) {
    const msgTokens = estimateMessageTokens(updated[i]);
    if (totalTokens + msgTokens > TOKEN_LIMIT) {
      cutoffIndex = i;
      break;
    }
    totalTokens += msgTokens;
  }
  
  // Mark all messages up to the cutoff index as forgotten
  if (cutoffIndex !== -1) {
    for (let i = 0; i <= cutoffIndex; i++) {
      updated[i].isForgotten = true;
    }
  }
  
  // Polish: Ensure the first active message starts with a 'user' role
  // to avoid sending an orphaned assistant reply at the beginning of the context.
  const firstActiveIdx = updated.findIndex(m => !m.isForgotten);
  if (firstActiveIdx !== -1 && updated[firstActiveIdx].role === "assistant") {
    updated[firstActiveIdx].isForgotten = true;
  }
  
  return updated;
}

export default function ChatInput() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + "px";
    }
  }, [input]);

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    const withNewUserMsg = [...messages, userMessage];
    const updated = updateMessageContext(withNewUserMsg);
    setMessages(updated);
    setInput("");
    setIsLoading(true);

    if (textareaRef.current) textareaRef.current.style.height = "auto";

    try {
      // Send only non-forgotten messages to the API
      const activeMessages = updated
        .filter(m => !m.isForgotten)
        .map(({ role, content }) => ({ role, content }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: activeMessages }),
      });

      if (!res.ok) throw new Error("Failed");

      const data = await res.json();
      const rawReplyContent = data.choices?.[0]?.message?.content || "Sorry, something went wrong.";
      const { thinking, content } = parseReply(rawReplyContent);
      const reply: Message = {
        role: "assistant",
        content,
        thinking,
      };
      
      setMessages((prev) => {
        const withAssistantReply = [...prev, reply];
        return updateMessageContext(withAssistantReply);
      });
    } catch {
      setMessages((prev) => {
        const errorReply: Message = { role: "assistant", content: "Something went wrong. Try again." };
        return [...prev, errorReply];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleClearChat = () => {
    if (window.confirm("คุณต้องการล้างประวัติการแชตทั้งหมดใช่หรือไม่?")) {
      setMessages([]);
    }
  };

  // Calculate memory metrics
  const activeMessages = messages.filter(m => !m.isForgotten);
  const activeTokens = activeMessages.reduce((sum, m) => sum + estimateMessageTokens(m), 0);
  const tokenPercentage = Math.min(Math.round((activeTokens / TOKEN_LIMIT) * 100), 100);

  return (
    <div className="flex flex-col h-full bg-gray-50 text-gray-900">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 pt-6 pb-16 relative">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center mb-4">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Super duper holy ultimate AI</h2>
            <p className="text-sm text-gray-500">ว่ามาโลด</p>
          </div>
        ) : (
          <div className="space-y-4 max-w-2xl mx-auto">
            {messages.map((msg, i) => (
              <ChatMessage key={i} message={msg} />
            ))}
            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-black flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-2.5">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-gray-200 bg-white px-4 sm:px-6 py-4 flex flex-col gap-2">
        {/* Actions panel */}
        {messages.length > 0 && (
          <div className="max-w-2xl w-full mx-auto flex items-center justify-end text-xs text-gray-500">
            <Button
              variant="danger"
              onClick={handleClearChat}
            >
              <Trash2 className="w-3.5 h-3.5" />
              ล้างแชต (Clear)
            </Button>
          </div>
        )}

        {/* Text input row */}
        <div className="max-w-2xl w-full mx-auto">
          <div className="flex items-end gap-2 border border-gray-300 rounded-2xl bg-gray-50 focus-within:border-gray-400 focus-within:bg-white transition-colors px-3 py-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message..."
              rows={1}
              className="flex-1 bg-transparent resize-none outline-none text-[15px] text-gray-900 placeholder-gray-400 py-1 leading-relaxed"
              disabled={isLoading}
            />

            {/* Context Memory Pill (ข้างปุ่มส่ง) */}
            {messages.length > 0 && (
              <div className="flex items-center self-center mr-1">
                <div className="group flex items-center bg-transparent hover:bg-gray-200/60 rounded-full px-2 py-1 transition-all duration-300 ease-in-out cursor-default select-none">
                  {/* Pulse Indicator */}
                  <span className="relative flex h-2 w-2 mr-1.5">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      tokenPercentage < 50 ? "bg-emerald-400" : tokenPercentage < 80 ? "bg-amber-400" : "bg-rose-400"
                    }`} />
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${
                      tokenPercentage < 50 ? "bg-emerald-500" : tokenPercentage < 80 ? "bg-amber-500" : "bg-rose-500"
                    }`} />
                  </span>

                  {/* Reusable Progress bar */}
                  <Progress value={tokenPercentage} />

                  {/* Hover Details */}
                  <div className="max-w-0 opacity-0 overflow-hidden group-hover:max-w-xs group-hover:opacity-100 transition-all duration-300 ease-in-out flex items-center text-[10px] font-bold text-gray-500 whitespace-nowrap">
                    <span className="ml-1.5 pl-1.5 border-l border-gray-200">
                      {activeTokens.toLocaleString()} / {TOKEN_LIMIT.toLocaleString()} ({tokenPercentage}%)
                    </span>
                  </div>
                </div>
              </div>
            )}

            <Button
              variant="circle"
              onClick={handleSubmit}
              disabled={isLoading || !input.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
