import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, MapPin, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ContactSection = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({ title: "Message sent!", description: "We'll get back to you shortly." });
      (e.target as HTMLFormElement).reset();
    }, 800);
  };

  return (
    <section id="contact" className="py-24 md:py-32 bg-zinc-950 relative">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-amber-500 font-bold uppercase tracking-[0.2em] text-sm italic">Reach Out</span>
          <h2 className="mt-4 text-4xl md:text-2xl font-bold text-white uppercase italic tracking-tighter">
            Let's Start a <span className="text-amber-500">Conversation</span>
          </h2>
          <div className="w-20 h-1 bg-amber-500 mx-auto mt-6 rounded-full" />
        </div>

        <div className="grid lg:grid-cols-2 gap-16 max-w-6xl mx-auto">
          {/* Contact Info */}
          <div className="space-y-8">
            <h3 className="text-2xl font-bold text-white mb-8 uppercase italic tracking-tight">Contact Information</h3>
            <Card className="bg-zinc-900/50 border-white/5 hover:border-amber-500/30 transition-colors">
              <CardContent className="flex items-center gap-6 pt-6 pb-6">
                <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-500"><Mail className="h-6 w-6" /></div>
                <div>
                  <p className="text-sm font-bold text-amber-500/50 uppercase tracking-widest mb-1">Email Us</p>
                  <a href="mailto:contact@alsafat.com" className="text-xl font-bold text-white hover:text-amber-500 transition-colors italic">contact@alsafat.com</a>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-zinc-900/50 border-white/5 hover:border-amber-500/30 transition-colors">
              <CardContent className="flex items-center gap-6 pt-6 pb-6">
                <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-500"><Phone className="h-6 w-6" /></div>
                <div>
                  <p className="text-sm font-bold text-amber-500/50 uppercase tracking-widest mb-1">Call Us</p>
                  <p className="text-xl font-bold text-white italic">+1 (555) 000-0000</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-zinc-900/50 border-white/5 hover:border-amber-500/30 transition-colors">
              <CardContent className="flex items-center gap-6 pt-6 pb-6">
                <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-500"><MapPin className="h-6 w-6" /></div>
                <div>
                  <p className="text-sm font-bold text-amber-500/50 uppercase tracking-widest mb-1">Visit Us</p>
                  <p className="text-xl font-bold text-white italic">Business District, Suite 400</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="bg-zinc-900/30 p-8 md:p-12 rounded-3xl border border-white/5 backdrop-blur-sm">
            <h3 className="text-2xl font-bold text-white mb-8 uppercase italic tracking-tight">Send a Message</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <Input placeholder="Your name" className="bg-white/5 border-white/10 text-white placeholder:text-zinc-600 focus:border-amber-500 focus:ring-amber-500 h-14" required />
                <Input type="email" placeholder="Your email" className="bg-white/5 border-white/10 text-white placeholder:text-zinc-600 focus:border-amber-500 focus:ring-amber-500 h-14" required />
              </div>
              <Input placeholder="Subject" className="bg-white/5 border-white/10 text-white placeholder:text-zinc-600 focus:border-amber-500 focus:ring-amber-500 h-14" required />
              <Textarea placeholder="Your message..." rows={5} className="bg-white/5 border-white/10 text-white placeholder:text-zinc-600 focus:border-amber-500 focus:ring-amber-500 text-base" required />
              <Button type="submit" size="lg" className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold text-lg h-16 uppercase italic" disabled={loading}>
                {loading ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
