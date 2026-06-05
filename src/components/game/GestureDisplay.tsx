import type { Gesture } from '@/lib/game/types'

const LABELS: Record<Gesture, string> = {
  rock: 'Rock',
  paper: 'Paper',
  scissors: 'Scissors',
  none: 'Show your hand',
}

const EMOJI: Record<Gesture, string> = {
  rock: '✊',
  paper: '✋',
  scissors: '✌️',
  none: '👋',
}

type GestureDisplayProps = {
  gesture: Gesture
  caption?: string
  size?: 'normal' | 'large'
}

export function GestureDisplay({
  gesture,
  caption,
  size = 'normal',
}: GestureDisplayProps) {
  const emojiSize = size === 'large' ? 'text-7xl' : 'text-5xl'
  const labelSize = size === 'large' ? 'text-5xl' : 'text-3xl'

  return (
    <div className="flex flex-col items-center gap-2 text-center">
      {caption ? (
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--ink-soft)]">
          {caption}
        </p>
      ) : null}
      <span className={emojiSize} aria-hidden="true">
        {EMOJI[gesture]}
      </span>
      <p
        className={`display-title ${labelSize} font-bold text-[var(--neon-bright)]`}
      >
        {LABELS[gesture]}
      </p>
    </div>
  )
}
