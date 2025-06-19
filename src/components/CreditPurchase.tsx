
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { createSubscription } from '@/services/stripeService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { CheckCircle, ArrowRight, Zap, Edit } from 'lucide-react';

interface CreditPurchaseProps {
  onPurchaseComplete?: () => void;
}

const CreditPurchase: React.FC<CreditPurchaseProps> = ({ onPurchaseComplete }) => {
  const [isProcessing, setIsProcessing] = useState<{ [key: string]: boolean }>({
    'ai-generator': false,
    'bulk-editor': false,
  });
  const { user } = useAuth();

  const handleAIPurchase = async () => {
    if (!user) {
      toast.error('Please log in to purchase credits');
      return;
    }
    setIsProcessing(prev => ({ ...prev, 'ai-generator': true }));
    try {
      const checkoutUrl = await createSubscription('200');
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error('Error creating subscription:', error);
      toast.error('Failed to initiate payment process. Please try again.');
      setIsProcessing(prev => ({ ...prev, 'ai-generator': false }));
    }
  };

  const handleBulkEditorPurchase = async () => {
    if (!user) {
      toast.error('Please log in to purchase subscription');
      return;
    }
    setIsProcessing(prev => ({ ...prev, 'bulk-editor': true }));
    try {
      // This will need to be implemented for subscription handling
      const checkoutUrl = await createSubscription('bulk-editor');
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error('Error creating subscription:', error);
      toast.error('Failed to initiate payment process. Please try again.');
      setIsProcessing(prev => ({ ...prev, 'bulk-editor': false }));
    }
  };

  const plans = [
    {
      name: "AI SEO Generator",
      price: "$20",
      credits: "200 credits",
      perProduct: "$0.10 per product",
      description: "Perfect for stores that need AI-powered SEO content.",
      features: [
        "1 credit = 1 product",
        "Includes all 5 SEO fields",
        "Long & short descriptions",
        "Meta titles & descriptions", 
        "Image alt text generation",
        "No API keys needed",
        "Pay-as-you-go"
      ],
      icon: Zap,
      gradient: "from-[#6C3EF4] to-[#7C4DFF]",
      border: "border-[#6C3EF4]",
      onPurchase: handleAIPurchase,
      processingKey: 'ai-generator'
    },
    {
      name: "Unlimited Bulk Editor", 
      price: "$9",
      credits: "/month",
      perProduct: "Unlimited edits",
      description: "For stores that need powerful bulk editing capabilities.",
      features: [
        "Edit unlimited products",
        "Unlimited connected stores",
        "Works with all product fields",
        "Prices, stock, descriptions",
        "SKUs, categories, tags",
        "Real-time WooCommerce sync",
        "Advanced filtering & search"
      ],
      icon: Edit,
      gradient: "from-[#A1E887] to-[#00C853]",
      border: "border-[#A1E887]",
      onPurchase: handleBulkEditorPurchase,
      processingKey: 'bulk-editor'
    }
  ];

  return (
    <div className="py-8">
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
        {plans.map((plan, index) => (
          <div 
            key={plan.name}
            className={`relative rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 ${plan.border} bg-white animate-scale-in group flex flex-col h-full`}
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-[#6C3EF4]/10 to-[#7C4DFF]/10 rounded-2xl flex items-center justify-center">
                <plan.icon className="h-8 w-8 text-[#6C3EF4]" />
              </div>
              <h3 className="text-2xl font-display font-bold mb-4 text-[#1F1F1F]">{plan.name}</h3>
              <div className="mb-4">
                <div className="text-5xl font-bold text-[#1F1F1F]">{plan.price}</div>
                <div className="text-[#6C3EF4] font-semibold">{plan.credits}</div>
              </div>
              <div className="text-[#6B6B6B] font-semibold mb-2">{plan.perProduct}</div>
              <p className="text-[#6B6B6B] mb-6">{plan.description}</p>
            </div>
            
            <ul className="space-y-4 mb-8 flex-grow">
              {plan.features.map((feature, featureIndex) => (
                <li key={featureIndex} className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-[#A1E887] mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-[#6B6B6B]">{feature}</span>
                </li>
              ))}
            </ul>
            
            <Button 
              className="w-full py-6 text-lg font-bold rounded-xl transition-all duration-300 transform group-hover:scale-105 bg-[#6C3EF4] hover:bg-[#512DA8] text-white shadow-lg hover:shadow-[#6C3EF4]/25"
              onClick={plan.onPurchase}
              disabled={isProcessing[plan.processingKey]}
            >
              {isProcessing[plan.processingKey] ? 'Processing...' : (
                <div className="flex items-center justify-center">
                  {plan.name === "AI SEO Generator" ? 'Purchase' : 'Subscribe'}
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </Button>
          </div>
        ))}
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg border text-sm mt-8">
        <h4 className="font-medium mb-2">What can I do with these plans?</h4>
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          <li><strong>AI SEO Generator:</strong> Generate SEO-optimized product descriptions, meta titles, meta descriptions, and alt text. Each credit optimizes one product.</li>
          <li><strong>Unlimited Bulk Editor:</strong> Edit unlimited products across all your stores with advanced filtering, search, and real-time sync.</li>
          <li>AI Generator credits never expire</li>
          <li>Bulk Editor subscription includes unlimited edits for connected stores</li>
        </ul>
      </div>
    </div>
  );
};

export default CreditPurchase;
