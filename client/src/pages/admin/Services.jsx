import ContentList from '../../components/admin/ContentList.jsx';
import DynamicIcon from '../../components/ui/DynamicIcon.jsx';
import { useAdminServices } from '../../features/admin/services.js';

export default function Services() {
  return (
    <ContentList
      title="Services"
      intro="What the agency offers. Published services appear on the website, in order."
      noun="service"
      plural="services"
      useData={useAdminServices}
      adminPath="/admin/services"
      searchHint="Service title"
      emptyHint="Add your first service. It appears on the website once it is published."
      renderRow={(service) => (
        <>
          <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700 sm:flex">
            <DynamicIcon name={service.icon} className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="block truncate font-semibold text-ink">{service.title}</span>
            <span className="block truncate text-sm text-slate-500">{service.summary}</span>
            <span className="block truncate text-xs text-slate-500">/services/{service.slug}</span>
          </span>
        </>
      )}
    />
  );
}
