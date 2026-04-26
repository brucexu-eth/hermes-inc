import type { GameState, EndingResult, GameEvent } from '../db/types.js';
import type { AgentOpinion } from '../data/agents.js';

export function formatWelcome(state: GameState): string {
  return `🏢 Welcome to Hermes Inc.
You are founder engineer #001.

💰 Cash: $${num(state.cash)}
⏳ Runway: ${state.runway_weeks.toFixed(1)} weeks
👥 Users: ${num(state.users)}
⭐ GitHub Stars: ${num(state.github_stars)}
🎯 Goal: survive, grow, and define the future of personal agents.

Type a strategy or use commands:
/inc_status — View company dashboard
/inc_next — Advance one week
/inc_plan — Get team suggestions
/inc_event — Trigger a random event
/inc_pause — Pause auto-advance

Or type naturally: "Focus on Telegram Memory, delay monetization"`;
}

export function formatStatus(state: GameState): string {
  const runwayEmoji = state.runway_weeks < 4 ? '🔴' : state.runway_weeks < 8 ? '🟡' : '🟢';
  const moraleEmoji = state.team_morale < 30 ? '😰' : state.team_morale < 60 ? '😐' : '😊';

  return `📊 Hermes Inc. — Week ${state.week}

💰 Cash: $${num(state.cash)}
${runwayEmoji} Runway: ${state.runway_weeks.toFixed(1)} weeks
📈 MRR: $${num(state.mrr)}
🔥 Weekly Burn: $${num(state.weekly_burn)}
💎 Valuation: $${formatValuation(state.valuation)}

👥 Users: ${num(state.users)} (${state.paid_users} paid)
⭐ GitHub Stars: ${num(state.github_stars)}
🔗 A2A Integrations: ${state.a2a_integrations}

📦 Product Quality: ${bar(state.product_quality)}
🧱 Tech Debt: ${bar(state.tech_debt)}
🔓 Security Risk: ${bar(state.security_risk)}
🤝 Community Trust: ${bar(state.community_trust)}
💚 Open-source Karma: ${bar(state.open_source_karma)}
${moraleEmoji} Team Morale: ${bar(state.team_morale)}
📣 Hype: ${bar(state.hype)}
🏦 Investor Interest: ${bar(state.investor_interest)}`;
}

export function formatWeeklyReport(
  prevState: GameState,
  newState: GameState,
  changes: Record<string, number>,
  events: GameEvent[],
): string {
  const lines: string[] = [];

  lines.push(`📅 Week ${newState.week} Report — Hermes Inc.\n`);

  lines.push(`💰 Cash: $${num(newState.cash)} (${delta(newState.cash - prevState.cash, '$')})`);
  lines.push(`⏳ Runway: ${newState.runway_weeks.toFixed(1)} weeks (${deltaNum(newState.runway_weeks - prevState.runway_weeks)} wk)`);
  lines.push(`📈 MRR: $${num(newState.mrr)}`);
  lines.push(`👥 Users: ${num(newState.users)} (${deltaNum(newState.users - prevState.users)})`);
  lines.push(`⭐ Stars: ${num(newState.github_stars)} (${deltaNum(newState.github_stars - prevState.github_stars)})`);
  lines.push(`💎 Valuation: $${formatValuation(newState.valuation)}`);

  // Key changes
  const keyChanges: string[] = [];
  const trackKeys: [string, string, boolean][] = [
    ['product_quality', 'Product Quality', false],
    ['tech_debt', 'Tech Debt', true],
    ['security_risk', 'Security Risk', true],
    ['community_trust', 'Community Trust', false],
    ['open_source_karma', 'OS Karma', false],
    ['team_morale', 'Morale', false],
    ['hype', 'Hype', false],
    ['investor_interest', 'Investor Interest', false],
  ];

  for (const [key, label, invertSign] of trackKeys) {
    const prev = (prevState as any)[key] as number;
    const curr = (newState as any)[key] as number;
    const diff = curr - prev;
    if (Math.abs(diff) >= 1) {
      const sign = invertSign
        ? (diff > 0 ? '⚠️ +' : '✅ ')
        : (diff > 0 ? '✅ +' : '⚠️ ');
      keyChanges.push(`${sign}${Math.abs(Math.round(diff))} ${label}`);
    }
  }

  if (keyChanges.length > 0) {
    lines.push('');
    lines.push('Changes:');
    lines.push(...keyChanges);
  }

  // Events
  if (events.length > 0) {
    lines.push('');
    for (const event of events) {
      lines.push(`⚡ Event: ${event.title}`);
      lines.push(event.description);
      if (!event.resolved) {
        lines.push('(Awaiting your decision)');
      }
    }
  }

  // Warnings
  const warnings: string[] = [];
  if (newState.runway_weeks < 4) warnings.push('🔴 CRITICAL: Runway below 4 weeks!');
  if (newState.security_risk > 70) warnings.push('🔴 Security risk dangerously high!');
  if (newState.team_morale < 25) warnings.push('🔴 Team morale critically low!');
  if (newState.community_trust < 30) warnings.push('🟡 Community trust is eroding.');
  if (newState.tech_debt > 70) warnings.push('🟡 Tech debt is unsustainable.');

  if (warnings.length > 0) {
    lines.push('');
    lines.push(...warnings);
  }

  return lines.join('\n');
}

