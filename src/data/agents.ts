import type { Employee } from '../db/types.js';

export const INITIAL_AGENTS: Employee[] = [
  {
    id: 'stella',
    name: 'Stella',
    role: 'PM',
    emoji: '🧠',
    salary_per_week: 900,
    morale: 75,
    fatigue: 10,
    loyalty: 60,
    active: 1,
    personality: 'Growth-oriented, user-focused, willing to compromise. Pushes for features that drive adoption and retention. Sometimes too eager to ship.',
    skills_json: JSON.stringify(['product_strategy', 'user_research', 'roadmap']),
    values_json: JSON.stringify(['user_growth', 'retention', 'demo_virality']),
  },
  {
    id: 'linus',
    name: 'Linus',
    role: 'Engineer',
    emoji: '🛠',
    salary_per_week: 1200,
    morale: 70,
    fatigue: 15,
    loyalty: 55,
    active: 1,
    personality: 'Engineering quality purist, hates messy pivots. Wants clean architecture and low tech debt. Will push back on rushed features.',
    skills_json: JSON.stringify(['architecture', 'code_quality', 'performance']),
    values_json: JSON.stringify(['code_quality', 'low_tech_debt', 'reliability']),
  },
  {
    id: 'maya',
    name: 'Maya',
    role: 'Community',
    emoji: '🌱',
    salary_per_week: 700,
    morale: 80,
    fatigue: 5,
    loyalty: 70,
    active: 1,
    personality: 'Open-source evangelist, DevRel mindset, community-first. Believes trust is the most valuable asset. Wary of aggressive monetization.',
    skills_json: JSON.stringify(['devrel', 'community_building', 'content']),
    values_json: JSON.stringify(['community_trust', 'open_source', 'transparency']),
  },
  {
    id: 'voss',
    name: 'Voss',
    role: 'CFO',
    emoji: '💰',
    salary_per_week: 1000,
    morale: 65,
    fatigue: 20,
    loyalty: 50,
    active: 1,
    personality: 'Revenue-obsessed, runway-conscious. Always calculating burn rate. Pushes for monetization and fundraising. Pragmatic about trade-offs.',
    skills_json: JSON.stringify(['finance', 'fundraising', 'pricing']),
    values_json: JSON.stringify(['revenue', 'runway', 'unit_economics']),
  },
  {
    id: 'nyx',
    name: 'Nyx',
    role: 'Security & Ethos',
    emoji: '🛡',
    salary_per_week: 900,
    morale: 72,
    fatigue: 10,
    loyalty: 65,
    active: 1,
    personality: 'Privacy-first, principled. Cares about security, data ethics, and long-term trust. Will veto features that compromise user safety.',
    skills_json: JSON.stringify(['security', 'privacy', 'ethics']),
    values_json: JSON.stringify(['security', 'privacy', 'user_safety']),
  },
];

export interface AgentOpinion {
  agent_id: string;
  emoji: string;
  name: string;
  role: string;
  stance: 'support' | 'oppose' | 'cautious' | 'neutral';
  comment: string;
}

