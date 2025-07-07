import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Zap, User, LogOut, Settings, CreditCard, ChevronDown, Edit, Download, CheckCircle } from 'lucide-react';
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

  // Determine if we should show the white header
  const isLandingPage = location.pathname === '/';
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const shouldShowWhiteHeader = !isLandingPage && !isAuthPage;

  const scrollToPricing = () => {
    if (location.pathname === '/') {
      const pricingSection = document.getElementById('pricing');
      if (pricingSection) {
        pricingSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.location.href = '/#pricing';
    }
  };

  const scrollToFAQ = () => {
    if (location.pathname === '/') {
      const faqSection = document.querySelector('.faq-section');
      if (faqSection) {
        faqSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.location.href = '/#faq';
    }
  };

  return (
    <header className={`${shouldShowWhiteHeader ? 'relative bg-white shadow-sm' : 'absolute top-0 left-0 right-0 bg-transparent'} z-50`}>
      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <Link to="/" className="flex items-center group">
          <div className={`${shouldShowWhiteHeader ? 'bg-[#6C3EF4]' : 'bg-white'} p-2.5 rounded-2xl mr-3 group-hover:scale-110 transition-transform duration-200 shadow-lg`}>
            <Zap className={`h-6 w-6 ${shouldShowWhiteHeader ? 'text-white' : 'text-[#1e40af]'}`} />
          </div>
          <span className={`text-2xl font-display font-bold ${shouldShowWhiteHeader ? 'text-[#6C3EF4]' : 'text-white'}`}>
            wooSEO
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8">
          <button 
            onClick={scrollToPricing}
            className={`${shouldShowWhiteHeader ? 'text-gray-600 hover:text-[#6C3EF4]' : 'text-white/90 hover:text-white'} transition-colors font-medium cursor-pointer`}
          >
            Pricing
          </button>
          <button 
            onClick={scrollToFAQ}
            className={`${shouldShowWhiteHeader ? 'text-gray-600 hover:text-[#6C3EF4]' : 'text-white/90 hover:text-white'} transition-colors font-medium cursor-pointer`}
          >
            FAQ
          </button>
          <Link 
            to="/docs" 
            className={`${shouldShowWhiteHeader ? 'text-gray-600 hover:text-[#6C3EF4]' : 'text-white/90 hover:text-white'} transition-colors font-medium`}
          >
            Docs
          </Link>
          
          {/* Products Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={`${shouldShowWhiteHeader ? 'text-gray-600 hover:text-[#6C3EF4]' : 'text-white/90 hover:text-white'} transition-colors font-medium flex items-center gap-1`}>
                Products
                <ChevronDown className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white border shadow-lg z-50">
              <DropdownMenuItem asChild>
                <Link to="/bulk-editor" className="cursor-pointer w-full flex items-center">
                  <Edit className="h-4 w-4 mr-2" />
                  Bulk Editor
                </Link>
              </DropdownMenuItem>
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
              <div className={`hidden md:flex items-center ${shouldShowWhiteHeader ? 'bg-gray-100 border border-gray-200' : 'bg-white/10 backdrop-blur-sm border border-white/20'} rounded-xl px-4 py-2`}>
                <CreditCard className={`h-4 w-4 ${shouldShowWhiteHeader ? 'text-[#6C3EF4]' : 'text-white'} mr-2`} />
                <span className={`text-sm font-semibold ${shouldShowWhiteHeader ? 'text-[#6C3EF4]' : 'text-white'}`}>{credits} credits</span>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className={`rounded-full ${shouldShowWhiteHeader ? 'hover:bg-gray-100 text-[#6C3EF4]' : 'hover:bg-white/10 text-white'} transition-colors`}>
                    <User className="h-5 w-5" />
                    <span className="sr-only">User menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white border shadow-lg z-50">
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
              <Button asChild variant="ghost" className={`${shouldShowWhiteHeader ? 'hover:bg-gray-100 text-[#6C3EF4]' : 'hover:bg-white/10 text-white'} transition-colors font-medium`}>
                <Link to="/login">Log In</Link>
              </Button>
              <Button asChild className="bg-[#A1E887] hover:bg-[#8BC34A] text-[#1F1F1F] px-6 py-2 rounded-full font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg">
                <Link to="/register">Get Started</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
