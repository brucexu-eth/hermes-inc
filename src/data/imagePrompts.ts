import type { GameState } from '../db/types.js';

// ── Consistent visual style ──────────────────────────────────────────

export const BASE_SCENE =
  'A modern startup office with floor-to-ceiling windows overlooking a city skyline, ' +
  'whiteboards covered in flowcharts and agent diagrams, dual monitors showing code and dashboards, ' +
  'scattered coffee cups, holographic UI overlays floating above desks, ' +
  'cyberpunk-lite aesthetic with warm ambient lighting, soft neon accents. ' +
  'Digital illustration, clean lines, cinematic composition.';

export const AGENT_VISUALS: Record<string, string> = {
  stella: 'a woman with silver hair in a sharp blue blazer, confident posture, holding a tablet',
  linus: 'a bearded man in a dark hoodie, typing intensely at a mechanical keyboard',
  maya: 'a woman with braids and a green cargo jacket, surrounded by floating chat bubbles',
  voss: 'a man in a grey vest and rolled sleeves, studying financial charts on a holographic display',
  nyx: 'a person with a shaved head in a black turtleneck, monitoring security dashboards with red indicators',
};

// ── Atmosphere modifiers ─────────────────────────────────────────────

type Atmosphere = 'crisis' | 'tense' | 'triumphant' | 'hopeful' | 'neutral';

export function getAtmosphere(state: GameState): Atmosphere {
  if (state.cash <= 0 || (state.runway_weeks < 3 && state.security_risk > 80))
    return 'crisis';
  if (state.runway_weeks < 6 || state.team_morale < 30)
    return 'tense';
  if (state.hype > 60 && state.valuation > 10_000_000)
    return 'triumphant';
  if (state.mrr > state.weekly_burn && state.github_stars > 50_000)
    return 'hopeful';
  return 'neutral';
}

const ATMOSPHERE_VISUALS: Record<Atmosphere, string> = {
  crisis: 'Red warning lights casting harsh shadows, screens flashing alerts, tense atmosphere, dark palette.',
  tense: 'Amber-tinted lighting, heavy shadows, worried expressions, monitors showing declining graphs.',
  triumphant: 'Golden hour lighting streaming through windows, confetti particles in air, glowing green charts, celebration mood.',
  hopeful: 'Bright natural light, green upward-trending charts on screens, warm color palette, optimistic energy.',
  neutral: 'Normal soft office lighting, calm productive atmosphere, balanced warm and cool tones.',
};

function atmosphereStr(state: GameState): string {
  return ATMOSPHERE_VISUALS[getAtmosphere(state)];
}

// ── Dramatic events that warrant images ──────────────────────────────

export const DRAMATIC_EVENT_IDS = new Set([
  'viral_x_thread',
  'feature_goes_viral',
  'hn_front_page',
  'privacy_backlash',
  'community_fork',
  'seed_offer',
  'enterprise_inquiry',
  'memory_leak',
  'prompt_injection',
  'token_leak',
  'competitor_launch',
  'key_employee_offer',
  'team_argument',
]);

export const EVENT_VISUALS: Record<string, string> = {
  viral_x_thread:
    'Screens lighting up with notification counters exploding, a phone showing a viral tweet with thousands of retweets, ' +
    `${AGENT_VISUALS.stella} beaming with excitement, ${AGENT_VISUALS.maya} high-fiving a colleague.`,
  feature_goes_viral:
    'A massive screen showing a video player at 500k views, social media reactions floating as holographic bubbles, ' +
    `${AGENT_VISUALS.stella} pointing at metrics, the whole team gathered around in awe.`,
  hn_front_page:
    'A large display showing Hacker News with the #1 post highlighted in orange, comment count climbing, ' +
    `${AGENT_VISUALS.linus} smiling proudly, GitHub star counter spinning upward on another screen.`,
  privacy_backlash:
    'Angry user messages flooding screens as holographic popups, a "PRIVACY" protest sign on one monitor, ' +
    `${AGENT_VISUALS.nyx} standing arms crossed looking concerned, ${AGENT_VISUALS.maya} reading community complaints.`,
  community_fork:
    'A Git branch diagram on a whiteboard splitting into two paths, one labeled "LibreHermes", ' +
    `${AGENT_VISUALS.maya} looking distressed at GitHub notifications, atmosphere dark and tense.`,
  seed_offer:
    'A formal term sheet document glowing on a holographic display, a VC in a suit shaking hands virtually, ' +
    `${AGENT_VISUALS.voss} studying the numbers intently, dollar signs reflected in screens.`,
  enterprise_inquiry:
    'A Fortune 500 company logo on a video call screen, enterprise architecture diagrams on the whiteboard, ' +
    `${AGENT_VISUALS.voss} presenting confidently, ${AGENT_VISUALS.linus} looking skeptical at the scope.`,
  memory_leak:
    'Red alert screens everywhere, a "BREACH DETECTED" warning flashing, scattered data fragments floating as holographic shards, ' +
    `${AGENT_VISUALS.nyx} typing urgently at a terminal, emergency lighting.`,
  prompt_injection:
    'A terminal showing exposed system prompts in red text, security dashboards flashing warnings, ' +
    `${AGENT_VISUALS.nyx} analyzing the attack vector, ${AGENT_VISUALS.linus} rushing to the keyboard.`,
  token_leak:
    'A GitHub diff on screen showing a highlighted API key in red, billing alerts stacking up, ' +
    `${AGENT_VISUALS.linus} face-palming, ${AGENT_VISUALS.nyx} revoking credentials on another terminal.`,
  competitor_launch:
    'A rival product launch announcement on a large screen, "$10M FUNDED" headline, the team staring at competitor metrics, ' +
    `${AGENT_VISUALS.stella} studying the competition with a determined look, tense atmosphere.`,
  key_employee_offer:
    'A Google offer letter glowing on a phone screen, ${AGENT_VISUALS.linus} sitting alone at his desk looking conflicted, ' +
    'the rest of the team in the background, emotional split-lighting.',
  team_argument:
    `${AGENT_VISUALS.voss} and ${AGENT_VISUALS.maya} facing each other across a table, opposing charts on screens behind them, ` +
    'the rest of the team watching uncomfortably, dramatic side lighting.',
};

