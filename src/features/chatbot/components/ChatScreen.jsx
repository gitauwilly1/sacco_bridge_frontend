import { useState, useRef, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  'view-loans': { label: 'View My Loans', to: '/loans' },
  'make-contribution': { label: 'Make Contribution', to: '/contributions' },
};

function TypingIndicator() {
  return (
    <div className="flex items-start gap-2 mb-4">
      <div className="h-8 w-8 rounded-full bg-sand-light flex items-center justify-center flex-shrink-0">
        <Bot className="h-4 w-4 text-terracotta" />
      </div>
      <div className="bg-sand-light rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex gap-1">
          <span className="h-2 w-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="h-2 w-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="h-2 w-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

export default function ChatScreen() {
  const queryClient = useQueryClient();
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [message, setMessage] = useState('');
  const [showSidebar, setShowSidebar] = useState(false);
  const [showContext, setShowContext] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

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
    if (action.to) {
      window.location.href = action.to;
    }
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Sidebar Overlay */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-white border-r transform transition-transform lg:relative lg:translate-x-0 ${
          showSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold text-slate text-sm">Chats</h2>
          <button onClick={() => setShowSidebar(false)} className="lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-2">
          <Button
            size="sm"
            className="w-full mb-3"
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
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-4">
              No chats yet
            </p>
          ) : (
            <div className="space-y-1">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-sm ${
                    activeSessionId === session.id
                      ? 'bg-terracotta/10 text-terracotta'
                      : 'hover:bg-gray-100 text-slate'
                  }`}
                  onClick={() => {
                    setActiveSessionId(session.id);
                    setShowSidebar(false);
                  }}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <MessageSquare className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">
                      {session.title || 'New Chat'}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSessionMutation.mutate(session.id);
                    }}
                    className="p-1 hover:bg-gray-200 rounded flex-shrink-0"
                  >
                    <Trash2 className="h-3 w-3 text-gray-400" />
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
        <div className="flex items-center gap-3 px-4 py-3 border-b bg-white">
          <button
            className="lg:hidden"
            onClick={() => setShowSidebar(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <div className="h-8 w-8 rounded-full bg-terracotta/10 flex items-center justify-center">
              <Bot className="h-4 w-4 text-terracotta" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-slate">
                Sacco Bridge Assistant
              </h1>
              <p className="text-xs text-gray-500">Online · Ask me anything</p>
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowContext(!showContext)}
          >
            {showContext ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Context Bar */}
        {showContext && (
          <div className="bg-sand-light px-4 py-2 flex items-center gap-2 text-xs">
            <span className="text-gray-500">Context:</span>
            <Badge className="bg-terracotta/10 text-terracotta" variant="outline">
              Active Chama: Upendo Group
            </Badge>
            <Badge className="bg-blue-500/10 text-blue-500" variant="outline">
              Role: Treasurer
            </Badge>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {!activeSessionId && !messagesLoading ? (
            /* Quick Topics */
            <div className="max-w-lg mx-auto pt-8">
              <div className="text-center mb-6">
                <div className="h-16 w-16 rounded-full bg-sand-light flex items-center justify-center mx-auto mb-3">
                  <Bot className="h-8 w-8 text-terracotta" />
                </div>
                <h2 className="text-lg font-bold text-slate mb-2">
                  What would you like help with?
                </h2>
                <p className="text-sm text-gray-500">
                  I can help you with chamas, loans, investments, and more.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {quickTopics.map((topic) => {
                  const TopicIcon = topic.icon;
                  return (
                    <button
                      key={topic.id}
                      onClick={() => handleQuickTopic(topic)}
                      className="flex items-center gap-3 p-3 rounded-lg border hover:border-terracotta/50 hover:bg-terracotta/5 transition-colors text-left"
                    >
                      <div className="h-8 w-8 rounded-lg bg-sand-light flex items-center justify-center flex-shrink-0">
                        <TopicIcon className="h-4 w-4 text-terracotta" />
                      </div>
                      <span className="text-sm text-slate">{topic.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : messagesLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-16 w-64 rounded-2xl" />
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-gray-500">Send a message to start</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isUser = msg.role === 'user' || msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2 mb-4 ${isUser ? 'justify-end' : ''}`}
                >
                  {!isUser && (
                    <div className="h-8 w-8 rounded-full bg-sand-light flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-terracotta" />
                    </div>
                  )}
                  <div className="max-w-[80%]">
                    <div
                      className={`rounded-2xl px-4 py-3 text-sm ${
                        isUser
                          ? 'bg-terracotta text-white rounded-tr-sm'
                          : 'bg-sand-light text-slate rounded-tl-sm'
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
                              className="px-3 py-1.5 bg-terracotta/10 text-terracotta text-xs rounded-full hover:bg-terracotta/20 transition-colors"
                            >
                              {chip.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                    <p className="text-xs text-gray-400 mt-1 px-1">
                      {formatTimeAgo(msg.created_at)}
                    </p>
                  </div>
                  {isUser && (
                    <div className="h-8 w-8 rounded-full bg-terracotta/10 flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-terracotta" />
                    </div>
                  )}
                </div>
              );
            })
          )}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t bg-white p-4">
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
              className="flex-1"
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={
                !message.trim() ||
                sendMessageMutation.isPending ||
                createSessionMutation.isPending
              }
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}