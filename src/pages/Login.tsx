
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const { signIn, forgotPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (forgotMode) {
        await forgotPassword(email);
      } else {
        await signIn(email, password);
      }
    } catch (error) {
      console.error('Authentication error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center group">
            <div className="bg-gradient-to-r from-[#6C3EF4] to-[#7C4DFF] p-2 rounded-xl mr-3 group-hover:scale-110 transition-transform duration-200">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-display font-bold bg-gradient-to-r from-[#6C3EF4] to-[#7C4DFF] bg-clip-text text-transparent">
              wooSEO
            </span>
          </Link>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>{forgotMode ? 'Reset Password' : 'Welcome Back'}</CardTitle>
            <CardDescription>
              {forgotMode 
                ? 'Enter your email and we\'ll send you a reset link' 
                : 'Sign in to your wooSEO account'}
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  disabled={isLoading}
                />
              </div>
              
              {!forgotMode && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Button 
                      type="button" 
                      variant="link" 
                      className="text-xs text-[#6C3EF4] hover:text-[#512DA8] p-0"
                      onClick={() => setForgotMode(true)}
                      disabled={isLoading}
                    >
                      Forgot password?
                    </Button>
                  </div>
                  <Input 
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full bg-[#6C3EF4] hover:bg-[#512DA8] text-white"
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : forgotMode ? 'Send Reset Link' : 'Sign In'}
              </Button>
              
              {forgotMode ? (
                <Button 
                  type="button" 
                  variant="link" 
                  className="text-[#6C3EF4] hover:text-[#512DA8]"
                  onClick={() => setForgotMode(false)}
                  disabled={isLoading}
                >
                  Back to login
                </Button>
              ) : (
                <div className="text-center text-sm">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-[#6C3EF4] hover:text-[#512DA8] font-medium hover:underline">
                    Sign up
                  </Link>
                </div>
              )}
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
