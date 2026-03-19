import { CheckCircle } from "lucide-react";

const highlights = [
  "Over a decade of industry experience",
  "Trusted by 500+ businesses worldwide",
  "Commitment to integrity and excellence",
  "Tailored solutions for every client",
];

const AboutSection = () => (
  <section id="about" className="py-24 md:py-32 bg-zinc-950 relative">
    <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-16 items-center">
      {/* Visual Element */}
      <div className="relative group">
        <div className="aspect-square rounded-3xl bg-gradient-to-tr from-amber-500/20 via-zinc-900 to-black p-1">
          <div className="w-full h-full rounded-[1.4rem] bg-zinc-900 flex items-center justify-center overflow-hidden relative">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80')] bg-cover bg-center mix-blend-overlay opacity-40 group-hover:scale-110 transition-transform duration-[10s]" />
            <span className="text-6xl font-black text-amber-500/10 italic select-none">AL SAFAT</span>
          </div>
        </div>
        {/* Dynamic accents */}
        <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full bg-amber-500/10 blur-2xl -z-10 animate-pulse" />
        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-amber-500/5 blur-xl -z-10" />
      </div>

      <div className="relative">
        <span className="text-amber-500 font-bold uppercase tracking-[0.2em] text-sm italic">Who We Are</span>
        <h2 className="mt-4 text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter leading-tight">
          Pioneering Excellence <br />
          <span className="text-amber-500">Since 2014</span>
        </h2>
        <div className="w-20 h-1 bg-amber-500 mt-6 rounded-full mb-8" />
        
        <p className="text-zinc-400 text-lg leading-relaxed mb-8">
          Founded with a vision to empower businesses, Al Safat Company has grown into a leading provider of professional
          services. We combine deep expertise with a client-first approach to deliver measurable results that drive long-term
          success in an ever-evolving market.
        </p>
        
        <ul className="grid sm:grid-cols-2 gap-6">
          {highlights.map((h) => (
            <li key={h} className="flex items-center gap-4 group">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500 transition-colors duration-300">
                <CheckCircle className="h-4 w-4 text-amber-500 group-hover:text-black transition-colors duration-300" />
              </div>
              <span className="text-zinc-300 font-medium group-hover:text-white transition-colors">{h}</span>
            </li>
          ))}
        </ul>
        
        <div className="mt-12 flex items-center gap-8 border-t border-white/5 pt-10">
          <div>
            <p className="text-3xl font-black text-white italic">500+</p>
            <p className="text-sm text-zinc-500 uppercase tracking-widest font-bold">Clients</p>
          </div>
          <div className="w-px h-10 bg-white/10" />
          <div>
            <p className="text-3xl font-black text-white italic">10+</p>
            <p className="text-sm text-zinc-500 uppercase tracking-widest font-bold">Years</p>
          </div>
          <div className="w-px h-10 bg-white/10" />
          <div>
            <p className="text-3xl font-black text-white italic">100%</p>
            <p className="text-sm text-zinc-500 uppercase tracking-widest font-bold">Success</p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default AboutSection;
