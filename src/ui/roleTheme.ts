import { Building2, Landmark, Megaphone, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { ROLES } from '../game/roles'
import type { RoleId } from '../game/types'

/**
 * The visual half of a role: colour, pale tint and icon. The name, blurb,
 * currency and power all still come from `game/roles.ts` — this file only
 * decides how a role looks, so the four colours stay identical on the phone,
 * the board and the report card.
 */
export interface RoleTheme {
  /** Solid role colour, mirrored from the game data so there is one source. */
  color: string
  /** Pale wash used behind selected cards and badges. */
  light: string
  icon: LucideIcon
}

const LIGHT: Record<RoleId, string> = {
  government: 'var(--government-light)',
  business: 'var(--business-light)',
  community: 'var(--community-light)',
  activist: 'var(--activist-light)',
}

const ICONS: Record<RoleId, LucideIcon> = {
  government: Landmark,
  business: Building2,
  community: Users,
  activist: Megaphone,
}

export function roleTheme(role: RoleId): RoleTheme {
  return { color: ROLES[role].accent, light: LIGHT[role], icon: ICONS[role] }
}

/** Indicator colours, kept beside the role colours so the palette is one file. */
export const INDICATOR_COLOR = {
  economy: 'var(--color-economy)',
  emissions: 'var(--color-emissions)',
  living: 'var(--color-living)',
} as const
