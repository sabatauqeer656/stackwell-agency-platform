import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
      <Helmet>
        <title>Page not found | Nexora Labs</title>
      </Helmet>
      <h1 className="text-6xl font-bold text-brand-600">404</h1>
      <p className="text-lg text-slate-600">This page does not exist.</p>
      <Link to="/" className="font-semibold text-brand-600 hover:text-brand-700">
        Back to home
      </Link>
    </main>
  );
}
