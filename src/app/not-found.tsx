import Link from "next/link";
import { RadarMark } from "@/components/icons/Radar";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <RadarMark className="h-10 w-10 text-ink-faint" />
      <h1 className="mt-6 text-xl font-semibold text-ink">Nada por aqui</h1>
      <p className="mt-2 text-sm text-ink-dim">
        Esse treinador ou essa página não foi encontrada — pode ter mudado de username ou nunca ter existido.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-full border border-brand/25 bg-brand-dim/40 px-4 py-2 text-sm font-medium text-brand transition-colors hover:bg-brand-dim/60"
      >
        Voltar pro feed
      </Link>
    </div>
  );
}