export function formatAgentDebate(opinions: AgentOpinion[]): string {
  const lines: string[] = [];
  for (const o of opinions) {
    lines.push(`${o.emoji} ${o.name} (${o.role}):`);
    lines.push(o.comment);
    lines.push('');
  }
  return lines.join('\n').trim();
}

export function formatDecisionPrompt(): string {
  return `This week's strategic tension:

A. Monetize hosted memory now
B. Open-source memory export first
C. Build A2A integrations
D. Focus on product quality
E. Propose your own strategy

Reply with a letter or describe your strategy in natural language.`;
}

export function formatEventChoices(event: GameEvent): string {
  const effects = JSON.parse(event.effects_json);
  const lines: string[] = [];
  lines.push(`⚡ ${event.title}\n`);
  lines.push(event.description);
  lines.push('');

  // If this is a choice event from template, format choices
  // Choices are encoded in the description by convention
  lines.push('How do you respond? Describe your choice or pick from suggestions above.');

  return lines.join('\n');
}

export function formatEnding(ending: EndingResult, state: GameState): string {
  const divider = ending.type === 'success' ? '🎉' : '💀';
  return `${divider} GAME OVER ${divider}

${ending.title}

${ending.description}

Final Stats:
📅 Survived: ${state.week} weeks
💰 Cash: $${num(state.cash)}
📈 MRR: $${num(state.mrr)}
👥 Users: ${num(state.users)}
⭐ Stars: ${num(state.github_stars)}
💎 Final Valuation: $${formatValuation(state.valuation)}

Type /inc_start to begin a new game.`;
}

export function formatSpeedChange(mode: string, interval: number): string {
  const desc: Record<string, string> = {
    demo: '1 minute = 1 week',
    fast: '5 minutes = 1 week',
    normal: '1 hour = 1 week',
    slow: '24 hours = 1 week',
    manual: 'Use /inc_next to advance',
  };
  return `⏱ Speed set to: ${mode}\n${desc[mode] || `${interval} minutes per week`}`;
}

export function formatPause(paused: boolean): string {
  return paused
    ? '⏸ Game paused. Use /inc_resume to resume.'
    : '▶️ Game resumed.';
}

export function formatPlan(state: GameState, opinions: AgentOpinion[]): string {
  const lines: string[] = [];
  lines.push(`🗓 Week ${state.week + 1} Planning — Team Suggestions\n`);

  for (const o of opinions) {
    lines.push(`${o.emoji} ${o.name}:`);
    lines.push(o.comment);
    lines.push('');
  }

  // Add strategic suggestion based on state
  lines.push('---');
  if (state.runway_weeks < 6) {
    lines.push('⚠️ Runway is critical. Consider monetization or fundraising.');
  } else if (state.tech_debt > 60) {
    lines.push('⚠️ Tech debt is high. Consider refactoring before shipping more features.');
  } else if (state.community_trust < 40) {
    lines.push('⚠️ Community trust is low. Consider open-source initiatives.');
  } else if (state.security_risk > 50) {
    lines.push('⚠️ Security risk is elevated. Consider a security audit.');
  } else {
    lines.push('💡 Company is stable. Good time to invest in growth or new capabilities.');
  }

  return lines.join('\n');
}

// Helpers

function num(n: number): string {
  return Math.round(n).toLocaleString('en-US');
}

function delta(n: number, prefix = ''): string {
  const rounded = Math.round(n);
  if (rounded >= 0) return `+${prefix}${num(rounded)}`;
  return `-${prefix}${num(Math.abs(rounded))}`;
}

function deltaNum(n: number): string {
  const rounded = Math.round(n * 10) / 10;
  if (rounded >= 0) return `+${rounded}`;
  return `${rounded}`;
}

function bar(value: number): string {
  const filled = Math.round(value / 10);
  const empty = 10 - filled;
  return `${'█'.repeat(filled)}${'░'.repeat(empty)} ${Math.round(value)}`;
}

function formatValuation(v: number): string {
  if (v >= 1e9) return `${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e3) return `${(v / 1e3).toFixed(0)}k`;
  return num(v);
}
