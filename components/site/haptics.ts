/*
 * A light tap under the finger, for touch screens only. Mouse and trackpad
 * users get nothing.
 *
 * Android: the Vibration API. iOS Safari has no Vibration API, but since iOS 18
 * it plays the system selection tick when a switch control toggles, so a
 * throwaway hidden switch is toggled instead. iOS only plays it inside a tap's
 * own handler, so scroll-driven calls stay silent there. Both follow the
 * phone's own vibration / system haptics setting.
 */

type Kind = 'tick' | 'tap'

const MS: Record<Kind, number> = { tick: 6, tap: 12 }

export function haptic(kind: Kind = 'tick') {
  if (typeof window === 'undefined' || !window.matchMedia('(pointer: coarse)').matches) return
  if (typeof navigator.vibrate === 'function') {
    navigator.vibrate(MS[kind])
    return
  }
  const label = document.createElement('label')
  const input = document.createElement('input')
  input.type = 'checkbox'
  input.setAttribute('switch', '')
  label.append(input)
  label.setAttribute('aria-hidden', 'true')
  label.style.display = 'none'
  document.body.append(label)
  label.click()
  label.remove()
}
