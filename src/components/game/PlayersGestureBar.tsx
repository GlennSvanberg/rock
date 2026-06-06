import type { RoundPhase, RoundWinner } from '@/hooks/useRound'
import { GestureDisplay } from './GestureDisplay'
import type { PlayableGesture } from '@/lib/game/types'

type PlayersGestureBarProps = {
  phase: RoundPhase
  lockedGesture: PlayableGesture | null
  computerGesture: PlayableGesture | null
  noShow: boolean
  roundWinner: RoundWinner | null
}

function WaitingSlot({ label }: { label: string }) {
  return (
    <div className="flex flex-1 flex-col items-center gap-2 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--ink-soft)]">
        {label}
      </p>
      <span className="text-5xl text-[var(--ink-soft)] opacity-40" aria-hidden="true">
        ···
      </span>
    </div>
  )
}

export function PlayersGestureBar({
  phase,
  lockedGesture,
  computerGesture,
  noShow,
  roundWinner,
}: PlayersGestureBarProps) {
  const isResult = phase === 'result'
  const showPlayerGesture =
    (phase === 'reveal' || isResult) && lockedGesture && !noShow
  const playerWins = isResult && roundWinner === 'player'
  const computerWins = isResult && roundWinner === 'computer'

  return (
    <div className="game-bottom-bar">
      <div className="game-bottom-gestures">
        <div className="game-bottom-player">
          {isResult && noShow ? (
            <div className="flex flex-col items-center gap-2 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--ink-soft)]">
                You
              </p>
              <span className="text-5xl" aria-hidden="true">
                🫥
              </span>
              <p className="display-title text-xl font-bold text-[var(--neon-bright)] sm:text-2xl">
                No show
              </p>
            </div>
          ) : showPlayerGesture ? (
            <GestureDisplay
              gesture={lockedGesture}
              caption={playerWins ? 'You — wins' : 'You'}
              size="normal"
            />
          ) : (
            <WaitingSlot label="You" />
          )}
        </div>

        <div className="game-bottom-divider" aria-hidden="true" />

        <div className="game-bottom-player">
          {isResult && computerGesture ? (
            <GestureDisplay
              gesture={computerGesture}
              caption={computerWins ? 'Computer — wins' : 'Computer'}
              size="normal"
            />
          ) : isResult && noShow ? (
            <div className="flex flex-col items-center gap-2 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--ink-soft)]">
                Computer — wins
              </p>
              <span className="text-5xl" aria-hidden="true">
                🤖
              </span>
              <p className="display-title text-xl font-bold text-[var(--neon-bright)] sm:text-2xl">
                Wins
              </p>
            </div>
          ) : (
            <WaitingSlot label="Computer" />
          )}
        </div>
      </div>
    </div>
  )
}
