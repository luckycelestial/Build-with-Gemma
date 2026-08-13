import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  Sparkles, 
  User, 
  Bot, 
  MessageSquare
} from 'lucide-react';
import { queryAIAnalyst } from '../api-client/api';
import type { DashboardData } from '../api-client/api';
import { WhatsAppContinuationBanner } from './chat/WhatsAppContinuationBanner';
import { ContinueOnWhatsAppButton } from './chat/ContinueOnWhatsAppButton';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

interface AIAnalystChatProps {
  isOpen: boolean;
  onClose: () => void;
  data: DashboardData;
}

export const AIAnalystChat: React.FC<AIAnalystChatProps> = ({ isOpen, onClose, data }) => {
  const topCustomerName = data?.customer_intelligence?.customers?.[0]?.name || "your key customers";
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `Hello! I am your AI Financial Copilot. I have analyzed your business records for ${data.summary.business_name}. 

You can ask me questions about:
- Payment delay details for ${topCustomerName} or other key clients
- Factors driving the baseline revenue forecast
- Market updates and their local business impact

How can I assist you today?`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    "Why did revenue decrease?",
    "Which customer has the highest payment risk?",
    "Explain the AI Scenario Forecast.",
    "What caused today's recommendation?",
    "Summarize my business health.",
    "Generate a board meeting summary."
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!isOpen) return null;

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;
    
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role === 'user' ? 'user' as const : 'model' as const,
        parts: m.text
      }));
      
      const aiResponse = await queryAIAnalyst(textToSend, history, data);
      
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: aiResponse
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error("AI analyst query failed:", error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "Sorry, I encountered an issue querying the model. Please check that the backend service is running."
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex justify-end">
      <div className="flex-1" onClick={onClose} />
      
      <div className="w-full max-w-lg bg-[var(--bg-card)] h-screen shadow-2xl flex flex-col justify-between border-l border-[var(--border-subtle)] animate-slide-in">
        {/* Header */}
        <div className="p-4 border-b border-[var(--border-subtle)] flex justify-between items-center bg-[var(--bg-card)] text-[var(--text-primary)]">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-[var(--primary)] rounded-2xl text-white flex items-center justify-center shadow-xs">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="font-black text-sm text-[var(--text-primary)] font-display leading-tight">Ask our AI Analyst</h3>
              <p className="text-[10px] text-[var(--text-muted)] font-bold font-sans">Contextual financial copilot for {data.summary.business_name}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-[var(--bg-subtle)] rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Omnichannel Continuation Banner */}
        <div className="px-4 pt-3">
          <WhatsAppContinuationBanner 
            lastWhatsAppMsg={messages[messages.length - 1]?.text}
          />
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-[var(--bg-app)]">
          {messages.map((m) => (
            <div 
              key={m.id} 
              className={`flex gap-3 max-w-[85%] ${
                m.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-xs ${
                m.role === 'user' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--bg-muted)] text-[var(--text-primary)] border border-[var(--border-subtle)]'
              }`}>
                {m.role === 'user' ? <User size={14} /> : <Bot size={14} />}
              </div>
              
              <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                m.role === 'user' 
                  ? 'bg-[var(--primary)] text-white rounded-tr-none shadow-xs font-medium' 
                  : 'bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-subtle)] shadow-xs rounded-tl-none whitespace-pre-wrap'
              }`}>
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3 max-w-[85%] self-start">
              <div className="w-8 h-8 rounded-full bg-[var(--bg-muted)] text-[var(--text-primary)] border border-[var(--border-subtle)] flex items-center justify-center flex-shrink-0">
                <Bot size={14} />
              </div>
              <div className="p-3 bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-subtle)] shadow-xs rounded-2xl rounded-tl-none flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-[var(--text-muted)] rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-[var(--text-muted)] rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 bg-[var(--text-muted)] rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input & Quick Prompts */}
        <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-card)] flex flex-col gap-3">
          {messages.length === 1 && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider font-display">Suggested Questions</span>
              <div className="flex flex-wrap gap-1.5">
                {quickPrompts.map((qp, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(qp)}
                    className="text-[10px] text-[var(--text-muted)] hover:text-[var(--primary)] bg-[var(--bg-subtle)] hover:bg-[var(--primary-subtle)] border border-[var(--border-subtle)] hover:border-[var(--primary)]/30 px-2.5 py-1.5 rounded-xl text-left transition-colors font-bold flex items-center gap-1 font-display cursor-pointer"
                  >
                    <MessageSquare size={10} />
                    <span>{qp}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Continue on WhatsApp Button */}
          <ContinueOnWhatsAppButton 
            lastMessage={messages[messages.length - 1]?.text}
          />

          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
              placeholder="Ask a question about your business data..."
              className="flex-1 bg-[var(--bg-subtle)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-full px-4 py-2.5 text-xs focus:ring-1 focus:ring-[var(--primary)] focus:border-[var(--primary)] outline-none"
            />
            <button
              onClick={() => handleSend(input)}
              disabled={loading || !input.trim()}
              className="p-3 bg-[var(--primary)] hover:bg-[var(--primary-dark)] disabled:opacity-50 text-white rounded-full transition-colors flex items-center justify-center cursor-pointer"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AIAnalystChat;
