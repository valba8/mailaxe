import { get } from 'svelte/store'
import { toasts } from '$lib/stores/toast'
import { _ } from '$lib/i18n'
// @ts-ignore - wailsjs path
import type { smtp } from '../../../wailsjs/go/models'

/** A message the composer handed over for undo send (main window) */
export interface HeldMessage {
  accountId: string
  message: smtp.ComposeMessage
  draftId: string | null
  seconds: number
}

export interface HeldSendOptions {
  /** Seconds to wait before sending */
  seconds: number
  /** Performs the real send */
  send: () => void
  /** Called when the user clicks Undo */
  undo: () => void
}

/**
 * Undo send for the main window (Gmail style): the composer has already
 * closed, and a toast counts down with Undo / Send now. When the countdown
 * ends, or on Send now, `send` runs; Undo cancels and calls `undo`.
 * Dismissing the toast with its close button does not cancel the send.
 */
export function holdSend({ seconds, send, undo }: HeldSendOptions): void {
  const t = get(_)
  let remaining = seconds
  let done = false

  const finish = (action: () => void) => {
    if (done) return
    done = true
    clearInterval(timer)
    toasts.remove(id)
    action()
  }

  const id = toasts.add({
    type: 'info',
    message: t('composer.sendingIn', { values: { seconds: remaining } }),
    // Safety net only: the countdown below removes the toast itself
    duration: (seconds + 5) * 1000,
    actions: [
      { label: t('composer.undoSend'), onClick: () => finish(undo) },
      { label: t('composer.sendNow'), onClick: () => finish(send) },
    ],
  })

  const timer = setInterval(() => {
    remaining -= 1
    if (remaining <= 0) {
      finish(send)
      return
    }
    toasts.patch(id, { message: get(_)('composer.sendingIn', { values: { seconds: remaining } }) })
  }, 1000)
}
