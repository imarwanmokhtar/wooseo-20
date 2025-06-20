
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle, FileText } from 'lucide-react';

const HeroSection = () => {
  const { user } = useAuth();

  const scrollToDemo = () => {
    const demoSection = document.getElementById('demo');
    if (demoSection) {
      demoSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative bg-gradient-to-br from-[#1e40af] via-[#3b82f6] to-[#1d4ed8] text-white overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-20 left-20 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#A1E887]/10 rounded-full blur-3xl animate-bounce"></div>
      
      {/* Main Content Section */}
      <div className="pt-32 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <div className="max-w-5xl mx-auto animate-fade-in">
            {/* Main Headlines */}
            <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight mb-8 leading-tight">
              Bulk Edit + AI-Powered SEO for WooCommerce — <span className="text-[#A1E887]">In One Click</span>
            </h1>
            
            {/* Subheadline */}
            <p className="text-xl md:text-2xl mb-12 text-white/90 leading-relaxed max-w-4xl mx-auto font-medium">
              Fix missing product data, generate SEO-optimized descriptions, and bulk edit thousands of products — faster than ever.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-20">
              <Button 
                asChild 
                size="lg" 
                className="bg-[#A1E887] hover:bg-[#8BC34A] text-[#1F1F1F] py-6 px-10 text-lg font-bold rounded-full transform hover:scale-105 transition-all duration-200 shadow-2xl hover:shadow-[#A1E887]/25"
              >
                <Link to={user ? "/dashboard" : "/register"} className="flex items-center">
                  Get Started
                  <CheckCircle className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <button
                onClick={scrollToDemo}
                className="text-white hover:text-[#A1E887] transition-colors font-medium text-lg underline underline-offset-4"
              >
                or try the demo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Live Demo Section */}
      <div id="demo" className="pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-6 text-white">
              Watch WooSEO in Action
            </h2>
            <p className="text-lg md:text-xl mb-8 text-white/80 leading-relaxed">
              See how fast you can go from incomplete listings to fully-optimized product pages with WooSEO.
            </p>
            
            {/* Demo Video/Image */}
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-2xl">
              <img 
                src="/lovable-uploads/0cd0c513-3f3f-47e1-b12c-43eff9f012c5.png" 
                alt="WooSEO Demo - Bulk Editor Stock and Price Management Interface"
                className="w-full h-auto rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
