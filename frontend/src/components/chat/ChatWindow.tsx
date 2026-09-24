import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/useAuth";
import { apiBaseUrl } from "../../api/client";
import { X, Send, Flag, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

export interface ChatMessage { id: string; sender_id?: string; sender_type?: string; content: string; sent_at: string; }

interface ChatWindowProps {
  matchId: string;
  contextTitle: string;
  contextSubtitle: string;
  onClose: () => void;
}

export function ChatWindow({ matchId, contextTitle, contextSubtitle, onClose }: ChatWindowProps) {
  const { accessToken, user, isDemo } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [isReporting, setIsReporting] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    if (isDemo) {
      setMessages([
        { id: "1", sender_id: "other", content: "Hi, I am on my way to the hospital.", sent_at: new Date(Date.now() - 60000).toISOString() },
        { id: "2", sender_id: user?.id, content: "Thank you so much! Ward 3.", sent_at: new Date().toISOString() }
      ]);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${apiBaseUrl}/chat/${matchId}/messages`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    if (!isDemo) {
      const interval = setInterval(fetchMessages, 3000); // HTTP Polling every 3s
      return () => clearInterval(interval);
    }
  }, [matchId, accessToken, isDemo, user?.id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  
  const handleReport = async () => {
    if (!reportReason.trim()) return;
    
    if (isDemo) {
      toast.success("Demo: Chat reported successfully");
      setIsReporting(false);
      setReportReason("");
      return;
    }

    try {
      const res = await fetch(`${apiBaseUrl}/chat/${matchId}/report`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}` 
        },
        body: JSON.stringify({ category: "Inappropriate", excerpt: reportReason })
      });
      if (res.ok) {
        toast.success("Chat reported to admins");
        setIsReporting(false);
        setReportReason("");
      } else {
        toast.error("Failed to report chat");
      }
    } catch (err) {
      toast.error("Network error");
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (isDemo) {
      setMessages([...messages, { id: Date.now().toString(), sender_id: user?.id, content: inputText, sent_at: new Date().toISOString() }]);
      setInputText("");
      return;
    }

    try {
      const res = await fetch(`${apiBaseUrl}/chat/${matchId}/messages`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}` 
        },
        body: JSON.stringify({ content: inputText })
      });
      if (res.ok) {
        setInputText("");
        fetchMessages();
      } else {
        toast.error("Failed to send message");
      }
    } catch (err) {
      toast.error("Network error");
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 max-w-[calc(100vw-2rem)] h-[500px] max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col z-50 overflow-hidden animate-in slide-in-from-bottom-5">
      {/* Contextual Header */}
      <div className="bg-slate-900 p-4 text-white flex justify-between items-start">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{contextSubtitle}</p>
          <h3 className="font-bold text-sm leading-snug">{contextTitle}</h3>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsReporting(true)} className="text-slate-400 hover:text-red-400 transition-colors p-1" title="Report Chat">
            <Flag size={16} />
          </button>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1">
            <X size={18} />
          </button>
        </div>
      </div>

      
      {/* Report Modal */}
      {isReporting && (
        <div className="absolute inset-0 bg-slate-900/90 z-10 flex flex-col items-center justify-center p-4">
          <div className="bg-white rounded-xl p-5 w-full max-w-sm shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-2 text-red-600 mb-3">
              <AlertTriangle size={20} />
              <h4 className="font-bold">Report this Chat</h4>
            </div>
            <p className="text-sm text-slate-600 mb-4">Please provide a reason for reporting this conversation. Admins will review the chat history.</p>
            <textarea 
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="E.g., inappropriate language, spam, or requesting money..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm min-h-[80px] mb-4 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/20"
            />
            <div className="flex gap-2">
              <button onClick={() => setIsReporting(false)} className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors text-sm">Cancel</button>
              <button onClick={handleReport} disabled={!reportReason.trim()} className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors text-sm disabled:opacity-50">Submit Report</button>
            </div>
          </div>
        </div>
      )}

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 bg-slate-50 flex flex-col gap-3">
        {loading ? (
          <p className="text-center text-sm text-slate-500 mt-4">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-sm text-slate-500 mt-4">No messages yet. Send a message to start coordinating.</p>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === user?.id;
            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${isMe ? "bg-primary text-white rounded-br-none" : "bg-white border border-slate-200 text-slate-800 rounded-bl-none"}`}>
                  {msg.content}
                </div>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex gap-2 items-center">
        <input 
          type="text" 
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-slate-100 border-transparent focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl px-4 py-2 outline-none text-sm transition-all"
        />
        <button type="submit" disabled={!inputText.trim()} className="p-2 bg-primary text-white rounded-xl hover:bg-primary-hover disabled:opacity-50 disabled:hover:bg-primary transition-colors">
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}

