import type { CSSProperties } from 'react'

/**
 * Clean Horizon artwork. Everything here is inline SVG so it scales cleanly on
 * a 320px phone and on a projector, costs no network request, and inherits the
 * palette from the CSS variables.
 *
 * Deliberately no wind turbines anywhere: Malaysia's low-carbon story is
 * rooftop and utility-scale solar, hydropower, electrified transit, efficient
 * buildings, forests and rivers — so that is what these draw.
 */

/** The brand mark: a leaf and a low-carbon skyline over water. */
export function BrandMark({ size = 72 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 72 72"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="36" cy="36" r="35" fill="#FFFFFF" />
      <circle
        cx="36"
        cy="36"
        r="34"
        stroke="var(--primary-green)"
        strokeOpacity="0.55"
        strokeWidth="2"
      />
      {/* A rising skyline, right of centre, with rooftop solar on the tallest */}
      <g fill="var(--primary-blue)">
        <rect x="34" y="33" width="7" height="18" rx="1.5" />
        <rect x="43" y="24" width="7" height="27" rx="1.5" />
        <rect x="52" y="30" width="7" height="21" rx="1.5" />
      </g>
      <path d="M42 23 h9 l-2.5 -3.5 h-9 Z" fill="var(--primary-blue-dark)" />
      {/* Leaf, left of centre, with a midrib */}
      <path
        d="M32 18c-11 2-18 10-18 20 0 5 2 9 5 12 8-2 15-7 19-14 4-7 3-14-6-18Z"
        fill="var(--primary-green)"
      />
      <path
        d="M19 49c3-11 8-19 16-25"
        stroke="#FFFFFF"
        strokeOpacity="0.85"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Water */}
      <path
        d="M13 56c6-4 12-4 18 0s12 4 18 0 6-3 10-1"
        stroke="var(--teal)"
        strokeWidth="3.2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

/**
 * A bright Malaysian low-carbon city, drawn to sit behind the title on the
 * main screen: open sky at the top for the wordmark, then a skyline of
 * efficient towers with rooftop solar, an elevated electric transit line, a
 * clean river and a planted riverside walk.
 */
export function CityHero({
  className = '',
  style,
  fit = 'meet',
}: {
  className?: string
  style?: CSSProperties
  /** 'meet' shows the whole scene; 'slice' fills a box of any shape. */
  fit?: 'meet' | 'slice'
}) {
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 390 420"
      preserveAspectRatio={`xMidYMax ${fit}`}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="ch-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#BCDCF7" />
          <stop offset="42%" stopColor="#D8ECFA" />
          <stop offset="72%" stopColor="#ECF6FC" />
        </linearGradient>
        <linearGradient id="ch-river" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7CC2E6" />
          <stop offset="60%" stopColor="#A3D8EF" />
          <stop offset="100%" stopColor="#CBEAF7" />
        </linearGradient>
        <linearGradient id="ch-glass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D9E8F6" />
          <stop offset="100%" stopColor="#AECBE5" />
        </linearGradient>
        <linearGradient id="ch-glass-near" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E4EFF8" />
        </linearGradient>
        <linearGradient id="ch-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C2E4A6" />
          <stop offset="100%" stopColor="#DFF1CD" />
        </linearGradient>
        <linearGradient id="ch-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F5F9FC" stopOpacity="0" />
          <stop offset="100%" stopColor="#F5F9FC" stopOpacity="1" />
        </linearGradient>
        <radialGradient id="ch-sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="55%" stopColor="#FFFFFF" stopOpacity="0.42" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="390" height="420" fill="url(#ch-sky)" />

      {/* Morning sun and cloud, kept to the edges so the wordmark reads on
          open sky at every width. */}
      <circle cx="34" cy="58" r="86" fill="url(#ch-sun)" />
      <circle cx="34" cy="58" r="22" fill="#FFFFFF" fillOpacity="0.9" />
      <g fill="#FFFFFF">
        <g fillOpacity="0.85">
          <ellipse cx="332" cy="50" rx="36" ry="12" />
          <ellipse cx="312" cy="42" rx="21" ry="11" />
          <ellipse cx="352" cy="41" rx="17" ry="9" />
        </g>
        <g fillOpacity="0.62">
          <ellipse cx="44" cy="150" rx="32" ry="9" />
          <ellipse cx="30" cy="145" rx="18" ry="8" />
        </g>
        <g fillOpacity="0.55">
          <ellipse cx="354" cy="146" rx="28" ry="8" />
          <ellipse cx="341" cy="141" rx="15" ry="7" />
        </g>
      </g>
      <g stroke="#8FB0CB" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.7">
        <path d="M292 96 q4 -4 8 0 q4 -4 8 0" />
        <path d="M314 84 q3 -3 6 0 q3 -3 6 0" />
      </g>

      {/* Layered hills */}
      <path
        d="M0 256 Q58 226 128 250 Q198 274 268 244 Q328 218 390 240 L390 318 L0 318 Z"
        fill="#D2E9C0"
      />
      <path
        d="M0 276 Q72 254 152 274 Q232 294 300 268 Q350 249 390 264 L390 318 L0 318 Z"
        fill="#BADFA1"
      />

      {/* Far skyline. The tall blocks sit at the edges, clear of the wordmark. */}
      <g fill="#C7DDEF">
        <rect x="4" y="168" width="27" height="132" rx="3" />
        <rect x="35" y="196" width="21" height="104" rx="3" />
        <rect x="60" y="182" width="24" height="118" rx="3" />
        <rect x="308" y="174" width="27" height="126" rx="3" />
        <rect x="339" y="200" width="21" height="100" rx="3" />
        <rect x="364" y="186" width="24" height="114" rx="3" />
      </g>
      <Windows x={9} y={180} cols={3} rows={7} />
      <Windows x={65} y={194} cols={3} rows={6} />
      <Windows x={313} y={186} cols={3} rows={7} />
      <Windows x={369} y={198} cols={3} rows={6} />

      {/* Communications mast — a Kuala Lumpur landmark, and not a turbine */}
      <g fill="#B4CFE7">
        <path d="M264 300 L267 236 h6 l3 64 Z" />
        <ellipse cx="270" cy="234" rx="11" ry="6" />
        <ellipse cx="270" cy="222" rx="6" ry="3.5" />
      </g>
      <path d="M270 218 V200" stroke="#B4CFE7" strokeWidth="2.2" strokeLinecap="round" />

      {/* The paired tapered towers with their skybridge — the skyline anchor */}
      <g fill="url(#ch-glass)">
        <path d="M194 300 V232 l6 -14 h12 l6 14 v68 Z" />
        <path d="M228 300 V238 l6 -13 h12 l6 13 v62 Z" />
      </g>
      <rect x="218" y="266" width="10" height="5" rx="2" fill="#BBD4E9" />
      <g stroke="#8FB4D5" strokeWidth="1.5" strokeLinecap="round">
        <path d="M206 218 V202" />
        <path d="M240 225 V212" />
      </g>
      <Windows x={199} y={238} cols={3} rows={8} tone="#EEF6FC" />
      <Windows x={233} y={244} cols={3} rows={7} tone="#EEF6FC" />

      {/* Mid skyline */}
      <g fill="#B9D3E9">
        <rect x="94" y="228" width="31" height="72" rx="3" />
        <rect x="160" y="248" width="24" height="52" rx="3" />
        <rect x="286" y="246" width="18" height="54" rx="3" />
      </g>
      <Windows x={99} y={238} cols={3} rows={5} />
      <Windows x={165} y={258} cols={2} rows={3} />

      {/* Efficient buildings with rooftop solar, front row */}
      <g>
        <rect x="128" y="250" width="46" height="50" rx="3" fill="url(#ch-glass-near)" stroke="#C0D6E9" />
        <SolarRow x={132} y={250} count={3} />
        <Windows x={134} y={262} cols={4} rows={3} tone="#D5E8F8" size={8} gap={11} />
      </g>
      <g>
        <rect x="52" y="262" width="42" height="38" rx="3" fill="url(#ch-glass-near)" stroke="#C0D6E9" />
        <SolarRow x={56} y={262} count={3} />
        <Windows x={58} y={274} cols={3} rows={2} tone="#D5E8F8" size={8} gap={11} />
      </g>

      {/* A planted green roof — efficient buildings are part of this too */}
      <g>
        <rect x="304" y="264" width="40" height="36" rx="3" fill="url(#ch-glass-near)" stroke="#C0D6E9" />
        <rect x="303" y="260" width="42" height="5" rx="2.5" fill="#65A30D" />
        <circle cx="312" cy="256" r="4.5" fill="#4D7C0F" />
        <circle cx="322" cy="257" r="3.8" fill="#7FB932" />
        <circle cx="332" cy="256" r="4.5" fill="#4D7C0F" />
        <Windows x={310} y={274} cols={3} rows={2} tone="#D5E8F8" size={8} gap={11} />
      </g>

      {/* Elevated electric transit, drawn in front of the blocks it passes so
          the carriage is never clipped in half by a rooftop. */}
      <g>
        <g fill="#C6D9EA">
          <rect x="258" y="298" width="6" height="12" rx="2" />
          <rect x="312" y="298" width="6" height="12" rx="2" />
          <rect x="366" y="298" width="6" height="12" rx="2" />
        </g>
        <rect x="234" y="292" width="156" height="6" rx="2" fill="#E2EDF6" />
        <rect x="234" y="292" width="156" height="2" rx="1" fill="#BCD3E8" />
        <g>
          <rect x="262" y="276" width="88" height="16" rx="7" fill="#FBFDFF" stroke="#4B86EE" strokeWidth="1.3" />
          <rect x="264" y="287" width="84" height="3" rx="1.5" fill="#4B86EE" />
          <g fill="#D3E4FB">
            <rect x="269" y="280" width="14" height="6" rx="1.5" />
            <rect x="287" y="280" width="14" height="6" rx="1.5" />
            <rect x="305" y="280" width="14" height="6" rx="1.5" />
            <rect x="323" y="280" width="14" height="6" rx="1.5" />
          </g>
          <circle cx="343" cy="284" r="1.9" fill="#65A30D" />
        </g>
      </g>

      {/* The ground plane. One continuous park rather than stacked bands, so
          the scene has depth instead of a horizon line every 20px. */}
      <path
        d="M0 304 C 62 294, 132 302, 196 298 C 262 294, 330 303, 390 297 L390 420 L0 420 Z"
        fill="url(#ch-ground)"
      />

      {/* A clean river running from the middle distance out past the viewer */}
      <path
        d="M196 297 C 184 330, 148 357, 94 384 C 58 401, 22 413, -8 420
           L 150 420 C 178 398, 202 365, 216 329 C 221 317, 224 306, 226 297 Z"
        fill="url(#ch-river)"
      />
      <g stroke="#FFFFFF" strokeOpacity="0.5" strokeLinecap="round" fill="none">
        <path d="M198 320 q10 -4 18 -1" strokeWidth="2" />
        <path d="M166 350 q14 -6 26 -2" strokeWidth="2.4" />
        <path d="M104 382 q18 -7 34 -2" strokeWidth="2.8" />
        <path d="M36 408 q22 -8 42 -2" strokeWidth="3.2" />
      </g>

      {/* The riverside walk on the far bank */}
      <path
        d="M232 300 C 246 330, 270 356, 306 378 C 336 396, 366 408, 390 414"
        stroke="#F1F8FC"
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
        opacity="0.9"
      />

      {/* Utility-scale solar on the park's edge, where it can actually be seen */}
      <g stroke="#1D4ED8" strokeWidth="0.9" fill="#2F6FEE">
        <path d="M300 322 l10 -7 h15 l-10 7 Z" />
        <path d="M320 322 l10 -7 h15 l-10 7 Z" />
        <path d="M340 322 l10 -7 h15 l-10 7 Z" />
        <path d="M308 333 l11 -8 h16 l-11 8 Z" />
        <path d="M330 333 l11 -8 h16 l-11 8 Z" />
        <path d="M352 333 l11 -8 h16 l-11 8 Z" />
      </g>
      <g stroke="#8FB4D5" strokeWidth="1.1" strokeLinecap="round">
        <path d="M311 322 v3" />
        <path d="M331 322 v3" />
        <path d="M351 322 v3" />
        <path d="M320 333 v3.5" />
        <path d="M342 333 v3.5" />
        <path d="M364 333 v3.5" />
      </g>

      {/* Planting, scaled front to back so the bank recedes */}
      <Tree x={244} y={312} scale={0.6} />
      <Tree x={150} y={318} scale={0.62} />
      <Tree x={60} y={324} scale={0.72} />
      <Palm x={278} y={348} />
      <Tree x={16} y={352} scale={0.95} />
      <Palm x={214} y={368} />
      <Tree x={362} y={374} scale={1.15} />
      <Tree x={266} y={398} scale={1.3} />
      <Tree x={46} y={410} scale={1.35} />

      {/* The ground meets the page rather than stopping at a hard edge */}
      <rect x="0" y="396" width="390" height="24" fill="url(#ch-fade)" />
    </svg>
  )
}

