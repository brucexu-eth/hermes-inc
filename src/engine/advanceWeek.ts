import type { GameState, ParsedDecision, GameEvent, WeekResult, EventEffect } from '../db/types.js';
import { calculateWeeklyBurn, calculateWeeklyRevenue } from './calculateBurn.js';
import { updateUserGrowth, updateGithubStars, updateProductQuality, updateMorale, updateInvestorInterest } from './calculateGrowth.js';
import { calculateValuation } from './calculateValuation.js';
import { applyDecisionEffects, applyEventEffects } from './applyDecision.js';
import { checkEndings } from '../data/endings.js';
import { rollRandomEvent } from '../data/events.js';
import { getActiveEmployees } from '../db/database.js';
import { nanoid } from 'nanoid';

export interface AdvanceWeekResult {
  prevState: GameState;
  newState: GameState;
  decisionChanges: Record<string, number>;
  events: GameEvent[];
  eventChanges: Record<string, number>[];
  ending: ReturnType<typeof checkEndings>;
}

export function advanceWeek(
  state: GameState,
  decision?: ParsedDecision,
): AdvanceWeekResult {
  const prevState = structuredClone(state);
  const next = structuredClone(state);

  next.week += 1;

  // Apply player decision
  let decisionChanges: Record<string, number> = {};
  if (decision) {
    decisionChanges = applyDecisionEffects(next, decision);
  }

  // Calculate burn and revenue
  const employees = getActiveEmployees();
  const weeklyRevenue = calculateWeeklyRevenue(next);
  const weeklyBurn = calculateWeeklyBurn(next, employees);

  next.cash += weeklyRevenue - weeklyBurn;
  next.weekly_burn = weeklyBurn;

  // Update organic growth
  updateUserGrowth(next);
  updateGithubStars(next);
  updateProductQuality(next);
  updateMorale(next);
  updateInvestorInterest(next);

  // Roll random events (40% chance per week, or 70% if state is extreme)
  const events: GameEvent[] = [];
  const eventChanges: Record<string, number>[] = [];

  const eventChance = (
    next.runway_weeks < 5 || next.security_risk > 60 ||
    next.community_trust < 30 || next.team_morale < 30
  ) ? 0.70 : 0.40;

  if (Math.random() < eventChance) {
    const template = rollRandomEvent(next);
    if (template) {
      const effects: EventEffect = template.choices ? {} : template.effects;
      const gameEvent: GameEvent = {
        id: nanoid(),
        week: next.week,
        type: template.type,
        title: template.title,
        description: template.description,
        effects_json: JSON.stringify(template.choices ? {} : template.effects),
        choice_made: null,
        resolved: template.choices ? 0 : 1,
        created_at: new Date().toISOString(),
      };

      events.push(gameEvent);

      // Auto-apply effects for events without choices
      if (!template.choices) {
        const changes = applyEventEffects(next, template.effects);
        eventChanges.push(changes);
      }
    }
  }

  // Update valuation
  next.valuation = calculateValuation(next);

  // Calculate runway
  const netBurn = Math.max(weeklyBurn - weeklyRevenue, 1);
  next.runway_weeks = Math.max(0, next.cash / netBurn);

  // Check endings
  const ending = checkEndings(next);
  if (ending) {
    next.game_over = 1;
    next.ending_id = ending.id;
  }

  return {
    prevState,
    newState: next,
    decisionChanges,
    events,
    eventChanges,
    ending,
  };
}
