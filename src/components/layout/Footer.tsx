export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-8 text-xs text-ink-faint sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>Dados capturados diretamente dos logs do servidor, em tempo real.</p>
        <p className="font-data">Next.js · Supabase Realtime</p>
      </div>
    </footer>
  );
}
