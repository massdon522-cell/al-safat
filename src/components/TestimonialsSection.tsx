import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const testimonials = [
  { name: "Ahmed Al-Rashid", role: "CEO, Vertex Logistics", text: "Al Safat transformed our operations — their consulting team delivered results beyond expectations." },
  { name: "Sara Mahmoud", role: "COO, Horizon Group", text: "Professional, reliable, and innovative. Partnering with Al Safat was the best decision we made this year." },
  { name: "James Carter", role: "Director, Atlas Corp", text: "Their market analysis gave us the edge we needed to expand into three new regions successfully." },
];

const TestimonialsSection = () => (
  <section id="testimonials" className="py-24 md:py-32 bg-black relative overflow-hidden">
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/5 via-transparent to-transparent -z-10" />

    <div className="container mx-auto px-4 relative z-10">
      <div className="text-center max-w-3xl mx-auto mb-20">
        <span className="text-amber-500 font-bold uppercase tracking-[0.2em] text-sm italic">Client Stories</span>
        <h2 className="mt-4 text-4xl md:text-2xl font-bold text-white uppercase italic tracking-tighter">
          Trusted by <span className="text-amber-500">Industry Leaders</span>
        </h2>
        <div className="w-20 h-1 bg-amber-500 mx-auto mt-6 rounded-full" />
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        {testimonials.map((t) => (
          <Card key={t.name} className="bg-zinc-900/40 border-white/5 hover:border-amber-500/30 transition-all duration-500 backdrop-blur-sm group">
            <CardContent className="pt-10 pb-8 px-8">
              <div className="flex gap-1 mb-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-amber-500 text-amber-500 group-hover:scale-110 transition-transform duration-300" style={{ transitionDelay: `${i * 50}ms` }} />
                ))}
              </div>
              <p className="text-zinc-300 text-lg leading-relaxed italic mb-8 relative">
                <span className="text-4xl text-amber-500/20 absolute -top-4 -left-4 font-serif">"</span>
                {t.text}
                <span className="text-4xl text-amber-500/20 absolute -bottom-10 right-0 font-serif">"</span>
              </p>
              <div className="mt-10 pt-6 border-t border-white/5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-amber-700 flex items-center justify-center text-white font-bold text-xl uppercase italic">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-white text-lg tracking-tight">{t.name}</p>
                  <p className="text-sm text-amber-500/70 font-bold uppercase tracking-widest">{t.role}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

export default TestimonialsSection;
