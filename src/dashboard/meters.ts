/**
 * Turning engine state into the three numbers the room reads from four metres.
 *
 * The status words are computed, not decorative. "Off track" means measured
 * against the pace the country actually has to hold to reach net zero by Round
 * 6, so the word changes the moment the arithmetic does.
 */
import { paceSchedule } from '../engine/engine'
import type { Content, PublicState } from '../engine/types'
import type { MeterSpec } from '../ui/primitives'

export interface Targets {
  emissions: number
  growth: number
  happiness: number
}

const START_HAPPINESS = 6.0
/** Below 4% growth the country is failing badly; the bar starts there. */
const GROWTH_FLOOR = 4.0

/**
 * Where emissions need to be by the end of `round` to still land on target.
 *
 * Reads the engine's schedule rather than drawing a straight line between the
 * start and the target. The line was close enough while the country only had to
 * fall from 300 to 200; running all the way to zero crosses the whole abatement
 * curve, and a line would call a table on track in Round 4 when its remaining
 * cuts are worth a third less than the ones it has already spent.
 */
export function emissionsPace(round: number, content: Content): number {
  return paceSchedule(content)[Math.max(0, Math.min(6, round))]
}

export function emissionsMeter(state: PublicState, targets: Targets, content: Content): MeterSpec {
  const start = content.config.start.e
  const pace = emissionsPace(state.round, content)
  const met = state.emissions <= targets.emissions
  const onTrack = state.emissions <= pace
  return {
    label: 'EMISSIONS',
    value: state.emissions,
    display: state.emissions.toFixed(0),
    unit: 'Mt',
    from: start,
    target: targets.emissions,
    inverted: true,
    ink: 'var(--jtnz-meter-emissions)',
    status: met
      ? { text: 'MET', tone: 'good' }
      : onTrack
        ? { text: 'ON TRACK', tone: 'good' }
        : { text: 'OFF TRACK', tone: 'bad' },
    footLeft: `from ${start} net`,
  }
}

export function growthMeter(state: PublicState, targets: Targets): MeterSpec {
  const avg = state.averageGrowth
  const met = avg >= targets.growth
  return {
    label: 'GROWTH',
    value: avg,
    display: state.growth.toFixed(1),
    unit: '%',
    from: GROWTH_FLOOR,
    target: targets.growth,
    ink: 'var(--jtnz-meter-growth)',
    status: met
      ? { text: 'ON TARGET', tone: 'good' }
      : avg >= targets.growth - 0.3
        ? { text: 'HOLDING', tone: 'warn' }
        : { text: 'SHORT', tone: 'bad' },
    footLeft: `6-round avg ${avg.toFixed(1)}`,
  }
}

export function happinessMeter(state: PublicState, targets: Targets): MeterSpec {
  const met = state.happiness >= targets.happiness
  return {
    label: 'HAPPINESS',
    value: state.happiness,
    display: state.happiness.toFixed(1),
    unit: '/10',
    from: START_HAPPINESS,
    target: targets.happiness,
    ink: 'var(--jtnz-meter-happiness)',
    status: met
      ? { text: 'MET', tone: 'good' }
      : state.happiness >= targets.happiness - 0.5
        ? { text: 'CLOSE', tone: 'warn' }
        : { text: 'SHORT', tone: 'bad' },
    footLeft: `from ${START_HAPPINESS.toFixed(1)}`,
  }
}

/** The carbon coupling sentence: the one interpreted line on the screen. */
export function driftSentence(k: number): string {
  return `Every 1% of growth now adds ${k.toFixed(1)} Mt of carbon.`
}

/** How the 2050 projection is framed once the arithmetic is settled. */
export function projectionNote(
  projection: number,
  target: number,
  round: number,
): { text: string; onTrack: boolean; dead: boolean } {
  const roundsLeft = 6 - round
  const over = projection - target
  if (projection <= target) {
    return { text: `On this path the country lands inside its budget.`, onTrack: true, dead: false }
  }
  // Once no remaining round can close the gap, say so plainly. The tone of
  // the rest of the session should change.
  // The most a single round has ever been measured to cut, at the 99th
  // percentile of 18,000 simulated rounds. Absolute, not proportional, so the
  // rebase to a 100 Mt country left it where it was.
  const bestCase = 50 * roundsLeft
  if (roundsLeft > 0 && over > bestCase) {
    return { text: 'Net zero is no longer reachable.', onTrack: false, dead: true }
  }
  if (roundsLeft === 0) {
    return { text: `${over.toFixed(0)} Mt over, and no rounds left.`, onTrack: false, dead: true }
  }
  return {
    text: `${over.toFixed(0)} Mt above target with ${roundsLeft} round${roundsLeft === 1 ? '' : 's'} left.`,
    onTrack: false,
    dead: false,
  }
}
