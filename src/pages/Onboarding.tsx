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
    <div className="flex flex-col h-screen bg-slate-50 md:max-w-md md:mx-auto md:border-x shadow-sm">
      <div className="bg-[#128C7E] text-white p-4 shadow-md flex items-center gap-3 space-y-0 relative z-10">
        <div className="bg-white/20 p-2 rounded-full">
          <Bot size={24} />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight">GigShield Assistant</h1>
          <p className="text-xs text-white/80">Online</p>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#E5DDD5]"
        style={{ backgroundImage: `url('https://transparenttextures.com/patterns/cubes.png')` }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl p-3 shadow-sm ${
                msg.sender === "user"
                  ? "bg-[#DCF8C6] text-slate-800 rounded-tr-none"
                  : "bg-white text-slate-800 rounded-tl-none"
              }`}
            >
              <p className="text-sm">{msg.text}</p>
            </div>
          </div>
        ))}
        {isSubmitting && (
          <div className="flex justify-start">
            <div className="bg-white max-w-[80%] rounded-2xl rounded-tl-none p-3 shadow-sm flex items-center gap-2 text-sm text-slate-500">
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></span>
            </div>
          </div>
        )}
      </div>

      <div className="bg-[#F0F0F0] p-3 border-t flex gap-2 w-full">
        <form onSubmit={handleSend} className="flex-1 flex gap-2">
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
            className="rounded-full bg-white border-none py-6 shadow-sm focus-visible:ring-[#128C7E]"
          />
          <Button 
            type="submit" 
            disabled={!inputValue.trim() || step === "done" || isSubmitting}
            className="rounded-full w-12 h-12 p-0 bg-[#128C7E] hover:bg-[#075E54] flex-shrink-0"
          >
            <Send size={20} className="ml-1" />
          </Button>
        </form>
      </div>
    </div>
  );
}
