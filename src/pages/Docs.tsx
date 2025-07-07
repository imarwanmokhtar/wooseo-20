
import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ArrowRight, FileText, Code, Image as ImageIcon, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';

// Mock documentation sections - you can replace this with actual documentation
const docSections = [
  {
    id: 'getting-started',
    title: 'Getting Started with wooSEO',
    excerpt: 'Learn how to set up and configure wooSEO for your WooCommerce store in just a few minutes.',
    date: '2024-01-15',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=300&fit=crop',
    slug: 'getting-started',
    type: 'guide',
    icon: FileText
  },
  {
    id: 'api-reference',
    title: 'API Reference & Integration Guide',
    excerpt: 'Complete API documentation for integrating wooSEO with your custom applications and workflows.',
    date: '2024-01-10',
    readTime: '12 min read',
    image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=300&fit=crop',
    slug: 'api-reference',
    type: 'reference',
    icon: Code
  },
  {
    id: 'video-tutorials',
    title: 'Video Tutorials & Walkthrough',
    excerpt: 'Step-by-step video guides showing you how to maximize your results with wooSEO features.',
    date: '2024-01-05',
    readTime: '15 min watch',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&h=300&fit=crop',
    slug: 'video-tutorials',
    type: 'video',
    icon: Play
  },
  {
    id: 'best-practices',
    title: 'SEO Best Practices & Optimization Tips',
    excerpt: 'Advanced strategies and techniques to get the most out of your AI-generated product content.',
    date: '2024-01-01',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=600&h=300&fit=crop',
    slug: 'best-practices',
    type: 'guide',
    icon: ImageIcon
  }
];

const getTypeColor = (type: string) => {
  switch (type) {
    case 'guide': return 'bg-blue-100 text-blue-800';
    case 'reference': return 'bg-purple-100 text-purple-800';
    case 'video': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const Docs = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-seo-light via-white to-seo-primary/5">
      <Header />
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-6 bg-gradient-to-r from-seo-primary to-seo-secondary bg-clip-text text-transparent">
            wooSEO Documentation
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to know about using wooSEO to optimize your WooCommerce store
          </p>
        </div>

        {/* Documentation Sections Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {docSections.map((doc) => {
            const IconComponent = doc.icon;
            return (
              <article 
                key={doc.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden group"
              >
                <div className="relative overflow-hidden">
                  <img 
                    src={doc.image} 
                    alt={doc.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(doc.type)}`}>
                      {doc.type}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <IconComponent className="h-4 w-4 mr-2" />
                    <Calendar className="h-4 w-4 mr-1" />
                    <span className="mr-4">{new Date(doc.date).toLocaleDateString()}</span>
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{doc.readTime}</span>
                  </div>
                  
                  <h2 className="text-xl font-display font-bold mb-3 text-gray-900 group-hover:text-seo-primary transition-colors">
                    {doc.title}
                  </h2>
                  
                  <p className="text-gray-600 mb-6 line-clamp-3">
                    {doc.excerpt}
                  </p>
                  
                  <Button 
                    asChild
                    variant="ghost" 
                    className="p-0 h-auto font-semibold text-seo-primary hover:text-seo-secondary transition-colors group"
                  >
                    <Link to={`/docs/${doc.slug}`} className="flex items-center">
                      Read Documentation
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </div>
              </article>
            );
          })}
        </div>

        {/* Quick Links Section */}
        <div className="mt-16 bg-white rounded-3xl p-8 shadow-lg max-w-4xl mx-auto">
          <h3 className="text-2xl font-display font-bold mb-6 text-center text-gray-900">
            Quick Access
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <Link to="/docs/getting-started" className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-all group">
              <FileText className="h-8 w-8 text-blue-600 mb-3" />
              <h4 className="font-semibold text-gray-900 mb-2">Setup Guide</h4>
              <p className="text-sm text-gray-600">Get started in minutes</p>
            </Link>
            <Link to="/docs/api-reference" className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 transition-all group">
              <Code className="h-8 w-8 text-purple-600 mb-3" />
              <h4 className="font-semibold text-gray-900 mb-2">API Reference</h4>
              <p className="text-sm text-gray-600">Technical documentation</p>
            </Link>
            <Link to="/docs/video-tutorials" className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 transition-all group">
              <Play className="h-8 w-8 text-green-600 mb-3" />
              <h4 className="font-semibold text-gray-900 mb-2">Video Guides</h4>
              <p className="text-sm text-gray-600">Visual walkthroughs</p>
            </Link>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-seo-primary/10 to-seo-secondary/10 rounded-3xl p-8 max-w-2xl mx-auto border border-seo-primary/20">
            <h3 className="text-2xl font-display font-bold mb-4 text-gray-900">
              Ready to Get Started?
            </h3>
            <p className="text-gray-600 mb-6">
              Follow our documentation to optimize your WooCommerce store with AI-powered SEO content.
            </p>
            <Button 
              asChild
              className="bg-gradient-to-r from-seo-primary to-seo-secondary hover:from-seo-primary/90 hover:to-seo-secondary/90"
            >
              <Link to="/register">Start Free Trial</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Docs;
