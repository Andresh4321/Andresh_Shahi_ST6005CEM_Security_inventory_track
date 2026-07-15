"use client";

import { ArrowRight, Zap } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/20 blur-[150px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="bg-card border-2 border-primary/30 rounded-3xl p-12 md:p-16 text-center max-w-4xl mx-auto shadow-2xl shadow-primary/20">
          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-8 animate-float">
            <Zap className="w-8 h-8 text-primary-foreground" />
          </div>

          {/* Heading */}
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
            Ready to Transform Your{" "}
            <span className="text-gradient-primary">Inventory?</span>
          </h2>

          {/* Subtitle */}
          <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-10">
            Join hundreds of businesses who have streamlined their inventory operations with InventoryTrack. Start your free trial today.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="bg-primary text-primary-foreground hover:opacity-90 shadow-[0_0_40px_hsl(var(--primary)/0.3)] h-14 px-10 text-lg rounded-lg font-medium transition-all duration-300 inline-flex items-center justify-center gap-2">
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="bg-card/70 backdrop-blur-xl border border-border/50 text-foreground hover:bg-secondary/50 h-14 px-10 text-lg rounded-lg font-medium transition-all duration-300">
              Schedule Demo
            </button>
          </div>

          {/* Trust Badge */}
          <p className="text-muted-foreground text-sm mt-8">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
