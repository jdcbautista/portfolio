import { describe, it, expect, beforeEach } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useLocalStorage } from './useLocalStorage'

describe('useLocalStorage', () => {
  beforeEach(() => localStorage.clear())

  it('returns the initial value when storage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('k', 'initial'))
    expect(result.current[0]).toBe('initial')
  })

  it('hydrates from an existing stored value', () => {
    localStorage.setItem('k', JSON.stringify('stored'))
    const { result } = renderHook(() => useLocalStorage('k', 'initial'))
    expect(result.current[0]).toBe('stored')
  })

  it('persists updates to localStorage', () => {
    const { result } = renderHook(() => useLocalStorage<number>('count', 0))
    act(() => result.current[1](5))
    expect(result.current[0]).toBe(5)
    expect(localStorage.getItem('count')).toBe('5')
  })

  it('supports functional updates', () => {
    const { result } = renderHook(() => useLocalStorage<number>('count', 1))
    act(() => result.current[1]((n) => n + 1))
    expect(result.current[0]).toBe(2)
  })

  it('reset restores the initial value', () => {
    const { result } = renderHook(() => useLocalStorage('k', 'initial'))
    act(() => result.current[1]('changed'))
    expect(result.current[0]).toBe('changed')
    act(() => result.current[2]())
    expect(result.current[0]).toBe('initial')
  })

  it('falls back to the initial value on malformed JSON', () => {
    localStorage.setItem('k', '{not valid json')
    const { result } = renderHook(() => useLocalStorage('k', 'safe'))
    expect(result.current[0]).toBe('safe')
  })
})
