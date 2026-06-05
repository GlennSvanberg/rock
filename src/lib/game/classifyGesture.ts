import { getFingerScores } from './landmarks'
import type { Gesture, Landmark } from './types'

const EXTENDED = 0.18
const CLEARLY_EXTENDED = 0.28
const CURLED = 0.14

export function classifyGesture(landmarks: Landmark[] | null | undefined): Gesture {
  if (!landmarks || landmarks.length < 21) {
    return 'none'
  }

  const { index, middle, ring, pinky } = getFingerScores(landmarks)
  const vSign = index + middle
  const curledSide = ring + pinky
  const allFingers = index + middle + ring + pinky

  const indexUp = index > EXTENDED
  const middleUp = middle > EXTENDED
  const ringUp = ring > EXTENDED
  const pinkyUp = pinky > EXTENDED

  const indexStrong = index > CLEARLY_EXTENDED
  const middleStrong = middle > CLEARLY_EXTENDED

  if (indexUp && middleUp && vSign > curledSide + 0.08) {
    const ringCurledEnough = ring < CLEARLY_EXTENDED
    const pinkyCurledEnough = pinky < CLEARLY_EXTENDED
    if (ringCurledEnough && pinkyCurledEnough) {
      return 'scissors'
    }
    if (vSign > curledSide + 0.2) {
      return 'scissors'
    }
  }

  if (indexStrong && middleStrong && ring < CURLED + 0.05 && pinky < CURLED + 0.05) {
    return 'scissors'
  }

  if (indexUp && middleUp && ringUp && pinkyUp) {
    return 'paper'
  }

  if (allFingers > 0.9 && indexUp && middleUp && ringUp) {
    return 'paper'
  }

  if (!indexUp && !middleUp && !ringUp && !pinkyUp) {
    return 'rock'
  }

  if (index < CURLED && middle < CURLED && ring < CURLED && pinky < CURLED) {
    return 'rock'
  }

  return 'none'
}
