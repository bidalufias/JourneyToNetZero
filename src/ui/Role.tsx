import type { ReactNode } from 'react'
import { Check } from 'lucide-react'
import { ROLES } from '../game/roles'
import type { RoleId } from '../game/types'
import { roleTheme } from './roleTheme'

/**
 * Role identity in one chip: coloured icon tile plus the role name. The icon
 * never travels without its label, so the four roles are never told apart by
 * colour alone.
 */
export function RoleBadge({
  role,
  size = 'md',
  showName = true,
}: {
  role: RoleId
  size?: 'sm' | 'md'
  showName?: boolean
}) {
  const { color, light, icon: Icon } = roleTheme(role)
  const box = size === 'sm' ? 28 : 36
  return (
    <span className="inline-flex min-w-0 items-center gap-2">
      <span
        className="grid shrink-0 place-items-center rounded-[10px]"
        style={{ width: box, height: box, background: light, color }}
      >
        <Icon size={size === 'sm' ? 16 : 20} strokeWidth={2} aria-hidden="true" />
      </span>
      {showName && (
        <span
          className={`truncate font-[650] ${size === 'sm' ? 'text-[13px]' : 'text-[15px]'}`}
          style={{ color }}
        >
          {ROLES[role].name}
        </span>
      )}
    </span>
  )
}

/**
 * The four-up role summary on the main screen: a circular icon tile, the role
 * name and a short accent rule. Sized in vw so all four names stay legible and
 * uncut from 320px up, where a fixed size would clip "Government".
 */
export function RoleTile({ role }: { role: RoleId }) {
  const { color, light, icon: Icon } = roleTheme(role)
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-[var(--radius-small)] border border-line bg-surface px-1 py-3 shadow-[var(--shadow-card)]">
      <span
        className="grid place-items-center rounded-full"
        style={{
          width: 'clamp(34px, 11vw, 46px)',
          height: 'clamp(34px, 11vw, 46px)',
          background: light,
          color,
        }}
      >
        <Icon size={22} strokeWidth={1.9} aria-hidden="true" />
      </span>
      <span
        className="w-full text-center leading-tight font-[650]"
        style={{ color, fontSize: 'clamp(9px, 2.95vw, 12px)' }}
      >
        {ROLES[role].name}
      </span>
      <span
        className="h-[3px] w-5 rounded-full"
        style={{ background: color }}
        aria-hidden="true"
      />
    </div>
  )
}

/**
 * A selectable role. Selected state is carried by the border, the pale role
 * wash and a tick — not by colour on its own.
 */
export function RoleCard({
  role,
  selected = false,
  disabled = false,
  status,
  description,
  onSelect,
}: {
  role: RoleId
  selected?: boolean
  disabled?: boolean
  /** Right-hand metadata, e.g. the seated player's name or "Taken". */
  status?: ReactNode
  description?: ReactNode
  onSelect?: () => void
}) {
  const { color, light, icon: Icon } = roleTheme(role)
  const meta = ROLES[role]

  const body = (
    <>
      <div className="flex items-center gap-3">
        <span
          className="grid size-11 shrink-0 place-items-center rounded-[12px]"
          style={{ background: light, color }}
        >
          <Icon size={22} strokeWidth={2} aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[17px] font-[650]" style={{ color }}>
            {meta.name}
          </span>
          <span className="block truncate text-[12px] font-medium text-muted">
            {meta.nameMs}
          </span>
        </span>
        {selected ? (
          <span
            className="grid size-6 shrink-0 place-items-center rounded-full text-white"
            style={{ background: color }}
          >
            <Check size={15} strokeWidth={3} aria-hidden="true" />
          </span>
        ) : (
          status && (
            <span className="shrink-0 text-[13px] font-medium text-muted">{status}</span>
          )
        )}
      </div>
      {description && (
        <p className="mt-2.5 text-[13px] leading-5 text-body">{description}</p>
      )}
    </>
  )

  if (!onSelect) {
    return (
      <div
        className="rounded-[var(--radius-card)] border p-4"
        style={{
          borderColor: selected ? color : 'var(--border)',
          background: selected ? light : 'var(--surface)',
        }}
      >
        {body}
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      aria-pressed={selected}
      className="w-full rounded-[var(--radius-card)] border p-4 text-left transition-[transform,background-color,border-color] duration-[var(--t-interaction)] ease-out not-disabled:active:scale-[0.99] disabled:opacity-45"
      style={{
        borderColor: selected ? color : 'var(--border)',
        background: selected ? light : 'var(--surface)',
        boxShadow: selected ? 'none' : 'var(--shadow-card)',
      }}
    >
      {body}
    </button>
  )
}