// ── Ending visuals ───────────────────────────────────────────────────

export const ENDING_VISUALS: Record<string, string> = {
  bankruptcy:
    'A dark empty office, monitors off, chairs pushed back, a single desk lamp flickering, ' +
    'an "EVICTION NOTICE" on the door, dust settling, melancholic blue-grey palette.',
  security_collapse:
    'Shattered holographic screens, data fragments scattering like broken glass, ' +
    'news headlines about the breach on every display, empty chairs, red emergency lighting.',
  community_fork:
    'An abandoned GitHub repo page on screen, tumbleweeds of unused code, ' +
    'in the distance a thriving new community logo "LibreHermes" glowing, bittersweet atmosphere.',
  founder_burnout:
    'An empty Slack channel showing "0 online", scattered energy drink cans, ' +
    'a burned-out desk lamp, dawn light coming through windows nobody is there to see.',
  acqui_hire:
    'A corporate office absorbing the small team, their colorful startup gear replaced by grey cubicles, ' +
    'the Hermes logo being replaced by a generic corp logo, resigned expressions.',
  indie_company:
    'A cozy profitable office bathed in warm sunlight, a small happy team at their desks, ' +
    'green revenue charts on screens, a "PROFITABLE" banner, plants growing on windowsills, calm joy.',
  open_source_standard:
    'A massive contributor wall showing hundreds of avatars, "100K STARS" on a giant screen, ' +
    'the team surrounded by holographic contributor badges from around the world, golden light.',
  agent_platform:
    'A sprawling network visualization showing 50+ connected agent nodes, ' +
    'the Hermes hub glowing at the center, marketplace dashboards showing thriving integrations.',
  unicorn:
    'A rooftop celebration at sunset overlooking the city skyline, champagne glasses raised, ' +
    '"$1B" glowing in the sky like a hologram, the full team together, golden hour lighting.',
  protocol_civilization:
    'A vast digital landscape of interconnected agents, Hermes protocol nodes spanning the globe, ' +
    'open governance council in session, the team watching their creation live beyond them, epic scale.',
};

// ── Prompt generator functions ───────────────────────────────────────

export function gameStartPrompt(): string {
  return (
    'A small garage office being set up for the first time. ' +
    'Two desks, one whiteboard with "HERMES INC" written in marker, ' +
    'a laptop open to a fresh GitHub repo with 0 stars, ' +
    'coffee cups and takeout containers, dawn light through a small window, ' +
    'the energy of a new beginning. ' +
    'Five founding team members visible: ' +
    Object.values(AGENT_VISUALS).join('; ') + '. ' +
    'Digital illustration, cinematic composition, hopeful warm palette.'
  );
}

export function milestonePrompt(type: string, value: number | string, state: GameState): string {
  const atmo = atmosphereStr(state);
  const milestoneVisuals: Record<string, string> = {
    stars_10k: 'A screen showing GitHub stars counter hitting 10,000 with confetti animation, the team cheering.',
    stars_50k: 'GitHub stars counter at 50,000, trending #1 on GitHub, celebration in a bigger office.',
    stars_100k: 'A massive "100K STARS" milestone displayed on a theater-sized screen, media coverage on side monitors.',
    users_1k: 'A dashboard showing "1,000 USERS" with a growing user graph, small team celebration.',
    users_5k: 'User count hitting 5,000, world map showing dots of active users, the team proud.',
    users_10k: '"10K USERS" banner on screens, support tickets flowing in, growing pains visible but exciting.',
    users_50k: 'A massive user grid visualization showing 50,000 faces, the team overwhelmed but thrilled.',
    first_mrr: 'The first dollar of revenue displayed on a dashboard, Voss actually smiling, a small "WE MADE MONEY" sign.',
    first_paid_user: 'A single payment notification glowing on screen, the entire team gathered around staring at it in disbelief.',
    valuation_1m: 'A valuation chart crossing the $1M line, investor emails on screen, growing confidence.',
    valuation_10m: '"$10M VALUATION" on the boardroom display, the team in a nicer office, momentum visible.',
    valuation_100m: 'Valuation hitting $100M, press coverage on monitors, the office transformed into a real HQ.',
    valuation_1b: 'The unicorn moment: $1B flashing on every screen, champagne, sunset through panoramic windows.',
    runway_crisis: 'A runway countdown timer in red showing under 4 weeks, cash burn visualization draining, panic stations.',
  };

  const visual = milestoneVisuals[type] || `A celebration of reaching ${type}: ${value}.`;
  return `${BASE_SCENE} ${atmo} ${visual} Digital illustration, cinematic composition.`;
}

