/**
 * The ⋯ sheet: how to play, your secret goal, and the way out.
 *
 * Leaving is destructive in a way nothing else on the phone is. It empties
 * your chair, drops your secret goal, and lets somebody else sit down, so it
 * asks twice and says plainly what it will cost. It is still worth having: a
 * player who took the wrong seat previously had no way to give it back, and the
 * whole workshop had to start a new room.
 */
import { useState } from 'react'
import type { PhoneView } from '../game/session'
import { HOW_TO_PLAY_URL } from '../ui/links'
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

          {/* The written guide is the long version: characters, every goal,
              every word explained. It opens in a tab of its own so a player
              who wanders into it mid-round has not left the game. */}
          <span className="plabel" style={{ marginTop: 'var(--space-4)' }}>
            THE FULL GUIDE
          </span>
          <a className="btn btn--ghost" href={HOW_TO_PLAY_URL} target="_blank" rel="noreferrer">
            THE FULL WRITTEN GUIDE
          </a>

          <span className="plabel" style={{ marginTop: 'var(--space-4)' }}>
            LEAVING
          </span>
          {confirming ? (
            <>
              <p className="ptext">
                This empties your seat. Your secret goal goes with you. Somebody else can take the
                seat. If you come back, you start again as a new player.
              </p>
              <button className="btn btn--accent" onClick={onLeave}>
                YES, LEAVE
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
