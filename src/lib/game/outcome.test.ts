import { describe, expect, it } from 'vitest'
import {
  getComputerGesture,
  getLosingGesture,
  getWinningGesture,
} from './outcome'

describe('getWinningGesture', () => {
  it('picks paper to beat rock', () => {
    expect(getWinningGesture('rock')).toBe('paper')
  })

  it('picks scissors to beat paper', () => {
    expect(getWinningGesture('paper')).toBe('scissors')
  })

  it('picks rock to beat scissors', () => {
    expect(getWinningGesture('scissors')).toBe('rock')
  })
})

describe('getLosingGesture', () => {
  it('picks scissors to lose to rock', () => {
    expect(getLosingGesture('rock')).toBe('scissors')
  })

  it('picks rock to lose to paper', () => {
    expect(getLosingGesture('paper')).toBe('rock')
  })

  it('picks paper to lose to scissors', () => {
    expect(getLosingGesture('scissors')).toBe('paper')
  })
})

describe('getComputerGesture', () => {
  it('picks winning counter when playerAlwaysWins is false', () => {
    expect(getComputerGesture('rock', { playerAlwaysWins: false })).toBe(
      'paper',
    )
  })

  it('picks losing counter when playerAlwaysWins is true', () => {
    expect(getComputerGesture('rock', { playerAlwaysWins: true })).toBe(
      'scissors',
    )
  })
})
