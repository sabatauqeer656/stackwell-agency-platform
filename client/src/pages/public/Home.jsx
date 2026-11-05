import { Helmet } from 'react-helmet-async';
import Hero from '../../components/sections/Hero.jsx';
import ServicesSection from '../../components/sections/ServicesSection.jsx';
import { useSettings } from '../../features/settings/useSettings.js';

// The home page is just a list of sections. Featured projects, testimonials and the closing
// call to action are added in the next step.
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
    </>
  );
}
