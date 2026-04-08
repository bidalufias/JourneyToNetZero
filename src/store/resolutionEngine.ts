import { actionById, endings, events, synergies, wildcards } from "../data";
import type {
  ActionCard,
  DelayedEffect,
  Effect,
  GameState,
  IndicatorKey,
  RoleKey,
  RoundLog,
} from "../types/gameTypes";

type ResolutionContext = {
  trustMultiplier: number;
  cleanTechBonus: number;
  extraGovTrustPenalty: number;
  extraBusinessConfidenceLoss: number;
  youthConfrontationalPressureBoost: number;
  cancelEquityLoss: number;
  cancelHarshFrictionIncrease: number;
  cancelBusinessPricingTrustLoss: number;
  nextTrustPenaltyReduction: number;
  nextTrustGainBoost: number;
  nextPublicFacingTrustBoost: number;
  nextSynergyTrustBoost: number;
  cancelShockPenalty: number;
  cancelShockTrustLoss: number;
  skipNextGovernmentBudgetGain: boolean;
  endgameCrisisPenalty: boolean;
  triggeredSynergies: string[];
  headlines: string[];
  indicatorChanges: Partial<Record<IndicatorKey, number>>;
  frictionChange: number;
  resourceDeltas: Record<RoleKey, { primary: number; secondary: number }>;
  selectedPrimary: Record<RoleKey, ActionCard | undefined>;
  selectedSupport: Record<RoleKey, ActionCard | undefined>;
  allSelectedTags: Set<string>;
  eventIsShock: boolean;
  governmentBusinessAligned: boolean;
  economyDeltaBeforeRefresh: number;
  hadBusinessConfidenceLoss: boolean;
};

const roleOrder: RoleKey[] = ["government", "business", "community", "youth"];

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

const isWeakClimateAction = (action?: ActionCard): boolean =>
  Boolean(
    action?.tags.includes("weak-climate-action") ||
      action?.tags.includes("delay") ||
      action?.tags.includes("polluting"),
  );

const isConfrontational = (action?: ActionCard): boolean =>
  Boolean(action?.tags.includes("confrontation"));

const isPublicFacing = (action?: ActionCard): boolean =>
  Boolean(action?.tags.includes("public-facing"));

const isInvestmentTagged = (action?: ActionCard): boolean =>
  Boolean(
    action?.tags.includes("investment") || action?.tags.includes("clean-investment"),
  );

const tagsMatchRequirement = (allTags: Set<string>, requirement: string): boolean => {
  if (!requirement.includes(" or ")) {
    return allTags.has(requirement);
  }

  const options = requirement.split(" or ").map((item) => item.trim());
  return options.some((option) => {
    if (allTags.has(option)) {
      return true;
    }
    if (option === "skills or jobs") {
      return allTags.has("skills") || allTags.has("jobs");
    }
    if (option === "community-equity or coalition") {
      return allTags.has("community-equity") || allTags.has("coalition");
    }
    if (option === "innovation or market narrative") {
      return allTags.has("innovation") || allTags.has("market") || allTags.has("narrative");
    }
    if (option === "public-awareness or coalition") {
      return allTags.has("public-awareness") || allTags.has("coalition");
    }
    if (option === "scorecard or transparency") {
      return allTags.has("scorecard") || allTags.has("transparency");
    }
    if (option === "public narrative or assembly") {
      return (
        allTags.has("public-narrative") ||
        allTags.has("public-awareness") ||
        allTags.has("assembly")
      );
    }
    if (option === "cleaner business or government action") {
      return (
        allTags.has("transparency") ||
        allTags.has("clean-investment") ||
        allTags.has("clean-tech") ||
        allTags.has("decarbonisation") ||
        allTags.has("government-support")
      );
    }
    return false;
  });
};

const addResourceDelta = (
  ctx: ResolutionContext,
  role: RoleKey,
  key: "primary" | "secondary",
  amount: number,
): void => {
  ctx.resourceDeltas[role][key] += amount;
  if (role === "business" && key === "secondary" && amount < 0) {
    ctx.hadBusinessConfidenceLoss = true;
  }
};

