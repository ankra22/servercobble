/**
 * Insígnia estilo "crachá de liga" — moldura hexagonal com uma gema central,
 * parecido com o formato clássico das badges dos jogos. Marca própria (SVG
 * desenhado aqui), sem biblioteca de ícone. A cor muda por posição/região;
 * `locked` deixa só o contorno, sem preenchimento, pra ginásio ainda não
 * vencido.
 */
export function GymBadgeIcon({
  color,
  locked = false,
  size = 34,
  className = "",
}: {
  color: string;
  locked?: boolean;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      className={className}
      aria-hidden="true"
    >
      <polygon
        points="20,2 35,11 35,29 20,38 5,29 5,11"
        fill={locked ? "none" : color}
        fillOpacity={locked ? 0 : 0.22}
        stroke={locked ? "currentColor" : color}
        strokeOpacity={locked ? 0.35 : 1}
        strokeWidth={locked ? 1.25 : 1.75}
      />
      {!locked && (
        <>
          <polygon points="20,10 27,15 24,24 16,24 13,15" fill={color} />
          <polygon
            points="20,10 27,15 24,24 16,24 13,15"
            fill="white"
            fillOpacity={0.25}
          />
        </>
      )}
      {locked && <circle cx="20" cy="18" r="3" fill="currentColor" fillOpacity={0.25} />}
    </svg>
  );
}
