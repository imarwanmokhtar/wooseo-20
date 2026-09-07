
import React from 'react';
import { CheckCircle, Package, Settings, Star } from 'lucide-react';

const USPSection = () => {
  const usps = [
    {
      icon: <CheckCircle className="h-8 w-8" />,
      title: "Predictable Pricing. Zero Surprises.",
      description: "You pay per product – and that's it. No separate AI bills, no API setup, no monthly lock-ins.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <Package className="h-8 w-8" />,
      title: "Full Content Package, Not Just Descriptions.",
      description: "We don't stop at words. You get meta titles, descriptions, and image alt text. Every detail counts for SEO.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Settings className="h-8 w-8" />,
      title: "Edit the AI Prompt. Take Full Control.",
      description: "Change tone, add instructions, and include keywords – even if you're not technical.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <Star className="h-8 w-8" />,
      title: "Delivering SEO optimized content.",
      description: "Every word, tag, and alt text we generate is engineered to help your products rank higher and convert better.",
      color: "from-orange-500 to-red-500"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 to-seo-light relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-20 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 text-gray-900">
            What You Get That <span className="bg-gradient-to-r from-seo-primary to-seo-secondary bg-clip-text text-transparent">Others Don't</span>
          </h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {usps.map((usp, index) => (
            <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className={`bg-gradient-to-r ${usp.color} p-4 rounded-2xl w-16 h-16 flex items-center justify-center text-white mb-6 shadow-lg`}>
                {usp.icon}
              </div>
              <h3 className="text-2xl font-display font-semibold mb-4 text-gray-900">{usp.title}</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                {usp.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default USPSection;
