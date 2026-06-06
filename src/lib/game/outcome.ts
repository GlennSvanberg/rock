import type { PlayableGesture } from '@/lib/game/types'

const BEATS: Record<PlayableGesture, PlayableGesture> = {
  rock: 'paper',
  paper: 'scissors',
  scissors: 'rock',
}

const LOSES_TO: Record<PlayableGesture, PlayableGesture> = {
  rock: 'scissors',
  paper: 'rock',
  scissors: 'paper',
}

export function getWinningGesture(player: PlayableGesture): PlayableGesture {
  return BEATS[player]
}

export function getLosingGesture(player: PlayableGesture): PlayableGesture {
  return LOSES_TO[player]
}

export function getComputerGesture(
  player: PlayableGesture,
  options: { playerAlwaysWins: boolean },
): PlayableGesture {
  return options.playerAlwaysWins
    ? getLosingGesture(player)
    : getWinningGesture(player)
}
