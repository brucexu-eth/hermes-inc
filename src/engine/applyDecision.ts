import type { GameState, ParsedDecision, EventEffect } from '../db/types.js';

// Maps focus keywords to their effects on game state
const FOCUS_EFFECTS: Record<string, EventEffect> = {
  // Product focuses
  telegram: { users: 200, hype: 5, product_quality: 3, tech_debt: 3, weekly_burn: 100 },
  memory: { users: 150, product_quality: 5, community_trust: 3, security_risk: 5, weekly_burn: 150 },
  skills: { github_stars: 200, product_quality: 5, tech_debt: 3, weekly_burn: 100 },
  voice: { users: 100, hype: 8, weekly_burn: 200 },
  browser: { users: 80, hype: 5, tech_debt: 8, security_risk: 5, weekly_burn: 200 },
  image: { users: 120, hype: 8, weekly_burn: 200 },
  subagents: { product_quality: 5, tech_debt: 5, investor_interest: 3, weekly_burn: 150 },
  features: { users: 100, product_quality: 3, tech_debt: 5, weekly_burn: 100 },
  product: { users: 100, product_quality: 5, tech_debt: 3, weekly_burn: 100 },

  // Strategy focuses
  open_source: { github_stars: 400, community_trust: 8, open_source_karma: 10, weekly_burn: 50 },
  community: { community_trust: 8, open_source_karma: 5, github_stars: 200, users: 50 },
  transparency: { community_trust: 10, open_source_karma: 8, hype: 3 },
  export: { community_trust: 5, open_source_karma: 5, security_risk: -5, tech_debt: 5 },
  privacy: { security_risk: -8, community_trust: 5, tech_debt: 5, weekly_burn: 100 },
  security: { security_risk: -10, community_trust: 5, product_quality: 3, weekly_burn: 150 },
  local_first: { community_trust: 5, open_source_karma: 8, security_risk: -5, weekly_burn: 100 },
  developer_community: { github_stars: 300, community_trust: 5, open_source_karma: 5 },

  // Business focuses
  monetization: { mrr: 800, paid_users: 20, investor_interest: 5, community_trust: -5, weekly_burn: 100 },
  revenue: { mrr: 600, investor_interest: 5, community_trust: -3 },
  enterprise: { mrr: 2000, tech_debt: 8, community_trust: -5, weekly_burn: 300 },
  fundraise: { investor_interest: 10, hype: 5, cash: 0, weekly_burn: 50 },
  saas: { mrr: 1000, users: 50, paid_users: 30, tech_debt: 5, weekly_burn: 200 },
  pricing: { mrr: 500, paid_users: 10, community_trust: -2 },
  growth: { users: 300, hype: 10, weekly_burn: 200, tech_debt: 5 },
  marketing: { users: 200, hype: 15, weekly_burn: 300 },

  // Technical focuses
  quality: { product_quality: 8, tech_debt: -5, weekly_burn: 50 },
  refactor: { tech_debt: -10, product_quality: 5 },
  architecture: { tech_debt: -8, product_quality: 5, weekly_burn: 50 },
  testing: { product_quality: 5, tech_debt: -3, security_risk: -3 },
  performance: { product_quality: 5, users: 50, tech_debt: -3 },
  bugs: { product_quality: 8, tech_debt: -5, community_trust: 3 },

  // Platform focuses
  a2a: { a2a_integrations: 2, investor_interest: 5, hype: 8, security_risk: 5, weekly_burn: 200 },
  marketplace: { mrr: 500, hype: 5, investor_interest: 5, tech_debt: 8, weekly_burn: 250 },
  api: { github_stars: 150, investor_interest: 3, tech_debt: 3, weekly_burn: 100 },
  sandbox: { security_risk: -8, community_trust: 3, tech_debt: 5, weekly_burn: 100 },
};

