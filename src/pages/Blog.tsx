import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';

// Mock blog posts - you can replace this with actual markdown files
const blogPosts = [
  {
    id: 'getting-started-with-wooseo',
    title: 'Getting Started with wooSEO: Transform Your WooCommerce Store',
    excerpt: 'Learn how to optimize your WooCommerce store with AI-powered SEO content generation and boost your search rankings.',
    date: '2024-01-15',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=300&fit=crop',
    slug: 'getting-started-with-wooseo'
  },
  {
    id: 'seo-best-practices-2024',
    title: 'SEO Best Practices for E-commerce in 2024',
    excerpt: 'Discover the latest SEO strategies and techniques that will help your online store rank higher and drive more organic traffic.',
    date: '2024-01-10',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=600&h=300&fit=crop',
    slug: 'seo-best-practices-2024'
  },
  {
    id: 'ai-content-generation-guide',
    title: 'The Complete Guide to AI Content Generation for Product Descriptions',
    excerpt: 'Master the art of creating compelling product descriptions using AI technology to increase conversions and improve SEO.',
    date: '2024-01-05',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&h=300&fit=crop',
    slug: 'ai-content-generation-guide'
  }
];

const Blog = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-seo-light via-white to-seo-primary/5">
      <Header />
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-6 bg-gradient-to-r from-seo-primary to-seo-secondary bg-clip-text text-transparent">
            wooSEO Blog
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Insights, tips, and guides to help you master SEO for your WooCommerce store
          </p>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {blogPosts.map((post) => (
            <article 
              key={post.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden group"
            >
              <div className="relative overflow-hidden">
                <img 
                  src={post.image} 
                  alt={post.title}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span className="mr-4">{new Date(post.date).toLocaleDateString()}</span>
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{post.readTime}</span>
                </div>
                
                <h2 className="text-xl font-display font-bold mb-3 text-gray-900 group-hover:text-seo-primary transition-colors">
                  {post.title}
                </h2>
                
                <p className="text-gray-600 mb-6 line-clamp-3">
                  {post.excerpt}
                </p>
                
                <Button 
                  asChild
                  variant="ghost" 
                  className="p-0 h-auto font-semibold text-seo-primary hover:text-seo-secondary transition-colors group"
                >
                  <Link to={`/blog/${post.slug}`} className="flex items-center">
                    Read More
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </article>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-seo-primary/10 to-seo-secondary/10 rounded-3xl p-8 max-w-2xl mx-auto border border-seo-primary/20">
            <h3 className="text-2xl font-display font-bold mb-4 text-gray-900">
              Ready to Optimize Your Store?
            </h3>
            <p className="text-gray-600 mb-6">
              Start generating professional SEO content for your WooCommerce store today.
            </p>
            <Button 
              asChild
              className="bg-gradient-to-r from-seo-primary to-seo-secondary hover:from-seo-primary/90 hover:to-seo-secondary/90"
            >
              <Link to="/register">Get Started Free</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;
