import type { GameState } from '../db/types.js';

export function calculateValuation(state: GameState): number {
  // ARR = MRR * 12
  const arr = state.mrr * 12;

  // Revenue multiple based on growth stage
  let revenueMultiple = 10;
  if (arr > 100000) revenueMultiple = 15;
  if (arr > 1000000) revenueMultiple = 20;
  if (arr > 10000000) revenueMultiple = 25;

  const baseValuation = arr * revenueMultiple;

  // Ecosystem value
  const ecosystemValue =
    state.github_stars * 20 +
    state.users * 5 +
    state.a2a_integrations * 5000 +
    state.open_source_karma * 1000;

  // Risk modifier
  let riskModifier = 1.0;

  // Community trust bonus (60-100 → +0% to +20%)
  if (state.community_trust > 60) {
    riskModifier += (state.community_trust - 60) * 0.005;
  }

  // Product quality bonus (60-100 → +0% to +20%)
  if (state.product_quality > 60) {
    riskModifier += (state.product_quality - 60) * 0.005;
  }

  // Tech debt penalty (40-100 → -0% to -30%)
  if (state.tech_debt > 40) {
    riskModifier -= (state.tech_debt - 40) * 0.005;
  }

  // Security risk penalty (40-100 → -0% to -30%)
  if (state.security_risk > 40) {
    riskModifier -= (state.security_risk - 40) * 0.005;
  }

  // Hype bonus
  if (state.hype > 50) {
    riskModifier += (state.hype - 50) * 0.003;
  }

  // Investor interest bonus
  if (state.investor_interest > 30) {
    riskModifier += (state.investor_interest - 30) * 0.003;
  }

  riskModifier = Math.max(0.3, Math.min(2.5, riskModifier));

  const valuation = (baseValuation + ecosystemValue) * riskModifier;

  // Minimum valuation floor
  return Math.max(50000, Math.round(valuation));
}
