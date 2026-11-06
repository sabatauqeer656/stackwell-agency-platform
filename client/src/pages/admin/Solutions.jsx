import ContentList from '../../components/admin/ContentList.jsx';
import DynamicIcon from '../../components/ui/DynamicIcon.jsx';
import { useAdminSolutions } from '../../features/admin/solutions.js';

export default function Solutions() {
  return (
    <ContentList
      title="Solutions"
      intro="The industries the agency serves. Every project belongs to one solution."
      noun="solution"
      plural="solutions"
      useData={useAdminSolutions}
      adminPath="/admin/solutions"
      searchHint="Solution title"
      emptyHint="Add the first industry you serve. Projects are filed under these."
      renderRow={(solution) => (
        <>
          <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700 sm:flex">
            <DynamicIcon name={solution.icon} className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="block truncate font-semibold text-ink">{solution.title}</span>
            <span className="block truncate text-sm text-slate-500">{solution.summary}</span>
            <span className="block truncate text-xs text-slate-400">/solutions/{solution.slug}</span>
          </span>
        </>
      )}
    />
  );
}
