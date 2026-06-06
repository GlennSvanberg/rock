import {
  getFingerScores,
  isThumbExtended,
  THUMB_MCP,
  THUMB_TIP,
  WRIST,
} from './landmarks'
import type { Landmark } from './types'

export type CheatGesture = 'thumb_up' | 'thumb_down' | 'none'

const EXTENDED = 0.18

function areFingersCurled(landmarks: Landmark[]): boolean {
  const { index, middle, ring, pinky } = getFingerScores(landmarks)
  return (
    index <= EXTENDED &&
    middle <= EXTENDED &&
    ring <= EXTENDED &&
    pinky <= EXTENDED
  )
}

function isThumbPointingDown(landmarks: Landmark[]): boolean {
  const thumbTip = landmarks[THUMB_TIP]
  const thumbMcp = landmarks[THUMB_MCP]
  const wrist = landmarks[WRIST]
  return thumbTip.y > thumbMcp.y + 0.04 && thumbTip.y > wrist.y + 0.02
}

function isThumbPointingUp(landmarks: Landmark[]): boolean {
  const thumbTip = landmarks[THUMB_TIP]
  const thumbMcp = landmarks[THUMB_MCP]
  return isThumbExtended(landmarks) && thumbTip.y < thumbMcp.y - 0.04
}

export function classifyCheatGesture(
  landmarks: Landmark[] | null | undefined,
): CheatGesture {
  if (!landmarks || landmarks.length < 21) {
    return 'none'
  }

  if (!areFingersCurled(landmarks)) {
    return 'none'
  }

  if (isThumbPointingDown(landmarks)) {
    return 'thumb_down'
  }

  if (isThumbPointingUp(landmarks)) {
    return 'thumb_up'
  }

  return 'none'
}
