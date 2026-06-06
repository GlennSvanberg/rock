export type Gesture = 'rock' | 'paper' | 'scissors' | 'none'

export type PlayableGesture = Exclude<Gesture, 'none'>

export type Landmark = {
  x: number
  y: number
  z: number
}
