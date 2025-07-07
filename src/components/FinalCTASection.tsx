
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';

const FinalCTASection = () => {
  return (
    <section className="py-24 bg-gradient-to-br from-[#1e40af] via-[#3b82f6] to-[#1d4ed8] text-white relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#A1E887]/20 rounded-full blur-3xl animate-bounce"></div>
      
      <div className="container mx-auto px-4 relative">
        <div className="text-center animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 leading-tight">
            Start Saving Time and <span className="text-[#A1E887]">Ranking Higher</span> — Today
          </h2>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-12 text-white/90 leading-relaxed">
            Ready to transform your WooCommerce catalog into a sales machine?
          </p>
          
          <Link to="/register">
            <Button 
              size="lg" 
              className="bg-[#A1E887] text-black hover:bg-[#A1E887]/90 font-semibold px-8 py-4 text-lg rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Get started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FinalCTASection;
