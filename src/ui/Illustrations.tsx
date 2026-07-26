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
      <circle cx="36" cy="36" r="34" fill="var(--surface)" fillOpacity="0.9" />
      <circle
        cx="36"
        cy="36"
        r="33"
        stroke="var(--primary-green)"
        strokeOpacity="0.45"
        strokeWidth="2"
      />
      {/* Skyline, right of centre */}
      <g fill="var(--primary-blue)">
        <rect x="38" y="26" width="7" height="22" rx="1.5" />
        <rect x="47" y="20" width="6" height="28" rx="1.5" />
        <rect x="30" y="33" width="6" height="15" rx="1.5" />
      </g>
      {/* Rooftop solar on the tallest block */}
      <path
        d="M46.5 19.5 L53.5 19.5 L53.5 17.5 L46.5 17.5 Z"
        fill="var(--primary-blue-dark)"
      />
      {/* Leaf, left of centre */}
      <path
        d="M31 22c-8 1-13 6-13 13 0 4 2 7 5 9 3-9 8-14 14-17-5 4-8 9-10 16 6 1 11-1 14-6 3-6 2-13-1-17-3-1-6-1-9 2Z"
        fill="var(--primary-green)"
      />
      {/* Water */}
      <path
        d="M14 53c6-4 12-4 18 0s12 4 18 0 12-4 18 0"
        stroke="var(--teal)"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

/**
 * A bright Malaysian low-carbon city: tropical greenery, a clean urban river,
 * modern towers with rooftop solar, an electric elevated transit line, a
 * utility-scale solar array on the hillside and a planted riverside walk.
 */
