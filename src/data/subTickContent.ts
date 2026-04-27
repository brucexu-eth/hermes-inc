import type { GameState, EventEffect } from '../db/types.js';

// --- Content Pools ---

const WORK_UPDATES = [
  { agent: 'Linus', emoji: '🛠', message: 'Just merged 3 PRs. Context manager is looking solid.' },
  { agent: 'Linus', emoji: '🛠', message: 'Refactoring the memory module. Found some dead code paths.' },
  { agent: 'Linus', emoji: '🛠', message: 'Writing tests for the skill execution pipeline.' },
  { agent: 'Linus', emoji: '🛠', message: 'Fixed a race condition in the message queue. Subtle one.' },
  { agent: 'Linus', emoji: '🛠', message: 'Optimizing the vector search. 40% faster now.' },
  { agent: 'Stella', emoji: '🧠', message: 'User interviews done. Three clear feature requests emerged.' },
  { agent: 'Stella', emoji: '🧠', message: 'Roadmap updated. Pushing the A2A timeline up.' },
  { agent: 'Stella', emoji: '🧠', message: 'Shipped the onboarding flow tweak. Watching retention numbers.' },
  { agent: 'Stella', emoji: '🧠', message: 'Writing the spec for the next capability module.' },
  { agent: 'Maya', emoji: '🌱', message: 'Reviewed 5 community PRs this morning. Good stuff coming in.' },
  { agent: 'Maya', emoji: '🌱', message: 'Published the weekly changelog. Discord is buzzing.' },
  { agent: 'Maya', emoji: '🌱', message: 'Organizing a contributor sprint for next week.' },
  { agent: 'Maya', emoji: '🌱', message: 'Updated the docs for the new API endpoints.' },
  { agent: 'Nyx', emoji: '🛡', message: 'Running the weekly security scan. Nothing critical so far.' },
  { agent: 'Nyx', emoji: '🛡', message: 'Reviewing the new permission model. Found two edge cases.' },
  { agent: 'Nyx', emoji: '🛡', message: 'Patched a dependency with a known CVE. We\'re clean now.' },
  { agent: 'Voss', emoji: '💰', message: 'Updated the financial model. Burn rate projections look tight.' },
  { agent: 'Voss', emoji: '💰', message: 'Drafting the investor update email.' },
  { agent: 'Voss', emoji: '💰', message: 'Crunching conversion numbers. Free-to-paid is trending up.' },
  { agent: 'Voss', emoji: '💰', message: 'Meeting with a potential enterprise lead tomorrow.' },
];

interface Observation {
  message: (state: GameState) => string;
  agent: string;
  emoji: string;
  condition?: (state: GameState) => boolean;
}

const OBSERVATIONS: Observation[] = [
  { agent: 'Maya', emoji: '🌱', message: (s) => `GitHub stars climbing... ${s.github_stars.toLocaleString()} now.`, condition: (s) => s.github_stars > 1000 },
  { agent: 'Voss', emoji: '💰', message: (s) => `Voss keeps checking the runway chart. ${s.runway_weeks.toFixed(1)} weeks left.`, condition: (s) => s.runway_weeks < 10 },
  { agent: 'Stella', emoji: '🧠', message: (s) => `User count just passed ${Math.floor(s.users / 100) * 100}. Growth feels organic.`, condition: (s) => s.users > 200 },
  { agent: 'Voss', emoji: '💰', message: (s) => `MRR is at $${s.mrr.toLocaleString()}. ${s.mrr > 0 ? 'Not bad.' : 'Still zero. We need to fix that.'}`, condition: () => true },
  { agent: 'Linus', emoji: '🛠', message: (s) => `Tech debt at ${Math.round(s.tech_debt)}. I can feel it slowing us down.`, condition: (s) => s.tech_debt > 35 },
  { agent: 'Nyx', emoji: '🛡', message: (s) => `Security risk sitting at ${Math.round(s.security_risk)}. Watching the logs closely.`, condition: (s) => s.security_risk > 30 },
  { agent: 'Maya', emoji: '🌱', message: (s) => `Community trust is ${Math.round(s.community_trust)}. ${s.community_trust > 60 ? 'People believe in us.' : 'We need to rebuild some bridges.'}`, condition: () => true },
  { agent: 'Stella', emoji: '🧠', message: (s) => `Hype meter at ${Math.round(s.hype)}. ${s.hype > 40 ? 'The window is open.' : 'We need a moment.'}`, condition: () => true },
  { agent: 'Voss', emoji: '💰', message: (s) => `Valuation estimate: $${formatCompact(s.valuation)}. ${s.investor_interest > 30 ? 'Investors are watching.' : 'Need more traction.'}`, condition: () => true },
  { agent: 'Linus', emoji: '🛠', message: (s) => `Product quality at ${Math.round(s.product_quality)}. ${s.product_quality > 60 ? 'Solid foundation.' : 'We should improve this.'}`, condition: () => true },
  { agent: 'Maya', emoji: '🌱', message: (s) => `Open source karma: ${Math.round(s.open_source_karma)}. The community remembers.`, condition: (s) => s.open_source_karma > 50 },
  { agent: 'Stella', emoji: '🧠', message: (s) => `${s.paid_users} paid users now. Each one is a vote of confidence.`, condition: (s) => s.paid_users > 0 },
  { agent: 'Voss', emoji: '💰', message: (s) => `Cash: $${s.cash.toLocaleString()}. Every dollar counts right now.`, condition: (s) => s.cash < 30000 },
  { agent: 'Nyx', emoji: '🛡', message: (s) => `${s.a2a_integrations} A2A integrations live. Each one is another attack surface to monitor.`, condition: (s) => s.a2a_integrations > 0 },
  { agent: 'Stella', emoji: '🧠', message: (s) => `Team morale at ${Math.round(s.team_morale)}. ${s.team_morale > 60 ? 'Energy is good.' : 'People are tired.'}`, condition: () => true },
];

