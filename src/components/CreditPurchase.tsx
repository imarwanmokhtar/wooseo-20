
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
    '50': false,
    '500': false,
    '1000': false,
  });
  const { user } = useAuth();

  const handlePurchase = async (creditPackage: '50' | '500' | '1000') => {
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

  const plans = [
    {
      name: "Starter",
      price: "$5",
      credits: "50",
      description: "Perfect for small stores getting started with SEO.",
      features: [
        "AI Content Generation",
        "Long & Short Descriptions",
        "Meta Title & Meta Description",
        "Image Alt Text",
        "Focus keywords",
        "Custom Prompt Editing",
        "Multi-store Support",
        "WooCommerce Store Integration",
        "Real-time Preview Before Applying",
        "Basic Support (Email)"
      ],
      popular: false,
      gradient: "from-seo-primary/10 to-seo-secondary/10",
      border: "border-seo-primary/20"
    },
    {
      name: "Growth",
      price: "$20",
      credits: "500",
      description: "For growing stores with more products to optimize.",
      features: [
        "Everything in Starter, plus:",
        "Multi-store Support",
        "Priority Support (Live Chat)",
        "Bulk Generation Tools",
        "Early Access to New Features"
      ],
      popular: true,
      gradient: "from-seo-accent/10 to-seo-primary/10",
      border: "border-seo-accent"
    },
    {
      name: "Scale",
      price: "$35",
      credits: "1000",
      description: "For large stores with extensive product catalogs.",
      features: [
        "Everything in Growth, plus:",
        "Multi-store Support",
        "Priority Support (Live Chat)"
      ],
      popular: false,
      gradient: "from-seo-secondary/10 to-seo-accent/10",
      border: "border-seo-secondary/20"
    }
  ];

  return (
    <div className="py-8">
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan, index) => (
          <div
            key={plan.name}
            className={`relative rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 ${plan.border} bg-gradient-to-br ${plan.gradient} animate-scale-in group flex flex-col h-full`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-seo-accent to-seo-primary text-white text-sm font-bold py-2 px-6 rounded-full shadow-lg">
                  MOST POPULAR
                </div>
              </div>
            )}
            <div className="text-center mb-8">
              <h3 className="text-2xl font-display font-bold mb-4 text-gray-900">{plan.name}</h3>
              <div className="text-5xl font-bold mb-2 text-gray-900">{plan.price}</div>
              <p className="text-gray-600 mb-6">{plan.description}</p>
              <div className="inline-flex items-center bg-white/50 rounded-full px-4 py-2 mb-6">
                <span className="font-semibold text-seo-primary">
                  {plan.credits} credits
                  {plan.name === "Scale" && <span className="text-seo-accent ml-1"></span>}
                </span>
              </div>
            </div>
            <ul className="space-y-4 mb-8 flex-grow">
              {plan.features.map((feature, featureIndex) => (
                <li key={featureIndex} className="flex items-start">
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
            <Button
              className={`w-full py-6 text-lg font-semibold rounded-2xl transition-all duration-300 transform group-hover:scale-105 ${plan.popular ? 'bg-gradient-to-r from-seo-accent to-seo-primary text-white' : 'bg-seo-primary text-white'}`}
              onClick={() => handlePurchase(plan.credits as '50' | '500' | '1000')}
              disabled={isProcessing[plan.credits]}
            >
              {isProcessing[plan.credits] ? 'Processing...' : 'Purchase'}
            </Button>
          </div>
        ))}
      </div>
      <div className="bg-gray-50 p-4 rounded-lg border text-sm mt-8">
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
