
import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Mail, Users } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <div className="flex items-center mb-8 md:mb-0">
            <div className="bg-gradient-to-r from-seo-primary to-seo-secondary p-3 rounded-xl mr-4">
              <Zap className="h-7 w-7 text-white" />
            </div>
            <span className="text-3xl font-display font-bold bg-gradient-to-r from-seo-accent to-white bg-clip-text text-transparent">
              wooSEO
            </span>
          </div>
          <div className="flex gap-8 text-center md:text-left">
            <Link to="/" className="hover:text-seo-accent transition-colors font-medium">WooCommerce SEO Home</Link>
            <Link to="/register" className="hover:text-seo-accent transition-colors font-medium">Start SEO Optimization</Link>
            <Link to="/login" className="hover:text-seo-accent transition-colors font-medium">Login to Dashboard</Link>
            <Link to="/affiliate" className="hover:text-seo-accent transition-colors font-medium flex items-center gap-1">
              <Users className="h-4 w-4" />
              Affiliate Program
            </Link>
          </div>
        </div>
        
        <div className="text-center mb-8">
          <a 
            href="mailto:team@wooseos.com" 
            className="inline-flex items-center text-seo-accent hover:text-white transition-colors font-medium text-lg"
          >
            <Mail className="h-5 w-5 mr-2" />
            team@wooseos.com
          </a>
        </div>
        
        <div className="border-t border-gray-700 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} wooSEO - Professional WooCommerce SEO Content Generator. All rights reserved. Transform your e-commerce SEO today.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
