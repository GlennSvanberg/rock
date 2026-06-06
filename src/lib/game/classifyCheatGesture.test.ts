import { describe, expect, it } from 'vitest'
import { classifyCheatGesture } from './classifyCheatGesture'
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

function makeThumbDownPose() {
  const landmarks = makeHandPose([false, false, false, false], false)
  landmarks[3] = { x: 0.42, y: 0.72, z: 0 }
  landmarks[4] = { x: 0.46, y: 0.88, z: 0 }
  return landmarks
}

describe('classifyCheatGesture', () => {
  it('returns none when landmarks are missing', () => {
    expect(classifyCheatGesture(null)).toBe('none')
    expect(classifyCheatGesture([])).toBe('none')
  })

  it('detects thumb up when thumb is extended and fingers are curled', () => {
    expect(
      classifyCheatGesture(makeHandPose([false, false, false, false], true)),
    ).toBe('thumb_up')
  })

  it('detects thumb down when fingers are curled and thumb points down', () => {
    expect(classifyCheatGesture(makeThumbDownPose())).toBe('thumb_down')
  })

  it('returns none for rock pose with thumb tucked', () => {
    expect(
      classifyCheatGesture(makeHandPose([false, false, false, false], false)),
    ).toBe('none')
  })

  it('returns none when fingers are extended', () => {
    expect(
      classifyCheatGesture(makeHandPose([true, true, true, true], true)),
    ).toBe('none')
  })
})
