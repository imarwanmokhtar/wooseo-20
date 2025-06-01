
import React from 'react';
import { FileText, Tag, BarChart3 } from 'lucide-react';

const FeaturesSection = () => {
  return (
    <section id="woocommerce-seo-features" className="py-24 bg-white relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-20 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 bg-gradient-to-r from-seo-primary to-seo-secondary bg-clip-text text-transparent">
            Professional WooCommerce SEO Tools for E-commerce Success
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to dominate search engine results and drive sustainable organic traffic to your online store
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
          <div className="group text-center animate-fade-in hover:transform hover:-translate-y-2 transition-all duration-300">
            <div className="bg-gradient-to-br from-seo-primary/10 to-seo-secondary/10 p-6 rounded-3xl mb-6 w-20 h-20 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-seo-primary/20">
              <FileText className="h-10 w-10 text-seo-primary" />
            </div>
            <h3 className="text-2xl font-display font-semibold mb-4 text-gray-900">AI SEO Content Generator</h3>
            <p className="text-gray-600 text-lg leading-relaxed">
              Create engaging product descriptions and SEO metadata with our advanced AI content generator that understands your brand voice and optimizes for search engines.
            </p>
          </div>
          
          <div className="group text-center animate-fade-in hover:transform hover:-translate-y-2 transition-all duration-300">
            <div className="bg-gradient-to-br from-seo-accent/10 to-seo-primary/10 p-6 rounded-3xl mb-6 w-20 h-20 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-seo-accent/20">
              <Tag className="h-10 w-10 text-seo-accent" />
            </div>
            <h3 className="text-2xl font-display font-semibold mb-4 text-gray-900">WooCommerce SEO Integration</h3>
            <p className="text-gray-600 text-lg leading-relaxed">
              Seamlessly connect to your WooCommerce store to import products and push SEO-optimized content with just one click for maximum search visibility.
            </p>
          </div>
          
          <div className="group text-center animate-fade-in hover:transform hover:-translate-y-2 transition-all duration-300">
            <div className="bg-gradient-to-br from-seo-secondary/10 to-seo-accent/10 p-6 rounded-3xl mb-6 w-20 h-20 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-seo-secondary/20">
              <BarChart3 className="h-10 w-10 text-seo-secondary" />
            </div>
            <h3 className="text-2xl font-display font-semibold mb-4 text-gray-900">RankMath SEO Optimization</h3>
            <p className="text-gray-600 text-lg leading-relaxed">
              Generate content specifically optimized for RankMath plugin with guaranteed 90+ SEO scores for superior search engine performance.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
