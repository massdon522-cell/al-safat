import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { TrendingUp, Globe, GraduationCap, Users, Banknote, Landmark, Headphones, Flag, Wrench, CheckCircle2 } from "lucide-react";

const mainServices = [
  {
    icon: TrendingUp,
    title: "Time Based Market excution",
    desc: "We guarantee swift processing of requests and immediate notifications regarding financial activities on your Al Safat account."
  },
  {
    icon: Globe,
    title: "Market Analysis and prompt excution",
    desc: "With our team of experts in diverse financial market sectors, it's difficult not to reap the rewards. Entrust your funds to us for maximum yield and let your money work for you."
  },
  {
    icon: GraduationCap,
    title: "Flexible plan option",
    desc: "In order to accommodate a wider range of individuals on the journey to financial success, we have introduced plan options that cater to various budgets, ranging from the minimum to the maximum investment amounts."
  },
];

const milestones = [
  { icon: Users, label: "Registered Memebers", value: "17,000+" },
  { icon: Banknote, label: "Added Fund", value: "$94.76M" },
  { icon: Landmark, label: "Withdrawal", value: "$112.98M" },
  { icon: Headphones, label: "Language support", value: "17" },
  { icon: Flag, label: "Global Country", value: "39" },
];

const ServicesSection = () => (
  <section id="services" className="py-24 md:py-32 bg-white text-zinc-900">
    <div className="container mx-auto px-4">
      {/* Top Header */}
      <div className="text-center max-w-5xl mx-auto mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-amber-500 mb-8">New into the trading space?</h2>
        <p className="text-zinc-500 text-lg leading-relaxed">
          Fixed Time is a trading mode offered by the Al Safat Yield Crypto Investment platform, allowing individuals to generate profits by leveraging currency, stocks, indices, ETFs, and the varying exchange rates of other assets. This activity is referred to as trading, with participants being referred to as traders.
        </p>
      </div>

      {/* Main Service Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-16">
        {mainServices.map((s) => (
          <Card key={s.title} className="bg-black border-none rounded-2xl overflow-hidden min-h-[240px]">
            <CardHeader className="p-6">
              <CardTitle className="text-amber-500 text-lg font-bold flex items-center justify-between gap-2 mb-3">
                {s.title}
                <s.icon className="h-4 w-4 flex-shrink-0" />
              </CardTitle>
              <CardDescription className="text-zinc-300 text-sm leading-relaxed">
                {s.desc}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Milestones Header */}
      <div className="text-center mb-12">
        <h3 className="text-3xl md:text-4xl font-bold text-amber-500 flex items-center justify-center gap-3">
          Brewed Minds for Great milestone
          <Wrench className="h-8 w-8" />
        </h3>
      </div>

      {/* Milestone Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {milestones.map((m) => (
          <Card key={m.label} className="bg-black border-none rounded-xl p-4 flex flex-col items-center justify-center text-center">
            <div className="text-amber-500 font-bold text-xs mb-2 flex items-center gap-2">
              {m.label}
              <m.icon className="h-3.5 w-3.5" />
            </div>
            <div className="text-white text-xl md:text-2xl font-bold">
              {m.value}
            </div>
          </Card>
        ))}
      </div>

      {/* Mining Support Section */}
      <div className="mt-32 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <h3 className="text-3xl md:text-4xl font-bold text-amber-500 leading-tight mb-6">
            We offer high-quality round-the-clock technical support, which is available to all miners.
          </h3>
          <p className="text-zinc-500 text-lg mb-8 font-medium italic">Do more with our mining services</p>

          <ul className="space-y-4">
            {[
              "24/7 Mining Support",
              "Flexible Mining Plans",
              "Unlimited capability"
            ].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-white" />
                </div>
                <span className="text-zinc-600 font-semibold">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <div className="aspect-video rounded-3xl overflow-hidden bg-zinc-50 flex items-center justify-center p-8 border border-zinc-100 shadow-sm">
            <img
              src="https://worldbesstplatform.com/asset/bitcoinmining.gif"
              alt="Mining Infrastructure"
              className="w-full h-full object-cover rounded-2xl opacity-80"
            />

          </div>
        </div>
      </div>
    </div>
  </section>
);

export default ServicesSection;
