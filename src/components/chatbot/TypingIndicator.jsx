import { Bot } from 'lucide-react';

export default function TypingIndicator() {
  return (
    <div className="flex items-start gap-2">
      <div className="w-7 h-7 rounded-full bg-terracotta-100 flex items-center justify-center flex-shrink-0">
        <Bot className="w-4 h-4 text-terracotta-600" />
      </div>
      <div className="bg-white border border-sand-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-subtle">
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" />
          <div className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '0.1s' }} />
          <div className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '0.2s' }} />
        </div>
      </div>
    </div>
  );
}