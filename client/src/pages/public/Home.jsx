import { Helmet } from 'react-helmet-async';
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
      <Helmet>
        {/* Helmet needs ONE string inside <title>, so build it with a template literal */}
        <title>{`${companyName} | Custom Software Development`}</title>
        <meta
          name="description"
          content={`${companyName} designs and builds web apps, mobile apps and e-commerce stores. Fixed-price quotes, demos every two weeks, and you own the code.`}
        />
      </Helmet>
      <Hero />
      <ServicesSection />
      <FeaturedProjectsSection />
      <TestimonialsSection />
      <CallToAction />
    </>
  );
}
