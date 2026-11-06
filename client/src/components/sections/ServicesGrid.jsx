import ServiceCard from './ServiceCard.jsx';

// The grid of service cards. Used by the home page and by the /services page.
export default function ServicesGrid({ services, headingLevel }) {
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((service) => (
        <li key={service._id} className="flex">
          <ServiceCard service={service} headingLevel={headingLevel} />
        </li>
      ))}
    </ul>
  );
}
