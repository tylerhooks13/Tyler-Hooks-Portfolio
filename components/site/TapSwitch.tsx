import type { MouseEvent } from 'react'

/*
 * The only haptic iOS 26.5+ allows a web page: a native switch toggled by the
 * finger itself. This one is invisible and laid over the button just before it
 * (both inside a `.tap` wrapper), so a tap toggles it, iOS plays the tick, and
 * the tap is handed on to the button as an ordinary click. It has to be a
 * sibling: inside a <button>, Safari gives the tap to the button and the switch
 * never toggles. Hidden from assistive tech and the tab order, and from mouse
 * and trackpad users by CSS.
 */
export default function TapSwitch() {
  const pass = (e: MouseEvent<HTMLInputElement>) => {
    e.stopPropagation()
    ;(e.currentTarget.previousElementSibling as HTMLElement | null)?.click()
  }
  return (
    <input
      type="checkbox"
      className="tap-switch"
      aria-hidden="true"
      tabIndex={-1}
      ref={(el) => el?.setAttribute('switch', '')}
      onClick={pass}
    />
  )
}
