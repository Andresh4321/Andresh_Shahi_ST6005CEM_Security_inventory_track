"use client";

import { 
  Package, 
  Calculator, 
  Warehouse, 
  Users, 
  AlertTriangle, 
  Factory,
  BarChart3,
  TrendingUp
} from "lucide-react";
import FeatureCard from "../_components/FeatureCard";

const features = [
  {
    icon: Package,
    title: "Raw Materials",
    description: "Track all ingredients with minimum stock levels, pricing, and automatic low-stock notifications."
  },
  {
    icon: Calculator,
    title: "Bill of Materials",
    description: "Calculate total inventory value and see real-time pricing for all your materials at a glance."
  },
  {
    icon: Warehouse,
    title: "Stock Management",
    description: "Easily add or reduce stock with remarks. Keep accurate records of every inventory change."
  },
  {
    icon: Users,
    title: "Supplier Directory",
    description: "Manage supplier contacts, compare prices, and quickly find alternatives when stock runs low."
  },
  {
    icon: AlertTriangle,
    title: "Low Stock Alerts",
    description: "Visual alerts for items approaching minimum levels. Priority sorting keeps critical items visible."
  },
  {
    icon: Factory,
    title: "Production Tracking",
    description: "Create recipes, track batches, and automatically deduct materials from inventory."
  },
  {
    icon: BarChart3,
    title: "Production Reports",
    description: "Daily production logs, material consumption graphs, and expenditure tracking."
  },
  {
    icon: TrendingUp,
    title: "Analytics Dashboard",
    description: "Comprehensive insights on wastage, production efficiency, and inventory trends."
  }
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 relative">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-0 w-[300px] h-[300px] rounded-full bg-primary/10 blur-[100px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-primary text-sm font-medium uppercase tracking-wider">Features</span>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mt-3 mb-4">
            Everything You Need to{" "}
            <span className="text-gradient-primary">Manage Inventory</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            A complete suite of tools designed specifically for inventory and stock operations.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={index * 100}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
