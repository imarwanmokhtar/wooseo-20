
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Sparkles, ArrowRight } from 'lucide-react';

const HeroSection = () => {
  const { user } = useAuth();

  return (
    <header className="relative bg-gradient-to-br from-seo-primary via-seo-secondary to-seo-primary/80 text-white overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-seo-accent/20 rounded-full blur-3xl animate-bounce"></div>
      
      <div className="container mx-auto py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center animate-fade-in">
          {/* SEO Badge with Focus Keywords */}
          <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 mb-8 border border-white/20 animate-scale-in">
            <Sparkles className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">Ultimate AI SEO Content Generator</span>
          </div>
          
          {/* H1 with Primary Focus Keyword and Power Words */}
          <h1 className="text-6xl md:text-7xl font-display font-extrabold tracking-tight mb-8 leading-tight animate-fade-in">
            <span className="block">Best WooCommerce SEO</span>
            <span className="block bg-gradient-to-r from-seo-accent to-white bg-clip-text text-transparent">
              Content Generator Tool
            </span>
          </h1>
          
          {/* Optimized Meta Description Content */}
          <p className="text-xl md:text-2xl max-w-4xl mx-auto mb-12 text-white/90 leading-relaxed animate-fade-in">
            Generate professional SEO-optimized product descriptions, meta titles, and focus keywords with our 
            advanced AI content generator. Boost your WooCommerce store's search rankings and drive more organic traffic instantly.
          </p>
          
          {/* CTA Buttons with Action Keywords */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-fade-in">
            <Button 
              asChild 
              size="lg" 
              className="bg-seo-accent hover:bg-seo-accent/90 text-white py-6 px-10 text-lg font-semibold rounded-2xl transform hover:scale-105 transition-all duration-200 shadow-2xl hover:shadow-seo-accent/25 group"
            >
              <Link to={user ? "/dashboard" : "/register"} className="flex items-center">
                {user ? "Access Dashboard Now" : "Start Free SEO Optimization"}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            
            <Button 
              asChild 
              variant="outline" 
              size="lg" 
              className="border-2 border-white/30 text-gray-900 bg-white hover:bg-gray-50 py-6 px-8 text-lg rounded-2xl backdrop-blur-sm transition-all duration-200 hover:scale-105"
            >
              <Link to="#woocommerce-seo-features" onClick={(e) => {
                e.preventDefault();
                document.getElementById('woocommerce-seo-features')?.scrollIntoView({ behavior: 'smooth' });
              }}>Discover SEO Features</Link>
            </Button>
          </div>
          
          {/* SEO Stats with Keywords */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            <div className="text-center animate-scale-in">
              <div className="text-3xl font-bold text-seo-accent">10K+</div>
              <div className="text-white/80">Products SEO Optimized</div>
            </div>
            <div className="text-center animate-scale-in">
              <div className="text-3xl font-bold text-seo-accent">90+</div>
              <div className="text-white/80">RankMath SEO Score</div>
            </div>
            <div className="text-center animate-scale-in">
              <div className="text-3xl font-bold text-seo-accent">40%</div>
              <div className="text-white/80">Traffic Increase</div>
            </div>
            <div className="text-center animate-scale-in">
              <div className="text-3xl font-bold text-seo-accent">2 Min</div>
              <div className="text-white/80">Quick Setup</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeroSection;
