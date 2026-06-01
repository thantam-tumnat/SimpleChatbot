import ChatInput from "./components/ChatInput";

export default function Home() {
  return (
    <main className="h-screen flex flex-col">
      {/* Minimal header */}
      <header className="flex-shrink-0 border-b border-gray-200 bg-white/80 backdrop-blur-sm px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-sm font-medium text-gray-900">Chatbot9Arm</span>
        </div>
      </header>

      <ChatInput />
    </main>
  );
}
