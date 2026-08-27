import Link from "next/link";
import { RadarMark } from "@/components/icons/Radar";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col items-center bg-nv px-4 py-24 text-center">
      <RadarMark className="h-10 w-10 text-route" />
      <h1 className="mt-6 font-body text-xl font-semibold text-lcd">Nada por aqui</h1>
      <p className="mt-2 font-body text-sm text-lcd/70">
        Esse treinador ou essa página não foi encontrada — pode ter mudado de username ou nunca ter
        existido.
      </p>
      <Link
        href="/feed"
        className="mt-6 bg-route px-4 py-2.5 font-pixel text-[11px] uppercase tracking-wide text-route-ink shadow-[4px_4px_0_rgb(12_18_54/0.4)] transition-[transform,box-shadow] duration-150 hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[1px_1px_0_rgb(12_18_54/0.4)] motion-reduce:transition-none"
      >
        Voltar pro feed
      </Link>
    </div>
  );
}
