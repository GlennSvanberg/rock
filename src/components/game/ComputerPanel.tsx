import { ComputerHandCanvas } from './ComputerHandCanvas'
import type { RoundPhase, RoundWinner } from '@/hooks/useRound'
import type { Landmark, PlayableGesture } from '@/lib/game/types'

type ComputerPanelProps = {
  phase: RoundPhase
  computerGesture: PlayableGesture | null
  landmarksRef: React.RefObject<Landmark[] | null>
  connections: Array<{ start: number; end: number }>
  modelReady: boolean
  roundWinner?: RoundWinner | null
  sessionWins?: number
}

export function ComputerPanel({
  phase,
  computerGesture,
  landmarksRef,
  connections,
  modelReady,
  roundWinner = null,
  sessionWins = 0,
}: ComputerPanelProps) {
  const showHand = modelReady

  return (
    <div className="game-panel game-panel--computer">
      <div className="game-panel-label flex items-end justify-between gap-3">
        <div>
          <p className="island-kicker">Opponent</p>
          <h2 className="display-title font-bold text-[var(--ink)]">
            Computer
          </h2>
        </div>
        <p
          className="game-panel-score display-title font-bold tabular-nums text-[var(--neon-bright)]"
          aria-label={`Computer wins: ${sessionWins}`}
        >
          {sessionWins}
        </p>
      </div>
      <div className="game-panel-viewport relative min-h-0 flex-1">
        {showHand ? (
          <ComputerHandCanvas
            phase={phase}
            computerGesture={computerGesture}
            landmarksRef={landmarksRef}
            connections={connections}
            active={modelReady && connections.length > 0}
            className="absolute inset-0 overflow-hidden bg-[var(--bg-elevated)]"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-[var(--ink-soft)]">
              Waiting for your move...
            </p>
          </div>
        )}
        {phase === 'result' && roundWinner === 'computer' ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-4 pt-10">
            <p className="display-title text-center text-xl font-bold text-[var(--neon-bright)] sm:text-2xl">
              Computer wins
            </p>
          </div>
        ) : null}
      </div>
    </div>
  )
}
