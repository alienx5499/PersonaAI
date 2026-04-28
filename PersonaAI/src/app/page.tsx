export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center px-6 py-16">
      <div className="w-full rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
          PersonaAI
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">
          Persona-Based AI Chatbot
        </h1>
        <p className="mt-4 text-zinc-600">
          Base project is ready. Next step: build persona switcher, chat flow, and API route.
        </p>
      </div>
    </main>
  );
}
