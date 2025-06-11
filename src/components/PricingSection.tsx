
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, Clock, Flame } from 'lucide-react';

const PricingSection = () => {
  const baseFeatures = [
    "AI SEO Content Generation",
    "Long & Short Product Descriptions",
    "SEO Meta Title & Meta Description", 
    "Optimized Image Alt Text",
    "Focus Keywords Extraction",
    "Custom SEO Prompt Editing",
    "WooCommerce Store Integration",
    "Real-time Preview Before Applying",
    "Multi-store SEO Management",
    "Bulk SEO Generation Tools"
  ];

  const plans = [
    {
      name: "50 Credits",
      price: "$5",
      originalPrice: null,
      credits: "50",
      perProduct: "$0.10 each",
      description: "Perfect for small stores testing the waters.",
      features: baseFeatures,
      popular: false,
      gradient: "from-seo-primary/10 to-seo-secondary/10",
      border: "border-seo-primary/20"
    },
    {
      name: "500 Credits", 
      price: "$20",
      originalPrice: "$100",
      credits: "500",
      perProduct: "$0.04 each",
      description: "Most popular for growing stores.",
      features: [
        ...baseFeatures,
        "Priority SEO Support",
        "Early Access to New Features"
      ],
      popular: true,
      gradient: "from-seo-accent/10 to-seo-primary/10", 
      border: "border-seo-accent"
    },
    {
      name: "1000 Credits",
      price: "$35",
      originalPrice: "$200", 
      credits: "1000",
      perProduct: "$0.035 each",
      description: "For serious stores with large catalogs.",
      features: [
        ...baseFeatures,
        "Priority SEO Support",
        "Priority Processing Queue",
        "Dedicated Account Manager"
      ],
      popular: false,
      gradient: "from-seo-secondary/10 to-seo-accent/10",
      border: "border-seo-secondary/20"
    }
  ];

  return (
    <section id="pricing" className="py-24 bg-white relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-20 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 bg-gradient-to-r from-seo-primary to-seo-secondary bg-clip-text text-transparent">
            Simple Pricing. Big Value.
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Pay per product – and that's it. No separate AI bills, no API setup, no monthly lock-ins.
          </p>
          
          {/* Highlight Box */}
          <div className="max-w-2xl mx-auto bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-2xl p-6 mb-8 shadow-lg">
            <div className="flex items-center justify-center mb-2">
              <Flame className="h-5 w-5 mr-2" />
              <span className="font-bold">Launch Special</span>
            </div>
            <p className="text-lg">Get 1000 credits for just $35. That's 93% off our standard rate.</p>
            <p className="text-sm opacity-90 mt-2">🧠 No monthly fees. Use your credits whenever you want.</p>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
          {plans.map((plan, index) => (
            <div 
              key={plan.name}
              className={`relative rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 ${plan.border} bg-gradient-to-br ${plan.gradient} animate-scale-in group flex flex-col h-full`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-seo-accent to-seo-primary text-white text-sm font-bold py-2 px-6 rounded-full shadow-lg">
                    MOST POPULAR
                  </div>
                </div>
              )}
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-display font-bold mb-4 text-gray-900">{plan.name}</h3>
                <div className="mb-4">
                  {plan.originalPrice && (
                    <div className="text-2xl text-gray-400 line-through">{plan.originalPrice}</div>
                  )}
                  <div className="text-5xl font-bold text-gray-900">{plan.price}</div>
                </div>
                <div className="text-seo-primary font-semibold mb-2">{plan.perProduct}</div>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                
                <div className="inline-flex items-center bg-white/50 rounded-full px-4 py-2 mb-6">
                  <Clock className="h-4 w-4 mr-2 text-seo-primary" />
                  <span className="font-semibold text-seo-primary">
                    {plan.credits} SEO credits
                  </span>
                </div>
              </div>
              
              <ul className="space-y-4 mb-8 flex-grow">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-seo-accent mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                className={`w-full py-6 text-lg font-semibold rounded-2xl transition-all duration-300 transform group-hover:scale-105 ${
                  plan.popular 
                    ? 'bg-gradient-to-r from-seo-accent to-seo-primary hover:from-seo-accent/90 hover:to-seo-primary/90 text-white shadow-lg hover:shadow-seo-accent/25' 
                    : 'bg-gradient-to-r from-seo-primary to-seo-secondary hover:from-seo-primary/90 hover:to-seo-secondary/90 text-white'
                }`}
                asChild
              >
                <Link to="/register" className="flex items-center justify-center">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          ))}
        </div>
        
        <div className="text-center">
          <Button 
            asChild 
            variant="outline"
            size="lg" 
            className="border-2 border-seo-primary text-seo-primary hover:bg-seo-primary hover:text-white py-4 px-8 text-lg rounded-2xl transition-all duration-200 hover:scale-105"
          >
            <Link to="/register">Get Started – No Card Needed</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
