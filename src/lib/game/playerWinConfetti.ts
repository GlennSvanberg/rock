import type { CreateTypes } from 'canvas-confetti'

const WIN_COLORS = ['#39ff14', '#6dff4a', '#22c55e', '#ffffff', '#bbf7d0']

export function firePlayerWinConfetti(confetti: CreateTypes) {
  const duration = 2800
  const end = Date.now() + duration

  confetti({
    particleCount: 140,
    spread: 110,
    startVelocity: 48,
    origin: { x: 0.5, y: 0.4 },
    colors: WIN_COLORS,
    ticks: 220,
    zIndex: 9999,
  })

  const frame = () => {
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 75,
      origin: { x: 0, y: 0.7 },
      colors: WIN_COLORS,
      zIndex: 9999,
    })
    confetti({
      particleCount: 5,
      angle: 120,
      spread: 75,
      origin: { x: 1, y: 0.7 },
      colors: WIN_COLORS,
      zIndex: 9999,
    })
    confetti({
      particleCount: 3,
      angle: 270,
      spread: 90,
      origin: { x: Math.random(), y: 0.1 },
      colors: WIN_COLORS,
      zIndex: 9999,
    })

    if (Date.now() < end) {
      requestAnimationFrame(frame)
    }
  }

  frame()
}
