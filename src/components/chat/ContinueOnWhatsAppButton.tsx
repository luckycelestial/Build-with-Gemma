"use client";

import React, { useState } from 'react';
import { LuMessageSquare, LuCheck, LuSparkles } from 'react-icons/lu';

export const ContinueOnWhatsAppButton: React.FC<{ lastMessage?: string }> = ({ lastMessage }) => {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleContinueOnWhatsApp = async () => {
    setLoading(true);
    try {
      const msg = `Hi Suresh. Continuing today's AI CTO discussion from the website. ${lastMessage ? `We were reviewing: "${lastMessage.slice(0, 60)}..."` : 'Would you like to continue our review?'}`;
      await fetch('/api/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, sender: 'AI CTO (Website Continuation)' })
      });
      setSent(true);
      setTimeout(() => setSent(false), 5000);
    } catch (e) {
      console.error("Failed to send WhatsApp continuation:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleContinueOnWhatsApp}
      disabled={loading || sent}
      className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
    >
      {loading ? (
        <LuSparkles size={14} className="animate-spin" />
      ) : sent ? (
        <>
          <LuCheck size={14} />
          <span>Sent to WhatsApp! Check your phone.</span>
        </>
      ) : (
        <>
          <LuMessageSquare size={14} />
          <span>Continue this discussion on WhatsApp</span>
        </>
      )}
    </button>
  );
};
