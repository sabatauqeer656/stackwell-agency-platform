import Seo from '../../components/Seo.jsx';
import Hero from '../../components/sections/Hero.jsx';
import ServicesSection from '../../components/sections/ServicesSection.jsx';
import FeaturedProjectsSection from '../../components/sections/FeaturedProjectsSection.jsx';
import TestimonialsSection from '../../components/sections/TestimonialsSection.jsx';
import CallToAction from '../../components/sections/CallToAction.jsx';
import { useSettings } from '../../features/settings/useSettings.js';

// The home page is just a list of sections: each one loads its own data and handles its own states.
export default function Home() {
  const { companyName } = useSettings();

  return (
    <>
      <Seo
        absoluteTitle={`${companyName} | Custom Software Development`}
        description={`${companyName} designs and builds web apps, mobile apps and e-commerce stores. Fixed-price quotes, demos every two weeks, and you own the code.`}
        path="/"
      />
      <Hero />
      <ServicesSection />
      <FeaturedProjectsSection />
      <TestimonialsSection />
      <CallToAction />
    </>
  );
}
