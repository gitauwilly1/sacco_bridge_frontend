import { useState, useRef, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
  Send, Plus, MessageSquare, Menu, X, Bot,
  User, ChevronDown, ChevronUp, Trash2,
  Building2, HandCoins, TrendingUp, ArrowRightLeft,
  BarChart3, HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { chatbotApi } from '../api/chatbotApi';
import { dashboardApi } from '../../dashboard/api/dashboardApi';
import { formatTimeAgo } from '../../../utils/format';

const quickTopics = [
  { id: 'create-chama', label: 'How do I create a chama?', icon: Building2 },
  { id: 'apply-loan', label: 'How do I apply for a loan?', icon: HandCoins },
  { id: 'sell-shares', label: 'How do I sell SACCO shares?', icon: TrendingUp },
  { id: 'settlement', label: 'Explain settlement process', icon: ArrowRightLeft },
  { id: 'contributions', label: 'Check my contribution status', icon: BarChart3 },
  { id: 'other', label: 'Something else', icon: HelpCircle },
];

const actionChips = {
  'create-chama': { label: 'Create a Chama', to: '/chamas/new' },
  'browse-saccos': { label: 'Browse SACCOs', to: '/investments' },
  'view-loans': { label: 'View My Chamas', to: '/chamas' },
  'make-contribution': { label: 'Make Contribution', to: '/chamas' },
};

function TypingIndicator() {
  return (
    <div className="flex items-start gap-2 mb-4">
      <div className="h-8 w-8 rounded-full bg-sand-light border border-sand/30 flex items-center justify-center flex-shrink-0 shadow-subtle">
        <Bot className="h-4 w-4 text-terracotta" />
      </div>
      <div className="bg-sand-light rounded-2xl rounded-tl-sm px-4 py-3 border border-sand/35">
        <div className="flex gap-1.5 items-center h-2">
          <span className="h-1.5 w-1.5 bg-clay/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="h-1.5 w-1.5 bg-clay/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="h-1.5 w-1.5 bg-clay/80 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

export default function ChatScreen() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [message, setMessage] = useState('');
  const [showSidebar, setShowSidebar] = useState(false);
  const [showContext, setShowContext] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Live chama context for the context bar
  const { data: chamasData } = useQuery({
    queryKey: ['chatbot-chama-context'],
    queryFn: () => dashboardApi.getMyChamas().then((r) => {
      const list = r.data;
      return Array.isArray(list) ? list : (list?.data || []);
    }),
  });

  const { data: sessionsData, isLoading: sessionsLoading } = useQuery({
    queryKey: ['chatbot-sessions'],
    queryFn: () =>
      chatbotApi.getSessions({ page_size: 50 }).then((r) => r.data),
  });

  const sessions = sessionsData?.results || sessionsData?.data || [];

  const { data: messagesData, isLoading: messagesLoading } = useQuery({
    queryKey: ['chatbot-messages', activeSessionId],
    queryFn: () =>
      chatbotApi
        .getMessages(activeSessionId, { page_size: 100 })
        .then((r) => r.data),
    enabled: !!activeSessionId,
  });

  const messages = messagesData?.results || messagesData?.data || [];

  const createSessionMutation = useMutation({
    mutationFn: (data) => chatbotApi.createSession(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['chatbot-sessions'] });
      const newSession = response.data.data || response.data;
      setActiveSessionId(newSession.id);
      setShowSidebar(false);
    },
    onError: () => toast.error('Failed to create chat'),
  });

  const sendMessageMutation = useMutation({
    mutationFn: (data) => chatbotApi.sendMessage(activeSessionId, data),
    onMutate: () => setIsTyping(true),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['chatbot-messages', activeSessionId],
      });
      setMessage('');
    },
    onError: () => toast.error('Failed to send message'),
    onSettled: () => {
      setIsTyping(false);
      inputRef.current?.focus();
    },
  });

  const deleteSessionMutation = useMutation({
    mutationFn: (sessionId) => chatbotApi.deleteSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatbot-sessions'] });
      if (activeSessionId === sessions[0]?.id) {
        setActiveSessionId(null);
      }
      toast.success('Chat deleted');
    },
    onError: () => toast.error('Failed to delete chat'),
  });

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  const handleSend = () => {
    if (!message.trim()) return;

    if (!activeSessionId) {
      createSessionMutation.mutate({
        title: message.slice(0, 50),
        initial_message: message,
      });
    } else {
      sendMessageMutation.mutate({ message: message.trim() });
    }
  };

  const handleQuickTopic = (topic) => {
    setMessage(topic.label);
    if (!activeSessionId) {
      createSessionMutation.mutate({
        title: topic.label.slice(0, 50),
        initial_message: topic.label,
      });
    } else {
      sendMessageMutation.mutate({ message: topic.label });
    }
  };

  const handleActionChip = (action) => {
    const chip = actionChips[action];
    const path = chip?.to || (typeof action === 'object' ? action.to : null);
    if (path) {
      navigate({ to: path });
    }
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] bg-surface">
      {/* Sidebar Overlay */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden backdrop-blur-xs"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-sand transform transition-transform lg:relative lg:translate-x-0 ${
          showSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-sand/40">
          <h2 className="font-bold text-slate text-xs uppercase tracking-wider">Chats</h2>
          <button onClick={() => setShowSidebar(false)} className="lg:hidden p-1 hover:bg-sand-light rounded-lg transition-colors cursor-pointer">
            <X className="h-4.5 w-4.5 text-slate" />
          </button>
        </div>
        <div className="p-3">
          <Button
            size="sm"
            className="w-full mb-3 bg-terracotta hover:bg-terracotta-dark text-white border-0 shadow-subtle cursor-pointer h-9 rounded-xl text-xs font-semibold"
            onClick={() => {
              setActiveSessionId(null);
              setShowSidebar(false);
            }}
          >
            <Plus className="h-4 w-4 mr-1" /> New Chat
          </Button>
          {sessionsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton-shimmer h-10 w-full rounded-lg" />
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <p className="text-xs text-gray-400 font-medium text-center py-6">
              No chats yet
            </p>
          ) : (
            <div className="space-y-1 overflow-y-auto max-h-[calc(100vh-10rem)] scrollbar-none">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-xs font-bold transition-all ${
                    activeSessionId === session.id
                      ? 'bg-sand-light text-terracotta border-l-2 border-terracotta shadow-none'
                      : 'hover:bg-sand-light/50 text-slate'
                  }`}
                  onClick={() => {
                    setActiveSessionId(session.id);
                    setShowSidebar(false);
                  }}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <MessageSquare className="h-4 w-4 flex-shrink-0 text-slate/60" />
                    <span className="truncate">
                      {session.title || 'New Chat'}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSessionMutation.mutate(session.id);
                    }}
                    className="p-1 hover:bg-danger/10 hover:text-danger rounded-lg transition-colors cursor-pointer flex-shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-gray-400 hover:text-danger" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-sand/40 bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <button
            className="lg:hidden p-1 hover:bg-sand-light rounded-lg cursor-pointer transition-colors"
            onClick={() => setShowSidebar(true)}
          >
            <Menu className="h-5 w-5 text-slate" />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <div className="h-8 w-8 rounded-full bg-terracotta/10 flex items-center justify-center border border-terracotta/20 shadow-none">
              <Bot className="h-4.5 w-4.5 text-terracotta" />
            </div>
            <div>
              <h1 className="text-xs font-bold text-slate">
                Sacco Bridge Assistant
              </h1>
              <p className="text-[10px] text-gray-400 font-medium mt-0.5">Online · Ask me anything</p>
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowContext(!showContext)}
            className="h-8 w-8 p-0 cursor-pointer rounded-lg text-slate"
          >
            {showContext ? (
              <ChevronUp className="h-4.5 w-4.5" />
            ) : (
              <ChevronDown className="h-4.5 w-4.5" />
            )}
          </Button>
        </div>

        {/* Context Bar */}
        {showContext && (
          <div className="bg-sand-light/60 border-b border-sand/35 px-4 py-2 flex items-center gap-2 text-xs flex-wrap">
            <span className="text-gray-400 font-medium">Context:</span>
            {chamasData && chamasData.length > 0 ? (
              chamasData.slice(0, 2).map((chama) => (
                <Badge
                  key={chama.id}
                  className="bg-terracotta/10 text-terracotta border border-terracotta/20 rounded-full font-bold shadow-none text-[10px]"
                  variant="outline"
                >
                  {chama.name} · {chama.role || 'Member'}
                </Badge>
              ))
            ) : (
              <Badge
                className="bg-sand text-slate border border-sand-dark/20 rounded-full font-bold shadow-none text-[10px]"
                variant="outline"
              >
                No active chamas
              </Badge>
            )}
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {!activeSessionId && !messagesLoading ? (
            /* Quick Topics */
            <div className="max-w-lg mx-auto pt-6 px-2">
              <div className="text-center mb-6">
                <div className="h-14 w-14 rounded-2xl bg-sand-light border border-sand/40 flex items-center justify-center mx-auto mb-3 shadow-subtle animate-bounce duration-1000">
                  <Bot className="h-7 w-7 text-terracotta" />
                </div>
                <h2 className="text-base font-bold text-slate mb-1">
                  What would you like help with?
                </h2>
                <p className="text-xs text-gray-400 font-medium">
                  I can help you with chamas, loans, investments, and platform settlements.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-2.5">
                {quickTopics.map((topic) => {
                  const TopicIcon = topic.icon;
                  return (
                    <button
                      key={topic.id}
                      onClick={() => handleQuickTopic(topic)}
                      className="flex items-center gap-3.5 p-3.5 rounded-xl border border-sand/45 bg-white card-lift hover:border-terracotta/40 hover:bg-sand-light/10 transition-all text-left cursor-pointer shadow-subtle"
                    >
                      <div className="h-9 w-9 rounded-xl bg-sand-light border border-sand/30 flex items-center justify-center flex-shrink-0 shadow-subtle">
                        <TopicIcon className="h-4.5 w-4.5 text-terracotta/80" />
                      </div>
                      <span className="text-xs font-bold text-slate leading-relaxed">{topic.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : messagesLoading ? (
            <div className="space-y-4 p-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="skeleton-shimmer h-8 w-8 rounded-full flex-shrink-0" />
                  <div className="skeleton-shimmer h-14 w-60 rounded-2xl" />
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-xs text-gray-400 font-medium">Send a message to start</p>
            </div>
          ) : (
            <div role="log" aria-live="polite" aria-label="Chat messages">
              {messages.map((msg) => {
              const isUser = msg.role === 'user' || msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 mb-4 ${isUser ? 'justify-end' : ''}`}
                >
                  {!isUser && (
                    <div className="h-8 w-8 rounded-full bg-sand-light border border-sand/30 flex items-center justify-center flex-shrink-0 shadow-subtle">
                      <Bot className="h-4 w-4 text-terracotta" />
                    </div>
                  )}
                  <div className="max-w-[80%] min-w-0">
                    <div
                      className={`rounded-2xl px-3.5 py-2.5 text-xs font-medium leading-relaxed ${
                        isUser
                          ? 'bg-terracotta text-white rounded-tr-sm shadow-subtle'
                          : 'bg-sand-light text-slate rounded-tl-sm border border-sand/35'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">
                        {msg.message || msg.content}
                      </p>
                    </div>
                    {msg.actions?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {msg.actions.map((action, index) => {
                          const chip = actionChips[action] || {
                            label: action.label || action,
                          };
                          return (
                            <button
                              key={index}
                              onClick={() => handleActionChip(action)}
                              className="px-3.5 py-1.5 bg-terracotta/10 text-terracotta text-xs font-bold rounded-full hover:bg-terracotta/20 border border-terracotta/20 cursor-pointer transition-all shadow-none"
                            >
                              {chip.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                    <p className="text-[10px] text-gray-400/90 mt-1 px-1 font-medium font-numbers">
                      {formatTimeAgo(msg.created_at)}
                    </p>
                  </div>
                  {isUser && (
                    <div className="h-8 w-8 rounded-full bg-terracotta/10 border border-terracotta/20 flex items-center justify-center flex-shrink-0 shadow-subtle">
                      <User className="h-4 w-4 text-terracotta" />
                    </div>
                  )}
                </div>
              );
            })}
            </div>
          )}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-sand/40 bg-white p-4">
          <div className="flex items-center gap-2 max-w-2xl mx-auto">
            <Input
              ref={inputRef}
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={
                sendMessageMutation.isPending ||
                createSessionMutation.isPending
              }
              className="flex-1 border-input rounded-xl bg-white text-sm focus:border-terracotta focus:ring-1 focus:ring-terracotta h-10"
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={
                !message.trim() ||
                sendMessageMutation.isPending ||
                createSessionMutation.isPending
              }
              className="bg-terracotta hover:bg-terracotta-dark text-white rounded-xl shadow-subtle cursor-pointer h-10 w-10 flex-shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}