export function eventImagePrompt(eventId: string, state: GameState): string {
  const atmo = atmosphereStr(state);
  const visual = EVENT_VISUALS[eventId] || '';
  if (!visual) return '';
  return `${BASE_SCENE} ${atmo} ${visual} Digital illustration, cinematic composition.`;
}

export function endingImagePrompt(endingId: string, state: GameState): string {
  const atmo = atmosphereStr(state);
  const visual = ENDING_VISUALS[endingId] || '';
  if (!visual) return '';
  return `${visual} ${atmo} Digital illustration, cinematic wide composition, emotional, memorable.`;
}

export function fundraisePrompt(success: boolean, state: GameState): string {
  const atmo = atmosphereStr(state);
  if (success) {
    return (
      `${BASE_SCENE} ${atmo} ` +
      `${AGENT_VISUALS.voss} holding a signed term sheet with a satisfied grin, ` +
      'cash infusion visualization flowing into company accounts on holographic display, ' +
      'the team relieved and energized, green lighting accents. ' +
      'Digital illustration, cinematic composition.'
    );
  }
  return (
    `${BASE_SCENE} ${atmo} ` +
    'An empty conference room after a failed investor pitch, ' +
    `${AGENT_VISUALS.voss} staring at a "PASS" email on screen, ` +
    'the team regrouping with determined faces, muted color palette. ' +
    'Digital illustration, cinematic composition.'
  );
}

// ── Milestone detection ──────────────────────────────────────────────

interface MilestoneCheck {
  type: string;
  check: (prev: GameState, next: GameState) => boolean;
  value: (next: GameState) => number | string;
}

const MILESTONE_CHECKS: MilestoneCheck[] = [
  { type: 'stars_10k', check: (p, n) => p.github_stars < 10_000 && n.github_stars >= 10_000, value: (n) => n.github_stars },
  { type: 'stars_50k', check: (p, n) => p.github_stars < 50_000 && n.github_stars >= 50_000, value: (n) => n.github_stars },
  { type: 'stars_100k', check: (p, n) => p.github_stars < 100_000 && n.github_stars >= 100_000, value: (n) => n.github_stars },
  { type: 'users_1k', check: (p, n) => p.users < 1_000 && n.users >= 1_000, value: (n) => n.users },
  { type: 'users_5k', check: (p, n) => p.users < 5_000 && n.users >= 5_000, value: (n) => n.users },
  { type: 'users_10k', check: (p, n) => p.users < 10_000 && n.users >= 10_000, value: (n) => n.users },
  { type: 'users_50k', check: (p, n) => p.users < 50_000 && n.users >= 50_000, value: (n) => n.users },
  { type: 'first_mrr', check: (p, n) => p.mrr <= 0 && n.mrr > 0, value: (n) => n.mrr },
  { type: 'first_paid_user', check: (p, n) => p.paid_users <= 0 && n.paid_users > 0, value: (n) => n.paid_users },
  { type: 'valuation_1m', check: (p, n) => p.valuation < 1_000_000 && n.valuation >= 1_000_000, value: (n) => n.valuation },
  { type: 'valuation_10m', check: (p, n) => p.valuation < 10_000_000 && n.valuation >= 10_000_000, value: (n) => n.valuation },
  { type: 'valuation_100m', check: (p, n) => p.valuation < 100_000_000 && n.valuation >= 100_000_000, value: (n) => n.valuation },
  { type: 'valuation_1b', check: (p, n) => p.valuation < 1_000_000_000 && n.valuation >= 1_000_000_000, value: (n) => n.valuation },
  { type: 'runway_crisis', check: (p, n) => p.runway_weeks >= 4 && n.runway_weeks < 4, value: (n) => n.runway_weeks },
];

/**
 * Compare two game states and return image prompts for milestone crossings.
 * Returns at most 1 prompt to avoid spamming images.
 */
export function detectMilestones(prev: GameState, next: GameState): string[] {
  for (const m of MILESTONE_CHECKS) {
    if (m.check(prev, next)) {
      return [milestonePrompt(m.type, m.value(next), next)];
    }
  }
  return [];
}