export function getAgentReactions(focus: string[], deprioritize: string[]): AgentOpinion[] {
  const opinions: AgentOpinion[] = [];

  // Stella (PM) - likes user growth, features
  const stellaLikes = focus.some(f =>
    ['users', 'retention', 'telegram', 'memory', 'features', 'growth', 'demo', 'product'].includes(f)
  );
  const stellaDislikes = deprioritize.some(d =>
    ['users', 'growth', 'features', 'product'].includes(d)
  );
  opinions.push({
    agent_id: 'stella',
    emoji: '🧠',
    name: 'Stella',
    role: 'PM',
    stance: stellaDislikes ? 'oppose' : stellaLikes ? 'support' : 'neutral',
    comment: stellaDislikes
      ? 'Deprioritizing growth is dangerous. We need users to prove value.'
      : stellaLikes
        ? 'Good direction. This will improve retention and make the product easier to demo.'
        : 'Acceptable, but let\'s not lose sight of user needs.',
  });

  // Linus (Engineer) - likes quality, hates rushed features
  const linusLikes = focus.some(f =>
    ['quality', 'refactor', 'architecture', 'bugs', 'testing', 'security'].includes(f)
  );
  const linusDislikes = focus.length > 2 || focus.some(f =>
    ['pivot', 'rush', 'hack', 'shortcut'].includes(f)
  );
  opinions.push({
    agent_id: 'linus',
    emoji: '🛠',
    name: 'Linus',
    role: 'Engineer',
    stance: linusDislikes ? 'oppose' : linusLikes ? 'support' : 'cautious',
    comment: linusDislikes
      ? 'Too many things at once. This will add complexity and tech debt.'
      : linusLikes
        ? 'Finally, some attention to engineering fundamentals.'
        : 'Doable, but we need to watch the tech debt accumulation.',
  });

  // Maya (Community) - likes open source, hates aggressive monetization
  const mayaLikes = focus.some(f =>
    ['open_source', 'community', 'transparency', 'export', 'devrel', 'contributors'].includes(f)
  );
  const mayaDislikes = focus.some(f =>
    ['monetization', 'enterprise', 'paid', 'pricing', 'closed_source'].includes(f)
  ) || deprioritize.some(d =>
    ['community', 'open_source', 'trust'].includes(d)
  );
  opinions.push({
    agent_id: 'maya',
    emoji: '🌱',
    name: 'Maya',
    role: 'Community',
    stance: mayaDislikes ? 'oppose' : mayaLikes ? 'support' : 'neutral',
    comment: mayaDislikes
      ? 'Monetizing too aggressively will erode community trust. Developers will fork.'
      : mayaLikes
        ? 'Open-source users will trust us more. This builds long-term ecosystem value.'
        : 'Community impact seems neutral. Let\'s make sure we communicate the change well.',
  });

  // Voss (CFO) - likes revenue, hates no-monetization strategies
  const vossLikes = focus.some(f =>
    ['monetization', 'revenue', 'paid', 'pricing', 'fundraise', 'enterprise', 'saas'].includes(f)
  );
  const vossDislikes = deprioritize.some(d =>
    ['monetization', 'revenue', 'paid', 'pricing'].includes(d)
  ) || (!vossLikes && focus.length > 0);
  opinions.push({
    agent_id: 'voss',
    emoji: '💰',
    name: 'Voss',
    role: 'CFO',
    stance: vossDislikes ? 'oppose' : vossLikes ? 'support' : 'cautious',
    comment: vossDislikes
      ? 'No monetization means runway pressure continues. We can\'t run on goodwill.'
      : vossLikes
        ? 'Smart move. Revenue solves most problems. Let\'s price it right.'
        : 'The numbers are tight. Whatever we do, we need a revenue plan within 3 weeks.',
  });

  // Nyx (Security) - likes security/privacy, hates risky moves
  const nyxLikes = focus.some(f =>
    ['security', 'privacy', 'export', 'delete', 'audit', 'sandbox', 'ethics'].includes(f)
  );
  const nyxDislikes = focus.some(f =>
    ['memory', 'data', 'tracking', 'analytics'].includes(f)
  ) && !focus.some(f =>
    ['privacy', 'export', 'delete', 'security'].includes(f)
  );
  opinions.push({
    agent_id: 'nyx',
    emoji: '🛡',
    name: 'Nyx',
    role: 'Security',
    stance: nyxDislikes ? 'oppose' : nyxLikes ? 'support' : 'cautious',
    comment: nyxDislikes
      ? 'Handling user data without privacy controls first is a liability. Ship export/delete.'
      : nyxLikes
        ? 'Responsible choice. Security and privacy build lasting trust.'
        : 'Proceed, but we need a security review before any data feature goes live.',
  });

  // Ensure at least one disagreement
  const stances = opinions.map(o => o.stance);
  const allAgree = stances.every(s => s === stances[0]);
  if (allAgree) {
    // Flip the CFO or Engineer to create tension
    const flipTarget = opinions.find(o => o.agent_id === 'voss') || opinions[1];
    if (flipTarget.stance === 'support') {
      flipTarget.stance = 'cautious';
      flipTarget.comment = 'I see the logic, but the runway math doesn\'t lie. We have limited weeks.';
    } else {
      flipTarget.stance = 'support';
      flipTarget.comment = 'Not my first choice, but the team alignment matters. Let\'s execute.';
    }
  }

  return opinions;
}
