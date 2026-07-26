import { CircleAlert, CircleCheckBig } from 'lucide-react'
import { ROLES } from '../game/roles'
import type { Action } from '../game/types'
import { Card, ChoiceCard, RoleBadge, StatusChip } from '../ui'

const SHAPE_LABEL = {
  self: 'Protect your own',
  collective: 'Carry the cost',
  conditional: 'Needs a deal',
} as const

export function ActionCard({
  action,
  playable,
  reason,
  selected,
  onSelect,
}: {
  action: Action
  playable: boolean
  reason?: string
  selected: boolean
  onSelect: () => void
}) {
  const blocked = !playable && reason
  const dependency =
    action.requires && playable
      ? `Unlocked by ${ROLES[action.requires.from].name}`
      : undefined

  return (
    <ChoiceCard
      role={action.role}
      kicker={SHAPE_LABEL[action.shape]}
      title={action.title}
      summary={action.summary}
      meta={
        <>
          {action.cost > 0 ? `−${action.cost}` : 'free'}
          {action.income ? ` · +${action.income}` : ''}
        </>
      }
      note={blocked ? reason : dependency}
      noteTone={blocked ? 'negative' : 'neutral'}
      selected={selected}
      disabled={!playable}
      onSelect={onSelect}
    />
  )
}

/** Compact version for the reveal, where all four are shown at once. */
export function RevealCard({ action, name }: { action: Action; name: string }) {
  return (
    <Card>
      <div className="flex items-center justify-between gap-2">
        <RoleBadge role={action.role} size="sm" />
        <span className="truncate text-[12px] font-medium text-muted">{name}</span>
      </div>
      <h3 className="mt-2.5 text-[17px] leading-[1.3] font-[650] text-navy">
        {action.title}
      </h3>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <Effect label="Economy" value={action.effects.economy ?? 0} good={(v) => v > 0} />
        <Effect label="Emissions" value={action.effects.emissions ?? 0} good={(v) => v < 0} />
        <Effect label="Living" value={action.effects.living ?? 0} good={(v) => v > 0} />
      </div>
      <p className="mt-2.5 text-[13px] leading-5 text-muted">{action.rationale}</p>
    </Card>
  )
}

/**
 * Whether an effect helped or hurt is not obvious from its sign — +4 emissions
 * is bad, −2 economy is bad — so the chip carries an icon as well as a colour.
 * Nothing here is readable by colour alone.
 */
function Effect({
  label,
  value,
  good,
}: {
  label: string
  value: number
  good: (v: number) => boolean
}) {
  if (value === 0) return null
  const helped = good(value)
  return (
    <StatusChip
      tone={helped ? 'positive' : 'negative'}
      icon={helped ? CircleCheckBig : CircleAlert}
    >
      {label} {value > 0 ? '+' : ''}
      {value}
    </StatusChip>
  )
}
