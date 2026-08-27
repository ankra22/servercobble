/**
 * Selo "AO VIVO" — usado no feed do perfil (que não tem a faixa de status).
 * Ponto quadrado que pulsa opacidade, na cor azul-fria de "notável" do feed.
 */
export function LiveDot({ label = "AO VIVO" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2 border border-[#2f6ea0]/35 bg-[#2f6ea0]/12 px-2 py-1 font-pixel text-[9px] tracking-wide text-[#2f6ea0]">
      <span aria-hidden="true" className="h-1.5 w-1.5 bg-[#2f6ea0] motion-safe:animate-pulse" />
      {label}
    </span>
  );
}
