import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Coins } from "lucide-react";
import { useNavigate } from "react-router-dom";

const plans = [
  {
    title: "First Plan",
    min: "$500",
    max: "$4,900",
    profit: "4%",
    duration: "1 week",
  },
  {
    title: "Second Plan",
    min: "$5,000",
    max: "$20,000",
    profit: "5.5%",
    duration: "1 week",
  },
  {
    title: "Third Plan",
    min: "$20,000",
    max: "Unlimited",
    profit: "7.2%",
    duration: "1 week",
  },
];

const InvestmentPlans = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-white text-zinc-900 border-t border-zinc-100">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl md:text-2xl font-bold text-amber-500 mb-16">Flexible Investment Plans</h2>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card key={plan.title} className="bg-white border-zinc-200 shadow-sm hover:shadow-xl transition-all duration-300">
              <CardHeader className="pt-8 flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mb-6">
                  <Coins className="h-10 w-10 text-amber-500" />
                </div>
                <CardTitle className="text-amber-500 text-2xl font-bold">{plan.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 py-6 text-left px-8">
                {[
                  { label: "Min. Possible Deposit", value: plan.min },
                  { label: "Max. Possible Deposit", value: plan.max },
                  { label: "Expected profit", value: plan.profit },
                  { label: "Duration", value: plan.duration },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-zinc-900 flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-zinc-600 font-medium text-sm">
                      {item.label}: <span className="font-bold text-zinc-900">{item.value}</span>
                    </span>
                  </div>
                ))}
              </CardContent>
              <CardFooter className="pb-8 px-8">
                <Button 
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-6 rounded-lg text-lg transition-transform hover:scale-105"
                  onClick={() => navigate('/login')}
                >
                  Create Account
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InvestmentPlans;
