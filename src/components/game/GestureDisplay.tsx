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
  const isLarge = size === 'large'

  return (
    <div className={`gesture-display${isLarge ? ' gesture-display--large' : ''}`}>
      {caption ? (
        <p className="gesture-display__caption">{caption}</p>
      ) : null}
      <span className="gesture-display__emoji" aria-hidden="true">
        {EMOJI[gesture]}
      </span>
      <p className="gesture-display__label">{LABELS[gesture]}</p>
    </div>
  )
}