const applyResourceEffect = (ctx: ResolutionContext, key: string, amount: number): void => {
  const [roleText, resourceText] = key.split(".");
  const role = roleText as RoleKey;
  if (!roleOrder.includes(role)) {
    return;
  }
  if (resourceText === "primary" || resourceText === "secondary") {
    addResourceDelta(ctx, role, resourceText, amount);
  }
};

const applyIndicatorDelta = (
  state: GameState,
  ctx: ResolutionContext,
  indicator: IndicatorKey,
  rawAmount: number,
  sourceAction?: ActionCard,
): void => {
  let amount = rawAmount;
  if (indicator === "trust") {
    if (ctx.trustMultiplier > 1) {
      amount *= ctx.trustMultiplier;
    }
    if (amount > 0 && state.city.friction >= 3) {
      amount = Math.max(0, amount - 1);
    }
    if (amount > 0 && ctx.nextTrustGainBoost > 0) {
      amount += 1;
      ctx.nextTrustGainBoost -= 1;
    }
    if (amount > 0 && isPublicFacing(sourceAction) && ctx.nextPublicFacingTrustBoost > 0) {
      amount += 1;
      ctx.nextPublicFacingTrustBoost -= 1;
    }
    if (amount < 0 && ctx.nextTrustPenaltyReduction > 0) {
      amount += 1;
      ctx.nextTrustPenaltyReduction -= 1;
    }
    if (amount < 0 && ctx.cancelShockTrustLoss > 0 && ctx.eventIsShock) {
      amount += 1;
      ctx.cancelShockTrustLoss -= 1;
    }
  }
  if (indicator === "economy" && amount < 0 && ctx.eventIsShock && state.city.friction >= 4) {
    amount -= 1;
  }
  if (indicator === "equity" && amount < 0 && ctx.cancelEquityLoss > 0) {
    amount += 1;
    ctx.cancelEquityLoss -= 1;
  }

  state.city.indicators[indicator] += amount;
  ctx.indicatorChanges[indicator] = (ctx.indicatorChanges[indicator] ?? 0) + amount;
  if (indicator === "economy") {
    ctx.economyDeltaBeforeRefresh += amount;
  }
};

const applyFrictionDelta = (state: GameState, ctx: ResolutionContext, rawAmount: number): void => {
  let amount = rawAmount;
  if (amount > 0 && ctx.cancelHarshFrictionIncrease > 0) {
    amount = Math.max(0, amount - 1);
    ctx.cancelHarshFrictionIncrease -= 1;
  }
  state.city.friction += amount;
  ctx.frictionChange += amount;
};