interface MiniEvent {
  message: string;
  agent: string;
  emoji: string;
  effect?: EventEffect;
  condition?: (state: GameState) => boolean;
}

const MINI_EVENTS: MiniEvent[] = [
  { agent: 'Linus', emoji: '🛠', message: 'Linus squashed an edge-case bug. Tech debt -1.', effect: { tech_debt: -1 } },
  { agent: 'Linus', emoji: '🛠', message: 'Linus cleaned up some dead imports. Small win for codebase health.', effect: { tech_debt: -1 } },
  { agent: 'Linus', emoji: '🛠', message: 'CI pipeline green across all branches. Quality +1.', effect: { product_quality: 1 } },
  { agent: 'Maya', emoji: '🌱', message: 'New 5-star user review on Product Hunt. Community trust +1.', effect: { community_trust: 1 } },
  { agent: 'Maya', emoji: '🌱', message: 'A contributor submitted a great PR. Open source karma +1.', effect: { open_source_karma: 1 } },
  { agent: 'Maya', emoji: '🌱', message: 'Someone wrote a blog post about us. Hype +2.', effect: { hype: 2 } },
  { agent: 'Maya', emoji: '🌱', message: 'Community Discord hit a new member milestone. Trust +1.', effect: { community_trust: 1 } },
  { agent: 'Stella', emoji: '🧠', message: 'Positive feedback on the latest release. Morale +1.', effect: { team_morale: 1 } },
  { agent: 'Stella', emoji: '🧠', message: 'Coffee run for the team. Morale +1.', effect: { team_morale: 1 } },
  { agent: 'Stella', emoji: '🧠', message: 'User onboarding funnel improved. Retention looking better.', effect: { users: 5 } },
  { agent: 'Voss', emoji: '💰', message: 'Newsletter mention by an AI influencer. Hype +2.', effect: { hype: 2 } },
  { agent: 'Voss', emoji: '💰', message: 'A trial user just converted to paid. Revenue tick.', effect: { mrr: 10, paid_users: 1 }, condition: (s) => s.mrr > 0 },
  { agent: 'Nyx', emoji: '🛡', message: 'Nyx patched a minor config exposure. Risk -1.', effect: { security_risk: -1 } },
  { agent: 'Nyx', emoji: '🛡', message: 'Automated scan found nothing. Clean bill of health.', effect: { security_risk: -1 } },
  { agent: 'Linus', emoji: '🛠', message: 'Performance optimization landed. Response times down 15%.', effect: { product_quality: 1 } },
  { agent: 'Maya', emoji: '🌱', message: 'Got retweeted by a popular dev account. Stars +5.', effect: { github_stars: 5, hype: 1 } },
  { agent: 'Stella', emoji: '🧠', message: 'Feature request from a power user. Good signal.', effect: { users: 2 } },
  { agent: 'Voss', emoji: '💰', message: 'Found a way to reduce API costs slightly. Burn -10.', effect: { weekly_burn: -10 } },
  { agent: 'Linus', emoji: '🛠', message: 'Rewrote a fragile test suite. More confident in deploys now.', effect: { tech_debt: -1, product_quality: 1 } },
  { agent: 'Nyx', emoji: '🛡', message: 'Updated our dependency lockfile. Supply chain risk reduced.', effect: { security_risk: -1 } },
];

interface Problem {
  message: string;
  agent: string;
  emoji: string;
  condition: (state: GameState) => boolean;
}

