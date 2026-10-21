/*
 * A light tap under the finger, for touch screens only. Mouse and trackpad
 * users get nothing.
 *
 * Android: the Vibration API. iOS Safari has no Vibration API, but since iOS 18
 * it plays the system selection tick when a switch control toggles, so a
 * throwaway hidden switch is toggled instead. iOS only plays it inside a tap's
 * own handler, so scroll-driven calls stay silent there, and from iOS 26.5 it
 * doesn't play from script at all; `hapticTap` below covers that. Both follow
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
 * A tap tick on `host` that still works on iOS 26.5+, where a script-toggled
 * switch no longer plays. An invisible native switch covers the host, so the
 * finger toggles it directly and iOS plays the tick; the tap is then passed on
 * to the host as an ordinary click. Android just vibrates on the host's click.
 * Returns a function that undoes it.
 */
export function hapticTap(host: HTMLElement): () => void {
  if (!touch()) return () => {}
  if (canVibrate()) {
    const buzz = () => navigator.vibrate(MS.tap)
    host.addEventListener('click', buzz)
    return () => host.removeEventListener('click', buzz)
  }
  const sw = document.createElement('input')
  sw.type = 'checkbox'
  sw.setAttribute('switch', '')
  sw.setAttribute('aria-hidden', 'true')
  sw.tabIndex = -1
  sw.style.cssText =
    'position:absolute;inset:0;width:100%;height:100%;margin:0;padding:0;border:0;-webkit-appearance:switch;appearance:auto;opacity:0;cursor:inherit;'
  const restore = host.style.position
  if (getComputedStyle(host).position === 'static') host.style.position = 'relative'
  // The switch takes the tap, so the host never sees it: hand it over.
  const pass = (e: MouseEvent) => {
    e.stopPropagation()
    host.click()
  }
  sw.addEventListener('click', pass)
  host.appendChild(sw)
  return () => {
    sw.removeEventListener('click', pass)
    sw.remove()
    host.style.position = restore
  }
}
