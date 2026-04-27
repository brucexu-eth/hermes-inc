export interface ProductCombo {
  platform: string;
  capability: string;
  market: string;
  effects: {
    users: number;
    github_stars: number;
    community_trust: number;
    tech_debt: number;
    security_risk: number;
    hype: number;
    mrr_potential: number;
    weekly_burn: number;
    product_quality: number;
    open_source_karma: number;
    investor_interest: number;
    a2a_integrations: number;
  };
  description: string;
}

export const PLATFORMS = [
  'telegram', 'cli', 'discord', 'web_ui', 'browser_extension',
  'api', 'local_desktop', 'a2a_gateway',
] as const;

export const CAPABILITIES = [
  'persistent_memory', 'skills', 'subagents', 'browser_automation',
  'image_generation', 'voice', 'a2a_communication', 'marketplace',
  'sandbox', 'security',
] as const;

export const MARKETS = [
  'developers', 'creators', 'open_source_maintainers', 'ai_power_users',
  'startups', 'enterprises', 'web3_communities',
] as const;

const BASE_EFFECTS = {
  users: 0, github_stars: 0, community_trust: 0, tech_debt: 0,
  security_risk: 0, hype: 0, mrr_potential: 0, weekly_burn: 0,
  product_quality: 0, open_source_karma: 0, investor_interest: 0,
  a2a_integrations: 0,
};

const PLATFORM_MODIFIERS: Record<string, Partial<typeof BASE_EFFECTS>> = {
  telegram: { users: 200, hype: 5, weekly_burn: 100 },
  cli: { github_stars: 300, community_trust: 3, tech_debt: -3, weekly_burn: 50 },
  discord: { users: 150, community_trust: 2, weekly_burn: 100 },
  web_ui: { users: 300, hype: 8, tech_debt: 10, weekly_burn: 300 },
  browser_extension: { users: 100, hype: 5, tech_debt: 8, weekly_burn: 200 },
  api: { github_stars: 200, investor_interest: 5, tech_debt: 5, weekly_burn: 150 },
  local_desktop: { community_trust: 5, open_source_karma: 5, tech_debt: 12, weekly_burn: 400 },
  a2a_gateway: { a2a_integrations: 2, investor_interest: 8, hype: 10, security_risk: 5, weekly_burn: 250 },
};

const CAPABILITY_MODIFIERS: Record<string, Partial<typeof BASE_EFFECTS>> = {
  persistent_memory: { users: 150, community_trust: 5, product_quality: 8, security_risk: 5, weekly_burn: 200 },
  skills: { github_stars: 200, product_quality: 5, tech_debt: 5, weekly_burn: 150 },
  subagents: { product_quality: 5, tech_debt: 8, investor_interest: 5, weekly_burn: 200 },
  browser_automation: { users: 100, hype: 8, security_risk: 8, tech_debt: 10, weekly_burn: 250 },
  image_generation: { users: 200, hype: 10, weekly_burn: 300 },
  voice: { users: 150, hype: 5, weekly_burn: 200 },
  a2a_communication: { a2a_integrations: 3, investor_interest: 10, hype: 8, security_risk: 5, weekly_burn: 200 },
  marketplace: { mrr_potential: 1000, hype: 5, investor_interest: 8, tech_debt: 10, weekly_burn: 300 },
  sandbox: { security_risk: -10, community_trust: 5, tech_debt: 5, weekly_burn: 150 },
  security: { security_risk: -8, community_trust: 8, product_quality: 3, weekly_burn: 100 },
};

const MARKET_MODIFIERS: Record<string, Partial<typeof BASE_EFFECTS>> = {
  developers: { github_stars: 400, open_source_karma: 5, community_trust: 3 },
  creators: { users: 200, hype: 8, mrr_potential: 500 },
  open_source_maintainers: { open_source_karma: 10, github_stars: 300, community_trust: 5 },
  ai_power_users: { users: 100, hype: 5, product_quality: 3, investor_interest: 3 },
  startups: { mrr_potential: 800, investor_interest: 5, users: 80 },
  enterprises: { mrr_potential: 3000, investor_interest: 10, tech_debt: 5, community_trust: -3 },
  web3_communities: { hype: 12, users: 150, community_trust: -2, investor_interest: 5 },
};

export function calculateProductEffects(platform: string, capability: string, market: string): ProductCombo {
  const effects = { ...BASE_EFFECTS };

  const pMod = PLATFORM_MODIFIERS[platform] || {};
  const cMod = CAPABILITY_MODIFIERS[capability] || {};
  const mMod = MARKET_MODIFIERS[market] || {};

  for (const key of Object.keys(effects) as (keyof typeof BASE_EFFECTS)[]) {
    effects[key] += (pMod[key] || 0) + (cMod[key] || 0) + (mMod[key] || 0);
  }

  return {
    platform,
    capability,
    market,
    effects,
    description: `${platform} × ${capability} × ${market}`,
  };
}

export function parseShipCommand(input: string): { platform: string; capability: string; market: string } | null {
  const lower = input.toLowerCase().replace(/[^a-z0-9_ ]/g, '').trim();
  const words = lower.split(/\s+/);

  let platform = 'telegram';
  let capability = 'persistent_memory';
  let market = 'developers';

  for (const p of PLATFORMS) {
    if (words.some(w => p.includes(w) || w.includes(p.replace('_', '')))) {
      platform = p;
      break;
    }
  }

  for (const c of CAPABILITIES) {
    if (words.some(w => c.includes(w) || w.includes(c.replace('_', '')))) {
      capability = c;
      break;
    }
  }

  for (const m of MARKETS) {
    if (words.some(w => m.includes(w) || w.includes(m.replace('_', '')))) {
      market = m;
      break;
    }
  }

  return { platform, capability, market };
}
