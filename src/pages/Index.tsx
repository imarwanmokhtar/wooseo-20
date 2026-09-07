
import React from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import AppShowcaseSection from '@/components/AppShowcaseSection';
import CoreBenefitsSection from '@/components/CoreBenefitsSection';
import Testimonials from '@/components/Testimonials';
import PricingSection from '@/components/PricingSection';
import FAQSection from '@/components/FAQSection';
import FinalCTASection from '@/components/FinalCTASection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <HeroSection />
      <AppShowcaseSection />
      <CoreBenefitsSection />
      <Testimonials />
      <PricingSection />
      <FAQSection />
      <FinalCTASection />
      <Footer />
    </div>
  );
};

export default Index;
