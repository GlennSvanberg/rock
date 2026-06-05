import { createFileRoute } from '@tanstack/react-router'
import { HandGame } from '@/components/game/HandGame'

export const Route = createFileRoute('/game')({
  component: GamePage,
})

function GamePage() {
  return <HandGame />
}
