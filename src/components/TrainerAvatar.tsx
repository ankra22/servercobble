// Classes escritas por extenso (não interpoladas) de propósito: o Tailwind
// só reconhece classes que aparecem literalmente no código-fonte.
const MONOGRAM_TONES = [
  "text-brand bg-brand-dim/60",
  "text-rare bg-rare-dim/60",
  "text-capture bg-capture-dim/60",
  "text-battle bg-battle-dim/60",
  "text-evolution bg-evolution-dim/60",
  "text-levelup bg-levelup-dim/60",
];

function toneFor(name: string) {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return MONOGRAM_TONES[hash % MONOGRAM_TONES.length];
}

interface TrainerAvatarProps {
  displayName: string;
  skinUrl: string | null;
  size?: number;
  className?: string;
}

/**
 * Avatar do treinador. Quando há `skin_url` (textura 64x64 padrão Minecraft),
 * recorta o rosto (camada base + overlay do "hat layer") via background-image
 * — o mesmo truque usado por launchers/sites de skin. Sem skin_url, cai pra
 * um monograma colorido determinístico a partir do nome.
 */
export function TrainerAvatar({ displayName, skinUrl, size = 40, className = "" }: TrainerAvatarProps) {
  const radius = size >= 64 ? "rounded-2xl" : "rounded-xl";

  if (!skinUrl) {
    const toneClasses = toneFor(displayName);
    return (
      <span
        className={`flex shrink-0 items-center justify-center ${radius} border border-border-strong font-data font-semibold ${toneClasses} ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.4 }}
        aria-hidden="true"
      >
        {displayName.slice(0, 1).toUpperCase()}
      </span>
    );
  }

  const scale = size / 8;
  const bgSize = `${64 * scale}px ${64 * scale}px`;

  return (
    <span
      className={`relative block shrink-0 overflow-hidden border border-border-strong bg-panel ${radius} ${className}`}
      style={{ width: size, height: size }}
    >
      <span
        className="pixelated absolute inset-0"
        style={{ backgroundImage: `url(${skinUrl})`, backgroundSize: bgSize, backgroundPosition: `-${8 * scale}px -${8 * scale}px` }}
      />
      <span
        className="pixelated absolute inset-0"
        style={{ backgroundImage: `url(${skinUrl})`, backgroundSize: bgSize, backgroundPosition: `-${40 * scale}px -${8 * scale}px` }}
      />
    </span>
  );
}