const DEPRIORITIZE_PENALTIES: Record<string, EventEffect> = {
  monetization: { mrr: -200, investor_interest: -3 },
  revenue: { mrr: -200, investor_interest: -3 },
  growth: { users: -50, hype: -5 },
  community: { community_trust: -5, open_source_karma: -3 },
  open_source: { community_trust: -3, open_source_karma: -5 },
  security: { security_risk: 5 },
  quality: { product_quality: -3, tech_debt: 5 },
  enterprise: { investor_interest: -3 },
  features: { users: -30 },
  users: { users: -50, hype: -3 },
};

export function applyDecisionEffects(state: GameState, decision: ParsedDecision): Record<string, number> {
  const changes: Record<string, number> = {};

  // Apply focus effects (diminishing returns for many focuses)
  const focusMultiplier = decision.focus.length <= 2 ? 1.0 :
    decision.focus.length <= 3 ? 0.7 :
    0.5;

  for (const focus of decision.focus) {
    const effects = FOCUS_EFFECTS[focus];
    if (!effects) continue;

    for (const [key, value] of Object.entries(effects)) {
      if (value === undefined) continue;
      const scaled = Math.round(value * focusMultiplier);
      applyEffect(state, key, scaled, changes);
    }
  }

  // Apply deprioritize penalties
  for (const dep of decision.deprioritize) {
    const penalties = DEPRIORITIZE_PENALTIES[dep];
    if (!penalties) continue;

    for (const [key, value] of Object.entries(penalties)) {
      if (value === undefined) continue;
      applyEffect(state, key, value, changes);
    }
  }

  // Apply any direct effects from the parsed decision
  for (const [key, value] of Object.entries(decision.effects)) {
    applyEffect(state, key, value, changes);
  }

  return changes;
}

function applyEffect(state: GameState, key: string, value: number, changes: Record<string, number>): void {
  const stateKey = key as keyof GameState;
  if (typeof (state as any)[stateKey] !== 'number') return;

  (state as any)[stateKey] += value;
  changes[key] = (changes[key] || 0) + value;

  // Clamp values
  clampState(state);
}

export function applyEventEffects(state: GameState, effects: EventEffect): Record<string, number> {
  const changes: Record<string, number> = {};

  for (const [key, value] of Object.entries(effects)) {
    if (value === undefined || value === 0) continue;
    applyEffect(state, key, value, changes);
  }

  return changes;
}

