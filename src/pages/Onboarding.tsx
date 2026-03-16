import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, User as UserIcon, Bot } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

type Message = {
  id: string;
  sender: "bot" | "user";
  text: string;
};

type FormStep = "name" | "platform" | "zone" | "earnings" | "done";

export default function Onboarding() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [step, setStep] = useState<FormStep>("name");
  const [formData, setFormData] = useState({
    name: "",
    platform: "",
    zone: "",
    earnings: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    addBotMessage("Hi! I'm GigShield's AI assistant. Let's get you protected. What is your full name?");
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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

    if (step === "name") {
      setFormData((prev) => ({ ...prev, name: currentInput }));
      setStep("platform");
      setTimeout(() => addBotMessage(`Nice to meet you, ${currentInput}. Which platform do you work for? (E.g., Zomato, Swiggy, or Both)`), 500);
    } else if (step === "platform") {
      setFormData((prev) => ({ ...prev, platform: currentInput }));
      setStep("zone");
      setTimeout(() => addBotMessage("Great. Which zone do you deliver in? (E.g., Koramangala, Bandra, Connaught Place)"), 500);
    } else if (step === "zone") {
      setFormData((prev) => ({ ...prev, zone: currentInput }));
      setStep("earnings");
      setTimeout(() => addBotMessage("Almost done! What are your average weekly earnings in ₹? (E.g., 5000)"), 500);
    } else if (step === "earnings") {
      const earningsValue = parseInt(currentInput.replace(/[^0-9]/g, ""), 10);
      if (isNaN(earningsValue)) {
        setTimeout(() => addBotMessage("Please enter a valid number for your weekly earnings."), 500);
        return;
      }
      setFormData((prev) => ({ ...prev, earnings: earningsValue.toString() }));
      setStep("done");
      setTimeout(() => addBotMessage("Perfect! I'm setting up your GigShield parametric policy now..."), 500);
      
      await submitData({
        ...formData,
        earnings: earningsValue.toString(),
      });
    }
  };

  const submitData = async (data: typeof formData) => {
    setIsSubmitting(true);
    try {
      const { data: newWorker, error } = await supabase
        .from("workers")
        .insert({
          name: data.name,
          platform: data.platform,
          zone: data.zone,
          avg_weekly_earnings: parseInt(data.earnings, 10),
          experience_weeks: 1, // Defaulting experience
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Automatically create an active policy for the user for the current week
      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);

      const { error: policyError } = await supabase.from("policies").insert({
        worker_id: newWorker.id,
        week_start: today.toISOString().split('T')[0],
        week_end: nextWeek.toISOString().split('T')[0],
        weekly_premium: (parseInt(data.earnings, 10) * 0.02).toFixed(2), // 2% premium
        coverage_amount: (parseInt(data.earnings, 10) * 0.5).toFixed(2), // 50% coverage
        status: "active"
      });

      if (policyError) {
        throw policyError;
      }

      toast({
        title: "Registration successful!",
        description: "Redirecting you to your dashboard...",
      });
      
      // Store worker ID to mimic session
      localStorage.setItem("gigshield_worker_id", newWorker.id);
      
      setTimeout(() => navigate("/worker"), 1500);
    } catch (error) {
      console.error("Error creating worker:", error);
      toast({
        title: "Error",
        description: "Could not set up your account. Please try again.",
        variant: "destructive",
      });
      addBotMessage("Sorry, there was an error saving your details. Let's try again. What is your full name?");
      setStep("name");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#F8FBFF] md:max-w-md md:mx-auto md:border-x border-[#BAE6FD] shadow-2xl relative overflow-hidden">
      {/* Premium Header */}
      <div className="bg-[#0EA5E9] text-white p-6 shadow-lg flex items-center gap-4 relative z-10 rounded-b-3xl">
        <div className="bg-white/20 p-2.5 rounded-2xl backdrop-blur-md border border-white/20">
          <Bot size={28} className="animate-bounce" />
        </div>
        <div>
          <h1 className="font-black text-[18px] tracking-tight leading-tight">GigShield Assistant</h1>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-pulse" />
            <p className="text-[10px] uppercase font-bold tracking-widest text-white/80">AI Guide Online</p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#F8FBFF]"
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
        {isSubmitting && (
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
      <div className="bg-white p-4 border-t border-[#BAE6FD] relative z-10 w-full rounded-t-3xl shadow-[0_-10px_20px_rgba(14,165,233,0.05)]">
        <form onSubmit={handleSend} className="flex gap-3 items-center">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={step === "done" || isSubmitting}
            placeholder={
              step === "name" ? "Type your name..." :
              step === "platform" ? "Zomato, Swiggy..." :
              step === "zone" ? "Type your zone..." :
              step === "earnings" ? "e.g. 5000" :
              "Processing..."
            }
            className="rounded-[20px] bg-[#F8FBFF] border-[#BAE6FD] h-14 px-6 shadow-inner focus-visible:ring-[#0EA5E9] text-[#0C1A2E] font-bold"
          />
          <Button 
            type="submit" 
            disabled={!inputValue.trim() || step === "done" || isSubmitting}
            className="rounded-[20px] w-14 h-14 p-0 bg-[#0EA5E9] hover:bg-[#0284C7] shadow-lg shadow-[#0EA5E9]/30 border-none transition-all active:scale-90"
          >
            <Send size={22} className="ml-1" />
          </Button>
        </form>
      </div>
    </div>
  );
}
