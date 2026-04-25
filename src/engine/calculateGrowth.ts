import type { GameState } from '../db/types.js';

export function updateUserGrowth(state: GameState): void {
  // Organic growth based on product quality and hype
  const qualityFactor = state.product_quality / 100;
  const hypeFactor = state.hype / 100;
  const trustFactor = state.community_trust / 100;

  const organicGrowth = Math.floor(
    state.users * 0.03 * qualityFactor +
    state.hype * 2 +
    state.github_stars * 0.002
  );

  // Churn based on low quality or trust issues
  const churnRate = Math.max(0.01,
    0.05 * (1 - qualityFactor) +
    0.03 * (1 - trustFactor) +
    0.02 * (state.tech_debt / 100)
  );
  const churn = Math.floor(state.users * churnRate);

  state.users = Math.max(0, state.users + organicGrowth - churn);

  // Paid user conversion
  if (state.mrr > 0) {
    const conversionRate = 0.02 * qualityFactor * trustFactor;
    const newPaid = Math.floor(state.users * conversionRate);
    state.paid_users = Math.min(state.users, state.paid_users + newPaid);
  }
}

export function updateGithubStars(state: GameState): void {
  const karmaFactor = state.open_source_karma / 100;
  const hypeFactor = state.hype / 100;

  // Organic star growth
  const organicStars = Math.floor(
    state.github_stars * 0.01 * karmaFactor +
    state.hype * 3 +
    state.users * 0.005
  );

  // Star loss from bad community trust
  const starLoss = state.community_trust < 30
    ? Math.floor(state.github_stars * 0.005)
    : 0;

  state.github_stars = Math.max(0, state.github_stars + organicStars - starLoss);
}

export function updateProductQuality(state: GameState): void {
  // Tech debt degrades quality over time
  if (state.tech_debt > 50) {
    state.product_quality = Math.max(0, state.product_quality - (state.tech_debt - 50) * 0.1);
  }

  // Natural tech debt accumulation
  state.tech_debt = Math.min(100, state.tech_debt + 0.5);

  // Security risk creeps up with more users and features
  if (state.users > 500 && state.security_risk < 80) {
    state.security_risk = Math.min(100, state.security_risk + 0.3);
  }

  // Morale natural decay under pressure
  if (state.runway_weeks < 6) {
    state.team_morale = Math.max(0, state.team_morale - 2);
  }

  // Hype decays naturally
  state.hype = Math.max(0, state.hype * 0.95);

  // Fatigue from low morale
  if (state.team_morale < 40) {
    state.product_quality = Math.max(0, state.product_quality - 1);
  }
}

export function updateMorale(state: GameState): void {
  // Good runway improves morale slightly
  if (state.runway_weeks > 12 && state.team_morale < 80) {
    state.team_morale = Math.min(100, state.team_morale + 1);
  }

  // Good hype improves morale
  if (state.hype > 40 && state.team_morale < 85) {
    state.team_morale = Math.min(100, state.team_morale + 0.5);
  }

  // Very low runway tanks morale
  if (state.runway_weeks < 4) {
    state.team_morale = Math.max(0, state.team_morale - 3);
  }
}

export function updateInvestorInterest(state: GameState): void {
  // Interest grows with traction
  if (state.users > 1000 && state.github_stars > 5000) {
    state.investor_interest = Math.min(100, state.investor_interest + 1);
  }

  // Interest grows with revenue
  if (state.mrr > 5000) {
    state.investor_interest = Math.min(100, state.investor_interest + 2);
  }

  // Interest decays without growth
  if (state.hype < 10) {
    state.investor_interest = Math.max(0, state.investor_interest - 1);
  }

  // Security issues tank interest
  if (state.security_risk > 60) {
    state.investor_interest = Math.max(0, state.investor_interest - 2);
  }
}
