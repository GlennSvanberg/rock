import { useEffect, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ComputerPanel } from './ComputerPanel'
import { CountdownOverlay } from './CountdownOverlay'
import { HandCamera } from './HandCamera'
import { HandTrackingToggle } from './HandTrackingToggle'
import { PlayersGestureBar } from './PlayersGestureBar'
import { useCheatModes } from '@/hooks/useCheatModes'
import { useHandLandmarker } from '@/hooks/useHandLandmarker'
import { useRound, type RoundPhase } from '@/hooks/useRound'
import { useWebcam } from '@/hooks/useWebcam'
import { SHOW_CHEAT_HINTS } from '@/lib/game/cheatConfig'
import { firePlayerWinConfetti } from '@/lib/game/playerWinConfetti'

function GameSkeleton() {
  return (
    <div className="game-screen">
      <div className="flex flex-1 items-center justify-center">
        <p className="text-[var(--ink-soft)]">Loading game...</p>
      </div>
    </div>
  )
}

export function HandGame() {
  const [mounted, setMounted] = useState(false)
  const [showHandTracking, setShowHandTracking] = useState(false)

  const { videoRef, status: webcamStatus, error: webcamError, retry } =
    useWebcam()
  const webcamReady = webcamStatus === 'ready'
  const {
    ready: modelReady,
    loading: modelLoading,
    error: modelError,
    gesture,
    landmarksRef,
  } = useHandLandmarker(videoRef, mounted && webcamReady)

  const phaseRef = useRef<RoundPhase>('ready')

  const { playerAlwaysWins, computerAlwaysWins } = useCheatModes(
    landmarksRef,
    modelReady,
    phaseRef,
  )

  const {
    phase,
    countdownValue,
    lockedGesture,
    computerGesture,
    noShow,
    roundWinner,
    sessionScore,
    startRound,
    playAgain,
  } = useRound(gesture, playerAlwaysWins)

  phaseRef.current = phase

  const [connections, setConnections] = useState<
    Array<{ start: number; end: number }>
  >([])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) {
      return
    }

    void import('@mediapipe/tasks-vision').then(({ HandLandmarker }) => {
      setConnections([...HandLandmarker.HAND_CONNECTIONS])
    })
  }, [mounted])

  useEffect(() => {
    if (phase !== 'result' || roundWinner !== 'player') {
      return
    }

    void import('canvas-confetti').then(({ default: confetti }) => {
      firePlayerWinConfetti(confetti)
    })
  }, [phase, roundWinner])

  if (!mounted) {
    return <GameSkeleton />
  }

  const isLoading =
    webcamStatus === 'loading' || webcamStatus === 'idle' || modelLoading
  const hasError = webcamStatus === 'error' || Boolean(modelError)
  const canPlay = modelReady && !hasError
  const cheatHint =
    SHOW_CHEAT_HINTS && playerAlwaysWins
      ? 'Easy mode'
      : SHOW_CHEAT_HINTS && computerAlwaysWins
        ? 'Difficult mode'
        : null

  return (
    <div className="game-screen">
      <header className="game-header">
        <div>
          <p className="island-kicker mb-0.5">Vs computer</p>
          <h1 className="display-title text-xl font-bold text-[var(--ink)] sm:text-2xl">
            Rock Paper Scissors
          </h1>
          {cheatHint ? (
            <p className="mt-1 text-xs font-medium uppercase tracking-[0.12em] text-[var(--ink-soft)]">
              {cheatHint}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <HandTrackingToggle
            checked={showHandTracking}
            disabled={!modelReady}
            onChange={setShowHandTracking}
          />
          <Link
            to="/"
            className="rounded-full border border-[var(--line)] bg-[var(--chip-bg)] px-4 py-2 text-sm font-semibold text-[var(--ink)] hover:border-[var(--neon-dim)] hover:bg-[var(--link-bg-hover)] hover:text-[var(--neon-bright)]"
          >
            Home
          </Link>
        </div>
      </header>

      {isLoading && (
        <p className="game-status-banner text-center text-sm text-[var(--ink-soft)]">
          {modelLoading ? 'Loading hand tracking model...' : 'Starting camera...'}
        </p>
      )}

      {hasError && (
        <div className="game-status-banner px-4 text-center">
          <p className="text-sm text-[var(--ink)]">
            {webcamError ?? modelError}
          </p>
          {webcamStatus === 'error' && (
            <button
              type="button"
              onClick={() => void retry()}
              className="neon-button mt-3"
            >
              Retry camera
            </button>
          )}
        </div>
      )}

      <div className="game-arena">
        <div className="game-panel game-panel--player">
          <div className="game-panel-label flex items-end justify-between gap-3">
            <div>
              <p className="island-kicker">Player</p>
              <h2 className="display-title text-lg font-bold text-[var(--ink)]">
                You
              </h2>
            </div>
            <p
              className="display-title text-2xl font-bold tabular-nums text-[var(--neon-bright)] sm:text-3xl"
              aria-label={`Your wins: ${sessionScore.player}`}
            >
              {sessionScore.player}
            </p>
          </div>
          <div className="game-panel-viewport relative min-h-0 flex-1">
            <HandCamera
              videoRef={videoRef}
              landmarksRef={landmarksRef}
              connections={connections}
              active={showHandTracking && modelReady}
              className="absolute inset-0 overflow-hidden rounded-[var(--game-radius-sm)] bg-[var(--bg-elevated)]"
            />
            {phase === 'countdown' && countdownValue !== null ? (
              <CountdownOverlay value={countdownValue} />
            ) : null}
            {phase === 'hold' ? <CountdownOverlay value="go" /> : null}
            {phase === 'result' && roundWinner === 'player' ? (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-4 pt-10">
                <p className="display-title text-center text-xl font-bold text-[var(--neon-bright)] sm:text-2xl">
                  You win
                </p>
              </div>
            ) : null}
          </div>
        </div>

        <ComputerPanel
          phase={phase}
          computerGesture={computerGesture}
          landmarksRef={landmarksRef}
          connections={connections}
          modelReady={modelReady}
          roundWinner={roundWinner}
          sessionWins={sessionScore.computer}
        />
      </div>

      <PlayersGestureBar
        phase={phase}
        lockedGesture={lockedGesture}
        computerGesture={computerGesture}
        noShow={noShow}
        roundWinner={roundWinner}
      />

      <footer className="game-controls">
        {phase === 'ready' && (
          <>
            <p className="text-center text-sm text-[var(--ink-soft)]">
              Get your hand ready, then start the countdown.
            </p>
            <button
              type="button"
              onClick={startRound}
              disabled={!canPlay}
              className="neon-button px-8 py-3 text-base disabled:cursor-not-allowed disabled:opacity-40"
            >
              Start round
            </button>
          </>
        )}

        {(phase === 'countdown' || phase === 'hold') && (
          <p className="text-center text-sm font-semibold text-[var(--neon-bright)]">
            {phase === 'hold' ? 'Hold your gesture...' : 'Show your move!'}
          </p>
        )}

        {phase === 'result' && (
          <button
            type="button"
            onClick={playAgain}
            className="neon-button px-8 py-3 text-base"
          >
            Play again
          </button>
        )}
      </footer>
    </div>
  )
}
