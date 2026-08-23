/**
 * Insígnia estilo "medalha de liga" — moldura circular com um símbolo
 * distinto por posição (gota, raio, folha, chama, etc.) ou uma estrela
 * dourada pro campeão. Marca própria (SVG desenhado aqui), sem biblioteca
 * de ícone. `locked` mostra só o símbolo em silhueta fraca, pra dar um ar
 * de "ainda não descoberto" em vez de uma caixa vazia.
 */

/** Um símbolo (path interno) por posição, ciclando a cada 10 — dá pra
 * distinguir os slots de longe sem depender só da cor. */
const EMBLEMS = [
  // 1: gota (água)
  "M20 10c4 5 6 8 6 11a6 6 0 1 1-12 0c0-3 2-6 6-11z",
  // 2: raio
  "M22 8 12 22h6l-2 10 12-15h-6l2-9z",
  // 3: folha
  "M12 26C12 15 20 9 28 9c0 11-8 17-16 17-2 0-3-1-3-1z M12 26l14-14",
  // 4: chama
  "M20 9c5 5 8 9 8 13a8 8 0 1 1-16 0c0-2 1-4 2-5 1 2 2 3 3 3 0-4 1-8 3-11z",
  // 5: losango (terra/pedra)
  "M20 8 31 20 20 32 9 20z",
  // 6: espiral (psíquico)
  "M20 12a8 8 0 1 1-8 8 5 5 0 1 1 5 5",
  // 7: trevo (veneno/planta)
  "M20 12a4 4 0 1 1 4 4 4 4 0 1 1-4 4 4 4 0 1 1-4-4 4 4 0 1 1 4-4z",
  // 8: escudo (defesa)
  "M20 9l9 3v7c0 6-4 10-9 12-5-2-9-6-9-12v-7z",
  // 9: pena/asa (elite four)
  "M11 26C11 15 22 10 30 11c-1 8-6 19-17 19-1 0-2-3-2-4z",
  // 10: lua crescente (elite four)
  "M25 10a11 11 0 1 0 0 20 9 9 0 0 1 0-20z",
];

function emblemFor(order: number) {
  return EMBLEMS[(order - 1) % EMBLEMS.length];
}

export function GymBadgeIcon({
  color,
  order = 1,
  shape = "badge",
  locked = false,
  size = 34,
  className = "",
}: {
  color: string;
  order?: number;
  shape?: "badge" | "star";
  locked?: boolean;
  size?: number;
  className?: string;
}) {
  const gradId = `gym-badge-grad-${color.replace("#", "")}`;

  if (shape === "star") {
    const points = "20,3 25,15 38,15 27,23 31,36 20,28 9,36 13,23 2,15 15,15";
    return (
      <svg width={size} height={size} viewBox="0 0 40 40" className={className} aria-hidden="true">
        <defs>
          <radialGradient id={gradId} cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor={color} stopOpacity={locked ? 0 : 1} />
            <stop offset="100%" stopColor={color} stopOpacity={locked ? 0 : 0.65} />
          </radialGradient>
        </defs>
        <polygon
          points={points}
          fill={locked ? "currentColor" : `url(#${gradId})`}
          fillOpacity={locked ? 0.12 : 1}
          stroke={locked ? "currentColor" : color}
          strokeOpacity={locked ? 0.3 : 1}
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className={className} aria-hidden="true">
      <defs>
        <radialGradient id={gradId} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor={color} stopOpacity={1} />
          <stop offset="100%" stopColor={color} stopOpacity={0.6} />
        </radialGradient>
      </defs>

      {/* moldura */}
      <circle
        cx="20"
        cy="20"
        r="18"
        fill={locked ? "none" : `url(#${gradId})`}
        stroke={locked ? "currentColor" : color}
        strokeOpacity={locked ? 0.3 : 0.9}
        strokeWidth={locked ? 1.25 : 2}
      />
      {!locked && <circle cx="20" cy="20" r="14.5" fill="none" stroke="white" strokeOpacity={0.35} strokeWidth={1} />}

      {/* símbolo */}
      <path
        d={emblemFor(order)}
        fill={locked ? "currentColor" : "white"}
        fillOpacity={locked ? 0.22 : 0.92}
        stroke="none"
      />
    </svg>
  );
}
