import {
  INDEX_DIP,
  INDEX_MCP,
  INDEX_PIP,
  INDEX_TIP,
  MIDDLE_DIP,
  MIDDLE_MCP,
  MIDDLE_PIP,
  MIDDLE_TIP,
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

const FINGER_CHAINS = [
  { mcp: INDEX_MCP, pip: INDEX_PIP, dip: INDEX_DIP, tip: INDEX_TIP },
  { mcp: MIDDLE_MCP, pip: MIDDLE_PIP, dip: MIDDLE_DIP, tip: MIDDLE_TIP },
  { mcp: RING_MCP, pip: RING_PIP, dip: RING_DIP, tip: RING_TIP },
  { mcp: PINKY_MCP, pip: PINKY_PIP, dip: PINKY_DIP, tip: PINKY_TIP },
] as const

const MCP_OFFSETS: Vec3[] = [
  { x: -0.1, y: -0.14, z: 0.01 },
  { x: -0.03, y: -0.18, z: 0 },
  { x: 0.04, y: -0.17, z: 0 },
  { x: 0.1, y: -0.13, z: 0.01 },
]

const EXTENDED_SEGMENTS: [Vec3, Vec3, Vec3] = [
  { x: 0, y: -0.09, z: 0.01 },
  { x: 0, y: -0.08, z: 0.01 },
  { x: 0, y: -0.07, z: 0.02 },
]

const CURLED_SEGMENTS: [Vec3, Vec3, Vec3] = [
  { x: 0.02, y: -0.04, z: 0.03 },
  { x: 0.03, y: -0.02, z: 0.04 },
  { x: 0.02, y: 0.01, z: 0.03 },
]

function add(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z }
}

function lerpVec(a: Vec3, b: Vec3, t: number): Vec3 {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    z: a.z + (b.z - a.z) * t,
  }
}

function mixSegments(ext: number): [Vec3, Vec3, Vec3] {
  return [
    lerpVec(CURLED_SEGMENTS[0], EXTENDED_SEGMENTS[0], ext),
    lerpVec(CURLED_SEGMENTS[1], EXTENDED_SEGMENTS[1], ext),
    lerpVec(CURLED_SEGMENTS[2], EXTENDED_SEGMENTS[2], ext),
  ]
}

function buildThumb(
  wrist: Vec3,
  indexMcp: Vec3,
  extension: number,
  spread: number,
): [Vec3, Vec3, Vec3, Vec3] {
  const cmc = add(wrist, { x: -0.08, y: -0.05, z: 0.02 })
  const extendedMcp = add(cmc, { x: -0.05 * spread, y: -0.03, z: 0 })
  const curledMcp = add(cmc, { x: 0.04, y: -0.02, z: 0.03 })
  const mcp = lerpVec(curledMcp, extendedMcp, extension)

  const extendedIp = add(mcp, { x: -0.04 * spread, y: -0.05, z: 0.01 })
  const curledIp = add(mcp, { x: 0.03, y: -0.03, z: 0.02 })
  const ip = lerpVec(curledIp, extendedIp, extension)

  const extendedTip = add(ip, { x: -0.03 * spread, y: -0.05, z: 0.01 })
  const curledTip = add(ip, { x: 0.02, y: 0.01, z: 0.02 })
  const tip = lerpVec(curledTip, extendedTip, extension)

  return [cmc, mcp, ip, tip]
}

export type HandPoseConfig = {
  fingers: [number, number, number, number]
  thumb: number
  center?: Vec3
}

export function buildHandPose({
  fingers,
  thumb,
  center = { x: 0.5, y: 0.62, z: 0 },
}: HandPoseConfig): Landmark[] {
  const landmarks: Landmark[] = Array.from({ length: 21 }, () => ({
    x: 0,
    y: 0,
    z: 0,
  }))

  const wrist = add(center, { x: 0, y: 0.12, z: 0 })
  landmarks[WRIST] = wrist

  let indexMcp: Vec3 = wrist

  FINGER_CHAINS.forEach((chain, fingerIndex) => {
    const mcp = add(wrist, MCP_OFFSETS[fingerIndex])
    if (fingerIndex === 0) {
      indexMcp = mcp
    }

    const extension = fingers[fingerIndex]
    const segments = mixSegments(extension)

    landmarks[chain.mcp] = mcp
    const pip = add(mcp, segments[0])
    landmarks[chain.pip] = pip
    const dip = add(pip, segments[1])
    landmarks[chain.dip] = dip
    landmarks[chain.tip] = add(dip, segments[2])
  })

  const [thumbCmc, thumbMcp, thumbIp, thumbTip] = buildThumb(
    wrist,
    indexMcp,
    thumb,
    1,
  )
  landmarks[THUMB_CMC] = thumbCmc
  landmarks[THUMB_MCP] = thumbMcp
  landmarks[THUMB_IP] = thumbIp
  landmarks[THUMB_TIP] = thumbTip

  return landmarks
}

export const ROCK_POSE = buildHandPose({
  fingers: [0.05, 0.05, 0.05, 0.05],
  thumb: 0.15,
})

export const PAPER_POSE = buildHandPose({
  fingers: [1, 1, 1, 1],
  thumb: 0.85,
})

export const SCISSORS_POSE = buildHandPose({
  fingers: [1, 1, 0.05, 0.05],
  thumb: 0.7,
})

export const IDLE_POSE = buildHandPose({
  fingers: [0.35, 0.35, 0.35, 0.35],
  thumb: 0.4,
  center: { x: 0.5, y: 0.65, z: 0 },
})

export const POSES: Record<PlayableGesture, Landmark[]> = {
  rock: ROCK_POSE,
  paper: PAPER_POSE,
  scissors: SCISSORS_POSE,
}

export function lerpLandmarks(
  from: Landmark[],
  to: Landmark[],
  t: number,
): Landmark[] {
  const clamped = Math.min(1, Math.max(0, t))
  return from.map((a, index) => {
    const b = to[index]
    return {
      x: a.x + (b.x - a.x) * clamped,
      y: a.y + (b.y - a.y) * clamped,
      z: a.z + (b.z - a.z) * clamped,
    }
  })
}

