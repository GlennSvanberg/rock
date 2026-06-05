type CountdownOverlayProps = {
  value: number | 'go'
}

const LABELS: Record<number | 'go', string> = {
  3: '3',
  2: '2',
  1: '1',
  go: 'Go!',
}

export function CountdownOverlay({ value }: CountdownOverlayProps) {
  const label = LABELS[value]
  const isGo = value === 'go'

  return (
    <div
      className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/35"
      aria-live="assertive"
      aria-atomic="true"
    >
      <span
        key={value}
        className={`countdown-pop display-title font-bold leading-none text-[var(--neon-bright)] drop-shadow-[0_0_40px_rgba(57,255,20,0.55)] ${
          isGo
            ? 'text-[clamp(3.5rem,20vw,7rem)]'
            : 'text-[clamp(5rem,28vw,10rem)]'
        }`}
        aria-label={label}
      >
        {label}
      </span>
    </div>
  )
}
