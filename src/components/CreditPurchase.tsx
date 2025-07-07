import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createSubscription } from '@/services/stripeService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { CheckCircle, ArrowRight, Zap, Edit, Crown } from 'lucide-react';

interface CreditPurchaseProps {
  onPurchaseComplete?: () => void;
}

const CreditPurchase: React.FC<CreditPurchaseProps> = ({ onPurchaseComplete }) => {
  const [isProcessing, setIsProcessing] = useState<{ [key: string]: boolean }>({
    'ai-generator': false,
    'bulk-editor-monthly': false,
    'bulk-editor-annual': false,
    'bulk-editor-lifetime': false,
  });
  const [selectedCredits, setSelectedCredits] = useState('200');
  const [selectedBulkPlan, setSelectedBulkPlan] = useState('lifetime'); // Changed default to lifetime
  const { user } = useAuth();

  const creditOptions = [
    { credits: '200', price: 20, pricePerProduct: 0.10 },
    { credits: '500', price: 40, pricePerProduct: 0.08 },
    { credits: '1000', price: 75, pricePerProduct: 0.075 }
  ];

  const bulkEditorPlans = [
    { id: 'monthly', name: 'Monthly', price: 9, period: '/month' },
    { id: 'annual', name: 'Annual', price: 29, period: '/year', savings: 'Save $79/year' },
    { id: 'lifetime', name: 'Lifetime', price: 99, period: 'one-time', savings: 'Limited to first 10 users', isLimited: true }
  ];

  const selectedOption = creditOptions.find(option => option.credits === selectedCredits) || creditOptions[0];
  const selectedBulkOption = bulkEditorPlans.find(plan => plan.id === selectedBulkPlan) || bulkEditorPlans[2]; // Default to lifetime (index 2)

  const handleAIPurchase = async () => {
    if (!user) {
      toast.error('Please log in to purchase credits');
      return;
    }
    setIsProcessing(prev => ({ ...prev, 'ai-generator': true }));
    try {
      const checkoutUrl = await createSubscription(selectedCredits as '200' | '500' | '1000');
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
    const processingKey = `bulk-editor-${selectedBulkPlan}`;
    setIsProcessing(prev => ({ ...prev, [processingKey]: true }));
    try {
      const checkoutUrl = await createSubscription(`bulk-editor-${selectedBulkPlan}` as any);
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error('Error creating subscription:', error);
      toast.error('Failed to initiate payment process. Please try again.');
      setIsProcessing(prev => ({ ...prev, [processingKey]: false }));
    }
  };

  const plans = [
    {
      name: "AI SEO Generator",
      price: `$${selectedOption.price}`,
      credits: `${selectedCredits} credits`,
      perProduct: `$${selectedOption.pricePerProduct.toFixed(3)} per product`,
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
      price: `$${selectedBulkOption.price}`,
      credits: selectedBulkOption.period,
      perProduct: selectedBulkOption.savings || "Unlimited edits",
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
      icon: selectedBulkPlan === 'lifetime' ? Crown : Edit,
      gradient: selectedBulkPlan === 'lifetime' ? "from-[#FFD700] to-[#FFA500]" : "from-[#A1E887] to-[#00C853]",
      border: selectedBulkPlan === 'lifetime' ? "border-[#FFD700]" : "border-[#A1E887]",
      onPurchase: handleBulkEditorPurchase,
      processingKey: `bulk-editor-${selectedBulkPlan}`,
      isLimited: selectedBulkOption.isLimited
    }
  ];

  return (
    <div className="py-8">
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
        {plans.map((plan, index) => (
          <div 
            key={plan.name}
            className={`relative rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 ${plan.border} bg-white animate-scale-in group flex flex-col h-full ${plan.isLimited ? 'ring-2 ring-orange-300 ring-opacity-50' : ''}`}
          >
            {plan.isLimited && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                  LIMITED OFFER
                </span>
              </div>
            )}
            
            <div className="text-center mb-8">
              <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-r ${plan.name === 'AI SEO Generator' ? 'from-[#6C3EF4] to-[#7C4DFF]' : 'from-[#6C3EF4]/10 to-[#7C4DFF]/10'} rounded-2xl flex items-center justify-center`}>
                <plan.icon className={`h-8 w-8 ${plan.name === 'AI SEO Generator' ? 'text-white' : plan.name === 'Unlimited Bulk Editor' && selectedBulkPlan === 'lifetime' ? 'text-[#FFD700]' : 'text-[#6C3EF4]'}`} />
              </div>
              <h3 className="text-2xl font-display font-bold mb-4 text-[#1F1F1F]">{plan.name}</h3>
              
              {plan.name === "AI SEO Generator" && (
                <div className="mb-6">
                  <p className="text-[#6B6B6B] mb-4">{plan.description}</p>
                  <Select value={selectedCredits} onValueChange={setSelectedCredits}>
                    <SelectTrigger className="w-full mb-4 bg-gray-50 border-gray-200">
                      <SelectValue placeholder="Select credits" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg">
                      {creditOptions.map((option) => (
                        <SelectItem 
                          key={option.credits} 
                          value={option.credits}
                          className="hover:bg-gray-100"
                        >
                          {option.credits} credits - ${option.price} (${option.pricePerProduct.toFixed(3)} per product)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {plan.name === "Unlimited Bulk Editor" && (
                <div className="mb-6">
                  <p className="text-[#6B6B6B] mb-4">{plan.description}</p>
                  <Select value={selectedBulkPlan} onValueChange={setSelectedBulkPlan}>
                    <SelectTrigger className="w-full mb-4 bg-gray-50 border-gray-200">
                      <SelectValue placeholder="Select plan" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg">
                      {bulkEditorPlans.map((option) => (
                        <SelectItem 
                          key={option.id} 
                          value={option.id}
                          className="hover:bg-gray-100"
                        >
                          {option.name} - ${option.price}{option.period}
                          {option.savings && (
                            <span className="text-green-600 ml-2">({option.savings})</span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="mb-4">
                <div className="text-5xl font-bold text-[#1F1F1F]">{plan.price}</div>
                <div className={`font-semibold ${plan.name === 'Unlimited Bulk Editor' && selectedBulkPlan === 'lifetime' ? 'text-[#FFD700]' : 'text-[#6C3EF4]'}`}>{plan.credits}</div>
              </div>
              <div className="text-[#6B6B6B] font-semibold mb-2">{plan.perProduct}</div>
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
              className={`w-full py-6 text-lg font-bold rounded-xl transition-all duration-300 transform group-hover:scale-105 text-white shadow-lg ${
                plan.name === 'Unlimited Bulk Editor' && selectedBulkPlan === 'lifetime' 
                  ? 'bg-gradient-to-r from-[#FFD700] to-[#FFA500] hover:from-[#FFC700] hover:to-[#FF9500] shadow-[#FFD700]/25' 
                  : 'bg-[#6C3EF4] hover:bg-[#512DA8] hover:shadow-[#6C3EF4]/25'
              }`}
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
