/*
 * A light tap under the finger, for touch screens only. Mouse and trackpad
 * users get nothing.
 *
 * Android: the Vibration API. iOS Safari has no Vibration API, but since iOS 18
 * it plays the system selection tick when a switch control toggles, so a
 * throwaway hidden switch is toggled instead. iOS only plays it inside a tap's
 * own handler, so scroll-driven calls stay silent there, and from iOS 26.5 it
 * doesn't play from script at all; see TapSwitch.tsx for what still works. Both follow
 * the phone's own vibration / system haptics setting.
 */

type Kind = 'tick' | 'tap'

const MS: Record<Kind, number> = { tick: 6, tap: 12 }

const touch = () => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
const canVibrate = () => typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function'

export function haptic(kind: Kind = 'tick') {
  if (!touch()) return
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

/*
 * Android only: a vibration outside a tap, such as while an answer types out.
 * The browser allows it once the page has been tapped at least once. iOS has
 * no way to do this, so it stays silent there.
 */
export function vibrate(pattern: number | number[]) {
  if (touch() && canVibrate()) navigator.vibrate(pattern)
}

/*
 * Android: a buzz on each of `host`'s clicks. On iOS 26.5+ a tap tick can't
 * come from script at all; it comes from the native switch TapSwitch lays over
 * the button. Returns a function that undoes it.
 */
export function hapticTap(host: HTMLElement): () => void {
  if (!touch() || !canVibrate()) return () => {}
  const buzz = () => navigator.vibrate(MS.tap)
  host.addEventListener('click', buzz)
  return () => host.removeEventListener('click', buzz)
}
