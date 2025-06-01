
import React from 'react';
import { Shield, Tag, Zap, TrendingUp } from 'lucide-react';

const HowItWorksSection = () => {
  const steps = [
    {
      step: 1,
      title: "Connect Your WooCommerce Store",
      description: "Enter your WooCommerce API credentials to securely connect your store in under 2 minutes for seamless SEO optimization.",
      icon: <Shield className="h-8 w-8" />,
      color: "from-seo-primary to-seo-secondary"
    },
    {
      step: 2,
      title: "Select Products for SEO Enhancement",
      description: "Browse your product catalog and choose which items need professional SEO content optimization and meta tag improvements.",
      icon: <Tag className="h-8 w-8" />,
      color: "from-seo-accent to-seo-primary"
    },
    {
      step: 3,
      title: "Generate AI SEO Content",
      description: "Our advanced AI creates RankMath-optimized descriptions, meta titles, focus keywords, and alt text based on your products.",
      icon: <Zap className="h-8 w-8" />,
      color: "from-seo-secondary to-seo-accent"
    },
    {
      step: 4,
      title: "Push SEO Content to Store",
      description: "Apply all SEO-optimized changes directly to your WooCommerce store and watch your search rankings improve.",
      icon: <TrendingUp className="h-8 w-8" />,
      color: "from-seo-orange to-seo-pink"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 to-seo-light relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-20 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 text-gray-900">
            How Our WooCommerce SEO Generator Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get started in minutes and see immediate SEO improvements for your e-commerce store
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {steps.map((item, index) => (
            <div key={item.step} className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 transform hover:scale-105 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className={`bg-gradient-to-r ${item.color} p-4 rounded-2xl w-16 h-16 flex items-center justify-center text-white mb-6 shadow-lg transform hover:scale-110 transition-transform duration-300`}>
                {item.icon}
              </div>
              <div className="flex items-center mb-4">
                <div className={`bg-gradient-to-r ${item.color} text-white text-2xl font-bold rounded-full w-12 h-12 flex items-center justify-center mr-4 shadow-lg`}>
                  {item.step}
                </div>
                <h3 className="text-2xl font-display font-semibold text-gray-900">{item.title}</h3>
              </div>
              <p className="text-gray-600 text-lg leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