/** A grid of lit windows, which is what makes a flat block read as a tower. */
function Windows({
  x,
  y,
  cols,
  rows,
  tone = '#E3EFF9',
  size = 4.5,
  gap = 7,
}: {
  x: number
  y: number
  cols: number
  rows: number
  tone?: string
  size?: number
  gap?: number
}) {
  const cells = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      cells.push(
        <rect
          key={`${r}-${c}`}
          x={x + c * gap}
          y={y + r * gap}
          width={size}
          height={size}
          rx={1}
        />,
      )
    }
  }
  return (
    <g fill={tone} fillOpacity="0.9">
      {cells}
    </g>
  )
}

/**
 * A wide, shallow strip of the same city, for the header band on result
 * screens. Cropping `CityHero` into a 100px band leaves only the riverbank, so
 * this draws the skyline at the band's own proportions instead.
 */
export function SkylineBand({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 780 72"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="ch-band-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#DCEEFB" />
          <stop offset="100%" stopColor="#F0F7FC" />
        </linearGradient>
      </defs>
      <rect width="780" height="72" fill="url(#ch-band-sky)" />

      {/* Distant blocks */}
      <g fill="#C7DCEE">
        <rect x="20" y="30" width="22" height="30" rx="2" />
        <rect x="96" y="24" width="18" height="36" rx="2" />
        <rect x="188" y="32" width="24" height="28" rx="2" />
        <rect x="300" y="22" width="20" height="38" rx="2" />
        <rect x="404" y="30" width="22" height="30" rx="2" />
        <rect x="512" y="26" width="18" height="34" rx="2" />
        <rect x="628" y="32" width="24" height="28" rx="2" />
        <rect x="726" y="24" width="20" height="36" rx="2" />
      </g>

      {/* Paired tapered towers, the skyline's anchor */}
      <g fill="#A9C8E4">
        <path d="M348 60 V20 l3-6 h8 l3 6 v40 Z" />
        <path d="M372 60 V20 l3-6 h8 l3 6 v40 Z" />
        <rect x="362" y="32" width="10" height="3" rx="1.5" />
      </g>

      {/* Efficient buildings with rooftop solar */}
      <g>
        <rect x="132" y="38" width="34" height="22" rx="2" fill="#FFFFFF" stroke="#C7DAE8" />
        <SolarRow x={136} y={38} count={2} />
        <rect x="452" y="36" width="38" height="24" rx="2" fill="#FFFFFF" stroke="#C7DAE8" />
        <SolarRow x={456} y={36} count={2} />
        <rect x="670" y="40" width="34" height="20" rx="2" fill="#FFFFFF" stroke="#C7DAE8" />
        <SolarRow x={674} y={40} count={2} />
      </g>

      {/* Electric transit line running the length of the band */}
      <rect x="0" y="60" width="780" height="4" rx="2" fill="#DDEAF5" />
      <g>
        <rect x="228" y="45" width="64" height="15" rx="6" fill="#FFFFFF" stroke="#2563EB" strokeWidth="1.2" />
        <rect x="231" y="55" width="58" height="3" rx="1.5" fill="#2563EB" />
        <g fill="#DBEAFE">
          <rect x="236" y="48" width="11" height="6" rx="1.5" />
          <rect x="252" y="48" width="11" height="6" rx="1.5" />
          <rect x="268" y="48" width="11" height="6" rx="1.5" />
        </g>
      </g>

      {/* Planted ground */}
      <path d="M0 66 Q200 62 400 68 Q600 73 780 66 L780 72 L0 72 Z" fill="#D7EDC2" />
      <g>
        <Tree x={62} y={66} scale={0.55} />
        <Tree x={276} y={66} scale={0.5} />
        <Tree x={498} y={67} scale={0.55} />
        <Tree x={714} y={66} scale={0.5} />
      </g>
    </svg>
  )
}

