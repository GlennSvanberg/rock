import { describe, expect, it } from 'vitest'
import { classifyGesture } from './classifyGesture'
import { getFingerScores } from './landmarks'
import type { Landmark } from './types'

function makeLandmarks(
  overrides: Partial<Record<number, Partial<Landmark>>> = {},
): Landmark[] {
  return Array.from({ length: 21 }, (_, index) => ({
    x: 0.5,
    y: 0.5,
    z: 0,
    ...overrides[index],
  }))
}

function setFinger(
  landmarks: Landmark[],
  mcp: number,
  pip: number,
  dip: number,
  tip: number,
  x: number,
  curled: boolean,
) {
  if (curled) {
    landmarks[mcp] = { x, y: 0.55, z: 0 }
    landmarks[pip] = { x, y: 0.65, z: 0 }
    landmarks[dip] = { x, y: 0.68, z: 0 }
    landmarks[tip] = { x, y: 0.62, z: 0 }
  } else {
    landmarks[mcp] = { x, y: 0.72, z: 0 }
    landmarks[pip] = { x, y: 0.62, z: 0 }
    landmarks[dip] = { x, y: 0.52, z: 0 }
    landmarks[tip] = { x, y: 0.32, z: 0 }
  }
}

function setPartiallyCurledFinger(
  landmarks: Landmark[],
  mcp: number,
  pip: number,
  dip: number,
  tip: number,
  x: number,
) {
  landmarks[mcp] = { x, y: 0.68, z: 0 }
  landmarks[pip] = { x, y: 0.64, z: 0 }
  landmarks[dip] = { x, y: 0.61, z: 0 }
  landmarks[tip] = { x, y: 0.58, z: 0 }
}

function makeHandPose(
  fingers: [boolean, boolean, boolean, boolean],
  thumbExtended = false,
) {
  const landmarks = makeLandmarks({
    0: { x: 0.5, y: 0.8, z: 0 },
    1: { x: 0.44, y: 0.74, z: 0 },
    2: { x: 0.42, y: 0.72, z: 0 },
    5: { x: 0.48, y: 0.72, z: 0 },
    9: { x: 0.52, y: 0.72, z: 0 },
    13: { x: 0.56, y: 0.72, z: 0 },
    17: { x: 0.6, y: 0.72, z: 0 },
    3: thumbExtended
      ? { x: 0.36, y: 0.55, z: 0 }
      : { x: 0.42, y: 0.72, z: 0 },
    4: thumbExtended
      ? { x: 0.32, y: 0.42, z: 0 }
      : { x: 0.46, y: 0.7, z: 0 },
  })

  const joints = [
    [5, 6, 7, 8],
    [9, 10, 11, 12],
    [13, 14, 15, 16],
    [17, 18, 19, 20],
  ] as const
  const xs = [0.5, 0.54, 0.58, 0.62]

  fingers.forEach((extended, index) => {
    const [mcp, pip, dip, tip] = joints[index]
    setFinger(landmarks, mcp, pip, dip, tip, xs[index], !extended)
  })

  return landmarks
}

describe('classifyGesture', () => {
  it('returns none when landmarks are missing', () => {
    expect(classifyGesture(null)).toBe('none')
    expect(classifyGesture([])).toBe('none')
  })

  it('detects rock when all fingers are curled', () => {
    expect(classifyGesture(makeHandPose([false, false, false, false], false))).toBe(
      'rock',
    )
  })

  it('detects paper when all fingers are extended', () => {
    expect(classifyGesture(makeHandPose([true, true, true, true], true))).toBe(
      'paper',
    )
  })

  it('detects scissors when index and middle are extended', () => {
    expect(classifyGesture(makeHandPose([true, true, false, false], false))).toBe(
      'scissors',
    )
  })

  it('detects scissors when ring and pinky are only slightly lifted', () => {
    const landmarks = makeHandPose([true, true, false, false], false)
    setPartiallyCurledFinger(landmarks, 13, 14, 15, 16, 0.58)
    setPartiallyCurledFinger(landmarks, 17, 18, 19, 20, 0.62)

    const scores = getFingerScores(landmarks)
    expect(scores.index).toBeGreaterThan(0.18)
    expect(scores.middle).toBeGreaterThan(0.18)
    expect(classifyGesture(landmarks)).toBe('scissors')
  })

  it('returns none for ambiguous poses', () => {
    expect(classifyGesture(makeHandPose([true, false, false, false], false))).toBe(
      'none',
    )
  })
})
