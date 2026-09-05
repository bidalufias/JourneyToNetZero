/**
 * The role card.
 *
 * One card, four fixed lines under four fixed headings, in the same order on
 * every surface: who you are, what you want, what you have, how to play. A
 * fifth line is added once the secret goal is chosen. The seat buttons show
 * the first two lines, the power step shows the last two, and everywhere else
 * shows the whole card. A player reads sixty words several times instead of
 * two hundred and fifty words once.
 *
 * The same component draws it on the phone and as a tile on the projector.
 */
import { useState } from 'react'
import type { Role } from '../engine/types'
import { ROLE_CARD, ROLE_LABEL } from '../game/session'
import { STEP_LABEL } from '../game/vocab'
import { RoleGlyph } from './primitives'
import './rolecard.css'

/** The four headings, in the order they always appear. */
export const CARD_HEADING = {
  who: 'WHO YOU ARE',
  wants: 'WHAT YOU WANT',
  has: 'WHAT YOU HAVE',
  howToPlay: 'HOW TO PLAY',
  goal: STEP_LABEL.goal,
} as const

type Line = 'who' | 'wants' | 'has' | 'howToPlay'

/** Which lines to show. `seat` is the first two, `power` the last two. */
const LINES: Record<'all' | 'seat' | 'power', Line[]> = {
  all: ['who', 'wants', 'has', 'howToPlay'],
  seat: ['who', 'wants'],
  power: ['has', 'howToPlay'],
}

export function RoleCard({
  role,
  size = 'phone',
  lines = 'all',
  goal = null,
  says = false,
  name,
}: {
  role: Role
  /** `phone` is the card, `big` the card with large lines, `tile` one of four on the projector. */
  size?: 'phone' | 'big' | 'tile'
  lines?: 'all' | 'seat' | 'power'
  /** The fifth line, once the goal is chosen. */
  goal?: { title: string; desc: string } | null
  /** Offer the two say-lines behind a tap. */
  says?: boolean
  /** The player's own name, beside the title. */
  name?: string | null
}) {
  const card = ROLE_CARD[role]
  const [open, setOpen] = useState(false)

  return (
    <div className={`rolecard rolecard--${size}`} data-role={role}>
      <div className="rolecard__head">
        <RoleGlyph role={role} size={size === 'tile' ? 22 : 16} />
        <span className="rolecard__title">
          {ROLE_LABEL[role]} · {card.title}
        </span>
        {name ? <span className="rolecard__name">{name}</span> : null}
      </div>

      {LINES[lines].map((key) => (
        <div key={key} className="rolecard__row">
          <span className="rolecard__key">{CARD_HEADING[key]}</span>
          <p className="rolecard__line">{card[key]}</p>
        </div>
      ))}

      {goal ? (
        <div className="rolecard__row rolecard__row--goal">
          <span className="rolecard__key">{CARD_HEADING.goal}</span>
          <p className="rolecard__line">
            <strong>{goal.title}.</strong> {goal.desc}
          </p>
        </div>
      ) : null}

      {says ? (
        open ? (
          <div className="rolecard__row">
            <span className="rolecard__key">TWO LINES YOU CAN SAY</span>
            {card.says.map((line) => (
              <p key={line} className="rolecard__say">
                “{line}”
              </p>
            ))}
          </div>
        ) : (
          <button className="rolecard__more" onClick={() => setOpen(true)}>
            TWO LINES YOU CAN SAY
          </button>
        )
      ) : null}
    </div>
  )
}
