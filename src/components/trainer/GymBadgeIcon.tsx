/**
 * Insígnia estilo "crachá de liga" — moldura hexagonal com uma gema central
 * (líder de ginásio/Elite Four) ou uma estrela (campeão), parecido com o
 * formato clássico das badges dos jogos. Marca própria (SVG desenhado
 * aqui), sem biblioteca de ícone. A cor muda por posição/rank; `locked`
 * deixa só o contorno, sem preenchimento, pra ainda não vencido.
 */
export function GymBadgeIcon({
  color,
  shape = "badge",
  locked = false,
  size = 34,
  className = "",
}: {
  color: string;
  shape?: "badge" | "star";
  locked?: boolean;
  size?: number;
  className?: string;
}) {
  const frame =
    shape === "star"
      ? "20,1 25,14 39,14 28,23 32,37 20,29 8,37 12,23 1,14 15,14"
      : "20,2 35,11 35,29 20,38 5,29 5,11";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      className={className}
      aria-hidden="true"
    >
      <polygon
        points={frame}
        fill={locked ? "none" : color}
        fillOpacity={locked ? 0 : 0.22}
        stroke={locked ? "currentColor" : color}
        strokeOpacity={locked ? 0.35 : 1}
        strokeWidth={locked ? 1.25 : 1.75}
      />
      {!locked && shape === "badge" && (
        <>
          <polygon points="20,10 27,15 24,24 16,24 13,15" fill={color} />
          <polygon points="20,10 27,15 24,24 16,24 13,15" fill="white" fillOpacity={0.25} />
        </>
      )}
      {!locked && shape === "star" && <circle cx="20" cy="20" r="6" fill={color} />}
      {locked && <circle cx="20" cy="18" r="3" fill="currentColor" fillOpacity={0.25} />}
    </svg>
  );
}