const conditionPasses = (
  state: GameState,
  ctx: ResolutionContext,
  effect: Effect,
  role: RoleKey,
): boolean => {
  if (!effect.condition) {
    return true;
  }

  const c = effect.condition;
  if (c === "if energySecurity <= 4") return state.city.indicators.energySecurity <= 4;
  if (c === "if government and business align") return ctx.governmentBusinessAligned;
  if (c === "if equity <= 4") return state.city.indicators.equity <= 4;
  if (c === "if resilience <= 4") return state.city.indicators.resilience <= 4;
  if (c === "if emissions >= 6") return state.city.indicators.emissions >= 6;
  if (c === "if business confidence high") {
    const business = state.players.find((player) => player.role === "business");
    return (business?.resources.secondary ?? 0) >= 4;
  }
  if (c === "if any 2 indicators are 3 or below") {
    return Object.values(state.city.indicators).filter((value) => value <= 3).length >= 2;
  }
  if (c === "unless synergy SYN_02 triggered") return !ctx.triggeredSynergies.includes("SYN_02");
  if (c === "unless business or community support present") {
    return !ctx.selectedSupport.business && !ctx.selectedSupport.community;
  }
  if (
    c ===
    "unless business selected transparency, innovation, or partnership action"
  ) {
    const business = ctx.selectedPrimary.business;
    if (!business) return true;
    return !(
      business.tags.includes("transparency") ||
      business.tags.includes("innovation") ||
      business.tags.includes("partnership")
    );
  }
  if (c === "if business chose investment-related action") {
    return isInvestmentTagged(ctx.selectedPrimary.business);
  }
  if (c === "if trust <= 4") return state.city.indicators.trust <= 4;
  if (c === "if government chose infrastructure or industrial action") {
    const gov = ctx.selectedPrimary.government;
    return Boolean(
      gov &&
        (gov.tags.includes("infrastructure") || gov.tags.includes("industrial-policy")),
    );
  }
  if (c === "unless community or government cushioning present") {
    return !ctx.selectedSupport.community && !ctx.selectedSupport.government;
  }
  if (c === "during heatwave rounds") {
    return events[state.round - 1]?.id === "EVT_04";
  }
  if (c === "if government or business chose transit or fleet action") {
    const gov = ctx.selectedPrimary.government;
    const bus = ctx.selectedPrimary.business;
    return Boolean(gov?.tags.includes("transit") || bus?.tags.includes("fleet"));
  }
  if (c === "if major industrial or infrastructure action selected this round") {
    const gov = ctx.selectedPrimary.government;
    const bus = ctx.selectedPrimary.business;
    return Boolean(
      gov?.tags.includes("infrastructure") ||
        gov?.tags.includes("industrial-policy") ||
        bus?.tags.includes("manufacturing"),
    );
  }
  if (c === "if opposing growth action without mediation support") {
    const gov = ctx.selectedPrimary.government;
    const bus = ctx.selectedPrimary.business;
    const growth = Boolean(
      gov?.tags.includes("growth") ||
        gov?.tags.includes("industrial-policy") ||
        bus?.tags.includes("market") ||
        bus?.tags.includes("clean-investment"),
    );
    return growth && !ctx.selectedSupport.government && !ctx.selectedSupport.community;
  }
  if (c === "unless public narrative, assembly, or youth coalition support is present") {
    const gov = ctx.selectedPrimary.government;
    const com = ctx.selectedPrimary.community;
    const youth = ctx.selectedPrimary.youth;
    return !(
      gov?.id === "GOV_10" ||
      com?.id === "COM_06" ||
      youth?.tags.includes("coalition")
    );
  }
  if (c === "if government responds with ambitious action") {
    const gov = ctx.selectedPrimary.government;
    return Boolean(
      gov &&
        (gov.tags.includes("decarbonisation") ||
          gov.tags.includes("clean-tech") ||
          gov.tags.includes("ambition")),
    );
  }
  if (c === "if government or business chose a credible action") {
    return Boolean(
      (ctx.selectedPrimary.government && !isWeakClimateAction(ctx.selectedPrimary.government)) ||
        (ctx.selectedPrimary.business && !isWeakClimateAction(ctx.selectedPrimary.business)),
    );
  }
  if (c === "if no credible action") {
    return !conditionPasses(
      state,
      ctx,
      { target: "meta", amount: 0, condition: "if government or business chose a credible action" },
      role,
    );
  }
  if (c === "if business chose delay or pass-through") {
    const business = ctx.selectedPrimary.business;
    return Boolean(business?.id === "BUS_09" || business?.id === "BUS_10");
  }
  if (c === "if business chose a weak or delay action") {
    return isWeakClimateAction(ctx.selectedPrimary.business);
  }
  if (c === "if business or government chose growth-oriented clean action") {
    const gov = ctx.selectedPrimary.government;
    const bus = ctx.selectedPrimary.business;
    return Boolean(
      (gov &&
        (gov.tags.includes("industrial-policy") ||
          gov.tags.includes("clean-tech") ||
          gov.tags.includes("decarbonisation"))) ||
        (bus &&
          (bus.tags.includes("clean-investment") ||
            bus.tags.includes("innovation") ||
            bus.tags.includes("clean-tech"))),
    );
  }
  if (c === "if Community chose a local action" || c === "if community chose a local action") {
    return Boolean(ctx.selectedPrimary.community);
  }
  if (c === "if Government or Business chose climate action" || c === "if government or business chose climate action") {
    const gov = ctx.selectedPrimary.government;
    const bus = ctx.selectedPrimary.business;
    return Boolean(
      gov?.tags.includes("decarbonisation") ||
        gov?.tags.includes("clean-tech") ||
        bus?.tags.includes("decarbonisation") ||
        bus?.tags.includes("clean-tech") ||
        bus?.tags.includes("clean-investment"),
    );
  }
  if (
    c === "if no climate-aligned Government or Business action selected" ||
    c === "if no climate-aligned government or business action selected"
  ) {
    return !conditionPasses(
      state,
      ctx,
      { target: "meta", amount: 0, condition: "if government or business chose climate action" },
      role,
    );
  }
  if (c === "if Government ignored climate and equity this round" || c === "if government ignored climate and equity this round") {
    const gov = ctx.selectedPrimary.government;
    return Boolean(
      !gov ||
        (!gov.tags.includes("decarbonisation") &&
          !gov.tags.includes("clean-tech") &&
          !gov.tags.includes("equity") &&
          !gov.tags.includes("government-support")),
    );
  }
  if (c === "if business invested") return isInvestmentTagged(ctx.selectedPrimary.business);
  if (c === "if Community or Government equity action chosen" || c === "if community or government equity action chosen") {
    const gov = ctx.selectedPrimary.government;
    const com = ctx.selectedPrimary.community;
    return Boolean(
      com?.tags.includes("equity") ||
        gov?.tags.includes("equity") ||
        gov?.tags.includes("government-support"),
    );
  }
  if (c === "if clean-tech present") return ctx.allSelectedTags.has("clean-tech");
  if (c === "if shock round") return ctx.eventIsShock;
  if (c === "if Government and Business both act" || c === "if government and business both act") {
    return Boolean(ctx.selectedPrimary.government && ctx.selectedPrimary.business);
  }
  if (c === "if weak climate action chosen") {
    return isWeakClimateAction(ctx.selectedPrimary.government) || isWeakClimateAction(ctx.selectedPrimary.business);
  }

  return true;
};

