interface StatTileProps {
  label: string;
  value: string | number;
  /** Destaca o número em dourado (usado pra shinies). */
  gold?: boolean;
}

export function StatTile({ label, value, gold = false }: StatTileProps) {
  return (
    <div className="border border-lcd-edge bg-lcd-sunken p-3.5">
      <p className={`font-data text-2xl font-semibold leading-none ${gold ? "text-[#9a6b12]" : "text-lcd-ink"}`}>
        {value}
      </p>
      <p className="mt-1.5 truncate font-body text-xs text-lcd-dim">{label}</p>
    </div>
  );
}
