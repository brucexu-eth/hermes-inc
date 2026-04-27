import type { EventEffect } from '../db/types.js';

export interface EventTemplate {
  id: string;
  type: 'product' | 'community' | 'business' | 'ai_market' | 'security' | 'a2a' | 'internal';
  title: string;
  description: string;
  effects: EventEffect;
  condition?: (state: any) => boolean;
  weight: number;
  choices?: EventChoice[];
}

export interface EventChoice {
  id: string;
  label: string;
  effects: EventEffect;
  description: string;
}

export const EVENT_TEMPLATES: EventTemplate[] = [
  // ===== PRODUCT EVENTS =====
  {
    id: 'viral_x_thread',
    type: 'community',
    title: 'Viral X Thread',
    description: 'A popular AI researcher posts: "Hermes Inc. feels like the first agent company that actually remembers its users."',
    effects: { github_stars: 1200, users: 600, hype: 20, weekly_burn: 150 },
    weight: 8,
    condition: (s) => s.users > 200 && s.product_quality > 40,
  },
  {
    id: 'major_bug',
    type: 'product',
    title: 'Critical Bug in Production',
    description: 'Users report that agent memory corrupts after 100+ messages. Twitter is not happy.',
    effects: { users: -80, community_trust: -8, tech_debt: 10, hype: -5 },
    weight: 10,
    condition: (s) => s.tech_debt > 30,
  },
  {
    id: 'feature_goes_viral',
    type: 'product',
    title: 'Feature Goes Viral',
    description: 'Someone demos your agent remembering a 3-month conversation perfectly. The clip gets 500k views.',
    effects: { users: 900, github_stars: 800, hype: 30, investor_interest: 10, weekly_burn: 200 },
    weight: 5,
    condition: (s) => s.product_quality > 60 && s.hype > 15,
  },
  {
    id: 'user_churn_wave',
    type: 'product',
    title: 'User Churn Wave',
    description: 'A batch of early adopters leave after finding the agent too slow and unreliable.',
    effects: { users: -200, community_trust: -5, hype: -8 },
    weight: 8,
    condition: (s) => s.product_quality < 40 || s.tech_debt > 50,
  },
  {
    id: 'hn_front_page',
    type: 'community',
    title: 'Hacker News Front Page',
    description: 'Your "Show HN" post hits #1. Comments are a mix of praise and skepticism.',
    effects: { github_stars: 2000, users: 400, hype: 15, community_trust: 5, investor_interest: 5 },
    weight: 6,
    condition: (s) => s.github_stars > 1000,
  },

  // ===== COMMUNITY EVENTS =====
  {
    id: 'privacy_backlash',
    type: 'community',
    title: 'Privacy Backlash',
    description: 'A user asks why Hermes remembers so much and demands memory export/delete. Others pile on.',
    effects: { community_trust: -12, security_risk: 8, hype: -5 },
    weight: 9,
    condition: (s) => s.users > 300 && s.security_risk > 15,
    choices: [
      { id: 'ship_export', label: 'Ship memory export/delete', effects: { community_trust: 15, tech_debt: 8, weekly_burn: 300 }, description: 'Build and ship memory export and delete features immediately.' },
      { id: 'publish_manifesto', label: 'Publish privacy manifesto', effects: { community_trust: 5, open_source_karma: 8, hype: 3 }, description: 'Write a transparent blog post about data handling principles.' },
      { id: 'ignore', label: 'Ignore for now', effects: { community_trust: -8, security_risk: 5 }, description: 'Hope it blows over. It might not.' },
    ],
  },
  {
    id: 'community_fork',
    type: 'community',
    title: 'Fork Threat',
    description: 'A group of contributors is discussing forking the project due to recent decisions.',
    effects: { community_trust: -15, open_source_karma: -10, team_morale: -8 },
    weight: 5,
    condition: (s) => s.community_trust < 40 || s.open_source_karma < 40,
  },
  {
    id: 'contributor_surge',
    type: 'community',
    title: 'Contributor Surge',
    description: 'A university AI lab assigns students to contribute to your project. 12 new PRs this week.',
    effects: { github_stars: 500, community_trust: 8, open_source_karma: 10, tech_debt: 5 },
    weight: 7,
    condition: (s) => s.open_source_karma > 60 && s.github_stars > 2000,
  },
  {
    id: 'github_issue_storm',
    type: 'community',
    title: 'GitHub Issue Storm',
    description: '47 new issues opened this week. Most are feature requests but some are angry bug reports.',
    effects: { github_stars: 200, community_trust: -3, tech_debt: 8, team_morale: -5 },
    weight: 8,
    condition: (s) => s.github_stars > 3000,
  },

  // ===== BUSINESS EVENTS =====
  {
    id: 'seed_offer',
    type: 'business',
    title: 'Seed Round Offer',
    description: 'A VC reaches out: "We love what you\'re building. Let\'s talk about a $500k seed at $5M valuation."',
    effects: { investor_interest: 20, hype: 10 },
    weight: 5,
    condition: (s) => s.investor_interest > 25 && s.users > 500,
    choices: [
      { id: 'accept', label: 'Accept the term sheet', effects: { cash: 500000, investor_interest: 15, community_trust: -5, weekly_burn: 500 }, description: 'Take the money. Runway is extended but expectations are set.' },
      { id: 'negotiate', label: 'Counter at $8M', effects: { investor_interest: -5, hype: 5 }, description: 'Push for a higher valuation. Risk losing the deal.' },
      { id: 'decline', label: 'Stay bootstrapped', effects: { community_trust: 10, open_source_karma: 5, investor_interest: -10 }, description: 'The community loves it. Your runway doesn\'t.' },
    ],
  },
  {
    id: 'enterprise_inquiry',
    type: 'business',
    title: 'Enterprise Inquiry',
    description: 'A Fortune 500 company wants to use your agent platform internally. They need SSO, audit logs, and SLA.',
    effects: { investor_interest: 10, hype: 5 },
    weight: 6,
    condition: (s) => s.users > 1000 && s.product_quality > 50,
    choices: [
      { id: 'pursue', label: 'Build enterprise features', effects: { mrr: 5000, tech_debt: 15, weekly_burn: 800, community_trust: -5 }, description: 'Big revenue but heavy engineering distraction.' },
      { id: 'waitlist', label: 'Put them on waitlist', effects: { investor_interest: 5, hype: 3 }, description: 'Signal demand without commitment.' },
      { id: 'reject', label: 'Stay focused on developers', effects: { community_trust: 5, open_source_karma: 5 }, description: 'The community cheers. The CFO doesn\'t.' },
    ],
  },
  {
    id: 'sponsor_offer',
    type: 'business',
    title: 'Open-source Sponsor',
    description: 'A cloud provider offers $2,000/month to sponsor your project in exchange for a "Powered by" badge.',
    effects: { mrr: 2000, community_trust: 3, open_source_karma: 5 },
    weight: 7,
    condition: (s) => s.github_stars > 5000 && s.open_source_karma > 50,
  },

  // ===== AI MARKET EVENTS =====
  {
    id: 'model_price_drop',
    type: 'ai_market',
    title: 'Model Price Drop',
    description: 'OpenAI slashes API prices by 60%. Your model costs plummet overnight.',
    effects: { weekly_burn: -400, product_quality: 5, hype: 3 },
    weight: 6,
  },
  {
    id: 'competitor_launch',
    type: 'ai_market',
    title: 'Competitor Launch',
    description: 'A well-funded competitor launches a similar agent product with $10M in backing.',
    effects: { hype: -10, investor_interest: -8, users: -100, community_trust: -3 },
    weight: 7,
    condition: (s) => s.week > 4,
  },
  {
    id: 'new_model_release',
    type: 'ai_market',
    title: 'New Frontier Model',
    description: 'A new model drops with 2x context and better tool use. Everyone wants you to integrate it.',
    effects: { hype: 10, tech_debt: 10, users: 200 },
    weight: 7,
    condition: (s) => s.week > 3,
  },
  {
    id: 'ai_regulation_news',
    type: 'ai_market',
    title: 'AI Regulation News',
    description: 'EU announces strict AI agent regulation. Companies must provide data export and audit trails.',
    effects: { security_risk: 10, investor_interest: -5, hype: -3 },
    weight: 5,
    condition: (s) => s.week > 6,
  },

  // ===== SECURITY EVENTS =====
  {
    id: 'memory_leak',
    type: 'security',
    title: 'Memory Data Leak',
    description: 'A security researcher finds that agent memories can be extracted via prompt injection.',
    effects: { security_risk: 20, community_trust: -15, users: -150, hype: -10 },
    weight: 4,
    condition: (s) => s.security_risk > 50,
  },
  {
    id: 'prompt_injection',
    type: 'security',
    title: 'Prompt Injection Attack',
    description: 'Someone discovers a prompt injection that makes your agent reveal system prompts.',
    effects: { security_risk: 15, community_trust: -8, hype: -5 },
    weight: 7,
    condition: (s) => s.security_risk > 25,
    choices: [
      { id: 'fix_ship', label: 'Emergency patch', effects: { security_risk: -20, tech_debt: 5, team_morale: -5 }, description: 'All-hands emergency fix. Ship within 24 hours.' },
      { id: 'bounty', label: 'Launch bug bounty', effects: { security_risk: -10, community_trust: 8, weekly_burn: 200, open_source_karma: 5 }, description: 'Turn it into a positive by rewarding the researcher.' },
      { id: 'downplay', label: 'Downplay the issue', effects: { security_risk: 5, community_trust: -10 }, description: 'Hope nobody notices. They always notice.' },
    ],
  },
  {
    id: 'token_leak',
    type: 'security',
    title: 'API Token Exposed',
    description: 'An API key was accidentally committed to the public repo. Bots are racking up charges.',
    effects: { cash: -3000, security_risk: 10, community_trust: -5, team_morale: -8 },
    weight: 6,
    condition: (s) => s.tech_debt > 40 && s.security_risk > 20,
  },

  // ===== A2A EVENTS =====
  {
    id: 'a2a_handshake',
    type: 'a2a',
    title: 'A2A Handshake Request',
    description: 'Another agent company wants to exchange skills and access your memory schema via A2A protocol.',
    effects: { hype: 5, investor_interest: 5 },
    weight: 6,
    condition: (s) => s.week > 5 && s.product_quality > 40,
    choices: [
      { id: 'accept', label: 'Accept full integration', effects: { a2a_integrations: 3, hype: 10, security_risk: 10, investor_interest: 8 }, description: 'Full interop. Huge ecosystem value, but security exposure.' },
      { id: 'sandbox', label: 'Sandbox integration', effects: { a2a_integrations: 1, security_risk: 3, tech_debt: 5, investor_interest: 3 }, description: 'Limited but safe integration.' },
      { id: 'reject', label: 'Reject', effects: { community_trust: -3, security_risk: -5 }, description: 'Stay closed. Safer but lonelier.' },
    ],
  },
  {
    id: 'a2a_standard_proposal',
    type: 'a2a',
    title: 'A2A Standard Proposal',
    description: 'An industry group asks you to co-author an agent communication standard.',
    effects: { hype: 15, open_source_karma: 10, investor_interest: 8, tech_debt: 10 },
    weight: 4,
    condition: (s) => s.a2a_integrations > 5 && s.github_stars > 10000,
  },

  // ===== INTERNAL EVENTS =====
  {
    id: 'engineer_burnout',
    type: 'internal',
    title: 'Engineer Burnout',
    description: 'Linus hasn\'t taken a day off in 6 weeks. Code quality is dropping and merge conflicts are piling up.',
    effects: { team_morale: -12, tech_debt: 8, product_quality: -5 },
    weight: 8,
    condition: (s) => s.team_morale < 50,
  },
  {
    id: 'team_argument',
    type: 'internal',
    title: 'Team Argument',
    description: 'Voss and Maya have a heated argument about monetization strategy. The team is divided.',
    effects: { team_morale: -8 },
    weight: 7,
    condition: (s) => s.mrr > 0 && s.community_trust < 60,
    choices: [
      { id: 'side_voss', label: 'Side with Voss (revenue)', effects: { mrr: 500, community_trust: -8, team_morale: -3 }, description: 'Revenue matters. Maya won\'t be happy.' },
      { id: 'side_maya', label: 'Side with Maya (community)', effects: { community_trust: 8, open_source_karma: 5, mrr: -200 }, description: 'Community first. Voss starts updating his resume.' },
      { id: 'mediate', label: 'Mediate a compromise', effects: { team_morale: 5, mrr: 200, community_trust: 2 }, description: 'Find middle ground. Slower but keeps the team intact.' },
    ],
  },
  {
    id: 'key_employee_offer',
    type: 'internal',
    title: 'Poaching Attempt',
    description: 'Google offers Linus 3x his salary. He\'s conflicted but hasn\'t decided yet.',
    effects: { team_morale: -5 },
    weight: 5,
    condition: (s) => s.team_morale < 60 && s.week > 4,
    choices: [
      { id: 'raise', label: 'Give Linus a raise', effects: { weekly_burn: 400, team_morale: 10 }, description: 'Match part of the offer. Expensive but keeps the team.' },
      { id: 'equity', label: 'Offer more equity', effects: { team_morale: 8, investor_interest: -2 }, description: 'No cash hit but dilution concerns.' },
      { id: 'let_go', label: 'Wish him well', effects: { team_morale: -15, product_quality: -10, tech_debt: 15 }, description: 'Losing your lead engineer. Painful.' },
    ],
  },
  {
    id: 'team_celebration',
    type: 'internal',
    title: 'Team Celebration',
    description: 'After a string of wins, the team hosts a small celebration. Morale is up.',
    effects: { team_morale: 12, cash: -500 },
    weight: 6,
    condition: (s) => s.team_morale > 70 && s.hype > 30,
  },
];

export function getEligibleEvents(state: any): EventTemplate[] {
  return EVENT_TEMPLATES.filter(e => !e.condition || e.condition(state));
}

export function rollRandomEvent(state: any): EventTemplate | null {
  const eligible = getEligibleEvents(state);
  if (eligible.length === 0) return null;

  const totalWeight = eligible.reduce((sum, e) => sum + e.weight, 0);
  let roll = Math.random() * totalWeight;

  for (const event of eligible) {
    roll -= event.weight;
    if (roll <= 0) return event;
  }

  return eligible[eligible.length - 1];
}
