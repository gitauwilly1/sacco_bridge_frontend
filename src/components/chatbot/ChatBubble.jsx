import { Bot, User } from 'lucide-react';

export default function ChatBubble({ message, role }) {
  const isUser = role === 'USER';

  return (
    <div className={`flex items-start gap-2 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-terracotta-100 flex items-center justify-center flex-shrink-0 mt-1">
          <Bot className="w-4 h-4 text-terracotta-600" />
        </div>
      )}
      <div
        className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
          isUser
            ? 'bg-gradient-to-r from-terracotta-500 to-clay-600 text-white rounded-br-md'
            : 'bg-white border border-sand-200 text-slate-700 rounded-bl-md shadow-subtle'
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        {message.intent_detected && (
          <p className={`text-[10px] mt-1 ${isUser ? 'text-white/60' : 'text-slate-400'}`}>
            {message.intent_detected}
          </p>
        )}
      </div>
      {isUser && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-terracotta-400 to-clay-600 flex items-center justify-center flex-shrink-0 mt-1">
          <User className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  );
}