
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { createSubscription } from '@/services/stripeService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Coins } from 'lucide-react';

interface CreditPurchaseProps {
  onPurchaseComplete?: () => void;
}

const CreditPurchase: React.FC<CreditPurchaseProps> = ({ onPurchaseComplete }) => {
  const [isProcessing, setIsProcessing] = useState<{ [key: string]: boolean }>({
    '100': false,
    '500': false,
    '1000': false,
  });
  const { user } = useAuth();

  const handlePurchase = async (creditPackage: '100' | '500' | '1000') => {
    if (!user) {
      toast.error('Please log in to purchase credits');
      return;
    }

    setIsProcessing(prev => ({ ...prev, [creditPackage]: true }));
    
    try {
      const checkoutUrl = await createSubscription(creditPackage);
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error('Error creating subscription:', error);
      toast.error('Failed to initiate payment process. Please try again.');
      setIsProcessing(prev => ({ ...prev, [creditPackage]: false }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-6 hover:shadow-md transition-shadow">
          <div className="flex flex-col h-full">
            <div className="mb-4">
              <div className="bg-blue-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-3">
                <Coins className="h-6 w-6 text-seo-primary" />
              </div>
              <h3 className="text-lg font-medium">100 Credits</h3>
              <div className="text-2xl font-bold mt-2 mb-1">$10</div>
              <div className="text-sm text-gray-500 mb-4">$0.10 per product</div>
            </div>
            
            <div className="mt-auto">
              <Button
                onClick={() => handlePurchase('100')}
                className="w-full"
                disabled={isProcessing['100']}
              >
                {isProcessing['100'] ? 'Processing...' : 'Purchase'}
              </Button>
            </div>
          </div>
        </Card>
        
        <Card className="p-6 border-seo-primary border-2 hover:shadow-md transition-shadow relative">
          <div className="absolute -top-3 left-0 right-0 flex justify-center">
            <span className="bg-seo-primary text-white px-3 py-1 text-xs font-medium rounded-full">
              MOST POPULAR
            </span>
          </div>
          
          <div className="flex flex-col h-full">
            <div className="mb-4">
              <div className="bg-blue-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-3">
                <Coins className="h-6 w-6 text-seo-primary" />
              </div>
              <h3 className="text-lg font-medium">500 Credits</h3>
              <div className="text-2xl font-bold mt-2 mb-1">$40</div>
              <div className="text-sm text-gray-500 mb-1">$0.08 per product</div>
              <div className="text-sm text-green-600 font-medium">20% savings</div>
            </div>
            
            <div className="mt-auto">
              <Button
                onClick={() => handlePurchase('500')}
                className="w-full bg-seo-accent hover:bg-seo-accent/90"
                disabled={isProcessing['500']}
              >
                {isProcessing['500'] ? 'Processing...' : 'Purchase'}
              </Button>
            </div>
          </div>
        </Card>
        
        <Card className="p-6 hover:shadow-md transition-shadow">
          <div className="flex flex-col h-full">
            <div className="mb-4">
              <div className="bg-blue-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-3">
                <Coins className="h-6 w-6 text-seo-primary" />
              </div>
              <h3 className="text-lg font-medium">1000 Credits</h3>
              <div className="text-2xl font-bold mt-2 mb-1">$70</div>
              <div className="text-sm text-gray-500 mb-1">$0.07 per product</div>
              <div className="text-sm text-green-600 font-medium">30% savings</div>
            </div>
            
            <div className="mt-auto">
              <Button
                onClick={() => handlePurchase('1000')}
                className="w-full"
                disabled={isProcessing['1000']}
              >
                {isProcessing['1000'] ? 'Processing...' : 'Purchase'}
              </Button>
            </div>
          </div>
        </Card>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg border text-sm">
        <h4 className="font-medium mb-2">What can I do with credits?</h4>
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          <li>Generate SEO-optimized product descriptions</li>
          <li>Create compelling meta titles and descriptions</li>
          <li>Generate alt text for product images</li>
          <li>Each credit allows you to optimize one product</li>
          <li>Credits never expire</li>
        </ul>
      </div>
    </div>
  );
};

export default CreditPurchase;
