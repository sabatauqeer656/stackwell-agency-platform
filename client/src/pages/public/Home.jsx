import { Helmet } from 'react-helmet-async';
import { useSettings } from '../../features/settings/useSettings.js';

// Temporary page: replaced by the real home page in the next steps of Phase 3.
export default function Home() {
  const { companyName, tagline } = useSettings();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-brand-50 px-4 py-20 text-center">
      <Helmet>
        <title>{companyName} | Custom Software Development</title>
      </Helmet>
      <h1 className="text-4xl font-bold tracking-tight text-brand-900 sm:text-6xl">{companyName}</h1>
      <p className="max-w-xl text-lg text-slate-600">{tagline}</p>
    </div>
  );
}
