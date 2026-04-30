import { cityArchetypes, events, synergies, wildcards } from "../data";
import type { ActionCard, GameState, IndicatorKey, RoleKey, RoundLog } from "../types/gameTypes";

type NarrativeContext = {
  selectedPrimary: Record<RoleKey, ActionCard | undefined>;
  selectedSupport: Record<RoleKey, ActionCard | undefined>;
  indicatorChanges: Partial<Record<IndicatorKey, number>>;
  frictionChange: number;
  triggeredSynergies: string[];
};

const roleOrder: RoleKey[] = ["government", "business", "community", "youth"];

const roleNames: Record<RoleKey, string> = {
  government: "Government",
  business: "Business",
  community: "Community",
  youth: "Youth",
};

const indicatorStories: Record<IndicatorKey, { up: string; down: string }> = {
  economy: {
    up: "jobs and investment feel more secure",
    down: "employers and small traders feel the squeeze",
  },
  emissions: {
    up: "clean-air progress becomes visible",
    down: "the city drifts back toward a dirtier pathway",
  },
  trust: {
    up: "rakyat confidence rises",
    down: "public faith in the transition thins",
  },
  equity: {
    up: "the burden is shared more fairly",
    down: "lower-income residents feel the transition pressing harder on them",
  },
  resilience: {
    up: "the city is better prepared for heat and banjir",
    down: "the next climate shock will hit harder",
  },
  energySecurity: {
    up: "Malaysia's energy footing looks steadier",
    down: "energy anxiety grows in homes and boardrooms",
  },
};

const strongestIndicatorChange = (
  changes: Partial<Record<IndicatorKey, number>>,
): [IndicatorKey, number] | undefined => {
  const entries = Object.entries(changes) as Array<[IndicatorKey, number]>;
  return entries
    .filter(([, amount]) => amount !== 0)
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))[0];
};

const actionList = (ctx: NarrativeContext): string =>
  roleOrder
    .map((role) => {
      const primary = ctx.selectedPrimary[role];
      return `${roleNames[role]} chose ${primary?.title ?? "to hold back"}`;
    })
    .join("; ");

const buildHeadline = (state: GameState, ctx: NarrativeContext): string => {
  const event = events.find((item) => item.id === state.currentEventId);
  if (state.city.friction >= 5) return "The Coalition Reaches Breaking Point";
  if (ctx.triggeredSynergies.length > 0) return "A Malaysian Coalition Finds Its Rhythm";
  if ((ctx.indicatorChanges.emissions ?? 0) > 0 && (ctx.indicatorChanges.equity ?? 0) < 0) {
    return "Cleaner Air, Uneven Burden";
  }
  if ((ctx.indicatorChanges.trust ?? 0) < 0 || ctx.frictionChange > 0) {
    return "Progress Comes With Political Heat";
  }
  if ((ctx.indicatorChanges.resilience ?? 0) > 0 && event?.tags.includes("shock")) {
    return "Preparedness Pays Off";
  }
  if ((ctx.indicatorChanges.economy ?? 0) > 0 && (ctx.indicatorChanges.emissions ?? 0) > 0) {
    return "Green Growth Starts To Feel Real";
  }
  return event ? `${event.title} Reshapes the City` : "The City Absorbs the Round";
};

const buildConsequences = (state: GameState, ctx: NarrativeContext): string[] => {
  const consequences: string[] = [];
  const strongest = strongestIndicatorChange(ctx.indicatorChanges);
  if (strongest) {
    const [indicator, amount] = strongest;
    consequences.push(
      amount > 0 ? indicatorStories[indicator].up : indicatorStories[indicator].down,
    );
  }
  if (ctx.frictionChange > 0) {
    consequences.push("Negotiations will be sharper next round; every concession now costs more pride.");
  } else if (ctx.frictionChange < 0) {
    consequences.push("The table breathes easier, and compromise feels possible again.");
  }
  if (ctx.triggeredSynergies.length > 0) {
    const titles = ctx.triggeredSynergies
      .map((id) => synergies.find((item) => item.id === id)?.title ?? id)
      .join(", ");
    consequences.push(`The city sees that coordination can work: ${titles}.`);
  }
  if (state.city.delayedEffectsQueue.length > 0) {
    consequences.push("Some promises now sit on the city's calendar, waiting to prove themselves.");
  }
  if (consequences.length === 0) {
    consequences.push("The round changes little on paper, but the room remembers who moved and who waited.");
  }
  return consequences.slice(0, 4);
};

const roleReflection = (role: RoleKey, ctx: NarrativeContext, state: GameState): string => {
  const primary = ctx.selectedPrimary[role];
  const support = ctx.selectedSupport[role];
  const supportText = support ? `, backed by ${support.title}` : "";
  if (!primary) return `${roleNames[role]} kept resources dry, but silence has its own politics.`;

  if (role === "government") {
    if ((ctx.indicatorChanges.trust ?? 0) < 0) {
      return `Government moved with ${primary.title}${supportText}, but the mandate feels thinner tonight.`;
    }
    return `Government can point to ${primary.title}${supportText} as proof that policy is moving beyond speeches.`;
  }
  if (role === "business") {
    if ((ctx.indicatorChanges.equity ?? 0) < 0 || (ctx.indicatorChanges.trust ?? 0) < 0) {
      return `Business protected its position with ${primary.title}${supportText}, but residents are watching who pays.`;
    }
    return `Business used ${primary.title}${supportText} to show the transition can still create Malaysian value.`;
  }
  if (role === "community") {
    if (state.city.indicators.equity <= 4) {
      return `Community fought through ${primary.title}${supportText}, yet vulnerable neighborhoods still feel exposed.`;
    }
    return `Community turned ${primary.title}${supportText} into a reminder that legitimacy starts close to home.`;
  }
  if (ctx.frictionChange > 0) {
    return `Youth forced attention with ${primary.title}${supportText}, but pressure now risks hardening the room.`;
  }
  return `Youth used ${primary.title}${supportText} to keep the future emotionally present at the table.`;
};

export const buildRoundNarrative = (
  state: GameState,
  ctx: NarrativeContext,
): NonNullable<RoundLog["narrative"]> => {
  const event = events.find((item) => item.id === state.currentEventId);
  const wildcard = wildcards.find((item) => item.id === state.currentWildcardId);
  const cityTitle =
    cityArchetypes.find((city) => city.id === state.cityArchetypeId)?.title ?? "the city";
  const headline = buildHeadline(state, ctx);
  const wildcardText = wildcard ? ` The twist was ${wildcard.title.toLowerCase()}.` : "";

  return {
    headline,
    summary: `${cityTitle}: ${event?.title ?? "This round"} put the table under pressure. ${actionList(ctx)}.${wildcardText}`,
    consequences: buildConsequences(state, ctx),
    roleReflections: Object.fromEntries(
      roleOrder.map((role) => [role, roleReflection(role, ctx, state)]),
    ) as Partial<Record<RoleKey, string>>,
    memory:
      state.city.friction >= 4
        ? "The next round begins under public suspicion; alliances may still hold, but nobody gets a free pass."
        : "The next round begins with the city still persuadable, but not patient forever.",
  };
};
