import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UserPlus, Wallet, Receipt, Wrench } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Register & Log in",
    desc: "To initiate the account opening process, simply click on the 'CREATE ACCOUNT' button located at the top of the website. Once clicked, you will be directed to a registration form where you will be prompted to provide necessary information including your full name, preferred username, password, and email address.",
  },
  {
    icon: Wallet,
    title: "Add Fund",
    desc: "Once you have successfully created your personal account, you can embark on your profit journey by making your first investment. Simply navigate to the investment section where you will find various payment options available, including Bitcoin, USDT (Tether), Ethereum, and TRON. From there, you can choose your preferred payment method and proceed with making your investment.",
  },
  {
    icon: Receipt,
    title: "Withdrawal",
    desc: "Making withdrawals is very fast and easy. Al Safat provides instant withdrawals for all withdrawal requests. Please note that you can withdraw funds only in the same currency as you invested, for example, if you invest through Bitcoin, you can withdraw only through Bitcoin.",
  },
];

const HowWeOperate = () => (
  <section className="py-24 md:py-32 bg-white text-zinc-900 border-t border-zinc-100">
    <div className="container mx-auto px-4">
      {/* Top Header */}
      <div className="max-w-5xl mx-auto mb-20 text-center lg:text-left">
        <h2 className="text-4xl md:text-xl font-bold text-amber-500 leading-tight">
          Easier than the trading floor.
          <br />
          Harder than pure luck.
        </h2>
        <div className="mt-8 space-y-6 text-zinc-500 text-lg leading-relaxed">
          <p>
            Fixed Time trading does not necessitate extensive analysis of the financial market by the trader. However, it is important to note that relying solely on luck is not a viable strategy for success.
          </p>
          <p>
            To enhance trading effectiveness and grasp the market sentiment, it is recommended for novice traders to explore the functionalities of the trading platform and familiarize themselves with various popular trading strategies. This enables a better understanding of market dynamics and helps in making informed trading decisions.
          </p>
        </div>
      </div>

      {/* Section Heading */}
      <div className="text-center mb-12">
        <h3 className="text-3xl md:text-2xl font-bold text-amber-500 flex items-center justify-center gap-3 italic">
          How we Operate
          <Wrench className="h-8 w-8" />
        </h3>
      </div>

      {/* Step Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {steps.map((s) => (
          <Card key={s.title} className="bg-black border-none rounded-2xl overflow-hidden min-h-[280px]">
            <CardHeader className="p-6">
              <CardTitle className="text-amber-500 text-lg font-bold flex items-center gap-2 mb-4">
                {s.title}
                <s.icon className="h-4 w-4" />
              </CardTitle>
              <CardDescription className="text-zinc-300 text-sm leading-relaxed">
                {s.desc}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

export default HowWeOperate;
