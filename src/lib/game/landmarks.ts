import type { Landmark } from './types'

export const WRIST = 0
export const THUMB_CMC = 1
export const THUMB_MCP = 2
export const THUMB_IP = 3
export const THUMB_TIP = 4
export const INDEX_MCP = 5
export const INDEX_PIP = 6
export const INDEX_DIP = 7
export const INDEX_TIP = 8
export const MIDDLE_MCP = 9
export const MIDDLE_PIP = 10
export const MIDDLE_DIP = 11
export const MIDDLE_TIP = 12
export const RING_MCP = 13
export const RING_PIP = 14
export const RING_DIP = 15
export const RING_TIP = 16
export const PINKY_MCP = 17
export const PINKY_PIP = 18
export const PINKY_DIP = 19
export const PINKY_TIP = 20

const FINGERS = [
  { mcp: INDEX_MCP, pip: INDEX_PIP, dip: INDEX_DIP, tip: INDEX_TIP },
  { mcp: MIDDLE_MCP, pip: MIDDLE_PIP, dip: MIDDLE_DIP, tip: MIDDLE_TIP },
  { mcp: RING_MCP, pip: RING_PIP, dip: RING_DIP, tip: RING_TIP },
  { mcp: PINKY_MCP, pip: PINKY_PIP, dip: PINKY_DIP, tip: PINKY_TIP },
] as const

export type FingerScores = {
  index: number
  middle: number
  ring: number
  pinky: number
  thumb: number
}

export function distance(a: Landmark, b: Landmark): number {
  const dx = a.x - b.x
  const dy = a.y - b.y
  const dz = a.z - b.z
  return Math.sqrt(dx * dx + dy * dy + dz * dz)
}

function palmScale(landmarks: Landmark[]): number {
  const wristToMiddle = distance(landmarks[WRIST], landmarks[MIDDLE_MCP])
  const indexToPinky = distance(landmarks[INDEX_MCP], landmarks[PINKY_MCP])
  return Math.max(wristToMiddle, indexToPinky, 0.05)
}

export function getFingerExtensionScore(
  landmarks: Landmark[],
  mcpIndex: number,
  pipIndex: number,
  dipIndex: number,
  tipIndex: number,
): number {
  const mcp = landmarks[mcpIndex]
  const pip = landmarks[pipIndex]
  const dip = landmarks[dipIndex]
  const tip = landmarks[tipIndex]
  const scale = palmScale(landmarks)

  const tipToMcp = distance(tip, mcp)
  const pipToMcp = distance(pip, mcp)
  const tipToPip = distance(tip, pip)
  const dipToPip = distance(dip, pip)

  const reach = Math.max(0, tipToMcp - pipToMcp * 0.88) / scale
  const straight = Math.max(0, tipToPip - dipToPip * 0.75) / scale

  return Math.min(1, reach * 1.4 + straight * 0.6)
}

export function getThumbExtensionScore(landmarks: Landmark[]): number {
  const thumbTip = landmarks[THUMB_TIP]
  const thumbIp = landmarks[THUMB_IP]
  const indexMcp = landmarks[INDEX_MCP]
  const scale = palmScale(landmarks)

  const spread = Math.max(0, distance(thumbTip, indexMcp) - distance(thumbIp, indexMcp)) / scale
  return Math.min(1, spread * 1.2)
}

export function getFingerScores(landmarks: Landmark[]): FingerScores {
  const [index, middle, ring, pinky] = FINGERS.map(({ mcp, pip, dip, tip }) =>
    getFingerExtensionScore(landmarks, mcp, pip, dip, tip),
  )

  return {
    index,
    middle,
    ring,
    pinky,
    thumb: getThumbExtensionScore(landmarks),
  }
}

export function isFingerExtended(
  landmarks: Landmark[],
  mcpIndex: number,
  pipIndex: number,
  dipIndex: number,
  tipIndex: number,
): boolean {
  return getFingerExtensionScore(landmarks, mcpIndex, pipIndex, dipIndex, tipIndex) > 0.18
}

export function isThumbExtended(landmarks: Landmark[]): boolean {
  return getThumbExtensionScore(landmarks) > 0.2
}

export function getFingerStates(landmarks: Landmark[]) {
  const scores = getFingerScores(landmarks)
  return {
    index: scores.index > 0.18,
    middle: scores.middle > 0.18,
    ring: scores.ring > 0.18,
    pinky: scores.pinky > 0.18,
    thumb: scores.thumb > 0.2,
  }
}

type Connection = { start: number; end: number }

export function drawHandLandmarks(
  ctx: CanvasRenderingContext2D,
  landmarks: Landmark[],
  connections: Connection[],
  width: number,
  height: number,
) {
  ctx.clearRect(0, 0, width, height)

  ctx.strokeStyle = 'rgba(57, 255, 20, 0.85)'
  ctx.lineWidth = 3
  for (const { start, end } of connections) {
    const a = landmarks[start]
    const b = landmarks[end]
    ctx.beginPath()
    ctx.moveTo(a.x * width, a.y * height)
    ctx.lineTo(b.x * width, b.y * height)
    ctx.stroke()
  }

  ctx.fillStyle = 'rgba(109, 255, 74, 0.95)'
  for (const landmark of landmarks) {
    ctx.beginPath()
    ctx.arc(landmark.x * width, landmark.y * height, 5, 0, Math.PI * 2)
    ctx.fill()
  }
}
