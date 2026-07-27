/**
 * How four people get into the room.
 *
 * Two routes to the same seat: four letters typed, or a code scanned. The
 * letters are still the headline — they are readable from the back of the room
 * and can be said out loud over a noisy table — and the QR is for the person
 * who cannot see the screen well, or is on the far side of it, or has simply
 * mistyped it twice.
 *
 * The overlay exists because a QR at lobby size is not scannable from four
 * metres. The facilitator opens it, the room scans, it closes: the projector
 * spends the rest of the session showing the game.
 */
import { QrCode } from '../ui/QrCode'
import { joinUrl } from '../ui/links'

/** The lobby's own QR — modest, beside the code, always there. */
export function JoinPanel({ code }: { code: string }) {
  if (!code) return null
  return (
    <div className="join-panel">
      <QrCode value={joinUrl(code)} title={`Join room ${code}`} className="join-panel__qr" />
      <div>
        <p className="join-panel__label">SCAN TO JOIN</p>
        <p className="join-panel__url">{joinUrl(code)}</p>
      </div>
    </div>
  )
}

/**
 * The same code, big enough for the back row.
 *
 * Full-bleed and light, because a projected QR needs the contrast the right way
 * round: dark modules on a lit field, not a dark screen with a small white
 * square on it that every phone camera hunts for and half of them miss.
 */
export function JoinOverlay({ code, onClose }: { code: string; onClose: () => void }) {
  return (
    <div className="joinover" onClick={onClose} role="dialog" aria-label="Join this session">
      <div className="joinover__grid">
        <div className="joinover__left">
          <p className="joinover__cue">JOIN ON YOUR PHONE</p>
          <p className="joinover__code">{code}</p>
          <p className="joinover__url">{joinUrl(code)}</p>
          <p className="joinover__hint">
            Scan it, or type the four letters at that address. Q or Esc to hide this.
          </p>
        </div>
        <div className="joinover__qr">
          <QrCode value={joinUrl(code)} title={`Join room ${code}`} />
        </div>
      </div>
    </div>
  )
}
