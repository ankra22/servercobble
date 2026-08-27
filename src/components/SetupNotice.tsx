export function SetupNotice() {
  return (
    <div className="mx-auto max-w-xl border border-ball/40 bg-ball/5 p-8 text-center">
      <h2 className="font-body text-lg font-semibold text-lcd-ink">Conecte o Supabase</h2>
      <p className="mt-2 font-body text-sm text-lcd-dim">
        Faltam as variáveis de ambiente do Supabase. Copie{" "}
        <code className="font-data text-[#9a6b12]">.env.local.example</code> para{" "}
        <code className="font-data text-[#9a6b12]">.env.local</code>, preencha com a URL e a{" "}
        <code className="font-data text-[#9a6b12]">anon key</code> do seu projeto e rode o script{" "}
        <code className="font-data text-[#9a6b12]">supabase/schema.sql</code> no SQL Editor.
      </p>
    </div>
  );
}
