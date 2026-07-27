/**
 * The ⋯ sheet: how to play, your sealed goal, and the way out.
 *
 * Leaving is destructive in a way nothing else on the phone is — it empties
 * your chair, drops your sealed goal, and lets somebody else sit down — so it
 * asks twice and says plainly what it will cost. It is still worth having: a
 * player who took the wrong seat previously had no way to give it back, and the
 * whole workshop had to start a new room.
 */
import { useState } from 'react'
import type { PhoneView } from '../game/session'
import { HowToPlay } from './guide'

export function MenuSheet({
  view,
  onClose,
  onLeave,
}: {
  view: PhoneView
  onClose: () => void
  onLeave: () => void
}) {
  const [confirming, setConfirming] = useState(false)

  return (
    <>
      <div className="sheet-scrim" onClick={onClose} />
      <div className="sheet" role="dialog" aria-label="How to play">
        <div className="sheet__head">
          <span className="sheet__title">HOW TO PLAY</span>
          <button className="sheet__close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="sheet__body">
          <HowToPlay view={view} />

          <span className="plabel" style={{ marginTop: 'var(--space-4)' }}>
            LEAVING
          </span>
          {confirming ? (
            <>
              <p className="ptext">
                This empties your seat. Your sealed goal goes with you, somebody else can take the
                chair, and rejoining means starting again as a new player.
              </p>
              <button className="btn btn--accent" onClick={onLeave}>
                YES, LEAVE THE GAME
              </button>
              <button className="btn btn--ghost" onClick={() => setConfirming(false)}>
                STAY
              </button>
            </>
          ) : (
            <>
              <p className="pmono">ROOM {view.code}</p>
              <button className="btn btn--ghost" onClick={() => setConfirming(true)}>
                LEAVE THE GAME
              </button>
            </>
          )}
        </div>
      </div>
    </>
  )
}
