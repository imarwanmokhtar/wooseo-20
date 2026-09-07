
import React from 'react';
import { Settings, BarChart3, Wrench, FolderOpen, RefreshCw, Package, DollarSign, Globe, FileText } from 'lucide-react';

const AppShowcaseSection = () => {
  const features1 = [
    {
      icon: Settings,
      title: "One-Click SEO Generator",
      description: "Instantly generate long & short descriptions, meta titles, descriptions, and image alt text for all your products."
    },
    {
      icon: BarChart3,
      title: "Store Health Analyzer",
      description: "Detect SEO gaps, missing fields, and content issues across your catalog in seconds."
    },
    {
      icon: Wrench,
      title: "Spreadsheet-Like Bulk Editor",
      description: "Update prices, stock, SKUs, titles, and SEO fields in one simple interface. No need to open each product."
    },
    {
      icon: FolderOpen,
      title: "Multi-Store Ready",
      description: "Manage all your WooCommerce sites from one dashboard with no extra fees."
    },
    {
      icon: RefreshCw,
      title: "Product Extract & Sync",
      description: "Export your store to Excel, review or adjust content, and sync it all back with one click."
    }
  ];

  const features2 = [
    {
      icon: Package,
      title: "Inventory Editing",
      description: "Bulk edit stock levels for products and variations in a grid interface that feels like a spreadsheet."
    },
    {
      icon: DollarSign,
      title: "Price Adjustments",
      description: "Increase, decrease, or batch-edit prices with formulas or bulk fills — no coding or CSV headaches."
    },
    {
      icon: Globe,
      title: "Multi-Store Sync",
      description: "Push updates to all your connected stores instantly and keep everything in sync."
    },
    {
      icon: FileText,
      title: "Import/Export CSV",
      description: "Effortlessly export your catalog or import updates from Excel — great for teams and VA workflows."
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* First Section - SEO & Content Generation */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-display font-bold mb-4 text-gray-900">
                SEO & Product Field Automation That Feels Like Magic
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                WooSEO makes it easy to fix missing data, generate high-converting product content, and bulk edit everything — all in one place.
              </p>
            </div>
            
            <div className="space-y-6">
              {features1.map((feature, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-[#6C3EF4] to-[#7C4DFF] rounded-xl flex items-center justify-center">
                    <feature.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">{feature.title}</h4>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* WooSEO Dashboard Screenshot */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
            <img 
              src="/lovable-uploads/a6f1ddc9-ef68-481a-8d71-5da53619656e.png" 
              alt="WooSEO Dashboard - Product Selection and SEO Generation Interface"
              className="w-full h-auto rounded-xl"
            />
          </div>
        </div>

        {/* Second Section - Stock & Pricing Management (Image on left, text on right) */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Bulk Editor Screenshot - Now on the left */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
            <img 
              src="/lovable-uploads/d22bbadb-1082-438b-82ac-b262e08d0189.png" 
              alt="WooSEO Bulk Editor - Stock and Price Management Interface"
              className="w-full h-auto rounded-xl"
            />
          </div>
          
          {/* Text content - Now on the right */}
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-display font-bold mb-4 text-gray-900">
                Smarter Stock & Price Management
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                Forget clunky WooCommerce backends. WooSEO brings speed, simplicity, and scale to your daily product management tasks.
              </p>
            </div>
            
            <div className="space-y-6">
              {features2.map((feature, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-[#A1E887] to-[#00C853] rounded-xl flex items-center justify-center">
                    <feature.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">{feature.title}</h4>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppShowcaseSection;
