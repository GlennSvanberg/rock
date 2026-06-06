import { useEffect, useLayoutEffect, useRef } from 'react'
import {
  cloneLandmarks,
  drawHandLandmarks,
  mirrorLandmarks,
} from '@/lib/game/landmarks'
import { morphFingersToGesture } from '@/lib/game/gestureMorph'
import { COMPUTER_REVEAL_MS } from '@/lib/game/timing'
import type { Landmark, PlayableGesture } from '@/lib/game/types'
import type { RoundPhase } from '@/hooks/useRound'

type ComputerHandCanvasProps = {
  phase: RoundPhase
  computerGesture: PlayableGesture | null
  landmarksRef: React.RefObject<Landmark[] | null>
  connections: Array<{ start: number; end: number }>
  active: boolean
  className?: string
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

/** Countdown through judging: rock fist, live palm position/rotation only. */
function isRockTrackingPhase(phase: RoundPhase): boolean {
  return (
    phase === 'countdown' || phase === 'hold' || phase === 'judging'
  )
}

function isRevealPhase(phase: RoundPhase): boolean {
  return phase === 'reveal' || phase === 'result'
}

export function ComputerHandCanvas({
  phase,
  computerGesture,
  landmarksRef,
  connections,
  active,
  className,
}: ComputerHandCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number>(0)
  const phaseRef = useRef(phase)
  const computerGestureRef = useRef(computerGesture)
  const revealStartRef = useRef<number | null>(null)
  const prepSnapshotRef = useRef<Landmark[] | null>(null)
  const revealSnapshotRef = useRef<Landmark[] | null>(null)

  phaseRef.current = phase
  computerGestureRef.current = computerGesture

  useEffect(() => {
    if (phase === 'ready' || phase === 'countdown') {
      prepSnapshotRef.current = null
      revealSnapshotRef.current = null
      revealStartRef.current = null
    }
  }, [phase])

  useLayoutEffect(() => {
    if (phase === 'reveal' && computerGesture && prepSnapshotRef.current) {
      revealSnapshotRef.current = cloneLandmarks(prepSnapshotRef.current)
      revealStartRef.current = performance.now()
    }
  }, [phase, computerGesture])

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) {
      return
    }

    const resize = () => {
      const { width, height } = container.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas.width = Math.max(1, Math.floor(width * dpr))
      canvas.height = Math.max(1, Math.floor(height * dpr))
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
    }

    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(container)

    return () => {
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    if (!active || connections.length === 0) {
      return
    }

    const draw = (now: number) => {
      const canvas = canvasRef.current
      if (!canvas) {
        rafRef.current = requestAnimationFrame(draw)
        return
      }

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        rafRef.current = requestAnimationFrame(draw)
        return
      }

      const dpr = window.devicePixelRatio || 1
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const currentPhase = phaseRef.current
      const gesture = computerGestureRef.current
      const live = landmarksRef.current
      let landmarks: Landmark[] | null = null

      if (live) {
        const mirrored = mirrorLandmarks(live)

        if (
          isRevealPhase(currentPhase) &&
          gesture &&
          revealSnapshotRef.current &&
          revealStartRef.current !== null
        ) {
          const revealT = Math.min(
            1,
            (now - revealStartRef.current) / COMPUTER_REVEAL_MS,
          )
          landmarks = morphFingersToGesture(
            revealSnapshotRef.current,
            gesture,
            easeOutCubic(revealT),
          )
        } else if (isRockTrackingPhase(currentPhase)) {
          landmarks = morphFingersToGesture(mirrored, 'rock', 1)
          prepSnapshotRef.current = cloneLandmarks(landmarks)
        } else if (currentPhase === 'ready') {
          landmarks = morphFingersToGesture(mirrored, 'rock', 1)
        }
      } else if (
        isRevealPhase(currentPhase) &&
        gesture &&
        revealSnapshotRef.current &&
        revealStartRef.current !== null
      ) {
        const revealT = Math.min(
          1,
          (now - revealStartRef.current) / COMPUTER_REVEAL_MS,
        )
        landmarks = morphFingersToGesture(
          revealSnapshotRef.current,
          gesture,
          easeOutCubic(revealT),
        )
      }

      const { width, height } = canvas.getBoundingClientRect()

      if (!landmarks || landmarks.length === 0) {
        ctx.clearRect(0, 0, width, height)
      } else {
        drawHandLandmarks(ctx, landmarks, connections, width, height)
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(rafRef.current)
    }
  }, [active, connections, landmarksRef])

  return (
    <div
      ref={containerRef}
      className={
        className ??
        'relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--bg-elevated)]'
      }
    >
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0" />
    </div>
  )
}