const applyEffect = (
  state: GameState,
  ctx: ResolutionContext,
  effect: Effect,
  role: RoleKey,
  sourceAction?: ActionCard,
): void => {
  if (!conditionPasses(state, ctx, effect, role)) {
    return;
  }

  if (effect.target === "meta") {
    if (effect.key === "extraGovTrustPenalty") ctx.extraGovTrustPenalty += effect.amount;
    if (effect.key === "cleanTechBonus") ctx.cleanTechBonus += effect.amount;
    if (effect.key === "doubleTrust") ctx.trustMultiplier = 2;
    if (effect.key === "youthConfrontationalPressureBoost") {
      ctx.youthConfrontationalPressureBoost += effect.amount;
    }
    if (effect.key === "extraBusinessConfidenceLoss") ctx.extraBusinessConfidenceLoss += effect.amount;
    if (effect.key === "cancelEquityLoss") ctx.cancelEquityLoss += effect.amount;
    if (effect.key === "cancelHarshFrictionIncrease") ctx.cancelHarshFrictionIncrease += effect.amount;
    if (effect.key === "cancelBusinessPricingTrustLoss") ctx.cancelBusinessPricingTrustLoss += effect.amount;
    if (effect.key === "nextTrustPenaltyReduction") ctx.nextTrustPenaltyReduction += effect.amount;
    if (effect.key === "nextTrustGainBoost") ctx.nextTrustGainBoost += effect.amount;
    if (effect.key === "nextPublicFacingTrustBoost") ctx.nextPublicFacingTrustBoost += effect.amount;
    if (effect.key === "nextSynergyTrustBoost") ctx.nextSynergyTrustBoost += effect.amount;
    if (effect.key === "cancelShockPenalty") ctx.cancelShockPenalty += effect.amount;
    if (effect.key === "cancelShockTrustLoss") ctx.cancelShockTrustLoss += effect.amount;
    if (effect.key === "skipNextGovernmentBudgetGain") ctx.skipNextGovernmentBudgetGain = true;
    if (effect.key === "endgameCrisisPenalty") ctx.endgameCrisisPenalty = true;
    return;
  }

  if (effect.target === "resource") {
    if (effect.key) applyResourceEffect(ctx, effect.key, effect.amount);
    return;
  }

  if (effect.target === "friction") {
    applyFrictionDelta(state, ctx, effect.amount);
    return;
  }

  if (
    effect.target === "emissions" &&
    effect.amount > 0 &&
    ctx.cleanTechBonus > 0 &&
    sourceAction &&
    (sourceAction.tags.includes("clean-tech") ||
      sourceAction.tags.includes("decarbonisation"))
  ) {
    applyIndicatorDelta(state, ctx, "emissions", effect.amount + 1, sourceAction);
    return;
  }

  applyIndicatorDelta(state, ctx, effect.target, effect.amount, sourceAction);
};

