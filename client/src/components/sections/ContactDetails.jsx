import { Mail, MapPin, Phone } from 'lucide-react';
import Card from '../ui/Card.jsx';
import QueryState from '../ui/QueryState.jsx';
import Skeleton from '../ui/Skeleton.jsx';
import { DEFAULT_SETTINGS, useSettingsQuery } from '../../features/settings/useSettings.js';

function DetailsSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      <p role="status" className="sr-only">
        Loading contact details
      </p>
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-5 w-4/5" />
    </div>
  );
}

// The company's email, phone and address, straight from the settings an admin edits in the dashboard.
export default function ContactDetails() {
  const query = useSettingsQuery();

  return (
    <Card>
      <h2 className="text-xl">Contact details</h2>
      <div className="mt-5">
        <QueryState
          query={query}
          skeleton={<DetailsSkeleton />}
          errorTitle="We could not load our contact details"
          errorDescription="Please check your connection and try again."
        >
          {(data) => {
            const { email, phone, address } = { ...DEFAULT_SETTINGS, ...data };
            // Only show what exists: an admin may leave the phone or address empty
            if (!email && !phone && !address) {
              return <p className="text-slate-600">Our contact details will appear here soon.</p>;
            }
            return (
              <ul className="space-y-4 text-slate-700">
                {email && (
                  <li className="flex items-start gap-3">
                    <Mail className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" aria-hidden="true" />
                    <span>
                      <span className="sr-only">Email: </span>
                      <a href={`mailto:${email}`} className="font-medium text-brand-700 hover:underline">
                        {email}
                      </a>
                    </span>
                  </li>
                )}
                {phone && (
                  <li className="flex items-start gap-3">
                    <Phone className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" aria-hidden="true" />
                    <span>
                      <span className="sr-only">Phone: </span>
                      <a href={`tel:${phone.replace(/[^\d+]/g, '')}`} className="font-medium text-brand-700 hover:underline">
                        {phone}
                      </a>
                    </span>
                  </li>
                )}
                {address && (
                  <li className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" aria-hidden="true" />
                    <span>
                      <span className="sr-only">Address: </span>
                      {address}
                    </span>
                  </li>
                )}
              </ul>
            );
          }}
        </QueryState>
      </div>
    </Card>
  );
}
