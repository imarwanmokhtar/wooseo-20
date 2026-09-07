
import React from 'react';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: "Sarah Chen",
    role: "E-commerce Manager",
    company: "TechGear Store",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b789?w=150&h=150&fit=crop&crop=face",
    content: "wooSEO transformed our product descriptions! Our search rankings improved by 40% within just 2 months. The AI generates content that actually converts.",
    rating: 5
  },
  {
    name: "Marcus Rodriguez",
    role: "Store Owner",
    company: "Urban Fashion Hub",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    content: "I was spending hours writing product descriptions. Now I generate professional SEO content in minutes. My organic traffic increased by 65%!",
    rating: 5
  },
  {
    name: "Emma Thompson",
    role: "Digital Marketing Specialist",
    company: "Home & Garden Co",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    content: "The RankMath integration is perfect. Our products now consistently score 90+ in SEO. The AI understands our brand voice and creates engaging content.",
    rating: 5
  }
];

const Testimonials = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-seo-light via-white to-seo-primary/5 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-10 left-10 w-32 h-32 bg-seo-accent/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-seo-secondary/10 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl font-display font-bold mb-4 bg-gradient-to-r from-seo-primary to-seo-secondary bg-clip-text text-transparent">
            Loved by Store Owners Worldwide
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of WooCommerce store owners who've transformed their SEO with wooSEO
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 group animate-scale-in"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className="flex items-center mb-6">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name}
                  className="w-16 h-16 rounded-full object-cover mr-4 ring-4 ring-seo-accent/20 group-hover:ring-seo-accent/40 transition-all duration-300"
                />
                <div>
                  <h4 className="font-semibold text-gray-900 font-display">{testimonial.name}</h4>
                  <p className="text-seo-primary font-medium">{testimonial.role}</p>
                  <p className="text-gray-500 text-sm">{testimonial.company}</p>
                </div>
              </div>
              
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star 
                    key={i} 
                    className="w-5 h-5 text-seo-orange fill-current"
                  />
                ))}
              </div>
              
              <div className="relative">
                <Quote className="absolute -top-2 -left-2 w-8 h-8 text-seo-accent/30" />
                <p className="text-gray-700 italic leading-relaxed pl-6">
                  "{testimonial.content}"
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
