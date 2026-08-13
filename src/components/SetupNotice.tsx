export function SetupNotice() {
  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-dashed border-border-strong bg-panel/50 p-8 text-center">
      <h2 className="text-lg font-semibold text-ink">Conecte o Supabase</h2>
      <p className="mt-2 text-sm text-ink-dim">
        Faltam as variáveis de ambiente do Supabase. Copie <code className="font-data text-brand">.env.local.example</code>{" "}
        para <code className="font-data text-brand">.env.local</code>, preencha com a URL e a{" "}
        <code className="font-data text-brand">anon key</code> do seu projeto e rode o script{" "}
        <code className="font-data text-brand">supabase/schema.sql</code> no SQL Editor.
      </p>
    </div>
  );
}
