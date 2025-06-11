
import React from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import ProblemSection from '@/components/ProblemSection';
import SolutionSection from '@/components/SolutionSection';
import USPSection from '@/components/USPSection';
import WhyChooseUsSection from '@/components/WhyChooseUsSection';
import PricingSection from '@/components/PricingSection';
import Testimonials from '@/components/Testimonials';
import DemoSection from '@/components/DemoSection';
import ScaleSection from '@/components/ScaleSection';
import FinalCTASection from '@/components/FinalCTASection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <USPSection />
      <WhyChooseUsSection />
      <PricingSection />
      <Testimonials />
      <DemoSection />
      <ScaleSection />
      <FinalCTASection />
      <Footer />
    </div>
  );
};

export default Index;