export function CityHero({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 390 260"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="ch-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#CFE6F9" />
          <stop offset="60%" stopColor="#E4F1FB" />
          <stop offset="100%" stopColor="#F5F9FC" />
        </linearGradient>
        <linearGradient id="ch-river" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#A9D8EE" />
          <stop offset="100%" stopColor="#D6EEF8" />
        </linearGradient>
        <radialGradient id="ch-sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="390" height="260" fill="url(#ch-sky)" />

      {/* Sun and a couple of soft clouds */}
      <circle cx="58" cy="40" r="52" fill="url(#ch-sun)" />
      <circle cx="58" cy="40" r="17" fill="#FFFFFF" fillOpacity="0.9" />
      <g fill="#FFFFFF" fillOpacity="0.75">
        <ellipse cx="268" cy="38" rx="30" ry="11" />
        <ellipse cx="288" cy="32" rx="20" ry="10" />
        <ellipse cx="150" cy="60" rx="24" ry="8" />
      </g>

      {/* Far hills */}
      <path d="M0 150 Q70 118 150 146 Q230 172 300 140 Q350 118 390 138 L390 205 L0 205 Z" fill="#CCE6BA" />
      <path d="M0 168 Q80 144 168 166 Q252 186 320 160 Q358 146 390 158 L390 205 L0 205 Z" fill="#B5DB9C" />

      {/* Utility-scale solar array on the hillside, right */}
      <g stroke="#1D4ED8" strokeWidth="1" fill="#2563EB">
        <path d="M336 160 l9-6 h13 l-9 6 Z" />
        <path d="M352 164 l9-6 h13 l-9 6 Z" />
        <path d="M340 170 l9-6 h13 l-9 6 Z" />
        <path d="M356 174 l9-6 h13 l-9 6 Z" />
      </g>

      {/* Skyline — far layer */}
      <g fill="#C2D9EC">
        <rect x="24" y="126" width="26" height="79" rx="2" />
        <rect x="56" y="146" width="20" height="59" rx="2" />
        <rect x="298" y="132" width="24" height="73" rx="2" />
        <rect x="326" y="150" width="20" height="55" rx="2" />
      </g>

      {/* Communications tower — a KL skyline landmark, not a turbine */}
      <g fill="#B3CFE6">
        <rect x="280" y="104" width="9" height="101" rx="2" />
        <ellipse cx="284.5" cy="104" rx="12" ry="7" />
      </g>
      <path d="M284.5 97 V80" stroke="#B3CFE6" strokeWidth="2.5" strokeLinecap="round" />

      {/* Skyline — the paired tapered towers */}
      <g fill="#A3C4E2">
        <path d="M150 205 V102 l5-12 h13 l5 12 v103 Z" />
        <path d="M190 205 V102 l5-12 h13 l5 12 v103 Z" />
        <rect x="173" y="140" width="17" height="5" rx="1.5" />
      </g>
      <g stroke="#8FB4D8" strokeWidth="1.5" strokeLinecap="round">
        <path d="M161.5 90 V78" />
        <path d="M201.5 90 V78" />
      </g>
      <g fill="#FFFFFF" fillOpacity="0.35">
        <rect x="154" y="112" width="14" height="2.5" rx="1" />
        <rect x="154" y="122" width="14" height="2.5" rx="1" />
        <rect x="154" y="132" width="14" height="2.5" rx="1" />
        <rect x="194" y="112" width="14" height="2.5" rx="1" />
        <rect x="194" y="122" width="14" height="2.5" rx="1" />
        <rect x="194" y="132" width="14" height="2.5" rx="1" />
      </g>

      {/* Skyline — mid layer */}
      <g fill="#B7D2E9">
        <rect x="84" y="154" width="30" height="51" rx="2" />
        <rect x="224" y="138" width="28" height="67" rx="2" />
        <rect x="258" y="160" width="16" height="45" rx="2" />
      </g>

      {/* Efficient buildings with rooftop solar, near layer */}
      <g>
        <rect x="38" y="162" width="46" height="43" rx="3" fill="#FFFFFF" stroke="#C7DAE8" />
        <SolarRow x={42} y={162} count={3} />
        <g fill="#DBEAFE">
          <rect x="44" y="176" width="8" height="8" rx="1.5" />
          <rect x="56" y="176" width="8" height="8" rx="1.5" />
          <rect x="68" y="176" width="8" height="8" rx="1.5" />
          <rect x="44" y="189" width="8" height="8" rx="1.5" />
          <rect x="56" y="189" width="8" height="8" rx="1.5" />
          <rect x="68" y="189" width="8" height="8" rx="1.5" />
        </g>
      </g>

      <g>
        <rect x="118" y="150" width="30" height="55" rx="3" fill="#FFFFFF" stroke="#C7DAE8" />
        <SolarRow x={121} y={150} count={2} />
        <g fill="#DBEAFE">
          <rect x="124" y="164" width="7" height="8" rx="1.5" />
          <rect x="135" y="164" width="7" height="8" rx="1.5" />
          <rect x="124" y="177" width="7" height="8" rx="1.5" />
          <rect x="135" y="177" width="7" height="8" rx="1.5" />
          <rect x="124" y="190" width="7" height="8" rx="1.5" />
          <rect x="135" y="190" width="7" height="8" rx="1.5" />
        </g>
      </g>

      {/* A planted green roof, because efficient buildings are part of this too */}
      <g>
        <rect x="330" y="172" width="36" height="33" rx="3" fill="#FFFFFF" stroke="#C7DAE8" />
        <rect x="330" y="169" width="36" height="4" rx="2" fill="#65A30D" />
        <circle cx="339" cy="166" r="4" fill="#4D7C0F" />
        <circle cx="349" cy="167" r="3.5" fill="#65A30D" />
        <circle cx="358" cy="166" r="4" fill="#4D7C0F" />
        <g fill="#DBEAFE">
          <rect x="336" y="182" width="8" height="8" rx="1.5" />
          <rect x="348" y="182" width="8" height="8" rx="1.5" />
          <rect x="336" y="194" width="8" height="8" rx="1.5" />
          <rect x="348" y="194" width="8" height="8" rx="1.5" />
        </g>
      </g>

      {/* Electric elevated transit line */}
      <g>
        <rect x="0" y="186" width="390" height="7" rx="2" fill="#E3EEF7" />
        <rect x="0" y="186" width="390" height="2" rx="1" fill="#C7DAE8" />
        <g fill="#D6E5F1">
          <rect x="26" y="193" width="8" height="16" rx="2" />
          <rect x="106" y="193" width="8" height="16" rx="2" />
          <rect x="238" y="193" width="8" height="16" rx="2" />
          <rect x="318" y="193" width="8" height="16" rx="2" />
        </g>
        {/* The train itself */}
        <rect x="196" y="164" width="104" height="22" rx="9" fill="#FFFFFF" stroke="#2563EB" strokeWidth="1.5" />
        <rect x="199" y="180" width="98" height="4" rx="2" fill="#2563EB" />
        <g fill="#DBEAFE">
          <rect x="206" y="169" width="16" height="9" rx="2" />
          <rect x="228" y="169" width="16" height="9" rx="2" />
          <rect x="250" y="169" width="16" height="9" rx="2" />
          <rect x="272" y="169" width="16" height="9" rx="2" />
        </g>
        <circle cx="292" cy="174" r="2.5" fill="#65A30D" />
      </g>

      {/* Clean urban river */}
      <rect x="0" y="209" width="390" height="27" fill="url(#ch-river)" />
      <g stroke="#FFFFFF" strokeOpacity="0.6" strokeWidth="2" strokeLinecap="round" fill="none">
        <path d="M28 218 q10 -4 20 0 t20 0" />
        <path d="M210 226 q10 -4 20 0 t20 0" />
        <path d="M310 216 q10 -4 20 0 t20 0" />
      </g>

      {/* Riverside walk and planting */}
      <path d="M0 234 Q120 228 220 238 Q310 246 390 236 L390 260 L0 260 Z" fill="#D7EDC2" />
      <path d="M0 245 Q130 238 240 248 Q320 255 390 246" stroke="#F5F9FC" strokeWidth="6" strokeLinecap="round" fill="none" />

      {/* Foreground trees and palms */}
      <Tree x={26} y={236} scale={1.1} />
      <Tree x={96} y={239} scale={0.85} />
      <Palm x={162} y={241} />
      <Tree x={236} y={244} scale={1} />
      <Palm x={306} y={243} />
      <Tree x={362} y={240} scale={0.9} />
    </svg>
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

function Tree({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <rect x="-1.5" y="-6" width="3" height="10" rx="1.5" fill="#4D7C0F" />
      <circle cx="0" cy="-12" r="9" fill="#65A30D" />
      <circle cx="-6" cy="-8" r="6" fill="#4D7C0F" />
      <circle cx="6" cy="-8" r="6" fill="#7FB932" />
    </g>
  )
}

function Palm({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M0 4 q-2 -10 1 -18" stroke="#4D7C0F" strokeWidth="3" strokeLinecap="round" fill="none" />
      <g stroke="#65A30D" strokeWidth="3" strokeLinecap="round" fill="none">
        <path d="M1 -14 q-9 -3 -13 3" />
        <path d="M1 -14 q9 -3 13 3" />
        <path d="M1 -14 q-6 -8 -3 -13" />
        <path d="M1 -14 q7 -7 11 -5" />
      </g>
    </g>
  )
}
