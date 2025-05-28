
import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { verifyPayment } from '@/services/stripeService';
import { toast } from 'sonner';

const PaymentSuccess = () => {
  const { refreshCredits } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creditsAdded, setCreditsAdded] = useState<number>(0);
  const hasVerified = useRef(false);

  useEffect(() => {
    const confirmPayment = async () => {
      // Prevent multiple calls
      if (hasVerified.current) {
        return;
      }
      hasVerified.current = true;

      try {
        console.log('Confirming payment on success page...');
        setIsVerifying(true);
        setError(null);
        
        // Get session_id from URL params
        const sessionId = searchParams.get('session_id');
        console.log('Session ID from URL:', sessionId);
        
        if (!sessionId) {
          setError('No session ID found in URL');
          return;
        }
        
        // Call payment verification with session ID
        const result = await verifyPayment(sessionId);
        console.log('Payment verification result:', result);
        
        if (result.success) {
          setCreditsAdded(result.credits_added || 0);
          
          // Only show success message if credits were actually added
          if (result.credits_added > 0) {
            toast.success(`Successfully added ${result.credits_added} credits to your account!`);
          } else {
            toast.info('Payment already processed. No additional credits added.');
          }
          
          // Refresh credits to get updated value
          await refreshCredits();
        } else {
          setError('Payment verification failed. Please contact support if this persists.');
          toast.error('Payment verification failed');
        }
      } catch (error) {
        console.error('Error confirming payment:', error);
        setError('There was an issue verifying your payment. Please contact support if this persists.');
        toast.error('Error verifying payment. Please contact support.');
      } finally {
        setIsVerifying(false);
      }
    };

    confirmPayment();
  }, [refreshCredits, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto bg-green-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
            {isVerifying ? (
              <Loader2 className="h-8 w-8 text-green-600 animate-spin" />
            ) : error ? (
              <div className="h-8 w-8 text-red-600">⚠️</div>
            ) : (
              <CheckCircle className="h-8 w-8 text-green-600" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {isVerifying ? 'Verifying Payment...' : error ? 'Payment Issue' : 'Payment Successful!'}
          </CardTitle>
          <CardDescription>
            {isVerifying ? 'Please wait while we verify your payment' : error ? 'There was an issue with your payment' : 'Thank you for your purchase'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="text-center">
          {error ? (
            <div className="space-y-2">
              <p className="text-red-600 mb-4">{error}</p>
              <p className="text-sm text-gray-500">
                If you were charged but don't see your credits, please contact our support team.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="mb-4">
                {isVerifying 
                  ? 'We are verifying your payment and updating your account...'
                  : creditsAdded > 0 
                    ? `${creditsAdded} credits have been added to your account and are ready to use.`
                    : 'Your payment has been processed successfully.'
                }
              </p>
              {!isVerifying && (
                <p className="text-sm text-gray-500">
                  You will receive a receipt via email shortly.
                </p>
              )}
            </div>
          )}
        </CardContent>
        
        {!isVerifying && (
          <CardFooter className="flex flex-col space-y-3">
            <Button className="w-full" onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/">
                Return to Home
              </Link>
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default PaymentSuccess;
