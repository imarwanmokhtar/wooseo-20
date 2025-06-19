
import React from 'react';
import { Brain, Zap, Stethoscope, Upload, Target, CheckCircle } from 'lucide-react';

const CoreBenefitsSection = () => {
  const benefits = [
    {
      icon: Brain,
      title: "AI-Powered SEO Fields",
      description: "Generate long/short descriptions, meta titles, meta descriptions, and image alt text — optimized for Google."
    },
    {
      icon: Zap,
      title: "Unlimited Bulk Editing",
      description: "Edit price, SKU, titles, descriptions, and more across 1 or 1000+ products instantly — with zero limits."
    },
    {
      icon: Stethoscope,
      title: "Store Analyzer Tool",
      description: "Scan your store for missing SEO fields and under-optimized listings in one click."
    },
    {
      icon: Upload,
      title: "Product Extractor",
      description: "Export your entire catalog to Excel and work offline or review SEO performance."
    },
    {
      icon: Target,
      title: "Customizable AI Prompts",
      description: "Control tone, keywords, or branding in every description. No rules engines or tech headaches."
    }
  ];

  return (
    <section id="core-benefits" className="py-24 bg-[#F8F9FB]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 text-[#1F1F1F]">
            Why Store Owners Love WooSEO
          </h2>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {benefits.map((benefit, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 animate-scale-in border border-gray-100"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 bg-[#6C3EF4]/10 rounded-xl flex items-center justify-center mb-6">
                <benefit.icon className="h-6 w-6 text-[#6C3EF4]" />
              </div>
              <h3 className="text-xl font-bold text-[#1F1F1F] mb-4">{benefit.title}</h3>
              <p className="text-[#6B6B6B] leading-relaxed">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CoreBenefitsSection;
