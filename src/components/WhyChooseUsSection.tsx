
import React from 'react';
import { Sparkles, TrendingUp, FileText, Shield, Zap, CheckCircle } from 'lucide-react';

const WhyChooseUsSection = () => {
  const features = [
    {
      icon: <Sparkles className="h-8 w-8" />,
      title: "Simple, Transparent SEO Pricing",
      description: "Say goodbye to confusing subscriptions and surprise bills. Our flexible credit system means you only pay for SEO content you generate — and each credit includes the full cost of AI optimization. No API keys, no hidden fees.",
      gradient: "from-seo-primary to-seo-secondary"
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Best Value SEO Content Generator",
      description: "With credits starting as low as $0.07 and no expiration dates, we offer industry-leading affordability for WooCommerce SEO optimization without compromising quality. Our pricing beats subscription-based competitors and BYO-API plugins.",
      gradient: "from-seo-accent to-seo-primary"
    },
    {
      icon: <FileText className="h-8 w-8" />,
      title: "Fully Customizable SEO Prompts",
      description: "Tweak and control the AI's SEO behavior without technical barriers. Whether you want formal tone, specific keywords, or brand-aligned messaging, our editable prompt system puts you in charge of content optimization.",
      gradient: "from-seo-secondary to-seo-accent"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Works Outside WordPress Dashboard",
      description: "Unlike plugin-only solutions, we're a dedicated SaaS built specifically for WooCommerce SEO — giving you a clean, fast interface without cluttering your WordPress dashboard. Easily connect multiple stores and manage everything from one place.",
      gradient: "from-seo-primary to-seo-secondary"
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Instant WooCommerce Integration",
      description: "Connect your WooCommerce store in minutes for immediate SEO benefits. No technical expertise required - we handle all the complex setup for search engine optimization.",
      gradient: "from-seo-accent to-seo-primary"
    },
    {
      icon: <CheckCircle className="h-8 w-8" />,
      title: "90+ RankMath SEO Score Guaranteed",
      description: "Every piece of content is professionally optimized for RankMath with guaranteed 90+ SEO scores. Your search engine success is our priority with proven results.",
      gradient: "from-seo-secondary to-seo-accent"
    }
  ];

  return (
    <section className="py-24 bg-white relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-20 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 bg-gradient-to-r from-seo-primary to-seo-secondary bg-clip-text text-transparent">
            Why Choose Our WooCommerce SEO Content Generator
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience the difference with our professional AI-powered SEO optimization solution for e-commerce success
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`bg-gradient-to-r ${feature.gradient} p-4 rounded-2xl w-16 h-16 flex items-center justify-center text-white mb-6 shadow-lg`}>
                {feature.icon}
              </div>
              <h3 className="text-2xl font-display font-semibold mb-4 text-gray-900">{feature.title}</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUsSection;
