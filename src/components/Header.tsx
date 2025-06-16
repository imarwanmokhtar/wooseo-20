
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Zap, User, LogOut, Settings, CreditCard, ChevronDown, Download, CheckCircle, Users } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Header = () => {
  const { user, signOut, credits } = useAuth();
  const location = useLocation();

  const scrollToPricing = () => {
    if (location.pathname === '/') {
      // If we're on the home page, scroll to pricing section
      const pricingSection = document.getElementById('pricing');
      if (pricingSection) {
        pricingSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // If we're on another page, navigate to home and then scroll
      window.location.href = '/#pricing';
    }
  };

  const scrollToWhyUs = () => {
    if (location.pathname === '/') {
      // Try to find the why-us section by ID first
      const whyUsSection = document.getElementById('why-us');
      if (whyUsSection) {
        whyUsSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // If we're on another page, navigate to home and then scroll
      window.location.href = '/#why-us';
    }
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
      <div className="container mx-auto py-4 px-4 flex items-center justify-between">
        <Link to="/" className="flex items-center group">
          <div className="bg-gradient-to-r from-seo-primary to-seo-secondary p-2 rounded-xl mr-3 group-hover:scale-110 transition-transform duration-200">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-2xl font-display font-bold bg-gradient-to-r from-seo-primary to-seo-secondary bg-clip-text text-transparent">
            wooSEO
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8">
          <button 
            onClick={scrollToPricing}
            className="text-gray-700 hover:text-seo-primary transition-colors font-medium cursor-pointer"
          >
            Pricing
          </button>
          <button 
            onClick={scrollToWhyUs}
            className="text-gray-700 hover:text-seo-primary transition-colors font-medium cursor-pointer"
          >
            Why Us
          </button>
          <Link 
            to="/blog" 
            className="text-gray-700 hover:text-seo-primary transition-colors font-medium"
          >
            Blog
          </Link>
          <Link 
            to="/affiliate" 
            className="text-gray-700 hover:text-seo-primary transition-colors font-medium"
          >
            Affiliates
          </Link>
          
          {/* Tools Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="text-gray-700 hover:text-seo-primary transition-colors font-medium flex items-center gap-1">
                Tools
                <ChevronDown className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white border shadow-lg">
              <DropdownMenuItem asChild>
                <Link to="/products-extractor" className="cursor-pointer w-full flex items-center">
                  <Download className="h-4 w-4 mr-2" />
                  Products Extractor
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/content-health" className="cursor-pointer w-full flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Content Health Analysis
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="hidden md:flex items-center bg-gradient-to-r from-seo-accent/10 to-seo-primary/10 rounded-xl px-4 py-2 border border-seo-accent/20 hover:border-seo-accent/40 transition-colors">
                <CreditCard className="h-4 w-4 text-seo-primary mr-2" />
                <span className="text-sm font-semibold text-seo-primary">{credits} credits</span>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-seo-primary/10 transition-colors">
                    <User className="h-5 w-5" />
                    <span className="sr-only">User menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white border shadow-lg">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium truncate">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="cursor-pointer w-full">
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/affiliate" className="cursor-pointer w-full">
                      <Users className="h-4 w-4 mr-2" />
                      Affiliate Program
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/products-extractor" className="cursor-pointer w-full">
                      Products Extractor
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/blog" className="cursor-pointer w-full">
                      Blog
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="cursor-pointer w-full">
                      <Settings className="h-4 w-4 mr-2" />
                      Account Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="cursor-pointer text-red-600">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex gap-3">
              <Button asChild variant="ghost" className="hover:bg-seo-primary/10 transition-colors">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild className="bg-gradient-to-r from-seo-primary to-seo-secondary hover:from-seo-primary/90 hover:to-seo-secondary/90 transition-all duration-200 transform hover:scale-105">
                <Link to="/register">Sign up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
