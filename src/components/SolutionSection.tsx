
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { CheckCircle, Zap } from 'lucide-react';

const SolutionSection = () => {
  const features = [
    "Long & Short Descriptions that actually sell",
    "Meta Titles & Descriptions that rank",
    "Image Alt Text for accessibility & SEO", 
    "1-click WooCommerce sync – no plugin required",
    "Edit the prompt anytime. Make it sound like you."
  ];

  return (
    <section className="py-24 bg-white relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-20 animate-fade-in-up">
          <div className="inline-flex items-center bg-gradient-to-r from-seo-primary/10 to-seo-secondary/10 rounded-full px-6 py-3 mb-8 border border-seo-primary/20">
            <Zap className="h-5 w-5 mr-2 text-seo-primary" />
            <span className="text-seo-primary font-semibold">Your New Content Engine</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-8 text-gray-900">
            Generate SEO-Ready Content for Your Entire Catalog – <span className="text-seo-primary">In Minutes.</span>
          </h2>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-1 gap-6 mb-12">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center p-4 bg-gradient-to-r from-green-50 to-seo-light rounded-xl border border-green-200 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <CheckCircle className="h-6 w-6 text-green-600 mr-4 flex-shrink-0" />
                <span className="text-lg text-gray-700 font-medium">{feature}</span>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <Button 
              asChild 
              size="lg" 
              className="bg-gradient-to-r from-seo-primary to-seo-secondary hover:from-seo-primary/90 hover:to-seo-secondary/90 text-white py-6 px-10 text-lg font-semibold rounded-2xl transform hover:scale-105 transition-all duration-200 shadow-2xl"
            >
              <Link to="/register">Try It. It's FREE</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;
