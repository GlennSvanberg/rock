import {
  cloneLandmarks,
  INDEX_DIP,
  INDEX_MCP,
  INDEX_PIP,
  INDEX_TIP,
  MIDDLE_DIP,
  MIDDLE_MCP,
  MIDDLE_PIP,
  MIDDLE_TIP,
  palmScale,
  PINKY_DIP,
  PINKY_MCP,
  PINKY_PIP,
  PINKY_TIP,
  RING_DIP,
  RING_MCP,
  RING_PIP,
  RING_TIP,
  THUMB_CMC,
  THUMB_IP,
  THUMB_MCP,
  THUMB_TIP,
  WRIST,
} from './landmarks'
import type { Landmark, PlayableGesture } from './types'

type Vec3 = { x: number; y: number; z: number }

type FingerChain = {
  mcp: number
  pip: number
  dip: number
  tip: number
}

const FINGER_CHAINS: FingerChain[] = [
  { mcp: INDEX_MCP, pip: INDEX_PIP, dip: INDEX_DIP, tip: INDEX_TIP },
  { mcp: MIDDLE_MCP, pip: MIDDLE_PIP, dip: MIDDLE_DIP, tip: MIDDLE_TIP },
  { mcp: RING_MCP, pip: RING_PIP, dip: RING_DIP, tip: RING_TIP },
  { mcp: PINKY_MCP, pip: PINKY_PIP, dip: PINKY_DIP, tip: PINKY_TIP },
]

const THUMB_CHAIN = {
  cmc: THUMB_CMC,
  mcp: THUMB_MCP,
  ip: THUMB_IP,
  tip: THUMB_TIP,
}

export type GestureShape = {
  fingers: [number, number, number, number]
  thumb: number
  /** Lateral spread for index/middle when extended (scissors). */
  scissorsSpread?: number
}

export const GESTURE_SHAPES: Record<PlayableGesture, GestureShape> = {
  rock: { fingers: [0.04, 0.04, 0.04, 0.04], thumb: 0.08 },
  paper: { fingers: [1, 1, 1, 1], thumb: 0.8 },
  scissors: {
    fingers: [1, 1, 0.04, 0.04],
    thumb: 0.65,
    scissorsSpread: 0.12,
  },
}

/** Lateral curl bias per finger so a fist reads as four distinct knuckles. */
const FINGER_CURL_LATERAL = [-0.12, -0.04, 0.04, 0.1] as const

export const PREP_SHAPE: GestureShape = GESTURE_SHAPES.rock

function sub(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z }
}

function add(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z }
}

function scaleVec(v: Vec3, s: number): Vec3 {
  return { x: v.x * s, y: v.y * s, z: v.z * s }
}

function length(v: Vec3): number {
  return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z)
}

function normalize(v: Vec3): Vec3 {
  const len = length(v)
  if (len < 1e-6) {
    return { x: 0, y: -1, z: 0 }
  }
  return scaleVec(v, 1 / len)
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

function lerpVec(a: Vec3, b: Vec3, t: number): Vec3 {
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
    z: lerp(a.z, b.z, t),
  }
}

function palmCenter(landmarks: Landmark[]): Vec3 {
  return {
    x:
      (landmarks[INDEX_MCP].x +
        landmarks[MIDDLE_MCP].x +
        landmarks[RING_MCP].x +
        landmarks[PINKY_MCP].x) /
      4,
    y:
      (landmarks[INDEX_MCP].y +
        landmarks[MIDDLE_MCP].y +
        landmarks[RING_MCP].y +
        landmarks[PINKY_MCP].y) /
      4,
    z:
      (landmarks[INDEX_MCP].z +
        landmarks[MIDDLE_MCP].z +
        landmarks[RING_MCP].z +
        landmarks[PINKY_MCP].z) /
      4,
  }
}

function fingerSpreadOffset(
  landmarks: Landmark[],
  fingerIndex: number,
  spread: number,
): Vec3 {
  if (spread <= 0) {
    return { x: 0, y: 0, z: 0 }
  }

  const lateral = normalize(
    sub(landmarks[PINKY_MCP], landmarks[INDEX_MCP]),
  )

  if (fingerIndex === 0) {
    return scaleVec(lateral, -spread)
  }

  if (fingerIndex === 1) {
    return scaleVec(lateral, spread)
  }

  return { x: 0, y: 0, z: 0 }
}

function fingerCurlLateralOffset(
  landmarks: Landmark[],
  fingerIndex: number,
  bend: number,
): Vec3 {
  if (bend <= 0) {
    return { x: 0, y: 0, z: 0 }
  }

  const lateral = normalize(
    sub(landmarks[PINKY_MCP], landmarks[INDEX_MCP]),
  )
  return scaleVec(lateral, FINGER_CURL_LATERAL[fingerIndex] * bend * palmScale(landmarks))
}

function segmentDirection(
  extendDir: Vec3,
  curlDir: Vec3,
  bend: number,
  jointBend: number,
  curlLateral: Vec3,
): Vec3 {
  const t = Math.min(1, bend * jointBend)
  return normalize(add(lerpVec(extendDir, curlDir, t), curlLateral))
}

