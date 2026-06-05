import type { Gesture } from './types'

const WINDOW_SIZE = 3
const GESTURE_PRIORITY: Gesture[] = ['scissors', 'paper', 'rock', 'none']

export function createGestureSmoother() {
  const history: Gesture[] = []
  let display: Gesture = 'none'

  return {
    update(raw: Gesture): Gesture {
      history.push(raw)
      if (history.length > WINDOW_SIZE) {
        history.shift()
      }

      const counts = new Map<Gesture, number>()
      for (const gesture of history) {
        counts.set(gesture, (counts.get(gesture) ?? 0) + 1)
      }

      const minVotes = Math.max(2, Math.ceil(history.length * 0.5))
      let best: Gesture = 'none'
      let bestCount = 0

      for (const gesture of GESTURE_PRIORITY) {
        const count = counts.get(gesture) ?? 0
        if (count >= minVotes && count > bestCount) {
          best = gesture
          bestCount = count
        }
      }

      if (bestCount >= minVotes) {
        display = best
      } else if (raw !== 'none') {
        display = raw
      } else if (bestCount > 0) {
        display = best
      }

      return display
    },
    reset() {
      history.length = 0
      display = 'none'
    },
  }
}
