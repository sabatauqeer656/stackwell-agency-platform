import ChoiceCardGroup from '../ChoiceCardGroup.jsx';
import Button from '../../ui/Button.jsx';
import Skeleton from '../../ui/Skeleton.jsx';
import { projectTypes } from '../../../features/quotes/quoteOptions.js';

// Step 1: what kind of project, and (optionally) which of our services.
export default function ProjectStep({ register, errors, servicesQuery }) {
  const { data: services, isPending, isError, isFetching, refetch } = servicesQuery;

  return (
    <div className="space-y-8">
      <ChoiceCardGroup
        legend="What would you like to build?"
        name="projectType"
        options={projectTypes}
        register={register}
        error={errors.projectType?.message}
      />

      {/* The services list is a bonus: if it fails to load, the visitor can still carry on */}
      {isPending && (
        <div aria-busy="true" className="space-y-3">
          <p role="status" className="sr-only">
            Loading services
          </p>
          <Skeleton className="h-5 w-56" />
          <Skeleton className="h-14 w-full" />
        </div>
      )}
      {isError && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          <p>We could not load our list of services. You can skip this part and continue.</p>
          <Button variant="outline" size="sm" className="mt-3" loading={isFetching} onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      )}
      {services?.length > 0 && (
        <ChoiceCardGroup
          legend="Which of our services are you interested in?"
          hint="Optional. Choose up to 6."
          type="checkbox"
          name="services"
          options={services.map((service) => ({ value: service.slug, label: service.title }))}
          register={register}
          error={errors.services?.message}
        />
      )}
    </div>
  );
}
