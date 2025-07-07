import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, ArrowRight, Zap, Edit, Crown } from 'lucide-react';

const PricingSection = () => {
  const [selectedCredits, setSelectedCredits] = useState('200');
  const [selectedBulkPlan, setSelectedBulkPlan] = useState('lifetime'); // Changed default to lifetime

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
      hasSelector: true
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
      hasSelector: true,
      isLimited: selectedBulkOption.isLimited
    }
  ];

  return (
    <section id="pricing" className="py-24 bg-[#F8F9FB] relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-20 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 text-[#1F1F1F]">
            Simple, Flexible Pricing
          </h2>
          <p className="text-xl text-[#6B6B6B] max-w-3xl mx-auto">
            Choose the plan that fits your needs. No hidden fees, no surprises.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
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
                <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-r ${plan.name === 'AI SEO Generator' ? 'from-[#6C3EF4] to-[#7C4DFF]' : plan.gradient.replace('from-[#6C3EF4]/10 to-[#7C4DFF]/10', 'from-[#6C3EF4]/10 to-[#7C4DFF]/10')} rounded-2xl flex items-center justify-center`}>
                  <plan.icon className={`h-8 w-8 ${plan.name === 'AI SEO Generator' ? 'text-white' : plan.name === 'Unlimited Bulk Editor' && selectedBulkPlan === 'lifetime' ? 'text-[#FFD700]' : 'text-[#6C3EF4]'}`} />
                </div>
                <h3 className="text-2xl font-display font-bold mb-4 text-[#1F1F1F]">{plan.name}</h3>
                
                {plan.hasSelector && plan.name === "AI SEO Generator" && (
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

                {plan.hasSelector && plan.name === "Unlimited Bulk Editor" && (
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
                {!plan.hasSelector && (
                  <p className="text-[#6B6B6B] mb-6">{plan.description}</p>
                )}
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
                asChild
              >
                <Link to="/register" className="flex items-center justify-center">
                  Start now
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
