
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle, FileText, Play } from 'lucide-react';

const HeroSection = () => {
  const { user } = useAuth();

  const scrollToDemo = () => {
    const demoSection = document.getElementById('demo');
    if (demoSection) {
      demoSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="relative bg-gradient-to-br from-[#6C3EF4] via-[#7C4DFF] to-[#512DA8] text-white overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#A1E887]/20 rounded-full blur-3xl animate-bounce"></div>
      
      <div className="container mx-auto py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center animate-fade-in">
          {/* Main Headlines */}
          <h1 className="text-4xl md:text-6xl font-display font-extrabold tracking-tight mb-6 leading-tight max-w-5xl mx-auto">
            Bulk Edit + AI-Powered SEO for WooCommerce — <span className="text-[#A1E887]">In One Click</span>
          </h1>
          
          {/* Subheadline */}
          <p className="text-xl md:text-2xl mb-8 text-white/90 leading-relaxed max-w-4xl mx-auto">
            Fix missing product data, generate SEO-optimized descriptions, and bulk edit thousands of products — faster than ever.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button 
              asChild 
              size="lg" 
              className="bg-[#A1E887] hover:bg-[#8BC34A] text-[#1F1F1F] py-6 px-8 text-lg font-bold rounded-lg transform hover:scale-105 transition-all duration-200 shadow-2xl hover:shadow-[#A1E887]/25"
            >
              <Link to={user ? "/dashboard" : "/register"} className="flex items-center">
                <CheckCircle className="mr-2 h-5 w-5" />
                Start Free
              </Link>
            </Button>
            <Button 
              onClick={scrollToDemo}
              variant="outline"
              size="lg" 
              className="border-2 border-white text-white bg-transparent hover:bg-white hover:text-[#6C3EF4] py-6 px-8 text-lg font-bold rounded-lg transition-all duration-200 hover:scale-105"
            >
              <FileText className="mr-2 h-5 w-5" />
              See How It Works
            </Button>
          </div>

          {/* Live Demo Section */}
          <div id="demo" className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-white">
              Watch WooSEO in Action
            </h2>
            <p className="text-lg md:text-xl mb-8 text-white/90 leading-relaxed">
              See how fast you can go from incomplete listings to fully-optimized product pages with WooSEO.
            </p>
            
            {/* Demo Video/Image */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <img 
                src="/lovable-uploads/0cd0c513-3f3f-47e1-b12c-43eff9f012c5.png" 
                alt="WooSEO Demo - Bulk Editor Stock and Price Management Interface"
                className="w-full h-auto rounded-xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeroSection;