function clampState(state: GameState): void {
  state.product_quality = clamp(state.product_quality, 0, 100);
  state.tech_debt = clamp(state.tech_debt, 0, 100);
  state.security_risk = clamp(state.security_risk, 0, 100);
  state.community_trust = clamp(state.community_trust, 0, 100);
  state.open_source_karma = clamp(state.open_source_karma, 0, 100);
  state.team_morale = clamp(state.team_morale, 0, 100);
  state.hype = clamp(state.hype, 0, 100);
  state.investor_interest = clamp(state.investor_interest, 0, 100);
  state.users = Math.max(0, state.users);
  state.paid_users = Math.max(0, Math.min(state.paid_users, state.users));
  state.github_stars = Math.max(0, state.github_stars);
  state.a2a_integrations = Math.max(0, state.a2a_integrations);
  state.mrr = Math.max(0, state.mrr);
  state.weekly_burn = Math.max(500, state.weekly_burn);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function parseNaturalLanguageDecision(input: string): ParsedDecision {
  const lower = input.toLowerCase();
  const focus: string[] = [];
  const deprioritize: string[] = [];

  // Detect focus areas
  const focusKeywords: Record<string, string[]> = {
    telegram: ['telegram', 'tg', 'bot'],
    memory: ['memory', 'remember', 'recall', 'persistence'],
    skills: ['skills', 'skill', 'capabilities'],
    voice: ['voice', 'speech', 'tts', 'audio'],
    browser: ['browser', 'web automation', 'puppeteer'],
    image: ['image', 'image generation', 'dalle', 'picture'],
    subagents: ['subagent', 'sub-agent', 'multi-agent'],
    open_source: ['open source', 'open-source', 'oss', 'foss'],
    community: ['community', 'devrel', 'developer relations'],
    transparency: ['transparency', 'transparent'],
    export: ['export', 'data portability'],
    privacy: ['privacy', 'private', 'gdpr'],
    security: ['security', 'secure', 'audit', 'penetration'],
    local_first: ['local first', 'local-first', 'on-device', 'offline'],
    developer_community: ['developer community', 'developers', 'devs'],
    monetization: ['monetize', 'monetization', 'charge', 'paid plan', 'subscription'],
    revenue: ['revenue', 'income', 'earnings'],
    enterprise: ['enterprise', 'b2b', 'corporate'],
    fundraise: ['fundraise', 'fundraising', 'raise', 'vc', 'investor', 'series'],
    saas: ['saas', 'hosted', 'cloud service'],
    pricing: ['pricing', 'price', 'tier'],
    growth: ['growth', 'grow', 'scale', 'expand'],
    marketing: ['marketing', 'promote', 'ads', 'campaign'],
    quality: ['quality', 'polish', 'ux', 'user experience'],
    refactor: ['refactor', 'rewrite', 'cleanup', 'clean up'],
    architecture: ['architecture', 'redesign', 'infrastructure'],
    testing: ['test', 'testing', 'ci', 'qa'],
    performance: ['performance', 'speed', 'optimize', 'fast'],
    bugs: ['bug', 'fix', 'patch', 'hotfix'],
    a2a: ['a2a', 'agent-to-agent', 'interop', 'protocol'],
    marketplace: ['marketplace', 'app store', 'plugin store'],
    api: ['api', 'sdk', 'integration'],
    sandbox: ['sandbox', 'isolation', 'containment'],
    features: ['feature', 'ship', 'launch', 'release'],
    product: ['product', 'build'],
  };

  for (const [key, keywords] of Object.entries(focusKeywords)) {
    if (keywords.some(kw => lower.includes(kw))) {
      focus.push(key);
    }
  }

  // Detect deprioritized areas
  const deprioritizePatterns = [
    { pattern: /(?:don'?t|no|not|stop|pause|skip|delay|defer|deprioritize|hold off on)\s+(?:.*?)(monetiz|revenue|paid|pricing|charge)/i, key: 'monetization' },
    { pattern: /(?:don'?t|no|not|stop|pause|skip|delay|defer|deprioritize|hold off on)\s+(?:.*?)(growth|marketing|promote)/i, key: 'growth' },
    { pattern: /(?:don'?t|no|not|stop|pause|skip|delay|defer|deprioritize|hold off on)\s+(?:.*?)(community|devrel|open.?source)/i, key: 'community' },
    { pattern: /(?:don'?t|no|not|stop|pause|skip|delay|defer|deprioritize|hold off on)\s+(?:.*?)(security|privacy)/i, key: 'security' },
    { pattern: /(?:don'?t|no|not|stop|pause|skip|delay|defer|deprioritize|hold off on)\s+(?:.*?)(enterprise|b2b)/i, key: 'enterprise' },
    { pattern: /(?:don'?t|no|not|stop|pause|skip|delay|defer|deprioritize|hold off on)\s+(?:.*?)(feature|ship)/i, key: 'features' },
    { pattern: /(?:don'?t|no|not|stop|pause|skip|delay|defer|deprioritize|hold off on)\s+(?:.*?)(a2a|interop)/i, key: 'a2a' },
    { pattern: /先不要.*?商业化|暂停.*?商业|不急.*?商业/i, key: 'monetization' },
    { pattern: /暂停.*?a2a|停.*?a2a/i, key: 'a2a' },
  ];

  for (const { pattern, key } of deprioritizePatterns) {
    if (pattern.test(input)) {
      deprioritize.push(key);
      // Remove from focus if conflicting
      const idx = focus.indexOf(key);
      if (idx > -1) focus.splice(idx, 1);
    }
  }

  // If no focus detected, default to generic product work
  if (focus.length === 0) {
    focus.push('product');
  }

  return {
    focus,
    deprioritize,
    effects: {},
  };
}
