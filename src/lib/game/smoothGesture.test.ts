import { describe, expect, it } from 'vitest'
import { createGestureSmoother } from './smoothGesture'

describe('createGestureSmoother', () => {
  it('updates quickly when gestures are consistent', () => {
    const smoother = createGestureSmoother()

    expect(smoother.update('rock')).toBe('rock')
    expect(smoother.update('rock')).toBe('rock')
  })

  it('shows raw gesture immediately when confident', () => {
    const smoother = createGestureSmoother()

    expect(smoother.update('paper')).toBe('paper')
  })

  it('resolves to majority in short window', () => {
    const smoother = createGestureSmoother()

    smoother.update('rock')
    smoother.update('rock')
    expect(smoother.update('paper')).toBe('rock')
    expect(smoother.update('paper')).toBe('paper')
  })
})