function setFingerShape(
  landmarks: Landmark[],
  chain: FingerChain,
  fingerIndex: number,
  extension: number,
  spread: number,
): void {
  const scale = palmScale(landmarks)
  const mcp = landmarks[chain.mcp]
  const wrist = landmarks[WRIST]
  const center = palmCenter(landmarks)

  const maxReach = scale * 0.92
  const curledReach = scale * 0.3
  const totalReach = lerp(curledReach, maxReach, extension)

  const awayFromWrist = normalize(sub(mcp, wrist))
  const towardPalm = normalize(sub(center, mcp))
  const bend = 1 - extension
  const curlDir = normalize(
    add(scaleVec(towardPalm, 0.82), scaleVec(awayFromWrist, -0.18)),
  )

  const spreadOffset = fingerSpreadOffset(
    landmarks,
    fingerIndex,
    spread * extension,
  )
  const curlLateral = fingerCurlLateralOffset(landmarks, fingerIndex, bend)

  const seg1Len = totalReach * 0.38
  const seg2Len = totalReach * 0.34
  const seg3Len = totalReach * 0.28

  const seg1Dir = segmentDirection(awayFromWrist, curlDir, bend, 0.45, curlLateral)
  const seg2Dir = segmentDirection(awayFromWrist, curlDir, bend, 0.72, scaleVec(curlLateral, 0.6))
  const seg3Dir = segmentDirection(awayFromWrist, curlDir, bend, 0.92, scaleVec(curlLateral, 0.35))

  const pip = add(mcp, add(scaleVec(seg1Dir, seg1Len), spreadOffset))
  const dip = add(pip, scaleVec(seg2Dir, seg2Len))
  const tip = add(dip, scaleVec(seg3Dir, seg3Len))

  landmarks[chain.pip] = pip
  landmarks[chain.dip] = dip
  landmarks[chain.tip] = tip
}

function setThumbShape(landmarks: Landmark[], extension: number): void {
  const scale = palmScale(landmarks)
  const cmc = landmarks[THUMB_CHAIN.cmc]
  const wrist = landmarks[WRIST]
  const indexMcp = landmarks[INDEX_MCP]
  const center = palmCenter(landmarks)

  const maxReach = scale * 0.55
  const curledReach = scale * 0.24
  const totalReach = lerp(curledReach, maxReach, extension)

  const awayFromWrist = normalize(sub(cmc, wrist))
  const towardIndex = normalize(sub(indexMcp, cmc))
  const acrossPalm = normalize(sub(center, cmc))
  const bend = 1 - extension

  const extendDir = normalize(
    add(scaleVec(awayFromWrist, 0.55), scaleVec(towardIndex, 0.45)),
  )
  const curlDir = normalize(
    add(scaleVec(towardIndex, 0.62), scaleVec(acrossPalm, 0.38)),
  )

  const seg1Len = totalReach * 0.34
  const seg2Len = totalReach * 0.36
  const seg3Len = totalReach * 0.3

  const seg1Dir = segmentDirection(extendDir, curlDir, bend, 0.4, { x: 0, y: 0, z: 0 })
  const seg2Dir = segmentDirection(extendDir, curlDir, bend, 0.68, { x: 0, y: 0, z: 0 })
  const seg3Dir = segmentDirection(extendDir, curlDir, bend, 0.9, { x: 0, y: 0, z: 0 })

  const mcp = add(cmc, scaleVec(seg1Dir, seg1Len))
  const ip = add(mcp, scaleVec(seg2Dir, seg2Len))
  const tip = add(ip, scaleVec(seg3Dir, seg3Len))

  landmarks[THUMB_CHAIN.mcp] = mcp
  landmarks[THUMB_CHAIN.ip] = ip
  landmarks[THUMB_CHAIN.tip] = tip
}

/**
 * Morph only finger joints on a fixed palm — wrist and MCPs stay put.
 */
export function morphFingersToGesture(
  base: Landmark[],
  gesture: PlayableGesture,
  t: number,
): Landmark[] {
  const clamped = Math.min(1, Math.max(0, t))
  const result = cloneLandmarks(base)
  const target = GESTURE_SHAPES[gesture]
  const spread = target.scissorsSpread ?? 0

  for (let i = 0; i < FINGER_CHAINS.length; i++) {
    const chain = FINGER_CHAINS[i]
    const fromExt = estimateFingerExtension(base, chain)
    const toExt = target.fingers[i]
    setFingerShape(result, chain, i, lerp(fromExt, toExt, clamped), spread)
  }

  const fromThumb = estimateThumbExtension(base)
  setThumbShape(result, lerp(fromThumb, target.thumb, clamped))

  return result
}

function estimateFingerExtension(base: Landmark[], chain: FingerChain): number {
  const scale = palmScale(base)
  const mcp = base[chain.mcp]
  const tip = base[chain.tip]
  const reach = length(sub(tip, mcp)) / scale
  return Math.min(1, Math.max(0, (reach - 0.3) / (0.92 - 0.3)))
}

function estimateThumbExtension(base: Landmark[]): number {
  const scale = palmScale(base)
  const cmc = base[THUMB_CHAIN.cmc]
  const tip = base[THUMB_CHAIN.tip]
  const reach = length(sub(tip, cmc)) / scale
  return Math.min(1, Math.max(0, (reach - 0.24) / (0.55 - 0.24)))
}
