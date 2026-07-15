"use client";

import { Check } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Set Up Your Materials",
    description: "Add all raw materials with costs, units, and minimum stock requirements. The system starts tracking immediately.",
    features: ["Bulk import support", "Price per unit tracking", "Minimum stock alerts"]
  },
  {
    number: "02",
    title: "Create Production Recipes",
    description: "Define how much of each material is needed for your products. Create unlimited recipes for different variants.",
    features: ["Multi-tier recipes", "Material auto-deduction", "Batch tracking"]
  },
  {
    number: "03",
    title: "Track & Analyze",
    description: "Monitor production, track wastage, and get insights to optimize your operations over time.",
    features: ["Real-time dashboards", "Wastage analytics", "Export reports"]
  }
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-24 relative">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-accent text-sm font-medium uppercase tracking-wider">How It Works</span>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mt-3 mb-4">
            Get Started in{" "}
            <span className="text-gradient-accent">Three Steps</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Simple setup, powerful results. Start managing your production in minutes.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-12 max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <div 
              key={step.number}
              className={`flex flex-col md:flex-row gap-8 items-start ${
                index % 2 === 1 ? 'md:flex-row-reverse' : ''
              }`}
            >
              {/* Number */}
              <div className="shrink-0">
                <div className="w-20 h-20 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-lg">
                  <span className="font-heading text-3xl font-bold text-primary-foreground">{step.number}</span>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 bg-card border border-border rounded-2xl p-8 shadow-md hover:shadow-lg transition-shadow">
                <h3 className="font-heading text-2xl font-bold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {step.description}
                </p>
                <div className="flex flex-wrap gap-4">
                  {step.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-sm text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
