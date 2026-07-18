'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Cpu, Database, ArrowLeft } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface StepProps {
  businessName: string;
  category: 'Analog Invoicing' | 'Fragmented Document Shop' | 'High-Maintenance Excel' | 'Isolated Digital Shop' | 'Integrated System Shop';
  onComplete: (priorities: any) => void;
  onBack: () => void;
}

export default function CalibrationChatStep({ businessName, category, onComplete, onBack }: StepProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat window
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Initial greeting from Gemma on mount based on category
  useEffect(() => {
    const fetchGreeting = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/gemma', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            messages: [],
            category 
          }),
        });
        const data = await response.json();
        if (data.text) {
          setMessages([{ role: 'assistant', content: data.text }]);
        }
      } catch (err) {
        // Fallback initial messages if Next.js API fails
        let fallbackGreeting = '';
        if (category === 'Analog Invoicing') {
          fallbackGreeting = `Namaste Suresh! I see you use paper invoices. I have configured your WhatsApp agent to parse photo/PDF uploads. Let's practice. What is the main material you want to try scanning first?`;
        } else if (category === 'Fragmented Document Shop') {
          fallbackGreeting = `Namaste Suresh! Since you have loose PDFs emailed to clients, we can map client name, item columns, and tax rates. What is the most common format your PDF invoices use?`;
        } else if (category === 'High-Maintenance Excel') {
          fallbackGreeting = `Namaste Suresh! Since all your jobs are mixed in a single Excel sheet, we need to map your column names. What column name represents the billing amount?`;
        } else if (category === 'Isolated Digital Shop') {
          fallbackGreeting = `Namaste Suresh! Since your Excel sheets are stored offline per client, how many months of historical invoices would you like to upload to establish baseline margins?`;
        } else {
          fallbackGreeting = `Namaste Suresh! Since you run Tally/Zoho, we can configure an API sync or XML ledger dump. Which accounting system is your primary source?`;
        }
        setMessages([{ role: 'assistant', content: fallbackGreeting }]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGreeting();
  }, [category]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;
    
    const newMessages = [...messages, { role: 'user', content: textToSend } as ChatMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemma', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: newMessages,
          category 
        }),
      });
      const data = await response.json();
      if (data.text) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.text }]);
        
        // Advance to success page after 3 steps or final confirmation
        if (data.text.includes('calibration complete') || data.text.includes('complete') || newMessages.length >= 6) {
          setTimeout(() => {
            onComplete({
              pricing: 'High Priority',
              cashflow: 'Critical Priority',
              supplierRisk: 'Medium Priority'
            });
          }, 3500);
        }
      }
    } catch (err) {
      // Fallback dialog mapping matching each Category if network goes offline
      let reply = "";
      if (category === 'Analog Invoicing') {
        if (newMessages.length === 2) {
          reply = `Got it. Once uploaded, I'll extract item lists and calculate margins. How do you want to keep track of payment deadlines for these bills?`;
        } else if (newMessages.length === 4) {
          reply = `Understood. I will configure automated due-date reminders. Let's enter the dashboard to view your new invoice upload area.`;
        } else {
          reply = `Calibration complete! Let's enter the dashboard!`;
          setTimeout(() => {
            onComplete({ pricing: 'Standard', cashflow: 'High', supplierRisk: 'Low' });
          }, 2500);
        }
      } else if (category === 'Fragmented Document Shop') {
        if (newMessages.length === 2) {
          reply = `Understood. I will automatically extract Client Name and CGST/SGST taxes. Do you also want me to track individual item details?`;
        } else if (newMessages.length === 4) {
          reply = `Excellent. Field mapping parameters are configured. Let's proceed to the dashboard to test uploading your first PDF document.`;
        } else {
          reply = `Calibration complete! Let's enter the dashboard!`;
          setTimeout(() => {
            onComplete({ pricing: 'High', cashflow: 'Standard', supplierRisk: 'Low' });
          }, 2500);
        }
      } else if (category === 'High-Maintenance Excel') {
        if (newMessages.length === 2) {
          reply = `Got it. And what column represents the supplier name or client name?`;
        } else if (newMessages.length === 4) {
          reply = `Thank you. The CSV column mapping template is ready. Let's go to the dashboard where you can upload this template and view your clean columns.`;
        } else {
          reply = `Calibration complete! Let's enter the dashboard!`;
          setTimeout(() => {
            onComplete({ pricing: 'High', cashflow: 'High', supplierRisk: 'Standard' });
          }, 2500);
        }
      } else if (category === 'Isolated Digital Shop') {
        if (newMessages.length === 2) {
          reply = `Got it. Uploading historical logs will help Gemma calculate your raw margin patterns. Which supplier do you buy from most frequently?`;
        } else if (newMessages.length === 4) {
          reply = `Understood! Margin calibration complete. Let's proceed to the dashboard to import your history.`;
        } else {
          reply = `Calibration complete! Let's enter the dashboard!`;
          setTimeout(() => {
            onComplete({ pricing: 'High', cashflow: 'Critical', supplierRisk: 'Medium' });
          }, 2500);
        }
      } else { // Integrated System Shop
        if (newMessages.length === 2) {
          reply = `Excellent choice. Do you prefer a direct ledger dump upload or setting up API connection credentials?`;
        } else if (newMessages.length === 4) {
          reply = `Understood. Tally/Zoho integration is calibrated. Let's proceed to the dashboard to import the ledger files.`;
        } else {
          reply = `Calibration complete! Let's enter the dashboard!`;
          setTimeout(() => {
            onComplete({ pricing: 'Critical', cashflow: 'Critical', supplierRisk: 'High' });
          }, 2500);
        }
      }
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to extract tool logs and actual text (if any exist)
  const parseMessage = (content: string) => {
    const lines = content.split('\n');
    const logs: string[] = [];
    const textLines: string[] = [];
    
    lines.forEach(line => {
      if (line.trim().startsWith('[') && line.trim().endsWith(']')) {
        logs.push(line.trim());
      } else if (line.trim()) {
        textLines.push(line);
      }
    });
    
    return { logs, text: textLines.join('\n\n') };
  };

  // Quick replies list based on conversational step and category
  const getQuickReplies = () => {
    const userMsgCount = messages.filter(m => m.role === 'user').length;
    
    if (category === 'Analog Invoicing') {
      if (userMsgCount === 0) {
        return ["Standard CNC Steel Sheets", "Carbide Tool Bits", "General supplies"];
      } else if (userMsgCount === 1) {
        return ["I write due dates on the paper copy.", "I wait for the supplier to call me.", "I pay them immediately in cash."];
      }
    } else if (category === 'Fragmented Document Shop') {
      if (userMsgCount === 0) {
        return ["Word-generated PDF files", "Emailed scanned bills", "Standard invoice templates"];
      } else if (userMsgCount === 1) {
        return ["Yes, track each item.", "No, just the total amount.", "Only if it is a major steel purchase."];
      }
    } else if (category === 'High-Maintenance Excel') {
      if (userMsgCount === 0) {
        return ["Amount", "Total INR", "Grand Total"];
      } else if (userMsgCount === 1) {
        return ["Supplier Name", "Party Details", "Client"];
      }
    } else if (category === 'Isolated Digital Shop') {
      if (userMsgCount === 0) {
        return ["Last 3 months of logs", "Last 6 months of logs", "Just start fresh from today"];
      } else if (userMsgCount === 1) {
        return ["Peenya Steel Stockyard", "Vikas Pressing Unit", "Raghav Industrial Traders"];
      }
    } else { // Integrated System Shop
      if (userMsgCount === 0) {
        return ["Tally Prime ERP", "Zoho Books", "QuickBooks Online"];
      } else if (userMsgCount === 1) {
        return ["Upload exported XML/JSON dumps.", "Set up secure API access keys.", "Help me export from Tally first."];
      }
    }
    return [];
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-surface border border-border-subtle rounded-card shadow-soft overflow-hidden flex flex-col h-[600px] transition-all duration-300">
      {/* Header bar */}
      <div className="px-6 py-4 bg-surface border-b border-border-subtle flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="mr-1 p-1.5 rounded-lg border border-border-subtle hover:bg-zinc-50 text-text-muted hover:text-foreground transition-all cursor-pointer"
            title="Go back to profile onboarding selection"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Cpu className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-display font-medium text-foreground leading-none">Gemma Engine</h3>
            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              Orchestrator Calibrating: {businessName}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs bg-background border border-border-subtle rounded-lg px-2.5 py-1 text-text-muted">
          <Database className="h-3.5 w-3.5" />
          <span>Local Engine (11434)</span>
        </div>
      </div>

      {/* Messages viewport */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-zinc-50/50">
        {messages.map((msg, idx) => {
          const isAssistant = msg.role === 'assistant';
          const { logs, text } = isAssistant ? parseMessage(msg.content) : { logs: [], text: msg.content };

          return (
            <div key={idx} className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'} space-y-2`}>
              {/* Message text bubble */}
              <div
                className={`max-w-md px-5 py-3 rounded-2xl text-sm font-sans leading-relaxed shadow-sm ${
                  isAssistant
                    ? 'bg-surface border border-border-subtle text-foreground rounded-tl-sm'
                    : 'bg-primary text-surface rounded-tr-sm font-medium'
                }`}
              >
                {text}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex flex-col items-start space-y-2">
            <div className="bg-surface border border-border-subtle text-text-muted px-4 py-2.5 rounded-2xl rounded-tl-sm text-xs italic flex items-center gap-1">
              Gemma is formulating reasoning...
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Control panel & Quick Replies */}
      <div className="p-4 bg-surface border-t border-border-subtle space-y-4">
        {/* Quick replies section */}
        {!isLoading && getQuickReplies().length > 0 && (
          <div className="flex flex-wrap gap-2">
            {getQuickReplies().map((reply, rIdx) => (
              <button
                key={rIdx}
                onClick={() => handleSendMessage(reply)}
                className="text-xs text-foreground bg-background hover:bg-primary/5 hover:border-primary border border-border-subtle rounded-full px-4 py-2 transition-all duration-200 text-left shadow-sm cursor-pointer"
              >
                {reply}
              </button>
            ))}
          </div>
        )}

        {/* Input box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(input);
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            className="flex-1 bg-background border border-border-subtle rounded-full px-5 py-3 text-sm focus:outline-none focus:border-primary"
            placeholder="Type your response in plain words..."
            value={input}
            disabled={isLoading || messages.filter(m => m.role === 'assistant' && (m.content.includes('calibrated your') || m.content.includes('complete'))).length > 0}
            onChange={(e) => setInput(e.target.value)}
          />
        </form>
      </div>
    </div>
  );
}