const PROBLEMS: Problem[] = [
  { agent: 'Nyx', emoji: '🛡', message: 'Nyx: Suspicious API call pattern in the logs. Worth investigating.', condition: (s) => s.security_risk > 25 },
  { agent: 'Linus', emoji: '🛠', message: 'Linus: CI pipeline broke again. Third time this week.', condition: (s) => s.tech_debt > 40 },
  { agent: 'Linus', emoji: '🛠', message: 'Linus: Memory usage is creeping up. We should profile the agent runtime.', condition: (s) => s.tech_debt > 30 },
  { agent: 'Maya', emoji: '🌱', message: 'Maya: Seeing some negative sentiment in the GitHub discussions. We should address it.', condition: (s) => s.community_trust < 55 },
  { agent: 'Maya', emoji: '🌱', message: 'Maya: A fork appeared with "community edition" in the name. Not great optics.', condition: (s) => s.community_trust < 40 },
  { agent: 'Voss', emoji: '💰', message: 'Voss: Burn rate is outpacing revenue growth. We need a plan.', condition: (s) => s.runway_weeks < 8 },
  { agent: 'Voss', emoji: '💰', message: 'Voss: An invoice bounced. Cash flow is getting tight.', condition: (s) => s.cash < 20000 },
  { agent: 'Stella', emoji: '🧠', message: 'Stella: User churn spiked this week. Something in the last release?', condition: (s) => s.product_quality < 45 },
  { agent: 'Stella', emoji: '🧠', message: 'Stella: The demo is broken for new users. First impressions matter.', condition: (s) => s.product_quality < 35 },
  { agent: 'Nyx', emoji: '🛡', message: 'Nyx: Found a prompt injection vector in the new feature. Flagging it.', condition: (s) => s.security_risk > 35 },
  { agent: 'Linus', emoji: '🛠', message: 'Linus: Deployment takes 45 minutes now. The build system needs love.', condition: (s) => s.tech_debt > 50 },
  { agent: 'Stella', emoji: '🧠', message: 'Stella: Team morale is low. People are making more mistakes.', condition: (s) => s.team_morale < 45 },
  { agent: 'Voss', emoji: '💰', message: 'Voss: Investor follow-up call went cold. We need better numbers.', condition: (s) => s.investor_interest < 20 },
  { agent: 'Maya', emoji: '🌱', message: 'Maya: A competitor just open-sourced something similar. We should differentiate.', condition: (s) => s.hype < 25 },
  { agent: 'Nyx', emoji: '🛡', message: 'Nyx: Our SSL cert expires next week. Adding it to the sprint.', condition: (s) => s.security_risk > 20 },
];

const IDLE_CHATTER = [
  { agent: 'Linus', emoji: '🛠', message: 'Linus: Grabbed a coffee. Back to the codebase.' },
  { agent: 'Maya', emoji: '🌱', message: 'Maya: Scrolling through our GitHub stars. Still feels surreal.' },
  { agent: 'Stella', emoji: '🧠', message: 'Stella: Reading competitor launch announcements. Interesting moves out there.' },
  { agent: 'Voss', emoji: '💰', message: 'Voss: Updating the spreadsheet. Again.' },
  { agent: 'Nyx', emoji: '🛡', message: 'Nyx: Checking the security dashboard. All quiet.' },
  { agent: 'Linus', emoji: '🛠', message: 'Linus: Reviewing old TODOs. Some of these are from week 1.' },
  { agent: 'Maya', emoji: '🌱', message: 'Maya: Writing a thank-you to our top contributors.' },
  { agent: 'Stella', emoji: '🧠', message: 'Stella: Sketching the next feature on a whiteboard.' },
  { agent: 'Voss', emoji: '💰', message: 'Voss: Just realized I forgot lunch. Classic startup life.' },
  { agent: 'Nyx', emoji: '🛡', message: 'Nyx: Reading the latest OWASP report. Always something new.' },
];

// --- Content Generator ---

type ContentType = 'agent_chatter' | 'observation' | 'mini_event' | 'problem' | 'silent';

function pickContentType(): ContentType {
  const roll = Math.random() * 100;
  if (roll < 35) return 'agent_chatter';
  if (roll < 60) return 'observation';
  if (roll < 75) return 'mini_event';
  if (roll < 90) return 'problem';
  return 'silent';
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateSubTickContent(state: GameState): { output: string; effects?: EventEffect } | null {
  const contentType = pickContentType();

  switch (contentType) {
    case 'silent':
      return null;

    case 'agent_chatter': {
      // 70% chance to say something (higher than old chatter system)
      if (Math.random() > 0.7) return null;
      const entry = pickRandom([...WORK_UPDATES, ...IDLE_CHATTER]);
      return { output: `${entry.emoji} ${entry.agent}:\n${entry.message}` };
    }

    case 'observation': {
      const valid = OBSERVATIONS.filter(o => !o.condition || o.condition(state));
      if (valid.length === 0) return null;
      const obs = pickRandom(valid);
      const msg = obs.message(state);
      return { output: `${obs.emoji} ${obs.agent}:\n${msg}` };
    }

    case 'mini_event': {
      const valid = MINI_EVENTS.filter(e => !e.condition || e.condition(state));
      if (valid.length === 0) return null;
      const evt = pickRandom(valid);
      return { output: `${evt.emoji} ${evt.message}`, effects: evt.effect };
    }

    case 'problem': {
      const valid = PROBLEMS.filter(p => p.condition(state));
      if (valid.length === 0) {
        // No problems match — fall back to idle chatter
        const entry = pickRandom(IDLE_CHATTER);
        return { output: `${entry.emoji} ${entry.agent}:\n${entry.message}` };
      }
      const prob = pickRandom(valid);
      return { output: `${prob.emoji} ${prob.message}` };
    }
  }
}

function formatCompact(v: number): string {
  if (v >= 1e9) return `${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e3) return `${(v / 1e3).toFixed(0)}k`;
  return Math.round(v).toLocaleString();
}
