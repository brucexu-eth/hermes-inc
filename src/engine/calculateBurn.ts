import type { GameState, Employee } from '../db/types.js';

export function calculateWeeklyBurn(state: GameState, employees: Employee[]): number {
  // Base: sum of active employee salaries
  const salaryBurn = employees
    .filter(e => e.active)
    .reduce((sum, e) => sum + e.salary_per_week, 0);

  // Infrastructure cost scales with users
  const infraCost = Math.floor(state.users * 0.15);

  // Model API cost scales with users and product quality
  const modelCost = Math.floor(state.users * 0.08 * (1 + state.product_quality / 200));

  // Tech debt increases maintenance cost
  const debtCost = Math.floor(state.tech_debt * 10);

  // A2A integrations have upkeep
  const a2aCost = state.a2a_integrations * 20;

  return salaryBurn + infraCost + modelCost + debtCost + a2aCost;
}

export function calculateWeeklyRevenue(state: GameState): number {
  // MRR is monthly, convert to weekly
  return state.mrr / 4.345;
}
