import { useCallback, useEffect, useRef, useState } from 'react'
import { getComputerGesture } from '@/lib/game/outcome'
import { COMPUTER_REVEAL_MS } from '@/lib/game/timing'
import type { Gesture, PlayableGesture } from '@/lib/game/types'

export type RoundPhase =
  | 'ready'
  | 'countdown'
  | 'hold'
  | 'judging'
  | 'reveal'
  | 'result'
export type RoundWinner = 'player' | 'computer'
export type { PlayableGesture }

const COUNTDOWN_SEQUENCE = [3, 2, 1] as const
const COUNTDOWN_TICK_MS = 1000
const HOLD_AFTER_COUNTDOWN_MS = 100
const GESTURE_RETRY_MS = 50
const GESTURE_MAX_ATTEMPTS = 5

function isPlayableGesture(gesture: Gesture): gesture is PlayableGesture {
  return gesture !== 'none'
}

export function useRound(
  liveGesture: Gesture,
  playerAlwaysWins: boolean,
) {
  const [phase, setPhase] = useState<RoundPhase>('ready')
  const [countdownIndex, setCountdownIndex] = useState(0)
  const [lockedGesture, setLockedGesture] = useState<PlayableGesture | null>(null)
  const [computerGesture, setComputerGesture] = useState<PlayableGesture | null>(
    null,
  )
  const [noShow, setNoShow] = useState(false)
  const [roundWinner, setRoundWinner] = useState<RoundWinner | null>(null)
  const [sessionScore, setSessionScore] = useState({ player: 0, computer: 0 })
  const liveGestureRef = useRef(liveGesture)
  liveGestureRef.current = liveGesture
  const playerAlwaysWinsRef = useRef(playerAlwaysWins)
  playerAlwaysWinsRef.current = playerAlwaysWins
  const pendingWinnerRef = useRef<RoundWinner | null>(null)

  const countdownValue =
    phase === 'countdown' ? COUNTDOWN_SEQUENCE[countdownIndex] : null

  const startRound = useCallback(() => {
    setLockedGesture(null)
    setComputerGesture(null)
    setNoShow(false)
    setRoundWinner(null)
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
      const easyMode = playerAlwaysWinsRef.current
      const winner: RoundWinner = easyMode ? 'player' : 'computer'
      setLockedGesture(gesture)
      setComputerGesture(
        getComputerGesture(gesture, { playerAlwaysWins: easyMode }),
      )
      setNoShow(false)
      pendingWinnerRef.current = winner
      setPhase('reveal')
    }

    const finishWithNoShow = () => {
      setLockedGesture(null)
      setComputerGesture(null)
      setNoShow(true)
      setRoundWinner('computer')
      setSessionScore((score) => ({
        ...score,
        computer: score.computer + 1,
      }))
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

  useEffect(() => {
    if (phase !== 'reveal') {
      return
    }

    const timer = window.setTimeout(() => {
      const winner = pendingWinnerRef.current
      if (winner) {
        setRoundWinner(winner)
        setSessionScore((score) => ({
          ...score,
          [winner]: score[winner] + 1,
        }))
        pendingWinnerRef.current = null
      }
      setPhase('result')
    }, COMPUTER_REVEAL_MS)

    return () => {
      window.clearTimeout(timer)
    }
  }, [phase])

  return {
    phase,
    countdownValue,
    lockedGesture,
    computerGesture,
    noShow,
    roundWinner,
    sessionScore,
    startRound,
    playAgain,
  }
}
