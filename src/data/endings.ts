import type { GameState, EndingResult } from '../db/types.js';

export interface EndingCondition {
  id: string;
  type: 'failure' | 'success';
  title: string;
  description: string;
  check: (state: GameState) => boolean;
  priority: number;
}

export const ENDINGS: EndingCondition[] = [
  // === FAILURE ENDINGS ===
  {
    id: 'bankruptcy',
    type: 'failure',
    title: '💀 Bankruptcy',
    description: 'Cash hit zero. The lights go off. Hermes Inc. is no more.\n\nYou ran out of runway before finding a sustainable path. The agents are archived, the repo goes quiet, and the community moves on.',
    check: (s) => s.cash <= 0,
    priority: 100,
  },
  {
    id: 'community_fork',
    type: 'failure',
    title: '🍴 Community Fork',
    description: 'The community lost faith. They forked the project and never looked back.\n\nYour repo is now a ghost town while "LibreHermes" has 3x your stars. The agents watch from the sidelines.',
    check: (s) => s.community_trust < 20 && s.open_source_karma < 30,
    priority: 90,
  },
  {
    id: 'security_collapse',
    type: 'failure',
    title: '🔓 Security Collapse',
    description: 'A catastrophic security breach exposed all user memories. Regulators and users flee.\n\nHermes Inc. becomes a cautionary tale in every AI safety talk.',
    check: (s) => s.security_risk > 90,
    priority: 95,
  },
  {
    id: 'founder_burnout',
    type: 'failure',
    title: '😵 Founder Burnout',
    description: 'The team collapsed under pressure. Morale hit rock bottom, key people left.\n\nYou stare at a Slack channel with 0 online members and realize it\'s over.',
    check: (s) => s.team_morale < 15,
    priority: 85,
  },
  {
    id: 'acqui_hire',
    type: 'failure',
    title: '🏢 Acqui-hire Under Pressure',
    description: 'With runway nearly gone, a big tech company offers to absorb the team. Not the exit you wanted.\n\nThe agents live on as internal tools. The vision dies in a corporate wiki.',
    check: (s) => s.runway_weeks < 3 && s.cash < 10000 && s.week > 8,
    priority: 80,
  },

  // === SUCCESS ENDINGS ===
  {
    id: 'indie_company',
    type: 'success',
    title: '🏠 Sustainable Indie Company',
    description: 'Hermes Inc. is profitable and independent. No VC pressure, no growth hacking.\n\nMRR covers burn with room to spare. The team is small, happy, and building exactly what they believe in.',
    check: (s) => s.mrr > s.weekly_burn * 4 * 4.345 && s.community_trust > 60 && s.team_morale > 50,
    priority: 70,
  },
  {
    id: 'open_source_standard',
    type: 'success',
    title: '🌍 Open-source Standard',
    description: 'Hermes became the de facto standard for personal AI agents.\n\nWith 100k+ stars, hundreds of contributors, and deep ecosystem roots, you built something bigger than a company.',
    check: (s) => s.github_stars > 100000 && s.open_source_karma > 85,
    priority: 60,
  },
  {
    id: 'agent_platform',
    type: 'success',
    title: '🔗 Agent Platform',
    description: 'Hermes Inc. is the platform that other agents build on.\n\nWith 50+ A2A integrations and a thriving marketplace, you became the AWS of personal agents.',
    check: (s) => s.a2a_integrations > 50 && s.mrr > 20000,
    priority: 55,
  },
  {
    id: 'unicorn',
    type: 'success',
    title: '🦄 AI Agent Unicorn',
    description: 'Hermes Inc. hit $1B valuation. Series B closed, team is growing, ARR is strong.\n\nThe agents have their own agents now. The board room is getting crowded.',
    check: (s) => s.valuation > 1000000000,
    priority: 50,
  },
  {
    id: 'protocol_civilization',
    type: 'success',
    title: '🌐 Protocol Civilization',
    description: 'Hermes didn\'t just build a company. It built a protocol that agents everywhere depend on.\n\n100+ integrations, open governance, and a self-sustaining ecosystem. You changed how AI agents communicate.',
    check: (s) => s.a2a_integrations > 100 && s.open_source_karma > 80 && s.github_stars > 50000,
    priority: 45,
  },
];

export function checkEndings(state: GameState): EndingResult | null {
  const triggered = ENDINGS.filter(e => e.check(state));
  if (triggered.length === 0) return null;

  // Sort by priority (highest first = most urgent)
  triggered.sort((a, b) => b.priority - a.priority);
  const ending = triggered[0];

  return {
    id: ending.id,
    type: ending.type,
    title: ending.title,
    description: ending.description,
  };
}
