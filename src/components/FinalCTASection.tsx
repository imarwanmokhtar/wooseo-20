
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';

const FinalCTASection = () => {
  return (
    <section className="py-24 bg-gradient-to-br from-seo-primary via-seo-secondary to-seo-primary/80 text-white relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-seo-accent/20 rounded-full blur-3xl animate-bounce"></div>
      
      <div className="container mx-auto px-4 relative">
        <div className="text-center animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 leading-tight">
            Join the Store Owners Who Actually <span className="text-seo-accent">Enjoy SEO Now</span>
          </h2>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-12 text-white/90 leading-relaxed">
            Ready to turn your WooCommerce catalog into a sales machine?
          </p>
          
          <Button 
            asChild 
            size="lg" 
            className="bg-seo-accent hover:bg-seo-accent/90 text-white py-6 px-10 text-lg font-semibold rounded-2xl transform hover:scale-105 transition-all duration-200 shadow-2xl hover:shadow-seo-accent/25 group"
          >
            <Link to="/register" className="flex items-center">
              <CheckCircle className="mr-3 h-6 w-6" />
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FinalCTASection;
