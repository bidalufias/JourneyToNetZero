/**
 * The join code, as something a phone camera can read.
 *
 * Four letters on a projector is fast for anyone who can see the screen and
 * slow for the person at the back who reads an O as a zero. The QR is the same
 * room by a different route, so both are on offer and neither is required.
 *
 * Drawn as SVG rather than canvas so it stays sharp at whatever size the
 * screen gives it — the same component renders 120px in the corner of the
 * lobby and full-height in the overlay.
 */
import { useMemo } from 'react'
import { QUIET, encodeQr, qrPath } from './qr'

export function QrCode({
  value,
  size,
  className,
  title,
}: {
  value: string
  /** CSS size in px. Omit to fill the container. */
  size?: number
  className?: string
  title?: string
}) {
  const { path, span } = useMemo(() => {
    const matrix = encodeQr(value)
    return { path: qrPath(matrix), span: matrix.size + QUIET * 2 }
  }, [value])

  return (
    // Width and height are attributes rather than inline style so a class can
    // still size it — an inline style would win over the stylesheet, which is
    // how the lobby's modest QR first rendered a metre wide.
    <svg
      className={className}
      width={size ?? '100%'}
      height={size ?? '100%'}
      viewBox={`0 0 ${span} ${span}`}
      role="img"
      aria-label={title ?? `QR code for ${value}`}
      shapeRendering="crispEdges"
    >
      {/* The quiet zone has to be light, whatever is behind the element. */}
      <rect width={span} height={span} fill="#fff" />
      <path d={path} fill="#000" />
    </svg>
  )
}
