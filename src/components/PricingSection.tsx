
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, Clock } from 'lucide-react';

const PricingSection = () => {
  const plans = [
    {
      name: "SEO Starter",
      price: "$5",
      credits: "50",
      description: "Perfect for small WooCommerce stores starting their SEO journey.",
      features: [
        "AI SEO Content Generation",
        "• Long & Short Product Descriptions",
        "• SEO Meta Title & Meta Description",
        "• Optimized Image Alt Text",
        "• Focus Keywords Extraction",
        "Custom SEO Prompt Editing",
        "Multi-store Support",
        "WooCommerce Store Integration",
        "Real-time Preview Before Applying",
        "Basic SEO Support (Email)"
      ],
      popular: false,
      gradient: "from-seo-primary/10 to-seo-secondary/10",
      border: "border-seo-primary/20"
    },
    {
      name: "SEO Growth",
      price: "$20", 
      credits: "500",
      description: "For growing WooCommerce stores with more products to optimize.",
      features: [
        "Everything in SEO Starter, plus:",
        "Multi-store SEO Management",
        "Priority SEO Support (Live Chat)",
        "Bulk SEO Generation Tools",
        "Early Access to New SEO Features"
      ],
      popular: true,
      gradient: "from-seo-accent/10 to-seo-primary/10",
      border: "border-seo-accent"
    },
    {
      name: "SEO Scale",
      price: "$35",
      credits: "1000", 
      description: "For large WooCommerce stores with extensive product catalogs.",
      features: [
        "Everything in SEO Growth, plus:",
        "Advanced Multi-store SEO Support",
        "Priority SEO Optimization Support"
      ],
      popular: false,
      gradient: "from-seo-secondary/10 to-seo-accent/10",
      border: "border-seo-secondary/20"
    }
  ];

  return (
    <section className="py-24 bg-white relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-20 animate-fade-in-up">
          <div className="flex items-center justify-center gap-4 mb-6">
            <h2 className="text-4xl md:text-5xl font-display font-bold bg-gradient-to-r from-seo-primary to-seo-secondary bg-clip-text text-transparent">
              Affordable WooCommerce SEO Plans
            </h2>
            <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm font-bold py-2 px-6 rounded-full shadow-lg">
              LIMITED OFFER for early adopters
            </div>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Pay only for SEO content you generate. Each credit creates optimized content for one product with no monthly commitments or hidden fees.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={plan.name}
              className={`relative rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 ${plan.border} bg-gradient-to-br ${plan.gradient} animate-scale-in group flex flex-col h-full`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-seo-accent to-seo-primary text-white text-sm font-bold py-2 px-6 rounded-full shadow-lg">
                    MOST POPULAR SEO PLAN
                  </div>
                </div>
              )}
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-display font-bold mb-4 text-gray-900">{plan.name}</h3>
                <div className="text-5xl font-bold mb-2 text-gray-900">{plan.price}</div>
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
                  {plan.popular ? `Choose ${plan.name}` : `Get ${plan.name}`}
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
