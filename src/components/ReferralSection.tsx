import { Wallet2 } from "lucide-react";

const ReferralSection = () => (
  <section className="py-24 bg-white text-zinc-900 overflow-hidden border-t border-zinc-100">
    <div className="container mx-auto px-4">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        {/* Text Content */}
        <div className="text-center lg:text-left">
          <h2 className="text-4xl md:text-5xl lg:text-2xl font-bold text-amber-500 leading-tight mb-6 uppercase italic tracking-tighter flex flex-wrap items-center justify-center lg:justify-start gap-4">
            TACTICAL REFERAL ALTERNATIVE TO EARN SOME COOL CASH
            <div className="flex gap-2">
              <Wallet2 className="h-10 w-10 text-amber-500 animate-bounce" />
              <Wallet2 className="h-10 w-10 text-amber-500 animate-bounce delay-100" />
            </div>
            !
          </h2>
          <p className="text-zinc-500 text-2xl font-bold italic">
            10% on every Deposit of your referee..
          </p>
        </div>

        {/* Image Content */}
        <div className="relative">
          <div className="aspect-square max-w-[200px] mx-auto">
            <img
              src="https://worldbesstplatform.com/asset/referingimages.jpg"
              alt="Referral Illustration"
              className="w-full h-full object-contain rounded-3xl"
            />
            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -z-10" />
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default ReferralSection;