const applyEffects = (
  state: GameState,
  ctx: ResolutionContext,
  effects: Effect[],
  role: RoleKey,
  sourceAction?: ActionCard,
): void => {
  effects.forEach((effect) => applyEffect(state, ctx, effect, role, sourceAction));
};

const queueDelayedEffects = (state: GameState, round: number, action: ActionCard): void => {
  action.delayedEffects?.forEach((effect) => {
    const queued: DelayedEffect = {
      ...effect,
      id: `${effect.id}_${round}`,
      sourceId: action.id,
      triggerRound:
        effect.triggerRound >= 90 ? effect.triggerRound : round + effect.triggerRound,
    };
    state.city.delayedEffectsQueue.push(queued);
  });
};

const applyCosts = (ctx: ResolutionContext): void => {
  roleOrder.forEach((role) => {
    const primary = ctx.selectedPrimary[role];
    const support = ctx.selectedSupport[role];
    if (primary) {
      addResourceDelta(ctx, role, "primary", -(primary.costs.primary ?? 0));
      addResourceDelta(ctx, role, "secondary", -(primary.costs.secondary ?? 0));
    }
    if (support) {
      addResourceDelta(ctx, role, "primary", -(support.costs.primary ?? 0));
      addResourceDelta(ctx, role, "secondary", -(support.costs.secondary ?? 0));
    }
  });
};

const applySynergyRules = (state: GameState, ctx: ResolutionContext): void => {
  synergies.forEach((rule) => {
    const matches = rule.requiredTags.filter((tag) =>
      tagsMatchRequirement(ctx.allSelectedTags, tag),
    ).length;
    if (matches < rule.minMatches) {
      return;
    }
    ctx.triggeredSynergies.push(rule.id);
    applyEffects(state, ctx, rule.effects, "government");
    ctx.headlines.push(`Synergy triggered: ${rule.title}`);
  });

  if (ctx.nextSynergyTrustBoost > 0 && ctx.triggeredSynergies.length > 0) {
    applyIndicatorDelta(state, ctx, "trust", 1);
    ctx.nextSynergyTrustBoost = 0;
  }
};

