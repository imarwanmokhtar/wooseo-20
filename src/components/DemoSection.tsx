
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const DemoSection = () => {
  return (
    <section className="py-24 bg-gradient-to-br from-seo-primary/5 to-seo-secondary/5 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-8 text-gray-900">
            What If You Could Transform <span className="text-seo-primary">This...</span>
          </h2>
        </div>
        
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 mb-12">
          {/* Before */}
          <div className="bg-red-50 rounded-2xl p-8 border-2 border-red-200 animate-fade-in">
            <div className="bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm font-semibold mb-6 inline-block">
              BEFORE
            </div>
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg border border-red-200">
                <h4 className="font-semibold text-gray-900 mb-2">Product Title:</h4>
                <p className="text-gray-600">Blue Widget</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-red-200">
                <h4 className="font-semibold text-gray-900 mb-2">Description:</h4>
                <p className="text-gray-400 italic">Lorem ipsum dolor sit amet...</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-red-200">
                <h4 className="font-semibold text-gray-900 mb-2">Meta Description:</h4>
                <p className="text-gray-400 italic">Empty</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-red-200">
                <h4 className="font-semibold text-gray-900 mb-2">Alt Text:</h4>
                <p className="text-gray-400 italic">image1.jpg</p>
              </div>
            </div>
          </div>
          
          {/* After */}
          <div className="bg-green-50 rounded-2xl p-8 border-2 border-green-200 animate-fade-in">
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold mb-6 inline-block">
              AFTER
            </div>
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-gray-900 mb-2">Product Title:</h4>
                <p className="text-gray-900">Premium Blue Widget - Enhanced Performance & Style</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-gray-900 mb-2">Description:</h4>
                <p className="text-gray-700">Transform your workflow with our premium blue widget, engineered for maximum efficiency and modern aesthetics...</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-gray-900 mb-2">Meta Description:</h4>
                <p className="text-gray-700">Discover the premium blue widget that combines performance and style. Shop now for enhanced productivity and modern design.</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-gray-900 mb-2">Alt Text:</h4>
                <p className="text-gray-700">Premium blue widget with modern design for enhanced performance</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <Button 
            asChild 
            size="lg" 
            className="bg-gradient-to-r from-seo-accent to-seo-primary hover:from-seo-accent/90 hover:to-seo-primary/90 text-white py-6 px-10 text-lg font-semibold rounded-2xl transform hover:scale-105 transition-all duration-200 shadow-2xl"
          >
            <Link to="/register" className="flex items-center">
              Generate 3 Products for Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default DemoSection;
