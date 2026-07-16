import React from 'react';
import HeroSection from './HeroSection';
import ServicesSection from './ServicesSection';
import SectorsSection from './SectorsSection';
import HelpSection from './HelpSection';
import './FAS.module.css';

const FAS = () => {

  return (
    <div className="body">
      <HeroSection />
      <ServicesSection />
      <SectorsSection />
      <HelpSection />
    </div>
  );
}

export default FAS;