const applyFrictionRules = (state: GameState, ctx: ResolutionContext): void => {
  if (ctx.selectedPrimary.business?.id === "BUS_09" && !ctx.selectedSupport.community && !ctx.selectedSupport.government) {
    applyFrictionDelta(state, ctx, 1);
  }

  if (
    isConfrontational(ctx.selectedPrimary.youth) &&
    (ctx.hadBusinessConfidenceLoss || (ctx.indicatorChanges.trust ?? 0) < 0)
  ) {
    applyFrictionDelta(state, ctx, 1);
  }

  const govHarsh = Boolean(
    ctx.selectedPrimary.government &&
      (ctx.selectedPrimary.government.tags.includes("pricing") ||
        ctx.selectedPrimary.government.tags.includes("regulation")),
  );
  const hasFairnessOrCommsSupport = Boolean(
    ctx.selectedPrimary.government?.tags.includes("equity") ||
      ctx.selectedPrimary.community?.tags.includes("equity") ||
      ctx.selectedPrimary.government?.tags.includes("communication") ||
      ctx.selectedPrimary.community?.tags.includes("assembly") ||
      ctx.selectedPrimary.youth?.tags.includes("public-awareness"),
  );
  if (govHarsh && !hasFairnessOrCommsSupport) {
    applyFrictionDelta(state, ctx, 1);
  }

  if (ctx.eventIsShock && state.city.indicators.resilience <= 3) {
    applyFrictionDelta(state, ctx, 1);
  }

  if (ctx.triggeredSynergies.length > 0) {
    const rolesWithSynergyAction = roleOrder.filter(
      (role) => Boolean(ctx.selectedPrimary[role]?.synergyKeys?.length),
    ).length;
    if (rolesWithSynergyAction >= 3) {
      applyFrictionDelta(state, ctx, -1);
    }
  }
};

const applyDueDelayedEffects = (state: GameState, ctx: ResolutionContext): void => {
  const event = events[state.round - 1];
  const remaining: DelayedEffect[] = [];

  state.city.delayedEffectsQueue.forEach((queued) => {
    const sourceRound = Number(queued.id.split("_").pop());
    const triggeredByShock =
      Boolean(queued.triggerOnShockTag && event.tags.includes(queued.triggerOnShockTag)) &&
      sourceRound < state.round;
    const dueByRound = queued.triggerRound === state.round;

    if (dueByRound || triggeredByShock) {
      applyEffects(state, ctx, queued.effects, "government");
      ctx.headlines.push(`Delayed effect resolved from ${queued.sourceId}`);
      return;
    }
    remaining.push(queued);
  });

  state.city.delayedEffectsQueue = remaining;
};

const refreshResources = (state: GameState, ctx: ResolutionContext): void => {
  if (!ctx.skipNextGovernmentBudgetGain) {
    addResourceDelta(ctx, "government", "primary", 1);
  }
  if (state.city.indicators.trust >= 6) addResourceDelta(ctx, "government", "secondary", 1);
  if (state.city.indicators.trust <= 3) addResourceDelta(ctx, "government", "secondary", -1);

  if (state.city.indicators.economy >= 5) addResourceDelta(ctx, "business", "primary", 1);
  if (ctx.economyDeltaBeforeRefresh > 0 || state.city.indicators.trust >= 6) {
    addResourceDelta(ctx, "business", "secondary", 1);
  }
  if (state.city.friction >= 3) addResourceDelta(ctx, "business", "secondary", -1);

  if ((ctx.indicatorChanges.trust ?? 0) > 0 || (ctx.indicatorChanges.equity ?? 0) > 0) {
    addResourceDelta(ctx, "community", "primary", 1);
  }
  if (
    ctx.selectedPrimary.community &&
    ((ctx.indicatorChanges.resilience ?? 0) > 0 || (ctx.indicatorChanges.equity ?? 0) > 0)
  ) {
    addResourceDelta(ctx, "community", "secondary", 1);
  }
  if ((ctx.indicatorChanges.trust ?? 0) <= -2) addResourceDelta(ctx, "community", "primary", -1);

  if (isPublicFacing(ctx.selectedPrimary.youth)) addResourceDelta(ctx, "youth", "primary", 1);
  if (isWeakClimateAction(ctx.selectedPrimary.government) || isWeakClimateAction(ctx.selectedPrimary.business)) {
    addResourceDelta(ctx, "youth", "secondary", 1);
  }
  if (isConfrontational(ctx.selectedPrimary.youth) && (ctx.indicatorChanges.trust ?? 0) <= -2) {
    addResourceDelta(ctx, "youth", "primary", -1);
  }
  if (isConfrontational(ctx.selectedPrimary.youth) && ctx.youthConfrontationalPressureBoost > 0) {
    addResourceDelta(ctx, "youth", "secondary", ctx.youthConfrontationalPressureBoost);
  }
  if (ctx.extraBusinessConfidenceLoss > 0) {
    addResourceDelta(ctx, "business", "secondary", -ctx.extraBusinessConfidenceLoss);
  }

  roleOrder.forEach((role) => {
    const player = state.players.find((item) => item.role === role);
    if (!player) return;
    player.resources.primary = clamp(player.resources.primary + ctx.resourceDeltas[role].primary, 0, 12);
    player.resources.secondary = clamp(
      player.resources.secondary + ctx.resourceDeltas[role].secondary,
      0,
      12,
    );
  });
};

