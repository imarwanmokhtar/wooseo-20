
import React from 'react';
import HeroSection from '@/components/HeroSection';
import ProblemSection from '@/components/ProblemSection';
import SolutionSection from '@/components/SolutionSection';
import USPSection from '@/components/USPSection';
import PricingSection from '@/components/PricingSection';
import Testimonials from '@/components/Testimonials';
import DemoSection from '@/components/DemoSection';
import ScaleSection from '@/components/ScaleSection';
import FinalCTASection from '@/components/FinalCTASection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <USPSection />
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
