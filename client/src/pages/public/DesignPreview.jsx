// TEMPORARY: visual check of the design tokens. Removed before launch.
const scale = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

// Full class names (not built dynamically) so Tailwind can detect them.
const brandBg = {
  50: 'bg-brand-50', 100: 'bg-brand-100', 200: 'bg-brand-200', 300: 'bg-brand-300', 400: 'bg-brand-400',
  500: 'bg-brand-500', 600: 'bg-brand-600', 700: 'bg-brand-700', 800: 'bg-brand-800', 900: 'bg-brand-900',
};
const accentBg = {
  50: 'bg-accent-50', 100: 'bg-accent-100', 200: 'bg-accent-200', 300: 'bg-accent-300', 400: 'bg-accent-400',
  500: 'bg-accent-500', 600: 'bg-accent-600', 700: 'bg-accent-700', 800: 'bg-accent-800', 900: 'bg-accent-900',
};

function Swatches({ title, classes }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-slate-600">{title}</p>
      <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
        {scale.map((n) => (
          <div key={n} className="text-center text-xs text-slate-500">
            <div className={`h-12 rounded-lg ${classes[n]}`} />
            {n}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DesignPreview() {
  return (
    <main className="mx-auto max-w-5xl space-y-12 px-4 py-12">
      <h1 className="text-h1">Design tokens</h1>

      <section className="space-y-6">
        <h2 className="text-h2">Colors</h2>
        <Swatches title="brand (indigo)" classes={brandBg} />
        <Swatches title="accent (violet)" classes={accentBg} />
        <div className="h-16 rounded-card bg-gradient-to-r from-brand-600 to-accent-500" />
      </section>

      <section className="space-y-4">
        <h2 className="text-h2">Type scale</h2>
        <p className="text-display">Display</p>
        <p className="text-h1 font-bold">Heading 1</p>
        <p className="text-h2 font-bold">Heading 2</p>
        <p className="text-h3 font-bold">Heading 3</p>
        <p className="text-base text-slate-600">
          Body text in Inter. The quick brown fox jumps over the lazy dog. 0123456789
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-h2">Cards</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-card bg-white p-6 shadow-card">shadow-card</div>
          <div className="rounded-card bg-white p-6 shadow-card-hover">shadow-card-hover</div>
        </div>
        <p className="text-sm text-slate-500">Press Tab: links and buttons get a visible focus ring.</p>
        <a href="#" className="inline-block font-semibold text-brand-600">Focusable link</a>
      </section>
    </main>
  );
}
