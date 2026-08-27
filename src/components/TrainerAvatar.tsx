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
 * um monograma da inicial. Quadrado, aresta dura: skin de Minecraft é quadrada.
 */
export function TrainerAvatar({ displayName, skinUrl, size = 40, className = "" }: TrainerAvatarProps) {
  if (!skinUrl) {
    return (
      <span
        className={`flex shrink-0 items-center justify-center border border-lcd-edge bg-lcd-sunken font-data font-semibold text-lcd-ink ${className}`}
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
      className={`relative block shrink-0 overflow-hidden border border-lcd-edge bg-lcd-sunken ${className}`}
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
