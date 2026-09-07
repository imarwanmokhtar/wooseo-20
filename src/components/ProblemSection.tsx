
import React from 'react';
import { AlertTriangle } from 'lucide-react';

const ProblemSection = () => {
  return (
    <section className="py-24 bg-gradient-to-br from-red-50 to-orange-50 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="inline-flex items-center bg-red-100 rounded-full px-6 py-3 mb-8 border border-red-200">
            <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
            <span className="text-red-600 font-semibold">The Hidden Problem</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-8 text-gray-900">
            Your Products Deserve Better Than <span className="text-red-600">"Lorem Ipsum"</span>
          </h2>
          <p className="text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
            Over 70% of WooCommerce stores have missing, duplicated, or weak product content – costing them visibility, conversions, and credibility. Writing unique SEO content manually is a pain. Hiring help is expensive. And plugins? Too complex, too limited.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
