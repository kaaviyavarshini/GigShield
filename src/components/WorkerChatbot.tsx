import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, ChevronDown, Send, Shield, Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useWeather } from '@/hooks/useWeather';
import { useAQI } from '@/hooks/useAQI';
import { useChatbot, Message } from '@/hooks/useChatbot';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

// --- Types ---
interface Policy {
  id: string;
  worker_name: string;
  city: string;
  plan_type: string;
  status: string;
}

import { useForecast } from '@/hooks/useForecast';

export function WorkerChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [hasStarted, setHasStarted] = useState(false);
  const [hasNotifiedRisk, setHasNotifiedRisk] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Fetch any worker with an active policy
  const { data: worker, isLoading: isWorkerLoading } = useQuery({
    queryKey: ['worker-policy'],
    queryFn: async () => {
      const { data } = await supabase
        .from('workers')
        .select('*, policies!inner(*)')
        .eq('policies.status', 'active')
        .limit(1)
        .single();
      return data;
    },
  });

  const activePolicy = worker?.policies?.[0];
  const city = activePolicy?.city || 'Chennai';
  const policyId = activePolicy?.id || '';

  // 2. Weather & AQI hooks for welcome message
  const { data: weather } = useWeather(city);
  const { data: aqi } = useAQI(city);
  const { data: forecast } = useForecast(city);

  // 3. Chatbot hook
  const { messages, setMessages, isLoading, error, sendMessage } = useChatbot(city);

  // 4. Welcome Message Logic (Hardcoded as first message)
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeContent = activePolicy ? (
        `Hi ${worker?.name || 'Partner'} 👋 I'm EarnSure AI.

I can see your [${activePolicy.plan_type}] plan is active and covering you in [${activePolicy.city}] right now.

Current conditions: 🌧 ${weather?.rainfall || 0}mm rain · ${weather?.temperature || 0}°C · AQI ${aqi?.aqi || 0} — all below trigger thresholds.

What would you like to know?`
      ) : (
        `Hi there 👋 I'm EarnSure AI. 
I can answer questions about our parametric insurance for delivery workers.
What would you like to know?`
      );

      setMessages([{
        role: 'assistant',
        content: welcomeContent,
        timestamp: new Date()
      }]);
    }
  }, [activePolicy, weather, aqi, setMessages, messages.length, worker?.name]);

  // 5. Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // 6. Proactive Alerts - Case 1: Trigger fired
  useEffect(() => {
    if (!policyId) return;
    
    const channel = supabase
      .channel('payout_alert')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'trigger_events',
        filter: `policy_id=eq.${policyId}` 
      }, (payload) => {
        const newEvent = payload.new;
        const proactiveMsg: Message = {
          role: 'assistant',
          content: `⚡ Your cover just activated!
Heavy rain detected in ${city} — ${newEvent.measured_value}mm.
₹${newEvent.payout_amount} payout is being processed now.
Should arrive in your UPI in ~90 seconds.`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, proactiveMsg]);
        setUnreadCount(prev => prev + 1);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [policyId, city, setMessages]);

  // Case 2: High risk tomorrow (Forecast check)
  useEffect(() => {
    if (forecast && forecast.length > 0 && !hasNotifiedRisk) {
      const highRisk = forecast.some(f => f.rain > 12); // Threshold for 'high risk' in forecast
      if (highRisk) {
        const proactiveMsg: Message = {
          role: 'assistant',
          content: `🌧 Heads up — heavy rain forecast for ${city} tomorrow afternoon.
Your cover is active and watching.
No action needed from you.`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, proactiveMsg]);
        setUnreadCount(prev => prev + 1);
        setHasNotifiedRisk(true);
      }
    }
  }, [forecast, city, hasNotifiedRisk, setMessages]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    sendMessage(inputValue);
    setInputValue('');
    setHasStarted(true);
  };

  const handleChipClick = (msg: string) => {
    sendMessage(msg);
    setHasStarted(true);
  };

  const formatTimestamp = (date: Date) => {
    const diff = Date.now() - date.getTime();
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const chips = ["Am I covered now?", "My last payout", "This week's risk", "Change my UPI", "How does it work?"];

  return (
    <>
      {/* --- Floating Button --- */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.button
          onClick={() => { setIsOpen(!isOpen); setUnreadCount(0); }}
          whileHover="hover"
          initial="rest"
          animate="rest"
          className="relative flex items-center bg-[#0EA5E9] rounded-full shadow-lg overflow-hidden h-14 group"
        >
          <motion.div 
            variants={{
              rest: { width: 56 },
              hover: { width: 200 }
            }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex items-center"
          >
            <div className="w-14 h-14 shrink-0 flex items-center justify-center">
              <MessageCircle className="text-white w-7 h-7" />
            </div>
            <motion.span 
              variants={{
                rest: { opacity: 0, x: -10 },
                hover: { opacity: 1, x: 0 }
              }}
              className="text-white font-bold text-[14px] whitespace-nowrap pr-6"
            >
              Ask EarnSure AI
            </motion.span>
          </motion.div>
          
          {/* Pulsing Green Dot */}
          <div className="absolute top-1 right-2 w-3.5 h-3.5 bg-[#22C55E] rounded-full border-2 border-white flex items-center justify-center">
            <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
          </div>

          {/* Unread Badge */}
          {unreadCount > 0 && (
            <div className="absolute top-0 left-0 bg-red-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-white">
              {unreadCount}
            </div>
          )}
        </motion.button>
      </div>

      {/* --- Chat Panel --- */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={`fixed bottom-[88px] right-[24px] bg-white rounded-[16px] shadow-[0_8px_40px_rgba(0,0,0,0.16)] border border-[#E2E8F0] overflow-hidden flex flex-col z-50
              ${window.innerWidth < 640 ? 'left-[24px] right-[24px] h-[70vh]' : 'w-[380px] h-[560px]'}`}
          >
            {/* Header */}
            <div className="h-[56px] flex items-center justify-between px-4 border-b border-[#F1F5F9] bg-white">
              <div className="flex items-center gap-2">
                <Shield className="text-[#0EA5E9] w-5 h-5" />
                <div className="flex flex-col">
                  <span className="text-[14px] font-semibold text-[#0F172A] leading-tight">EarnSure AI</span>
                  <span className="text-[11px] text-[#94A3B8]">Powered by Claude</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setIsOpen(false)} className="p-1 px-2 hover:bg-[#F1F5F9] rounded-md text-[#94A3B8] transition-colors">
                  <ChevronDown size={20} />
                </button>
                <button onClick={() => setIsOpen(false)} className="p-1 px-2 hover:bg-[#F1F5F9] rounded-md text-[#94A3B8] transition-colors">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Chat Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 bg-[#F8FAFC] space-y-4"
            >
              {messages.map((msg, i) => (
                <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`px-[14px] py-[10px] text-[14px] leading-relaxed
                    ${msg.role === 'user' 
                      ? 'bg-[#0EA5E9] text-white rounded-[16px_16px_4px_16px] max-w-[75%]' 
                      : 'bg-white text-[#0F172A] border border-[#E2E8F0] rounded-[16px_16px_16px_4px] max-w-[85%] shadow-[0_1px_3px_rgba(0,0,0,0.06)]'
                    }`}
                  >
                    {msg.content.split('\n').map((line, j) => (
                      <React.Fragment key={j}>
                        {line}
                        <br />
                      </React.Fragment>
                    ))}
                  </div>
                  <span className="text-[10px] text-[#94A3B8] mt-1 px-1">
                    {formatTimestamp(msg.timestamp)}
                  </span>
                </div>
              ))}

              {isLoading && (
                <div className="flex flex-col items-start">
                  <div className="bg-white border border-[#E2E8F0] px-[14px] py-[10px] rounded-[16px_16px_16px_4px] flex items-center gap-1 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                    <span className="w-1.5 h-1.5 bg-[#0EA5E9] rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-[#0EA5E9] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-1.5 h-1.5 bg-[#0EA5E9] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-50 rounded-xl border border-red-100 flex flex-col items-center gap-2">
                  <p className="text-[12px] text-red-600 font-medium text-center">{error}</p>
                  <Button variant="outline" size="sm" onClick={() => sendMessage(messages[messages.length-1].content)} className="h-8 bg-white border-red-200 text-red-600 hover:bg-red-50">
                    Retry
                  </Button>
                </div>
              )}
            </div>

            {/* Quick Replies */}
            {!hasStarted && messages.length === 1 && (
              <div className="px-4 py-3 bg-[#F8FAFC] overflow-x-auto border-t border-[#F1F5F9]">
                <div className="flex gap-2 min-w-max">
                  {chips.map(chip => (
                    <button
                      key={chip}
                      onClick={() => handleChipClick(chip)}
                      className="px-3 py-2 bg-[#EFF8FF] text-[#0EA5E9] border border-[#BAE6FD] rounded-full text-[12px] font-semibold hover:bg-[#D1E9FF] transition-colors"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="bg-white border-t border-[#F1F5F9] p-4 flex flex-col">
              <form onSubmit={handleSend} className="flex gap-2 items-center h-[24px] mb-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask anything about your cover..."
                  className="flex-1 text-[14px] outline-none border-none placeholder:text-[#94A3B8] p-0"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className={`p-1 transition-colors ${!inputValue.trim() || isLoading ? 'text-[#CBD5E1]' : 'text-[#0EA5E9]'}`}
                >
                  <Send size={20} />
                </button>
              </form>
              <div className="pt-2 border-t border-[#F1F5F9] mt-1">
                <p className="text-[10px] text-[#94A3B8] text-center leading-tight">
                  EarnSure AI can make mistakes. <br /> Verify important coverage details.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
