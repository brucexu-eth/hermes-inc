export interface GameState {
  id: number;
  week: number;
  cash: number;
  mrr: number;
  users: number;
  paid_users: number;
  github_stars: number;
  valuation: number;
  runway_weeks: number;
  weekly_burn: number;
  product_quality: number;
  tech_debt: number;
  security_risk: number;
  community_trust: number;
  open_source_karma: number;
  team_morale: number;
  hype: number;
  investor_interest: number;
  a2a_integrations: number;
  speed_mode: string;
  tick_interval_minutes: number;
  next_tick_at: string | null;
  paused: number;
  game_over: number;
  ending_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  emoji: string;
  salary_per_week: number;
  morale: number;
  fatigue: number;
  loyalty: number;
  active: number;
  personality: string;
  skills_json: string;
  values_json: string;
}

export interface Decision {
  id: string;
  week: number;
  raw_input: string;
  parsed_json: string | null;
  result_json: string | null;
  applied: number;
  created_at: string;
}

export interface GameEvent {
  id: string;
  week: number;
  type: string;
  title: string;
  description: string;
  effects_json: string;
  choice_made: string | null;
  resolved: number;
  created_at: string;
}

export interface WeekLog {
  id: number;
  week: number;
  state_before_json: string;
  state_after_json: string;
  decision_id: string | null;
  event_ids_json: string;
  narrative: string | null;
  created_at: string;
}

export interface ParsedDecision {
  focus: string[];
  deprioritize: string[];
  effects: Record<string, number>;
}

export interface EventEffect {
  cash?: number;
  mrr?: number;
  users?: number;
  paid_users?: number;
  github_stars?: number;
  product_quality?: number;
  tech_debt?: number;
  security_risk?: number;
  community_trust?: number;
  open_source_karma?: number;
  team_morale?: number;
  hype?: number;
  investor_interest?: number;
  a2a_integrations?: number;
  weekly_burn?: number;
}

export interface WeekResult {
  state: GameState;
  events: GameEvent[];
  ending: EndingResult | null;
}

export interface EndingResult {
  id: string;
  type: 'failure' | 'success';
  title: string;
  description: string;
}
