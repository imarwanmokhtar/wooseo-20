
import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const FAQSection = () => {
  const faqs = [
    {
      id: "what-is-wooseo",
      question: "🛒 What is WooSEO and how can it help my store?",
      answer: (
        <div className="space-y-4">
          <p>WooSEO is your <strong>AI-powered product content assistant</strong> for WooCommerce. It instantly generates and updates:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Long & short product descriptions</li>
            <li>Meta titles & meta descriptions</li>
            <li>Image alt text</li>
          </ul>
          <p>All optimized for <strong>Google ranking, accessibility, and conversions</strong>. No need to write manually ever again.</p>
        </div>
      )
    },
    {
      id: "is-free",
      question: "💸 Is WooSEO free to use?",
      answer: (
        <div className="space-y-4">
          <p>You get <strong>free credits</strong> to generate product content when you sign up—no strings attached. Use them to see real results on your own product pages.</p>
          <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded">
            <p className="text-orange-800">⚠️ Note: <strong>Bulk editing features</strong> are available on paid plans only.</p>
          </div>
        </div>
      )
    },
    {
      id: "bulk-editor",
      question: "⚙️ What's included in the bulk editor?",
      answer: (
        <div className="space-y-4">
          <p>Our bulk editor is built to <strong>save you hours of manual work</strong>:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Edit product fields like titles, prices, categories, inventory in a spreadsheet-like interface</li>
            <li>Apply mass actions to hundreds of products at once</li>
            <li>Instantly generate or regenerate SEO content for multiple products with one click</li>
            <li>Use filters to isolate missing fields, low-word content, or empty alt texts</li>
          </ul>
        </div>
      )
    },
    {
      id: "seo-improvement",
      question: "🔍 Can WooSEO improve my SEO?",
      answer: (
        <div className="space-y-4">
          <p>Yes. We don't just generate content—we optimize it for:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Focus keyword usage</li>
            <li>Meta and alt tag compliance</li>
            <li>Word count & readability</li>
            <li>Accessibility best practices</li>
          </ul>
          <p>WooSEO helps your store <strong>rank higher</strong> and convert more traffic.</p>
        </div>
      )
    },
    {
      id: "customize-ai",
      question: "✍️ Can I customize the AI outputs?",
      answer: (
        <div className="space-y-4">
          <p>Absolutely. You can <strong>edit the prompt template</strong> used to generate content. That means full control over:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Tone of voice</li>
            <li>Brand personality</li>
            <li>Keyword targeting</li>
          </ul>
          <p>No technical skills required—just type in what you want and WooSEO handles the rest.</p>
        </div>
      )
    },
    {
      id: "image-alt-text",
      question: "🖼️ Does WooSEO write image alt text too?",
      answer: (
        <div className="space-y-4">
          <p>Yes. We scan your product image and automatically generate <strong>alt text</strong> that's:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Context-aware</li>
            <li>SEO-friendly</li>
            <li>Accessibility-compliant</li>
          </ul>
          <p>Perfect for WCAG / ADA alignment and search engines.</p>
        </div>
      )
    },
    {
      id: "api-keys",
      question: "🔌 Do I need an OpenAI or API key?",
      answer: (
        <div className="space-y-4">
          <p>Nope. Unlike many plugins, <strong>you don't need to worry about API keys or hidden costs</strong>. Everything—AI usage, credits, updates—is covered in one transparent pricing plan.</p>
        </div>
      )
    },
    {
      id: "better-than-others",
      question: "🧠 How is WooSEO better than other plugins?",
      answer: (
        <div className="space-y-4">
          <p>Here's why WooSEO stands out:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>⚡ <strong>Lightning-fast bulk editing</strong> (like Google Sheets for WooCommerce)</li>
            <li>✍️ <strong>AI generation for every key field</strong>—meta, alt text, descriptions</li>
            <li>🧾 <strong>Simple pricing</strong>: one credit = one product, no hidden API fees</li>
            <li>🔐 <strong>Standalone SaaS</strong>: no plugin bloat or WordPress slowdowns</li>
            <li>🔧 <strong>Custom prompt editing</strong> for total brand control</li>
          </ul>
        </div>
      )
    },
    {
      id: "dont-like-content",
      question: "🤔 What happens if I don't like the content?",
      answer: (
        <div className="space-y-4">
          <p>Just hit <strong>"regenerate"</strong>. You can retry, tweak the prompt, and generate again until it fits your store's tone and style—no extra cost per retry within the same product.</p>
        </div>
      )
    }
  ];

  return (
    <section className="py-24 bg-white faq-section">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 text-[#1F1F1F]">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-[#6B6B6B] max-w-3xl mx-auto">
            Everything you need to know about WooSEO and how it can transform your store.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq) => (
              <AccordionItem 
                key={faq.id} 
                value={faq.id}
                className="border border-gray-200 rounded-2xl px-6 py-2 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <AccordionTrigger className="text-left text-lg font-semibold text-[#1F1F1F] hover:text-[#6C3EF4] transition-colors py-6 hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-[#6B6B6B] pb-6 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
