import React, { useState, useEffect, useRef } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot } from "lucide-react";

type Message = {
  id: string;
  sender: "bot" | "user";
  text: string;
};

export default function AdminChatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    addBotMessage("Hello! I'm the EarnSafe Admin Assistant. How can I help you today? You can ask me about active triggers, policy stats, or recent claims.");
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const addBotMessage = (text: string) => {
    setMessages((prev) => [...prev, { id: Date.now().toString(), sender: "bot", text }]);
  };

  const addUserMessage = (text: string) => {
    setMessages((prev) => [...prev, { id: Date.now().toString(), sender: "user", text }]);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const currentInput = inputValue.trim();
    addUserMessage(currentInput);
    setInputValue("");
    setIsTyping(true);

    // Mock chatbot logic for the admin dashboard
    setTimeout(() => {
      const lowerInput = currentInput.toLowerCase();
      let response = "I'm still learning about that. Try asking about 'active triggers', 'total claims', or 'platform stats'.";
      
      if (lowerInput.includes("trigger") || lowerInput.includes("weather")) {
        response = "Currently, we have active live tracking across 10 major gig hubs. Based on recent data, Chennai has recorded 6.2mm of rainfall, triggering a parametric event.";
      } else if (lowerInput.includes("claim") || lowerInput.includes("payout")) {
        response = "We have processed 42 claims this week, with a total payout of ₹8,408 to protected gig workers.";
      } else if (lowerInput.includes("policy") || lowerInput.includes("worker")) {
        response = "There are 1,842 gig workers currently protected by active policies across all zones.";
      }

      setIsTyping(false);
      addBotMessage(response);
    }, 1500);
  };

  return (
    <AdminLayout 
      title="EarnSafe Assistant" 
      subtitle="AI-Powered Platform Insights"
    >
      <div className="flex justify-center h-[calc(100vh-12rem)]">
        <div className="flex flex-col w-full max-w-2xl bg-[#F8FBFF] border border-[#BAE6FD] rounded-3xl shadow-xl relative overflow-hidden">
          
          {/* Header */}
          <div className="bg-[#0EA5E9] text-white p-6 flex items-center gap-4 relative z-10">
            <div className="bg-white/20 p-2.5 rounded-2xl backdrop-blur-md border border-white/20">
              <Bot size={28} className="animate-bounce" />
            </div>
            <div>
              <h1 className="font-black text-[18px] tracking-tight leading-tight">EarnSafe Assistant</h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-pulse" />
                <p className="text-[10px] uppercase font-bold tracking-widest text-white/80">AI Guide Online</p>
              </div>
            </div>
          </div>

          {/* Chat History */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 space-y-6"
            style={{ backgroundImage: `url('https://transparenttextures.com/patterns/cubes.png')`, backgroundBlendMode: 'soft-light' }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
              >
                <div
                  className={`max-w-[85%] rounded-[24px] p-4 shadow-md text-[14px] leading-relaxed font-semibold transition-all ${
                    msg.sender === "user"
                      ? "bg-[#0EA5E9] text-white rounded-tr-none shadow-[#0EA5E9]/20"
                      : "bg-white text-[#0C1A2E] rounded-tl-none border border-[#BAE6FD] shadow-sky-900/5"
                  }`}
                >
                  <p>{msg.text}</p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-[#BAE6FD] max-w-[80%] rounded-[24px] rounded-tl-none p-4 shadow-sm flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#0EA5E9]/40 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-[#0EA5E9]/40 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
                  <span className="w-2 h-2 bg-[#0EA5E9]/40 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></span>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="bg-white p-4 border-t border-[#BAE6FD] relative z-10 w-full shadow-[0_-10px_20px_rgba(14,165,233,0.05)]">
            <form onSubmit={handleSend} className="flex gap-3 items-center">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isTyping}
                placeholder={isTyping ? "Assistant is typing..." : "Ask me anything about the platform..."}
                className="rounded-[20px] bg-[#F8FBFF] border-[#BAE6FD] h-14 px-6 shadow-inner focus-visible:ring-[#0EA5E9] text-[#0C1A2E] font-bold"
              />
              <Button 
                type="submit" 
                disabled={!inputValue.trim() || isTyping}
                className="rounded-[20px] w-14 h-14 p-0 bg-[#0EA5E9] hover:bg-[#0284C7] shadow-lg shadow-[#0EA5E9]/30 border-none transition-all active:scale-90 flex-shrink-0"
              >
                <Send size={22} className="ml-1" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
