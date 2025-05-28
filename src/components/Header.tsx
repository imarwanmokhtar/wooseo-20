
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Zap, User, LogOut, Settings, CreditCard } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Header = () => {
  const { user, signOut, credits } = useAuth();

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
                <DropdownMenuContent align="end" className="w-56">
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
