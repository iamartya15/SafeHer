import { useState, useEffect, useRef } from 'react';
import * as chatService from '../services/chatService';
import { Bot, Send, Trash2, ShieldAlert, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const AIAssistant = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingHistory, setFetchingHistory] = useState(true);
  const chatEndRef = useRef(null);

  const loadChatHistory = async () => {
    try {
      const res = await chatService.getChatHistory();
      if (res.success) {
        setMessages(res.history);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load chat logs.');
    } finally {
      setFetchingHistory(false);
    }
  };

  useEffect(() => {
    loadChatHistory();
  }, []);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputMessage.trim();
    if (!text) return;

    // Optimistic UI updates
    const tempUserMsg = { role: 'user', content: text, timestamp: new Date() };
    setMessages((prev) => [...prev, tempUserMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const res = await chatService.sendChatMessage(text);
      if (res.success) {
        setMessages(res.history);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to communicate with AI model.');
      // Remove optimistic message on fail
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear your conversation history?')) return;
    const toastId = toast.loading('Clearing history...');
    try {
      const res = await chatService.clearChatHistory();
      if (res.success) {
        setMessages([]);
        toast.success('History cleared successfully.', { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to wipe logs.', { id: toastId });
    }
  };

  const templates = [
    { label: 'Someone is following me', text: 'I think someone is following me right now.' },
    { label: 'Walking alone in the dark', text: "I'm walking alone at night and feel insecure." },
    { label: 'Unsafe neighborhood guide', text: "I'm in an unsafe area. What safety guidelines should I follow?" }
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] space-y-4">
      
      {/* Header */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>AI Emergency Advisor</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 border border-purple-500/20 text-purple-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Gemini Active
            </span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">Get instant, actionable safety advice in safety distress scenarios.</p>
        </div>

        {messages.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="btn-secondary py-1.5 px-3 flex items-center gap-1.5 text-xs text-red-400 border-red-500/10 hover:bg-red-500/5 hover:border-red-500/20"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Chats</span>
          </button>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 glass-card rounded-2xl border border-white/5 overflow-hidden flex flex-col relative bg-slate-900/30">
        
        {/* Chat Logs */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4">
          {fetchingHistory ? (
            <div className="h-full flex items-center justify-center text-slate-500 text-xs">
              <Loader2 className="w-5 h-5 animate-spin mr-1.5" /> Synchronizing chats logs...
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto space-y-4">
              <div className="p-4 bg-purple-500/10 rounded-full border border-purple-500/20 text-purple-400 animate-pulse-slow">
                <Bot className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">SafeHer AI Emergency Companion</h3>
                <p className="text-xs text-slate-400 leading-relaxed mt-1">
                  Ask safety advice or select one of the emergency guidelines below to start.
                </p>
              </div>
              
              {/* Template Buttons */}
              <div className="flex flex-col gap-2 w-full pt-2">
                {templates.map((t, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(t.text)}
                    className="w-full text-left p-3 rounded-xl border border-white/5 bg-slate-950/40 hover:bg-slate-950/70 hover:border-purple-500/20 text-xs text-slate-300 transition-all font-medium leading-tight"
                  >
                    👉 {t.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => {
                const isModel = msg.role === 'model';
                return (
                  <div
                    key={i}
                    className={`flex gap-3 max-w-[85%] ${isModel ? '' : 'ml-auto flex-row-reverse'}`}
                  >
                    {/* Avatar icon */}
                    <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-sm font-bold ${
                      isModel ? 'bg-purple-600/20 border border-purple-500/30 text-purple-400' : 'bg-slate-800 border border-slate-700 text-slate-200'
                    }`}>
                      {isModel ? <Bot className="w-4 h-4" /> : 'U'}
                    </div>

                    {/* Chat Bubble */}
                    <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                      isModel 
                        ? 'bg-slate-900/80 border border-white/5 text-slate-200 rounded-tl-none font-light' 
                        : 'bg-gradient-to-br from-purple-600 to-fuchsia-600 text-white rounded-tr-none font-medium'
                    }`}>
                      {/* Render line breaks/markdown bullet structures */}
                      <p className="whitespace-pre-line">{msg.content}</p>
                    </div>
                  </div>
                );
              })}

              {/* Message Typing Indicator */}
              {loading && (
                <div className="flex gap-3 max-w-[85%]">
                  <div className="w-8 h-8 rounded-full bg-purple-600/20 border border-purple-500/30 text-purple-400 flex items-center justify-center animate-pulse">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="p-4 rounded-2xl rounded-tl-none bg-slate-900/80 border border-white/5 flex items-center gap-1 text-[11px] text-slate-400">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-500 mr-1" />
                    <span>Analyzing guidelines...</span>
                  </div>
                </div>
              )}
              
              <div ref={chatEndRef} />
            </>
          )}
        </div>

        {/* Input Form Bar */}
        <div className="p-4 border-t border-white/5 bg-slate-950/40 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Tell SafeHer AI what is happening..."
              disabled={loading || fetchingHistory}
              className="flex-1 glass-input text-xs py-3 pr-10 focus:ring-purple-500 focus:border-purple-500"
            />
            <button
              type="submit"
              disabled={loading || fetchingHistory || !inputMessage.trim()}
              className="btn-primary py-3 px-4 flex items-center justify-center shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
export default AIAssistant;
