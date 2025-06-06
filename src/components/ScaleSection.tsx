
import React from 'react';
import { Globe, Shield, MessageCircle } from 'lucide-react';

const ScaleSection = () => {
  const features = [
    {
      icon: <Globe className="h-6 w-6" />,
      text: "Multi-store support"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      text: "GDPR-compliant, no data reselling"
    },
    {
      icon: <MessageCircle className="h-6 w-6" />,
      text: "Human support, real fast"
    }
  ];

  return (
    <section className="py-24 bg-white relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-8 text-gray-900">
            Whether You Have 10 or 10,000 Products – <span className="text-seo-primary">We've Got You.</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
            Bulk generation, smart queueing, and blazing-fast processing means you can grow without bottlenecks.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 bg-gradient-to-br from-seo-light to-white rounded-2xl border border-seo-primary/20 hover:border-seo-primary/40 transition-all duration-300 transform hover:-translate-y-2 animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="bg-gradient-to-r from-seo-primary to-seo-secondary p-4 rounded-2xl w-16 h-16 flex items-center justify-center text-white mb-4 mx-auto shadow-lg">
                  {feature.icon}
                </div>
                <p className="text-gray-700 font-medium text-lg">{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ScaleSection;
