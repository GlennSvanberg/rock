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
}

export function GestureDisplay({ gesture }: GestureDisplayProps) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <span className="text-5xl" aria-hidden="true">
        {EMOJI[gesture]}
      </span>
      <p className="display-title text-3xl font-bold text-[var(--neon-bright)]">
        {LABELS[gesture]}
      </p>
    </div>
  )
}
