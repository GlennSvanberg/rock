import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { CountdownOverlay } from './CountdownOverlay'
import { GestureDisplay } from './GestureDisplay'
import { HandCamera } from './HandCamera'
import { useHandLandmarker } from '@/hooks/useHandLandmarker'
import { useRound } from '@/hooks/useRound'
import { useWebcam } from '@/hooks/useWebcam'

function GameSkeleton() {
  return (
    <div className="page-wrap py-10">
      <div className="island-shell mx-auto max-w-2xl rounded-3xl p-8 text-center">
        <p className="text-[var(--ink-soft)]">Loading game...</p>
      </div>
    </div>
  )
}

export function HandGame() {
  const [mounted, setMounted] = useState(false)

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

  const {
    phase,
    countdownValue,
    lockedGesture,
    noShow,
    startRound,
    playAgain,
  } = useRound(gesture)

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

  if (!mounted) {
    return <GameSkeleton />
  }

  const isLoading =
    webcamStatus === 'loading' || webcamStatus === 'idle' || modelLoading
  const hasError = webcamStatus === 'error' || Boolean(modelError)
  const canPlay = modelReady && !hasError

  return (
    <div className="page-wrap py-10">
      <div className="island-shell mx-auto max-w-2xl rounded-3xl p-6 sm:p-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="island-kicker mb-1">Solo round</p>
            <h1 className="display-title text-2xl font-bold text-[var(--ink)]">
              Rock Paper Scissors
            </h1>
          </div>
          <Link
            to="/"
            className="rounded-full border border-[var(--line)] bg-[var(--chip-bg)] px-4 py-2 text-sm font-semibold text-[var(--ink)] hover:border-[var(--neon-dim)] hover:bg-[var(--link-bg-hover)] hover:text-[var(--neon-bright)]"
          >
            Home
          </Link>
        </div>

        {isLoading && (
          <p className="mb-4 text-center text-sm text-[var(--ink-soft)]">
            {modelLoading ? 'Loading hand tracking model...' : 'Starting camera...'}
          </p>
        )}

        {hasError && (
          <div className="mb-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 text-center">
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

        <div className="flex flex-col items-center gap-6">
          <div className="relative w-full max-w-xl">
            <HandCamera
              videoRef={videoRef}
              landmarksRef={landmarksRef}
              connections={connections}
              active={modelReady}
            />
            {phase === 'countdown' && countdownValue !== null ? (
              <CountdownOverlay value={countdownValue} />
            ) : null}
            {phase === 'hold' ? <CountdownOverlay value="go" /> : null}
          </div>

          {phase === 'ready' && (
            <>
              <GestureDisplay gesture={gesture} caption="Live preview" />
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
              {phase === 'hold'
                ? 'Hold your gesture...'
                : 'Show your move!'}
            </p>
          )}

          {phase === 'result' && noShow && (
            <>
              <div className="flex flex-col items-center gap-3 text-center">
                <span className="text-7xl" aria-hidden="true">
                  🫥
                </span>
                <p className="display-title text-3xl font-bold text-[var(--neon-bright)]">
                  Cheeky — you didn&apos;t show anything!
                </p>
              </div>
              <button
                type="button"
                onClick={playAgain}
                className="neon-button px-8 py-3 text-base"
              >
                Play again
              </button>
            </>
          )}

          {phase === 'result' && lockedGesture !== null && !noShow && (
            <>
              <GestureDisplay
                gesture={lockedGesture}
                caption="You played"
                size="large"
              />
              <button
                type="button"
                onClick={playAgain}
                className="neon-button px-8 py-3 text-base"
              >
                Play again
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
