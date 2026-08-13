"use client";

import React, { useState } from 'react';
import { 
  LuMessageSquare, 
  LuX, 
  LuSend, 
  LuFileText, 
  LuSparkles,
  LuCheckCheck
} from 'react-icons/lu';
import { useExecutiveContext } from '@/context/ExecutiveContextProvider';

export const WhatsAppSimulatorModal: React.FC = () => {
  const { isWhatsAppModalOpen, setWhatsAppModalOpen } = useExecutiveContext();
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string; time: string }>>([
    {
      sender: 'bot',
      text: "Namaste Suresh! I am your AI CTO WhatsApp Assistant. Send me supplier invoices (text/PDF), ask balance queries (*\"How much do I owe Peenya Steel?\"*), or log price hikes (*\"Steel increased by 8%\"*).",
      time: "09:00 AM"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isWhatsAppModalOpen) return null;

  const handleSend = async (customText?: string, customSender?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim()) return;

    const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    const senderDisplayName = customSender || 'Factory Leadership';
    setMessages(prev => [...prev, { sender: 'user', text: `[${senderDisplayName}] ${textToSend}`, time: timeStr }]);
    if (!customText) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend, sender: senderDisplayName })
      });
      const data = await res.json();

      setMessages(prev => [
        ...prev, 
        { sender: 'bot', text: data.reply || "Message received and logged.", time: timeStr }
      ]);
    } catch {
      setMessages(prev => [
        ...prev, 
        { sender: 'bot', text: "⚠️ Error processing message. Check server connection.", time: timeStr }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[600px]">
        
        {/* WhatsApp Mobile Header */}
        <div className="p-4 bg-emerald-700 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600 rounded-full">
              <LuMessageSquare size={18} />
            </div>
            <div>
              <h4 className="font-bold text-sm leading-tight">AI CTO WhatsApp Business Input</h4>
              <p className="text-[10px] text-emerald-100 font-medium">Online • Powered by Groq API (llama-3.3-70b-versatile)</p>
            </div>
          </div>
          <button 
            onClick={() => setWhatsAppModalOpen(false)}
            className="p-1 hover:bg-emerald-600 rounded-full transition-colors cursor-pointer"
          >
            <LuX size={18} />
          </button>
        </div>

        {/* Quick Command Suggestions */}
        <div className="p-2.5 bg-[var(--bg-subtle)] border-b border-[var(--border-subtle)] flex items-center gap-2 overflow-x-auto scrollbar-none text-[10px]">
          <button 
            onClick={() => handleSend("Steel prices increased by 7%", "AI Advisory Agent")}
            className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-black shrink-0 cursor-pointer"
          >
            Advisory: Steel +7%
          </button>
          <button 
            onClick={() => handleSend("Port strike expected next week", "AI Advisory Agent")}
            className="px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-600 border border-purple-500/20 font-black shrink-0 cursor-pointer"
          >
            Advisory: Port Strike
          </button>
          <button 
            onClick={() => handleSend("Import duty increased to 12%", "AI Advisory Agent")}
            className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20 font-black shrink-0 cursor-pointer"
          >
            Advisory: Duty +12%
          </button>
          <button 
            onClick={() => handleSend("Here is today's supplier invoice from Peenya Steel for ₹45,000")}
            className="px-2.5 py-1 rounded-full bg-[var(--bg-card)] border border-[var(--border-subtle)] font-bold text-[var(--text-primary)] hover:border-[var(--primary)] shrink-0 cursor-pointer"
          >
            Send Invoice (₹45K)
          </button>
          <button 
            onClick={() => handleSend("How much do I owe Peenya Steel?")}
            className="px-2.5 py-1 rounded-full bg-[var(--bg-card)] border border-[var(--border-subtle)] font-bold text-[var(--text-primary)] hover:border-[var(--primary)] shrink-0 cursor-pointer"
          >
            Query Debt
          </button>
        </div>

        {/* Messages Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[var(--bg-app)]">
          {messages.map((m, idx) => (
            <div 
              key={idx} 
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div 
                className={`max-w-[82%] p-3 rounded-2xl text-xs space-y-1 ${
                  m.sender === 'user' 
                    ? 'bg-emerald-600 text-white rounded-br-none' 
                    : 'bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-bl-none shadow-2xs'
                }`}
              >
                <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>
                <div className={`flex items-center gap-1 text-[9px] ${m.sender === 'user' ? 'text-emerald-100 justify-end' : 'text-[var(--text-muted)]'}`}>
                  <span>{m.time}</span>
                  {m.sender === 'user' && <LuCheckCheck size={12} />}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] italic p-2">
              <LuSparkles className="animate-spin text-emerald-600" size={14} />
              <span>Gemma AI CTO processing input...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-[var(--bg-card)] border-t border-[var(--border-subtle)] flex items-center gap-2">
          <input 
            type="text" 
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Type WhatsApp command or invoice details..."
            className="flex-1 px-4 py-2 bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-full text-xs text-[var(--text-primary)] focus:outline-none focus:border-emerald-600"
          />
          <button 
            onClick={() => handleSend()}
            disabled={loading}
            className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full transition-colors cursor-pointer disabled:opacity-50"
          >
            <LuSend size={14} />
          </button>
        </div>

      </div>
    </div>
  );
};
