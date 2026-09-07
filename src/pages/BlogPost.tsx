import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Calendar, Clock, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Mock blog post content - you can replace this with actual markdown parsing
const blogPostContent = {
  'getting-started-with-wooseo': {
    title: 'Getting Started with wooSEO: Transform Your WooCommerce Store',
    date: '2024-01-15',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop',
    content: `
      <p>Welcome to the future of WooCommerce SEO! In this comprehensive guide, we'll walk you through everything you need to know to get started with wooSEO and transform your online store's search engine visibility.</p>
      
      <h2>Why SEO Matters for Your WooCommerce Store</h2>
      <p>Search Engine Optimization isn't just a nice-to-have for e-commerce stores—it's essential for success. With over 2 billion websites competing for attention, your products need to be easily discoverable by potential customers.</p>
      
      <h2>Getting Started with wooSEO</h2>
      <p>wooSEO makes professional SEO content generation accessible to everyone. Here's how to get started:</p>
      
      <ol>
        <li><strong>Sign up for your account</strong> - Create your free wooSEO account in just 30 seconds</li>
        <li><strong>Connect your WooCommerce store</strong> - Safely integrate with our secure API</li>
        <li><strong>Start generating content</strong> - Use AI to create optimized product descriptions, meta titles, and more</li>
      </ol>
      
      <h2>Best Practices for AI-Generated SEO Content</h2>
      <p>While wooSEO does the heavy lifting, following these best practices will maximize your results:</p>
      
      <ul>
        <li>Always review and customize generated content to match your brand voice</li>
        <li>Include relevant keywords naturally throughout your content</li>
        <li>Keep meta descriptions under 160 characters</li>
        <li>Use descriptive, keyword-rich product titles</li>
      </ul>
      
      <h2>Ready to Transform Your Store?</h2>
      <p>With wooSEO, you're just minutes away from having professional, SEO-optimized content for all your products. Start your free trial today and see the difference quality SEO can make for your WooCommerce store.</p>
    `
  },
  'seo-best-practices-2024': {
    title: 'SEO Best Practices for E-commerce in 2024',
    date: '2024-01-10',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800&h=400&fit=crop',
    content: `
      <p>The SEO landscape continues to evolve rapidly. In 2024, e-commerce stores need to adapt to new algorithms, user behaviors, and technological advances to maintain their competitive edge.</p>
      
      <h2>Core Web Vitals: More Important Than Ever</h2>
      <p>Google's Core Web Vitals have become crucial ranking factors. Ensure your WooCommerce store loads quickly, is visually stable, and responds to user interactions promptly.</p>
      
      <h2>Content Quality Over Quantity</h2>
      <p>Search engines are getting better at understanding content quality. Focus on creating comprehensive, helpful product descriptions that truly serve your customers' needs.</p>
      
      <h2>Mobile-First Optimization</h2>
      <p>With mobile commerce continuing to grow, ensure your store provides an exceptional mobile experience. This includes fast loading times, easy navigation, and optimized checkout processes.</p>
      
      <h2>Structured Data Implementation</h2>
      <p>Rich snippets can significantly improve your click-through rates. Implement proper schema markup for products, reviews, and pricing information.</p>
    `
  },
  'ai-content-generation-guide': {
    title: 'The Complete Guide to AI Content Generation for Product Descriptions',
    date: '2024-01-05',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=400&fit=crop',
    content: `
      <p>AI content generation has revolutionized how e-commerce stores create product descriptions. Learn how to leverage this powerful technology to scale your content creation while maintaining quality and brand consistency.</p>
      
      <h2>Understanding AI Content Generation</h2>
      <p>AI content generation uses machine learning models to create human-like text based on prompts and parameters you provide. For e-commerce, this means generating product descriptions, meta tags, and marketing copy at scale.</p>
      
      <h2>Benefits of AI-Generated Product Descriptions</h2>
      <ul>
        <li><strong>Speed:</strong> Generate descriptions for hundreds of products in minutes</li>
        <li><strong>Consistency:</strong> Maintain brand voice across all product pages</li>
        <li><strong>SEO Optimization:</strong> Include relevant keywords naturally</li>
        <li><strong>Cost-Effective:</strong> Reduce content creation costs significantly</li>
      </ul>
      
      <h2>Best Practices for AI Content Generation</h2>
      <p>To get the best results from AI-generated content:</p>
      
      <ol>
        <li>Provide detailed product information as input</li>
        <li>Define your brand voice and tone clearly</li>
        <li>Always review and edit generated content</li>
        <li>Test different prompts and approaches</li>
        <li>Maintain human oversight for quality control</li>
      </ol>
      
      <h2>The Future of E-commerce Content</h2>
      <p>As AI technology continues to advance, we can expect even more sophisticated content generation capabilities. The key is to embrace these tools while maintaining the human touch that makes your brand unique.</p>
    `
  }
};

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? blogPostContent[slug as keyof typeof blogPostContent] : null;

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Post Not Found</h1>
          <p className="text-gray-600 mb-6">The blog post you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/blog">Back to Blog</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-96 overflow-hidden">
        <img 
          src={post.image} 
          alt={post.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white max-w-4xl mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              {post.title}
            </h1>
            <div className="flex items-center justify-center text-white/80">
              <Calendar className="h-4 w-4 mr-1" />
              <span className="mr-4">{new Date(post.date).toLocaleDateString()}</span>
              <Clock className="h-4 w-4 mr-1" />
              <span>{post.readTime}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          {/* Back Button */}
          <Button 
            asChild
            variant="ghost" 
            className="mb-8 text-seo-primary hover:text-seo-secondary"
          >
            <Link to="/blog" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Link>
          </Button>

          {/* Article Content */}
          <article className="prose prose-lg max-w-none">
            <div 
              dangerouslySetInnerHTML={{ __html: post.content }}
              className="prose-headings:font-display prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700 prose-strong:text-gray-900"
            />
          </article>

          {/* CTA Section */}
          <div className="mt-16 bg-gradient-to-r from-seo-primary/10 to-seo-secondary/10 rounded-3xl p-8 border border-seo-primary/20">
            <h3 className="text-2xl font-display font-bold mb-4 text-gray-900">
              Ready to Optimize Your WooCommerce Store?
            </h3>
            <p className="text-gray-600 mb-6">
              Start generating professional SEO content with wooSEO today.
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

export default BlogPost;
