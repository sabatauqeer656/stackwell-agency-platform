function App() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 bg-brand-50 px-4 text-center">
      <h1 className="text-4xl font-bold tracking-tight text-brand-900 sm:text-6xl">
        Nexora Labs
      </h1>
      <p className="max-w-xl text-lg text-slate-600">
        Tailwind is working. This text is slate gray, the heading uses our brand color.
      </p>
      <button className="rounded-lg bg-brand-600 px-6 py-3 font-semibold text-white transition hover:bg-brand-700">
        Get a Quote
      </button>
    </main>
  )
}

export default App
