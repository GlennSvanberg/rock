import { useEffect, useRef, useState } from 'react'
import { classifyCheatGesture } from '@/lib/game/classifyCheatGesture'
import type { CheatGesture } from '@/lib/game/classifyCheatGesture'
import type { Landmark } from '@/lib/game/types'
import type { RoundPhase } from '@/hooks/useRound'

const HOLD_MS = 800
const COOLDOWN_MS = 2000

function canToggle(phase: RoundPhase): boolean {
  return (
    phase !== 'countdown' &&
    phase !== 'hold' &&
    phase !== 'reveal'
  )
}

export function useCheatModes(
  landmarksRef: React.RefObject<Landmark[] | null>,
  enabled: boolean,
  phaseRef: React.RefObject<RoundPhase>,
) {
  const [playerAlwaysWins, setPlayerAlwaysWins] = useState(false)
  const [computerAlwaysWins, setComputerAlwaysWins] = useState(true)

  const holdGestureRef = useRef<CheatGesture>('none')
  const holdStartRef = useRef(0)
  const cooldownUntilRef = useRef(0)

  useEffect(() => {
    if (!enabled) {
      return
    }

    let raf = 0

    const tick = () => {
      const now = performance.now()
      const landmarks = landmarksRef.current
      const detected = classifyCheatGesture(landmarks)

      if (
        now < cooldownUntilRef.current ||
        !canToggle(phaseRef.current ?? 'ready')
      ) {
        holdGestureRef.current = 'none'
        holdStartRef.current = 0
        raf = requestAnimationFrame(tick)
        return
      }

      if (detected === holdGestureRef.current && detected !== 'none') {
        if (holdStartRef.current === 0) {
          holdStartRef.current = now
        } else if (now - holdStartRef.current >= HOLD_MS) {
          if (detected === 'thumb_up') {
            setPlayerAlwaysWins((value) => !value)
          } else if (detected === 'thumb_down') {
            setComputerAlwaysWins((value) => !value)
          }

          cooldownUntilRef.current = now + COOLDOWN_MS
          holdGestureRef.current = 'none'
          holdStartRef.current = 0
        }
      } else {
        holdGestureRef.current = detected
        holdStartRef.current = detected !== 'none' ? now : 0
      }

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
    }
  }, [enabled, landmarksRef])

  return { playerAlwaysWins, computerAlwaysWins }
}