/** A tilted rooftop solar array. */
function SolarRow({ x, y, count }: { x: number; y: number; count: number }) {
  return (
    <g fill="#2563EB" stroke="#1D4ED8" strokeWidth="0.8">
      {Array.from({ length: count }, (_, i) => (
        <path key={i} d={`M${x + i * 13} ${y} l7 -6 h9 l-7 6 Z`} />
      ))}
    </g>
  )
}

/**
 * A broadleaf canopy built from a lobed silhouette with a shaded underside and
 * a lit crown, rather than three flat circles — at 20px that difference is the
 * whole reason the riverside reads as planting instead of clip art.
 */
function Tree({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="0" cy="4" rx="10" ry="2.2" fill="#A9CE85" fillOpacity="0.55" />
      <path d="M0 4 V-9" stroke="#5F7F34" strokeWidth="3" strokeLinecap="round" />
      <path d="M0 -4 l-4 -4 M0 -6 l4 -4" stroke="#5F7F34" strokeWidth="1.6" strokeLinecap="round" />
      {/* Canopy silhouette */}
      <path
        d="M-11 -11 a7.5 7.5 0 0 1 3 -8.5 a7 7 0 0 1 7 -6.5 a7.5 7.5 0 0 1 6 2.5
           a7 7 0 0 1 6.5 6 a7 7 0 0 1 -2 6.8 a6.5 6.5 0 0 1 -6 3.4 h-8.5
           a7 7 0 0 1 -6 -3.7 Z"
        fill="#65A30D"
      />
      {/* Shaded underside and lit crown */}
      <path
        d="M-11 -11 a7 7 0 0 0 6 3.7 h8.5 a6.5 6.5 0 0 0 6 -3.4 a9 9 0 0 1 -20.5 -0.3 Z"
        fill="#4D7C0F"
        fillOpacity="0.55"
      />
      <path
        d="M-3.5 -25.5 a7.5 7.5 0 0 1 8 1.6 a8 8 0 0 0 -10.5 5.4 a7.5 7.5 0 0 1 2.5 -7 Z"
        fill="#8CC63F"
        fillOpacity="0.75"
      />
    </g>
  )
}

