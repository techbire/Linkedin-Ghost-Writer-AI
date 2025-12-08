import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: "₹600",
    priceSuffix: "/6 months",
    description: "For new creators finding their voice.",
    features: [
      "100 credits/month",
      "Personalized tone learning",
      "Post & carousel generator",
      "Email support",
    ],
    cta: "Get Started",
    popular: false,
    bgColor: "#FFFFFF",
    textColor: "#000000",
    buttonStyle: "bg-white border border-black",
    buttonTextColor: "text-black",
  },
  {
    id: "pro",
    name: "Pro",
    price: "₹1000",
    priceSuffix: "/12 months",
    description: "For growing creators and ghostwriters.",
    features: [
      "500 credits/month",
      "Trend & idea finder",
      "Deep research integration",
      "Priority support",
      "Engagement analytics",
    ],
    cta: "Get Started",
    popular: true,
    bgColor: "#000000",
    textColor: "#FFFFFF",
    descriptionColor: "#D8D8D8",
    buttonStyle: "bg-[#2C8032]",
    buttonTextColor: "text-white",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    priceSuffix: "",
    description: "For agencies and multi-brand founders.",
    features: [
      "2000 credits/billing period",
      "Unlimited content generation",
      "Team collaboration tools",
      "Dedicated account manager",
      "Advanced analytics dashboard",
    ],
    cta: "Contact Our Sales",
    popular: false,
    bgColor: "#FFFFFF",
    textColor: "#000000",
    buttonStyle: "bg-white border border-black",
    buttonTextColor: "text-black",
  },
];

export function Pricing() {
  return (
    <section
      id="pricing"
      className="w-full bg-white py-20 px-4 flex flex-col items-center gap-[120px]"
    >
      {/* Header */}
      <div className="flex flex-col items-center gap-5 max-w-[1280.5px] w-full">
        <h2
          className="text-[32px] sm:text-[42px] md:text-[52px] font-semibold text-center text-black w-full"
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 600,
            lineHeight: "63px",
          }}
        >
          Choose the plan that grows with you.
        </h2>
        <p
          className="text-[16px] sm:text-[18px] md:text-[20px] font-normal text-center text-black max-w-[764px]"
          style={{
            fontFamily: "Caladea, serif",
            fontWeight: 400,
            lineHeight: "30px",
          }}
        >
          Start free. Upgrade when your content — and audience — start scaling.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="flex flex-col lg:flex-row justify-center items-center gap-8 w-full max-w-[1280.5px]">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="flex flex-col justify-between items-center p-6 gap-6 w-full max-w-[405.5px] rounded-lg border-2 border-[#2C8032] relative transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl cursor-pointer"
            style={{
              background: plan.bgColor,
              minHeight: plan.popular ? "438px" : "393px",
            }}
          >
            {/* Title */}
            <div className="flex flex-col justify-center items-center gap-1 w-full">
              <h3
                className="text-[24px] font-medium w-full text-center"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 500,
                  lineHeight: "120%",
                  color: plan.textColor,
                }}
              >
                {plan.name}
              </h3>
              <p
                className="text-[32px] font-medium w-full text-center"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 500,
                  lineHeight: "120%",
                  color: plan.textColor,
                }}
              >
                {plan.price}
                {plan.priceSuffix && (
                  <span className="text-[32px]">{plan.priceSuffix}</span>
                )}
              </p>
            </div>

            {/* Content */}
            <div className="flex flex-col justify-center items-start gap-3 w-full">
              <p
                className="text-[14px] font-medium"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 500,
                  lineHeight: "150%",
                  color: plan.descriptionColor || plan.textColor,
                }}
              >
                {plan.description}
              </p>
              {plan.features.map((feature, index) => (
                <div
                  key={index}
                  className="flex flex-row items-center gap-3"
                >
                  <div
                    className="w-5 h-5 rounded-[3.2px] flex items-center justify-center flex-shrink-0"
                    style={{
                      background: plan.popular ? "#4B4B4B" : "#F2F2F2",
                    }}
                  >
                    <Check
                      className="w-3 h-3"
                      style={{
                        stroke: plan.popular ? "#FFFFFF" : "#AFAFAF",
                        strokeWidth: "1.6px",
                      }}
                    />
                  </div>
                  <span
                    className="text-[14px] font-normal"
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 400,
                      lineHeight: "150%",
                      color: plan.textColor,
                    }}
                  >
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            {/* Button */}
            <Button
              asChild
              className={`w-full h-[40px] px-[18px] py-2 rounded-[4px] ${plan.buttonStyle} ${plan.buttonTextColor} hover:opacity-90`}
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 500,
                fontSize: "16px",
                lineHeight: "150%",
              }}
            >
              <Link href="/signup">{plan.cta}</Link>
            </Button>

            {/* Most Popular Badge */}
            {plan.popular && (
              <p
                className="text-[14px] font-medium text-center mt-2"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 500,
                  lineHeight: "150%",
                  color: "#D8D8D8",
                }}
              >
                Most Popular
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