const evaluateEnding = (state: GameState): string =>
  endings.find((ending) => ending.matches(state))?.id ?? "managed-transition";

const initContext = (state: GameState): ResolutionContext => {
  const selectedPrimary: Record<RoleKey, ActionCard | undefined> = {
    government: undefined,
    business: undefined,
    community: undefined,
    youth: undefined,
  };
  const selectedSupport: Record<RoleKey, ActionCard | undefined> = {
    government: undefined,
    business: undefined,
    community: undefined,
    youth: undefined,
  };

  state.players.forEach((player) => {
    if (player.selectedPrimaryActionId) {
      selectedPrimary[player.role] = actionById.get(player.selectedPrimaryActionId);
    }
    if (player.selectedSupportActionId) {
      selectedSupport[player.role] = actionById.get(player.selectedSupportActionId);
    }
  });

  const allSelectedTags = new Set<string>();
  [...Object.values(selectedPrimary), ...Object.values(selectedSupport)].forEach((action) => {
    action?.tags.forEach((tag) => allSelectedTags.add(tag));
  });

  const gov = selectedPrimary.government;
  const bus = selectedPrimary.business;
  const governmentBusinessAligned = Boolean(
    gov &&
      bus &&
      (gov.tags.some((tag) => bus.tags.includes(tag)) ||
        (gov.tags.includes("industrial-policy") && bus.tags.includes("clean-investment"))),
  );

  return {
    trustMultiplier: 1,
    cleanTechBonus: 0,
    extraGovTrustPenalty: 0,
    extraBusinessConfidenceLoss: 0,
    youthConfrontationalPressureBoost: 0,
    cancelEquityLoss: 0,
    cancelHarshFrictionIncrease: 0,
    cancelBusinessPricingTrustLoss: 0,
    nextTrustPenaltyReduction: 0,
    nextTrustGainBoost: 0,
    nextPublicFacingTrustBoost: 0,
    nextSynergyTrustBoost: 0,
    cancelShockPenalty: 0,
    cancelShockTrustLoss: 0,
    skipNextGovernmentBudgetGain: false,
    endgameCrisisPenalty: false,
    triggeredSynergies: [],
    headlines: [],
    indicatorChanges: {},
    frictionChange: 0,
    resourceDeltas: {
      government: { primary: 0, secondary: 0 },
      business: { primary: 0, secondary: 0 },
      community: { primary: 0, secondary: 0 },
      youth: { primary: 0, secondary: 0 },
    },
    selectedPrimary,
    selectedSupport,
    allSelectedTags,
    eventIsShock: false,
    governmentBusinessAligned,
    economyDeltaBeforeRefresh: 0,
    hadBusinessConfidenceLoss: false,
  };
};

const buildRoundLog = (state: GameState, ctx: ResolutionContext): RoundLog => ({
  round: state.round,
  eventId: state.currentEventId ?? "",
  wildcardId: state.currentWildcardId,
  actionsByRole: {
    government: {
      primary: ctx.selectedPrimary.government?.id,
      support: ctx.selectedSupport.government?.id,
    },
    business: {
      primary: ctx.selectedPrimary.business?.id,
      support: ctx.selectedSupport.business?.id,
    },
    community: {
      primary: ctx.selectedPrimary.community?.id,
      support: ctx.selectedSupport.community?.id,
    },
    youth: {
      primary: ctx.selectedPrimary.youth?.id,
      support: ctx.selectedSupport.youth?.id,
    },
  },
  indicatorChanges: ctx.indicatorChanges,
  frictionChange: ctx.frictionChange,
  triggeredSynergies: ctx.triggeredSynergies,
  headlines: ctx.headlines,
});