/** A tropical palm: curved trunk, drooping fronds, a little fruit. */
function Palm({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="0" cy="4" rx="8" ry="2" fill="#A9CE85" fillOpacity="0.55" />
      <path
        d="M0 4 q-3 -11 2 -21"
        stroke="#7A6A45"
        strokeWidth="3.2"
        strokeLinecap="round"
        fill="none"
      />
      <g fill="#65A30D">
        <path d="M2 -17 q-11 -6 -16 1 q7 -1 10 1 q3 2 6 -2 Z" />
        <path d="M2 -17 q11 -6 16 1 q-7 -1 -10 1 q-3 2 -6 -2 Z" />
        <path d="M2 -17 q-7 -10 -2 -15 q1 7 3 9 q2 3 -1 6 Z" />
        <path d="M2 -17 q9 -8 14 -4 q-7 1 -9 3 q-3 2 -5 1 Z" />
      </g>
      <g fill="#4D7C0F" fillOpacity="0.6">
        <path d="M2 -17 q-9 -4 -13 0 q6 0 8 1 q3 1 5 -1 Z" />
        <path d="M2 -17 q9 -4 13 0 q-6 0 -8 1 q-3 1 -5 -1 Z" />
      </g>
      <circle cx="2" cy="-16" r="1.8" fill="#4D7C0F" />
    </g>
  )
}
