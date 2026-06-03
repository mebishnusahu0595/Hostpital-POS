import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "FREE",
    price: "$0",
    period: "/month",
    description: "Perfect for small clinics",
    features: [
      "Up to 10 equipment",
      "1 admin, 1 engineer",
      "Basic reports",
      "Community support"
    ],
    cta: "Get Started Free",
    popular: false
  },
  {
    name: "BASIC",
    price: "$999",
    period: "/month",
    description: "For growing nursing homes",
    features: [
      "Up to 100 equipment",
      "3 engineers",
      "Email alerts",
      "PDF export",
      "Standard support"
    ],
    cta: "Start Free Trial",
    popular: true
  },
  {
    name: "PRO",
    price: "$2,499",
    period: "/month",
    description: "For multispecialty hospitals",
    features: [
      "Unlimited equipment",
      "Unlimited users",
      "Real-time alerts",
      "Advanced analytics",
      "Compliance module",
      "Priority support"
    ],
    cta: "Start Free Trial",
    popular: false
  },
  {
    name: "ENTERPRISE",
    price: "Custom",
    period: "",
    description: "For large hospital chains",
    features: [
      "On-premise option",
      "API access",
      "Custom integrations",
      "Dedicated account manager",
      "24/7 Priority support"
    ],
    cta: "Contact Sales",
    popular: false
  }
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold text-medical-navy mb-4">Pricing that scales with you.</h2>
          <p className="text-slate-600 max-w-xl mx-auto">No hidden fees. Choose a plan that fits your facility's current needs.</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`p-8 rounded-3xl border flex flex-col transition-all duration-300 ${
                plan.popular 
                  ? "border-medical-blue shadow-2xl shadow-medical-blue/10 scale-105 bg-white relative z-10" 
                  : "border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-xl"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-medical-blue text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-widest">
                  MOST POPULAR
                </div>
              )}
              <div className="mb-8">
                <p className="text-sm font-bold text-slate-500 mb-2">{plan.name}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-medical-navy">{plan.price}</span>
                  <span className="text-slate-500 text-sm">{plan.period}</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">{plan.description}</p>
              </div>
              
              <ul className="space-y-4 mb-8 flex-grow">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                    <Check size={16} className="text-medical-blue mt-0.5 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button 
                variant={plan.popular ? "default" : "outline"} 
                className={`w-full rounded-full h-11 ${
                  plan.popular ? "bg-medical-blue hover:bg-medical-blue/90" : "border-slate-300"
                }`}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
