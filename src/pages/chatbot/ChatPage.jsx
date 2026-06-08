import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { Send, Bot, User, Plus, MessageSquare } from 'lucide-react';
import api from '@/lib/api.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { ListSkeleton } from '@/components/shared/LoadingSkeleton.jsx';

export default function ChatPage() {
  const { sessionId } = useParams();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const [input, setInput] = useState('');
  const [activeSessionId, setActiveSessionId] = useState(sessionId || null);

  const { data: sessionsData, isLoading: sLoading } = useQuery({
    queryKey: ['chat-sessions'],
    queryFn: async () => {
      const { data } = await api.get('/chatbot/sessions/');
      return data.data || data;
    },
  });

  const sessions = Array.isArray(sessionsData) ? sessionsData : sessionsData?.results || [];

  const { data: messagesData, isLoading: mLoading, refetch: refetchMessages } = useQuery({
    queryKey: ['chat-messages', activeSessionId],
    queryFn: async () => {
      const { data } = await api.get(`/chatbot/sessions/${activeSessionId}/messages/`);
      return data.data || data;
    },
    enabled: !!activeSessionId,
  });

  const messages = Array.isArray(messagesData) ? messagesData : messagesData?.results || [];

  const createSessionMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/chatbot/sessions/', {
        session_type: 'GENERAL_SUPPORT',
        title: 'New Conversation',
      });
      return data.data || data;
    },
    onSuccess: (newSession) => {
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] });
      setActiveSessionId(newSession.id);
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (message) => {
      const { data } = await api.post(`/chatbot/sessions/${activeSessionId}/send_message/`, {
        message,
      });
      return data.data || data;
    },
    onSuccess: () => {
      refetchMessages();
      setInput('');
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!sessionId && sessions.length > 0 && !activeSessionId) {
      setActiveSessionId(sessions[0].id);
    }
  }, [sessions, sessionId, activeSessionId]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || !activeSessionId) return;
    sendMessageMutation.mutate(input.trim());
  };

  const quickPrompts = [
    'How do I create a chama?',
    'What are SACCO shares?',
    'How do loans work?',
    'How do I sell my shares?',
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-sand-200">
        <h2 className="text-lg font-heading font-semibold text-slate-800">AI Assistant</h2>
        <button
          onClick={() => createSessionMutation.mutate()}
          disabled={createSessionMutation.isPending}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-terracotta-600 border border-terracotta-200 rounded-lg hover:bg-terracotta-50 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          New Chat
        </button>
      </div>

      {!activeSessionId && messages.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
          <div className="w-16 h-16 rounded-full bg-terracotta-50 flex items-center justify-center mb-4">
            <Bot className="w-8 h-8 text-terracotta-600" />
          </div>
          <h3 className="font-heading font-semibold text-slate-700 mb-2">How can I help?</h3>
          <p className="text-sm text-slate-500 mb-6">Ask me anything about Sacco Bridge.</p>
          <div className="flex flex-wrap justify-center gap-2">
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => {
                  if (!activeSessionId) {
                    createSessionMutation.mutate();
                  }
                }}
                className="px-3 py-1.5 bg-sand-50 border border-sand-200 rounded-full text-xs text-slate-600 hover:bg-sand-100 transition-all"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {mLoading && (
        <div className="flex-1 px-4 py-4">
          <ListSkeleton rows={4} />
        </div>
      )}

      {!mLoading && messages.length > 0 && (
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2 ${msg.role === 'USER' ? 'justify-end' : ''}`}
            >
              {msg.role === 'ASSISTANT' && (
                <div className="w-7 h-7 rounded-full bg-terracotta-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-terracotta-600" />
                </div>
              )}
              <div
                className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                  msg.role === 'USER'
                    ? 'bg-gradient-to-r from-terracotta-500 to-clay-600 text-white rounded-br-md'
                    : 'bg-white border border-sand-200 text-slate-700 rounded-bl-md'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
              {msg.role === 'USER' && (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-terracotta-400 to-clay-600 flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          ))}
          {sendMessageMutation.isPending && (
            <div className="flex items-start gap-2">
              <div className="w-7 h-7 rounded-full bg-terracotta-100 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-terracotta-600" />
              </div>
              <div className="bg-white border border-sand-200 rounded-2xl rounded-bl-md px-4 py-2.5">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-slate-300 animate-pulse" />
                  <div className="w-2 h-2 rounded-full bg-slate-300 animate-pulse" style={{ animationDelay: '0.2s' }} />
                  <div className="w-2 h-2 rounded-full bg-slate-300 animate-pulse" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      <form onSubmit={handleSend} className="px-4 py-3 border-t border-sand-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2.5 bg-white border border-sand-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-terracotta-300"
            disabled={sendMessageMutation.isPending}
          />
          <button
            type="submit"
            disabled={!input.trim() || sendMessageMutation.isPending || !activeSessionId}
            className="w-10 h-10 flex items-center justify-center bg-gradient-to-r from-terracotta-500 to-clay-600 text-white rounded-xl shadow-terracotta hover:from-terracotta-600 hover:to-clay-700 disabled:opacity-50 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}