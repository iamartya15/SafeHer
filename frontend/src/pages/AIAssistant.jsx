import { useState, useEffect, useRef } from 'react';
import * as chatService from '../services/chatService';
import { Bot, Send, Trash2, Sparkles, Loader2, MapPin } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';

export const AIAssistant = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingHistory, setFetchingHistory] = useState(true);
  const [confirmClear, setConfirmClear] = useState(false);
  const chatEndRef = useRef(null);

  // AI Location States
  const [isLocationEnabled, setIsLocationEnabled] = useState(() => {
    return localStorage.getItem('safeher-ai-location') === 'true';
  });
  const [locationContext, setLocationContext] = useState('');
  const [geoStatus, setGeoStatus] = useState('Idle'); // Idle, Fetching, Success, Error
  const [locationDetails, setLocationDetails] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const loadChatHistory = async () => {
      try {
        const res = await chatService.getChatHistory();
        if (res.success && isMounted) {
          setMessages(res.history);
        }
      } catch (err) {
        if (isMounted) {
          console.error(err);
          toast.error('Failed to load chat logs.');
        }
      } finally {
        if (isMounted) {
          setFetchingHistory(false);
        }
      }
    };

    loadChatHistory();

    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Fetch Location Context logic
  const fetchLocationData = async () => {
    setGeoStatus('Fetching');
    if (!navigator.geolocation) {
      setGeoStatus('Error');
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        try {
          // Reverse geocode via Nominatim
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          const city = data.address?.city || data.address?.town || data.address?.village || 'Unknown City';
          const state = data.address?.state || 'Unknown State';
          
          setLocationDetails({ latitude, longitude, accuracy, city, state, display: data.display_name });
          
          const contextStr = `[SYSTEM: USER LOCATION CONTEXT: Coordinates: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}. Accuracy: ${accuracy}m. Address: ${data.display_name}]`;
          setLocationContext(contextStr);
          setGeoStatus('Success');
          toast.success('Location context linked to AI!');
        } catch (error) {
          console.error('Reverse geocoding error:', error);
          const contextStr = `[SYSTEM: USER LOCATION CONTEXT: Coordinates: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}. Accuracy: ${accuracy}m.]`;
          setLocationContext(contextStr);
          setGeoStatus('Success');
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        setGeoStatus('Error');
        setIsLocationEnabled(false);
        localStorage.setItem('safeher-ai-location', 'false');
        if (error.code === 1) toast.error('Location permission denied.');
        else toast.error('Failed to get location. Ensure GPS is on.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleToggleLocation = () => {
    const newState = !isLocationEnabled;
    setIsLocationEnabled(newState);
    localStorage.setItem('safeher-ai-location', String(newState));

    if (newState) {
      fetchLocationData();
    } else {
      setLocationContext('');
      setLocationDetails(null);
      setGeoStatus('Idle');
      toast.success('AI Location awareness disabled.');
    }
  };

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputMessage.trim();
    if (!text) return;

    const tempUserMsg = { role: 'user', content: text, timestamp: new Date() };
    setMessages((prev) => [...prev, tempUserMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      // Pass locationContext to backend
      const res = await chatService.sendChatMessage(text, locationContext);
      if (res.success) {
        setMessages(res.history);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to communicate with AI model.');
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    const toastId = toast.loading('Clearing history...');
    try {
      const res = await chatService.clearChatHistory();
      if (res.success) {
        setMessages([]);
        setConfirmClear(false);
        toast.success('History cleared successfully.', { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to wipe logs.', { id: toastId });
    }
  };

  const templates = [
    { label: 'Nearest hospital', text: 'Where is the nearest hospital?' },
    { label: 'I feel unsafe', text: "I feel unsafe right now. What should I do?" },
    { label: 'Find safe places', text: "Can you suggest some safe places nearby?" }
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] space-y-4">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center shrink-0 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>AI Emergency Advisor</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 border border-purple-500/20 text-purple-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Gemini Active
            </span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">Get instant, actionable safety advice in safety distress scenarios.</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Location Toggle */}
          <button
            onClick={handleToggleLocation}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              isLocationEnabled 
                ? 'bg-purple-500/10 border-purple-500/30 text-purple-300 hover:bg-purple-500/20'
                : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:text-slate-300'
            }`}
          >
            {geoStatus === 'Fetching' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MapPin className="w-3.5 h-3.5" />}
            {isLocationEnabled ? 'Location Linked' : 'Enable AI Location'}
          </button>

          {messages.length > 0 && (
            confirmClear ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Clear all chats?</span>
                <button onClick={handleClearHistory} className="btn-danger py-1.5 px-3 text-xs">Yes</button>
                <button onClick={() => setConfirmClear(false)} className="btn-secondary py-1.5 px-3 text-xs">No</button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmClear(true)}
                className="btn-secondary py-1.5 px-3 flex items-center gap-1.5 text-xs text-red-400 border-red-500/10 hover:bg-red-500/5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Clear</span>
              </button>
            )
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 glass-card rounded-2xl border border-white/5 overflow-hidden flex flex-col relative bg-slate-900/30">
        
        {/* Status Banner if Location Enabled */}
        {isLocationEnabled && locationDetails && (
          <div className="bg-purple-900/20 border-b border-purple-500/20 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[11px] text-purple-300">
              <MapPin className="w-3 h-3" />
              <span className="truncate max-w-[200px] md:max-w-md">
                Aware of your location: {locationDetails.city}, {locationDetails.state}
              </span>
            </div>
            <button onClick={fetchLocationData} className="text-[10px] text-purple-400 hover:text-purple-300 underline">
              Refresh
            </button>
          </div>
        )}
        {isLocationEnabled && geoStatus === 'Error' && (
          <div className="bg-red-900/20 border-b border-red-500/20 px-4 py-2 flex items-center justify-between text-[11px] text-red-300">
            <span>Location access is disabled or unavailable. AI cannot use nearby context.</span>
            <button onClick={fetchLocationData} className="underline hover:text-red-200">Retry</button>
          </div>
        )}

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
                <h3 className="text-sm font-bold text-white">Location-Aware AI Companion</h3>
                <p className="text-xs text-slate-400 leading-relaxed mt-1">
                  Enable location for intelligent nearby safety recommendations, or ask general safety advice.
                </p>
              </div>
              
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
                  <div key={i} className={`flex gap-3 max-w-[85%] ${isModel ? '' : 'ml-auto flex-row-reverse'}`}>
                    <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-sm font-bold ${
                      isModel ? 'bg-purple-600/20 border border-purple-500/30 text-purple-400' : 'bg-slate-800 border border-slate-700 text-slate-200'
                    }`}>
                      {isModel ? <Bot className="w-4 h-4" /> : 'U'}
                    </div>
                    <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                      isModel 
                        ? 'bg-slate-900/80 border border-white/5 text-slate-200 rounded-tl-none font-light markdown-body prose prose-invert max-w-none' 
                        : 'bg-gradient-to-br from-purple-600 to-fuchsia-600 text-white rounded-tr-none font-medium'
                    }`}>
                      {isModel ? (
                         <ReactMarkdown>{msg.content}</ReactMarkdown>
                      ) : (
                         <p className="whitespace-pre-line">{msg.content}</p>
                      )}
                    </div>
                  </div>
                );
              })}
              {loading && (
                <div className="flex gap-3 max-w-[85%]">
                  <div className="w-8 h-8 rounded-full bg-purple-600/20 border border-purple-500/30 text-purple-400 flex items-center justify-center animate-pulse">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="p-4 rounded-2xl rounded-tl-none bg-slate-900/80 border border-white/5 flex items-center gap-1 text-[11px] text-slate-400">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-500 mr-1" />
                    <span>Analyzing situation...</span>
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
