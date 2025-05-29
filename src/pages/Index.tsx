import React from 'react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Zap, FileText, Tag, BarChart3, CheckCircle, ArrowRight, Sparkles, TrendingUp, Shield, Clock } from 'lucide-react';
import Testimonials from '@/components/Testimonials';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <header className="relative bg-gradient-to-br from-seo-primary via-seo-secondary to-seo-primary/80 text-white overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-seo-accent/20 rounded-full blur-3xl animate-bounce"></div>
        
        <div className="container mx-auto py-24 px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center animate-fade-in">
            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 mb-8 border border-white/20 animate-scale-in">
              <Sparkles className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">AI-Powered SEO Revolution</span>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-display font-extrabold tracking-tight mb-8 leading-tight animate-fade-in">
              <span className="block">Transform Your</span>
              <span className="block bg-gradient-to-r from-seo-accent to-white bg-clip-text text-transparent">
                WooCommerce SEO
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl max-w-4xl mx-auto mb-12 text-white/90 leading-relaxed animate-fade-in">
              Generate SEO-optimized product descriptions, meta titles, and more with our 
              AI assistant. Save time and boost your store's search visibility instantly.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-fade-in">
              <Button 
                asChild 
                size="lg" 
                className="bg-seo-accent hover:bg-seo-accent/90 text-white py-6 px-10 text-lg font-semibold rounded-2xl transform hover:scale-105 transition-all duration-200 shadow-2xl hover:shadow-seo-accent/25 group"
              >
                <Link to={user ? "/dashboard" : "/register"} className="flex items-center">
                  {user ? "Go to Dashboard" : "Start Optimizing Free"}
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              
              <Button 
                asChild 
                variant="outline" 
                size="lg" 
                className="border-2 border-white/30 text-gray-900 bg-white hover:bg-gray-50 py-6 px-8 text-lg rounded-2xl backdrop-blur-sm transition-all duration-200 hover:scale-105"
              >
                <Link to="#how-it-works" onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                }}>Learn More</Link>
              </Button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
              <div className="text-center animate-scale-in">
                <div className="text-3xl font-bold text-seo-accent">10K+</div>
                <div className="text-white/80">Products Optimized</div>
              </div>
              <div className="text-center animate-scale-in">
                <div className="text-3xl font-bold text-seo-accent">40%</div>
                <div className="text-white/80">Average Traffic Boost</div>
              </div>
              <div className="text-center animate-scale-in">
                <div className="text-3xl font-bold text-seo-accent">70+</div>
                <div className="text-white/80">RankMath Score</div>
              </div>
              <div className="text-center animate-scale-in">
                <div className="text-3xl font-bold text-seo-accent">2 Min</div>
                <div className="text-white/80">Setup Time</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-24 bg-white relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 bg-gradient-to-r from-seo-primary to-seo-secondary bg-clip-text text-transparent">
              Powerful SEO Tools for E-commerce
            </h2>
            <p id="how-it-works" className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to dominate search results and drive organic traffic
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
            <div className="group text-center animate-fade-in hover:transform hover:-translate-y-2 transition-all duration-300">
              <div className="bg-gradient-to-br from-seo-primary/10 to-seo-secondary/10 p-6 rounded-3xl mb-6 w-20 h-20 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-seo-primary/20">
                <FileText className="h-10 w-10 text-seo-primary" />
              </div>
              <h3 className="text-2xl font-display font-semibold mb-4 text-gray-900">AI-Generated Content</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Create engaging product descriptions and SEO metadata with our advanced AI that understands your brand voice.
              </p>
            </div>
            
            <div className="group text-center animate-fade-in hover:transform hover:-translate-y-2 transition-all duration-300">
              <div className="bg-gradient-to-br from-seo-accent/10 to-seo-primary/10 p-6 rounded-3xl mb-6 w-20 h-20 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-seo-accent/20">
                <Tag className="h-10 w-10 text-seo-accent" />
              </div>
              <h3 className="text-2xl font-display font-semibold mb-4 text-gray-900">WooCommerce Integration</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Seamlessly connect to your store to import products and push optimized content with just one click.
              </p>
            </div>
            
            <div className="group text-center animate-fade-in hover:transform hover:-translate-y-2 transition-all duration-300">
              <div className="bg-gradient-to-br from-seo-secondary/10 to-seo-accent/10 p-6 rounded-3xl mb-6 w-20 h-20 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-seo-secondary/20">
                <BarChart3 className="h-10 w-10 text-seo-secondary" />
              </div>
              <h3 className="text-2xl font-display font-semibold mb-4 text-gray-900">RankMath Optimized</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Generate content specifically optimized for RankMath plugin with 90+ SEO scores guaranteed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-gradient-to-br from-gray-50 to-seo-light relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 text-gray-900">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get started in minutes and see results immediately
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {[
              {
                step: 1,
                title: "Connect Your WooCommerce Store",
                description: "Enter your WooCommerce API details to securely connect your store in under 2 minutes.",
                icon: <Shield className="h-8 w-8" />,
                color: "from-seo-primary to-seo-secondary"
              },
              {
                step: 2,
                title: "Select Products to Optimize",
                description: "Browse your product catalog and choose which items need SEO enhancement.",
                icon: <Tag className="h-8 w-8" />,
                color: "from-seo-accent to-seo-primary"
              },
              {
                step: 3,
                title: "Generate AI Content",
                description: "Our AI creates optimized descriptions, meta titles, and focus keywords based on your products.",
                icon: <Zap className="h-8 w-8" />,
                color: "from-seo-secondary to-seo-accent"
              },
              {
                step: 4,
                title: "Push to Your Store",
                description: "Apply changes directly to your WooCommerce store.",
                icon: <TrendingUp className="h-8 w-8" />,
                color: "from-seo-orange to-seo-pink"
              }
            ].map((item, index) => (
              <div key={item.step} className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 transform hover:scale-105 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className={`bg-gradient-to-r ${item.color} p-4 rounded-2xl w-16 h-16 flex items-center justify-center text-white mb-6 shadow-lg transform hover:scale-110 transition-transform duration-300`}>
                  {item.icon}
                </div>
                <div className="flex items-center mb-4">
                  <div className={`bg-gradient-to-r ${item.color} text-white text-2xl font-bold rounded-full w-12 h-12 flex items-center justify-center mr-4 shadow-lg`}>
                    {item.step}
                  </div>
                  <h3 className="text-2xl font-display font-semibold text-gray-900">{item.title}</h3>
                </div>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-24 bg-white relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 bg-gradient-to-r from-seo-primary to-seo-secondary bg-clip-text text-transparent">
              Why Choose Us
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the difference with our AI-powered SEO solution
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: <Sparkles className="h-8 w-8" />,
                title: "Simple, Transparent Pricing",
                description: "Say goodbye to confusing subscriptions and surprise bills. Our flexible credit system means you only pay for what you use — and each credit includes the full cost of AI generation. No API keys, no hidden fees.",
                gradient: "from-seo-primary to-seo-secondary"
              },
              {
                icon: <TrendingUp className="h-8 w-8" />,
                title: "Unmatched Value Per Dollar",
                description: "With credits starting as low as $0.07 and no expiration dates, we offer industry-leading affordability without compromising quality. Our pricing beats subscription-based competitors and BYO-API plugins, making us the best value in the market.",
                gradient: "from-seo-accent to-seo-primary"
              },
              {
                icon: <FileText className="h-8 w-8" />,
                title: "Fully Customizable Prompts",
                description: "Tweak and control the AI's behavior without technical barriers. Whether you want a formal tone, specific keywords, or brand-aligned messaging, our editable prompt system puts you in charge.",
                gradient: "from-seo-secondary to-seo-accent"
              },
              {
                icon: <Shield className="h-8 w-8" />,
                title: "Works Outside WordPress",
                description: "Unlike plugin-only solutions, we're a dedicated SaaS built for WooCommerce — giving you a clean, fast interface without cluttering your WordPress dashboard. Easily connect multiple stores and manage everything from one place.",
                gradient: "from-seo-primary to-seo-secondary"
              },
              {
                icon: <Zap className="h-8 w-8" />,
                title: "Instant Integration",
                description: "Connect your WooCommerce store in minutes. No technical expertise required - we handle all the complex setup.",
                gradient: "from-seo-accent to-seo-primary"
              },
              {
                icon: <CheckCircle className="h-8 w-8" />,
                title: "Quality Guaranteed",
                description: "Every piece of content is optimized for RankMath with guaranteed 90+ SEO scores. Your success is our priority.",
                gradient: "from-seo-secondary to-seo-accent"
              }
            ].map((feature, index) => (
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

      {/* Testimonials */}
      <Testimonials />

      {/* Pricing */}
      <section className="py-24 bg-white relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20 animate-fade-in-up">
            <div className="flex items-center justify-center gap-4 mb-6">
              <h2 className="text-4xl md:text-5xl font-display font-bold bg-gradient-to-r from-seo-primary to-seo-secondary bg-clip-text text-transparent">
                Simple, Credit-Based Pricing
              </h2>
              <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm font-bold py-2 px-6 rounded-full shadow-lg">
                LIMITED OFFER for the first 100 users
              </div>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Pay only for what you use. Each credit generates content for one product with no monthly commitments.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: "Starter",
                price: "$5",
                credits: "200",
                description: "Perfect for small stores getting started with SEO.",
                features: [
                  "AI Content Generation",
                  "• Long & Short Descriptions",
                  "• Meta Title & Meta Description",
                  "• Image Alt Text",
                  "• Focus keywords",
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
                credits: "1000",
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
                credits: "2000", 
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
            ].map((plan, index) => (
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
                    <Clock className="h-4 w-4 mr-2 text-seo-primary" />
                    <span className="font-semibold text-seo-primary">
                      {plan.credits} credits
                      {plan.name === "Scale" && <span className="text-seo-accent ml-1"></span>}
                    </span>
                  </div>
                </div>
                
                <ul className="space-y-4 mb-8 flex-grow">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-seo-accent mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full py-6 text-lg font-semibold rounded-2xl transition-all duration-300 transform group-hover:scale-105 ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-seo-accent to-seo-primary hover:from-seo-accent/90 hover:to-seo-primary/90 text-white shadow-lg hover:shadow-seo-accent/25' 
                      : 'bg-gradient-to-r from-seo-primary to-seo-secondary hover:from-seo-primary/90 hover:to-seo-secondary/90 text-white'
                  }`}
                  asChild
                >
                  <Link to="/register" className="flex items-center justify-center">
                    {plan.popular ? `Choose ${plan.name}` : `Get ${plan.name}`}
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <div className="flex items-center mb-8 md:mb-0">
              <div className="bg-gradient-to-r from-seo-primary to-seo-secondary p-3 rounded-xl mr-4">
                <Zap className="h-7 w-7 text-white" />
              </div>
              <span className="text-3xl font-display font-bold bg-gradient-to-r from-seo-accent to-white bg-clip-text text-transparent">
                wooSEO
              </span>
            </div>
            <div className="flex gap-8 text-center md:text-left">
              <Link to="/" className="hover:text-seo-accent transition-colors font-medium">Home</Link>
              <Link to="/register" className="hover:text-seo-accent transition-colors font-medium">Sign Up</Link>
              <Link to="/login" className="hover:text-seo-accent transition-colors font-medium">Login</Link>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} wooSEO. All rights reserved. Transform your WooCommerce SEO today.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;