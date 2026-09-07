
import React from 'react';
import { CheckCircle, DollarSign, Layers, Plug, Globe } from 'lucide-react';

const UniqueEdgeSection = () => {
  const edges = [
    {
      icon: DollarSign,
      title: "Predictable Pricing",
      description: "1 credit = 1 product. No surprise bills. No API keys. $20 = 200 AI generations."
    },
    {
      icon: Layers,
      title: "All-In-One Field Generation",
      description: "Unlike other tools, WooSEO generates everything: long/short descriptions, meta titles, meta descriptions, AND alt text."
    },
    {
      icon: Plug,
      title: "No WordPress Plugin Required",
      description: "Standalone SaaS. Just connect your store. Fast, secure, no bloat."
    },
    {
      icon: Globe,
      title: "Unlimited Sites",
      description: "Use the same account to manage and bulk edit across all your WooCommerce stores — with no extra charge."
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 text-[#1F1F1F]">
            What Makes WooSEO Different?
          </h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {edges.map((edge, index) => (
            <div 
              key={index}
              className="flex items-start space-x-4 p-6 rounded-2xl bg-[#F8F9FB] hover:bg-white hover:shadow-lg transition-all duration-300 animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 bg-[#A1E887]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-[#00C853]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#1F1F1F] mb-2">{edge.title}</h3>
                <p className="text-[#6B6B6B] leading-relaxed">{edge.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UniqueEdgeSection;
