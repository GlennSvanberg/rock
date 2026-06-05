import { useCallback, useEffect, useRef, useState } from 'react'
import type { Gesture } from '@/lib/game/types'

export type RoundPhase = 'ready' | 'countdown' | 'hold' | 'judging' | 'result'
export type PlayableGesture = Exclude<Gesture, 'none'>

const COUNTDOWN_SEQUENCE = [3, 2, 1] as const
const COUNTDOWN_TICK_MS = 1000
const HOLD_AFTER_COUNTDOWN_MS = 100
const GESTURE_RETRY_MS = 50
const GESTURE_MAX_ATTEMPTS = 5

function isPlayableGesture(gesture: Gesture): gesture is PlayableGesture {
  return gesture !== 'none'
}

export function useRound(liveGesture: Gesture) {
  const [phase, setPhase] = useState<RoundPhase>('ready')
  const [countdownIndex, setCountdownIndex] = useState(0)
  const [lockedGesture, setLockedGesture] = useState<PlayableGesture | null>(null)
  const [noShow, setNoShow] = useState(false)
  const liveGestureRef = useRef(liveGesture)
  liveGestureRef.current = liveGesture

  const countdownValue =
    phase === 'countdown' ? COUNTDOWN_SEQUENCE[countdownIndex] : null

  const startRound = useCallback(() => {
    setLockedGesture(null)
    setNoShow(false)
    setCountdownIndex(0)
    setPhase('countdown')
  }, [])

  const playAgain = useCallback(() => {
    startRound()
  }, [startRound])

  useEffect(() => {
    if (phase !== 'countdown') {
      return
    }

    const timer = window.setTimeout(() => {
      const isLastTick = countdownIndex >= COUNTDOWN_SEQUENCE.length - 1

      if (isLastTick) {
        setPhase('hold')
        return
      }

      setCountdownIndex((index) => index + 1)
    }, COUNTDOWN_TICK_MS)

    return () => {
      window.clearTimeout(timer)
    }
  }, [phase, countdownIndex])

  useEffect(() => {
    if (phase !== 'hold') {
      return
    }

    const timer = window.setTimeout(() => {
      setPhase('judging')
    }, HOLD_AFTER_COUNTDOWN_MS)

    return () => {
      window.clearTimeout(timer)
    }
  }, [phase])

  useEffect(() => {
    if (phase !== 'judging') {
      return
    }

    let cancelled = false
    let attempt = 0
    let retryTimer = 0

    const finishWithGesture = (gesture: PlayableGesture) => {
      setLockedGesture(gesture)
      setNoShow(false)
      setPhase('result')
    }

    const finishWithNoShow = () => {
      setLockedGesture(null)
      setNoShow(true)
      setPhase('result')
    }

    const tryLock = () => {
      if (cancelled) {
        return
      }

      const current = liveGestureRef.current
      if (isPlayableGesture(current)) {
        finishWithGesture(current)
        return
      }

      attempt += 1
      if (attempt >= GESTURE_MAX_ATTEMPTS) {
        finishWithNoShow()
        return
      }

      retryTimer = window.setTimeout(tryLock, GESTURE_RETRY_MS)
    }

    tryLock()

    return () => {
      cancelled = true
      window.clearTimeout(retryTimer)
    }
  }, [phase])

  return {
    phase,
    countdownValue,
    lockedGesture,
    noShow,
    startRound,
    playAgain,
  }
}
