
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Sparkles, ArrowRight, CheckCircle, Shield } from 'lucide-react';

const HeroSection = () => {
  const { user } = useAuth();

  const trustTags = [
    "Supports GPT-4o & GPT-4o-mini",
    "No Plugin Required", 
    "SEO Optimized by Default"
  ];

  return (
    <header className="relative bg-gradient-to-br from-seo-primary via-seo-secondary to-seo-primary/80 text-white overflow-hidden">
      {/* SEO Plugin Support Badge */}
      <div className="absolute top-6 left-6 z-10">
        <div className="inline-flex items-center bg-white/15 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30 animate-scale-in">
          <Shield className="h-4 w-4 mr-2 text-seo-accent" />
          <span className="text-sm font-medium text-white/95">Supporting RankMath, YoastSEO, AIOSEO</span>
        </div>
      </div>

      {/* Background effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-seo-accent/20 rounded-full blur-3xl animate-bounce"></div>
      
      <div className="container mx-auto py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center animate-fade-in">
          {/* SEO Badge */}
          <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 mb-8 border border-white/20 animate-scale-in">
            <Sparkles className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">AI-Powered Content Generation</span>
          </div>
          
          {/* Main Headlines */}
          <h1 className="text-5xl md:text-7xl font-display font-extrabold tracking-tight mb-8 leading-tight animate-fade-in">
            <span className="block">Smarter WooCommerce Content</span>
            <span className="block">in <span className="text-seo-accent">Seconds.</span></span>
            <span className="block text-3xl md:text-4xl mt-4 font-semibold">No Guesswork. No Overpaying.</span>
          </h1>
          
          {/* Subheadline */}
          <p className="text-xl md:text-2xl max-w-4xl mx-auto mb-12 text-white/90 leading-relaxed animate-fade-in">
            AI-powered product descriptions, meta tags, and alt text – fully customized, lightning fast, and priced to scale.
          </p>
          
          {/* CTA Button */}
          <div className="mb-12 animate-fade-in">
            <Button 
              asChild 
              size="lg" 
              className="bg-seo-accent hover:bg-seo-accent/90 text-white py-6 px-10 text-lg font-semibold rounded-2xl transform hover:scale-105 transition-all duration-200 shadow-2xl hover:shadow-seo-accent/25 group"
            >
              <Link to={user ? "/dashboard" : "/register"} className="flex items-center">
                👉 Start Free – No Card Needed
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
          
          {/* Trust Tags */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-16">
            {trustTags.map((tag, index) => (
              <div key={index} className="flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20 animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <CheckCircle className="h-4 w-4 mr-2 text-seo-accent" />
                <span className="text-sm font-medium text-white/90">{tag}</span>
              </div>
            ))}
          </div>
          
          {/* SEO Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            <div className="text-center animate-scale-in">
              <div className="text-3xl font-bold text-seo-accent">10K+</div>
              <div className="text-white/80">Products Optimized</div>
            </div>
            <div className="text-center animate-scale-in">
              <div className="text-3xl font-bold text-seo-accent">90+</div>
              <div className="text-white/80">SEO Score</div>
            </div>
            <div className="text-center animate-scale-in">
              <div className="text-3xl font-bold text-seo-accent">40%</div>
              <div className="text-white/80">Traffic Increase</div>
            </div>
            <div className="text-center animate-scale-in">
              <div className="text-3xl font-bold text-seo-accent">2 Min</div>
              <div className="text-white/80">Setup Time</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeroSection;
