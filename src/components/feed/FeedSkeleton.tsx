/**
 * Espelha a estrutura do FeedTimeline — mesma grade, mesma coluna de horário,
 * mesmo nó — pra o loading não piscar o layout antigo antes de hidratar.
 * Precisa estar dentro de um elemento `.feed`, que é onde os tokens vivem.
 */
export function FeedSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="@container">
      <div className="relative">
        <span
          aria-hidden="true"
          className="fd-rail absolute bottom-2 top-2 left-[0.625rem] w-px @[26rem]:left-[4.875rem]"
        />

        <div className="relative">
          {Array.from({ length: rows }).map((_, i) => (
            <div
              key={i}
              className="fd-row grid grid-cols-[1.25rem_1fr] items-start gap-x-3 py-2.5 pr-1 @[26rem]:grid-cols-[3.5rem_1.25rem_1fr]"
            >
              <span className="hidden h-5 items-center justify-end @[26rem]:flex">
                <span
                  className="block h-2 w-8 animate-pulse"
                  style={{ background: "var(--fd-surface-2)" }}
                />
              </span>

              <span className="flex h-5 items-center justify-center">
                <span aria-hidden="true" className="fd-node fd-node--standard" />
              </span>

              <div className="min-w-0 space-y-1.5">
                <span
                  className="block h-3 animate-pulse"
                  style={{ background: "var(--fd-surface-2)", width: i % 3 === 0 ? "62%" : "84%" }}
                />
                <span
                  className="block h-2 w-24 animate-pulse"
                  style={{ background: "var(--fd-surface)" }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
