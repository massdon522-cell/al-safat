import React, { useState } from "react";
import { MessageCircle, X, Send, Bot, Info, Mail, User, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { cn } from "@/lib/utils";

const ChatbotAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({ name: "", email: "", message: "" });
    }, 1500);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button 
            className="w-14 h-14 rounded-full bg-amber-500 hover:bg-amber-600 shadow-2xl shadow-amber-500/20 group relative overflow-hidden transition-all hover:scale-105"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <MessageCircle className="h-6 w-6 text-black" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="bg-zinc-950 border-white/10 text-white w-full sm:max-w-md p-0 overflow-hidden flex flex-col">
          <SheetHeader className="p-8 bg-gradient-to-br from-zinc-900 via-zinc-900 to-amber-900/10 border-b border-white/5">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-12 w-12 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20 ring-4 ring-amber-500/10">
                <Bot className="h-7 w-7 text-black" />
              </div>
              <div>
                <SheetTitle className="text-xl font-bold text-white italic uppercase tracking-tighter">
                  Safat Assistant
                </SheetTitle>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">System Online</span>
                </div>
              </div>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8">
            {/* Intro Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-amber-500">
                <Info className="h-4 w-4" />
                <h3 className="text-xs font-black uppercase tracking-widest">About Al Safat</h3>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed italic border-l-2 border-amber-500/30 pl-4 py-1">
                Welcome to Al Safat Platform, your premier destination for strategic global investments. 
                We provide scaling solutions in innovative styles across vast sectors, ensuring 
                sustainable growth for our strategic partners.
              </p>
            </div>

            {/* Feedback Form */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-amber-500">
                <Mail className="h-4 w-4" />
                <h3 className="text-xs font-black uppercase tracking-widest">Drop a Message</h3>
              </div>

              {isSubmitted ? (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-8 text-center space-y-4 animate-in zoom-in-95 duration-500">
                  <div className="h-16 w-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-lg font-bold text-white">Transmission Successful</h4>
                    <p className="text-xs text-zinc-400">
                      Thank you for your feedback! Our system will process your inquiry and we will get back to you shortly.
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="border-zinc-800 text-zinc-400 hover:text-white"
                    onClick={() => setIsSubmitted(false)}
                  >
                    Send another message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bot-name" className="text-[10px] uppercase font-black tracking-widest text-zinc-500 ml-1">Your Identity</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
                      <Input 
                        id="bot-name"
                        placeholder="Name (Optional)" 
                        className="bg-zinc-900/50 border-white/5 focus:border-amber-500/30 pl-10 h-11"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bot-email" className="text-[10px] uppercase font-black tracking-widest text-zinc-500 ml-1">Contact Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
                      <Input 
                        id="bot-email"
                        type="email" 
                        required 
                        placeholder="your@email.com" 
                        className="bg-zinc-900/50 border-white/5 focus:border-amber-500/30 pl-10 h-11"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bot-msg" className="text-[10px] uppercase font-black tracking-widest text-zinc-500 ml-1">Brief Proposal / Inquiry</Label>
                    <Textarea 
                      id="bot-msg"
                      required 
                      placeholder="How can we assist your investment journey?" 
                      className="bg-zinc-900/50 border-white/5 focus:border-amber-500/30 min-h-[120px] resize-none p-4"
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-black font-black uppercase tracking-widest h-12 shadow-xl shadow-amber-500/10 active:scale-95 transition-all mt-4"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" /> Ship Message
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>

          <div className="p-6 bg-zinc-900/30 border-t border-white/5 text-center">
            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.2em]">
              Powered by Al Safat Global AI
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default ChatbotAssistant;
