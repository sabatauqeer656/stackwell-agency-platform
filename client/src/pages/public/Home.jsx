import { Helmet } from 'react-helmet-async';

// Temporary page: proves routing, SEO tags and Tailwind work. Replaced in Phase 3.
export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 bg-brand-50 px-4 text-center">
      <Helmet>
        <title>Stackwell | Custom Software Development</title>
      </Helmet>
      <h1 className="text-4xl font-bold tracking-tight text-brand-900 sm:text-6xl">Stackwell</h1>
      <p className="max-w-xl text-lg text-slate-600">Client foundation is wired up.</p>
    </main>
  );
}