export const resolveRound = (state: GameState): GameState => {
  const next = structuredClone(state) as GameState;
  const ctx = initContext(next);
  const event = events.find((item) => item.id === next.currentEventId) ?? events[next.round - 1];
  const wildcard = wildcards.find((item) => item.id === next.currentWildcardId);

  ctx.eventIsShock = event.tags.includes("shock");
  applyCosts(ctx);

  // 1) Round event base modifiers
  applyEffects(next, ctx, event.baseEffects, "government");
  ctx.headlines.push(`Event: ${event.title}`);

  // 2) Wildcard modifiers
  if (wildcard) {
    applyEffects(next, ctx, wildcard.effects, "government");
    ctx.headlines.push(`Wildcard: ${wildcard.title}`);
  }

  // 3) Primary action immediate effects
  roleOrder.forEach((role) => {
    const action = ctx.selectedPrimary[role];
    if (!action) return;
    applyEffects(next, ctx, action.immediateEffects, role, action);
  });

  // 4) Support actions
  roleOrder.forEach((role) => {
    const support = ctx.selectedSupport[role];
    if (!support) return;
    applyEffects(next, ctx, support.immediateEffects, role, support);
  });

  // 5) Synergies
  applySynergyRules(next, ctx);

  // 6) Trade-offs and penalties
  roleOrder.forEach((role) => {
    const action = ctx.selectedPrimary[role];
    if (!action) return;
    applyEffects(next, ctx, action.tradeoffEffects, role, action);
    if (role === "government" && ctx.extraGovTrustPenalty > 0) {
      const hasTrustPenalty = action.tradeoffEffects.some(
        (effect) => effect.target === "trust" && effect.amount < 0,
      );
      if (hasTrustPenalty) {
        applyIndicatorDelta(next, ctx, "trust", -ctx.extraGovTrustPenalty, action);
      }
    }
    if (action.id === "BUS_09" && ctx.cancelBusinessPricingTrustLoss > 0) {
      applyIndicatorDelta(next, ctx, "trust", 1, action);
      ctx.cancelBusinessPricingTrustLoss -= 1;
    }
    queueDelayedEffects(next, next.round, action);
  });
  if (ctx.cancelShockPenalty > 0 && ctx.eventIsShock) {
    applyIndicatorDelta(next, ctx, "economy", 1);
    ctx.cancelShockPenalty -= 1;
  }
  if (ctx.endgameCrisisPenalty) {
    applyIndicatorDelta(next, ctx, "trust", -1);
    applyIndicatorDelta(next, ctx, "economy", -1);
    ctx.headlines.push("Endgame crisis penalty triggered.");
  }
  applyFrictionRules(next, ctx);

  // 7) Delayed effects due this round
  applyDueDelayedEffects(next, ctx);

  // 8) Clamp
  (Object.keys(next.city.indicators) as IndicatorKey[]).forEach((indicator) => {
    next.city.indicators[indicator] = clamp(next.city.indicators[indicator], 0, 10);
  });
  next.city.friction = clamp(next.city.friction, 0, 5);

  // 9) Resource refresh
  refreshResources(next, ctx);

  if (next.city.friction >= 5) {
    ctx.headlines.push("Crisis pressure escalates: city debate turns volatile.");
  }

  // 10) Log and round advance
  next.logs.push(buildRoundLog(next, ctx));
  next.players.forEach((player) => {
    player.selectedPrimaryActionId = undefined;
    player.selectedSupportActionId = undefined;
    player.lockedIn = false;
  });

  if (next.round >= 8) {
    next.phase = "ending";
    next.endingId = evaluateEnding(next);
    next.currentEventId = undefined;
    next.currentWildcardId = undefined;
    return next;
  }

  next.round += 1;
  next.phase = "brief";
  next.currentEventId = events[next.round - 1]?.id;
  return next;
};
