import type { Role, RoleId } from './types'

export const ROLES: Record<RoleId, Role> = {
  government: {
    id: 'government',
    name: 'Government',
    nameMs: 'Kerajaan',
    currency: 'Budget',
    currencyShort: 'BGT',
    startingCurrency: 6,
    blurb:
      'You hold the fiscal room and the statute book. Everything you do costs money you must first find, and every rakyat feels it.',
    power: {
      name: 'Mandate',
      description:
        'Once per game, override another player’s action and force your own outcome. Costs you legitimacy with the public.',
    },
    accent: '#e0b341',
  },
  business: {
    id: 'business',
    name: 'Business',
    nameMs: 'Perniagaan',
    currency: 'Capital',
    currencyShort: 'CAP',
    startingCurrency: 6,
    blurb:
      'You move at the scale that matters. Nothing decarbonises without your balance sheet, and nothing on your balance sheet moves without a return.',
    power: {
      name: 'Deploy',
      description:
        'Your actions carry the largest raw effect on both Economy and Emissions. What you build, the country lives with for decades.',
    },
    accent: '#3f9ecb',
  },
  community: {
    id: 'community',
    name: 'Community',
    nameMs: 'Masyarakat',
    currency: 'Mandate',
    currencyShort: 'MDT',
    startingCurrency: 5,
    blurb:
      'You are the households, the kampung, the unions and the small traders. You decide whether a policy is tolerated or resisted.',
    power: {
      name: 'Legitimacy',
      description:
        'Government actions that raise the cost of living are diluted or fail outright unless you back them.',
    },
    accent: '#5fbf8f',
  },
  activist: {
    id: 'activist',
    name: 'Activist',
    nameMs: 'Aktivis',
    currency: 'Pressure',
    currencyShort: 'PRS',
    startingCurrency: 5,
    blurb:
      'You have no budget and no factory. You have attention, evidence and the willingness to make things uncomfortable.',
    power: {
      name: 'Escalate',
      description:
        'Once per game, force this situation to return next round with double the stakes. Nobody gets to move on.',
    },
    accent: '#d4705f',
  },
}

export const ROLE_ORDER: RoleId[] = [
  'government',
  'business',
  'community',
  'activist',
]
