#!/usr/bin/env node

import { mkdirSync, existsSync } from 'fs';
import { dirname } from 'path';
import {
  initDb, getGameState, createGameState, updateGameState, resetGame,
  getActiveEmployees, insertEmployee, updateEmployee, getEmployee,
  insertDecision, insertEvent, insertWeekLog, getDbPath, getDb,
  getUnappliedDecisions, markDecisionsApplied,
  MAX_ACTIONS_PER_WEEK,
} from './db/database.js';
import { INITIAL_AGENTS, getAgentReactions } from './data/agents.js';
import { advanceWeek } from './engine/advanceWeek.js';
import { parseNaturalLanguageDecision, mergeDecisions, applyEventEffects } from './engine/applyDecision.js';
import { EVENT_TEMPLATES, rollRandomEvent } from './data/events.js';
import { calculateProductEffects, parseShipCommand } from './data/products.js';
import {
  formatWelcome, formatStatus, formatWeeklyReport, formatAgentDebate,
  formatDecisionPrompt, formatEnding, formatSpeedChange, formatPause,
  formatPlan, formatEventChoices,
} from './telegram/formatReport.js';
import {
  gameStartPrompt, fundraisePrompt, DRAMATIC_EVENT_IDS, eventImagePrompt,
} from './data/imagePrompts.js';
import { generateSubTickContent } from './data/subTickContent.js';
import type { ParsedDecision, GameEvent, EventEffect, GameState } from './db/types.js';
import { nanoid } from 'nanoid';

const args = process.argv.slice(2);
const command = args[0]?.toLowerCase();
const rest = args.slice(1).join(' ');

function ensureDbDir() {
  const dbPath = getDbPath();
  const dir = dirname(dbPath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function ensureDb() {
  ensureDbDir();
  initDb();
}

function ensureGame() {
  const state = getGameState();
  if (!state) {
    console.log('No active game. Use "hermes-inc start" to begin.');
    process.exit(1);
  }
  if (state.game_over) {
    console.log('Game is over. Use "hermes-inc start" to begin a new game.');
    process.exit(1);
  }
  return state;
}

/** Check and consume one action point. Returns false and prints warning if none left. */
function useAction(state: GameState): boolean {
  if (state.actions_remaining <= 0) {
    console.log(`⛔ No actions remaining this week (${MAX_ACTIONS_PER_WEEK} per week).`);
    console.log(`Use "/inc_next" to advance to next week and get fresh action points.`);
    return false;
  }
  state.actions_remaining -= 1;
  updateGameState({ actions_remaining: state.actions_remaining } as any);
  return true;
}

function printActionsRemaining(state: GameState) {
  console.log(`\n🎬 Actions remaining this week: ${state.actions_remaining}/${MAX_ACTIONS_PER_WEEK}`);
}

/** Check if AP is exhausted and auto-advance if so */
function checkAutoAdvance(state: GameState) {
  if (state.actions_remaining <= 0 && state.speed_mode !== 'manual') {
    console.log('\n⏰ All action points spent — advancing to next week...\n');
    cmdWeekAdvance();
  }
}

async function main() {
  ensureDb();

  switch (command) {
    case 'start':
      cmdStart();
      break;
    case 'status':
      cmdStatus();
      break;
    case 'next':
      cmdNext(rest);
      break;
    case 'decide':
      cmdDecide(rest);
      break;
    case 'plan':
      cmdPlan();
      break;
    case 'event':
      cmdEvent(rest);
      break;
    case 'speed':
      cmdSpeed(rest);
      break;
    case 'pause':
      cmdPause();
      break;
    case 'resume':
      cmdResume();
      break;
    case 'ship':
      cmdShip(rest);
      break;
    case 'hire':
      cmdHire(rest);
      break;
    case 'fire':
      cmdFire(rest);
      break;
    case 'fundraise':
      cmdFundraise();
      break;
    case 'tick':
      cmdTick();
      break;
    case 'choose':
      cmdChoose(rest);
      break;
    case 'chatter':
      cmdChatter();
      break;
    case 'reply':
      cmdReply(rest);
      break;
    default:
      if (command && !command.startsWith('-')) {
        // Treat as natural language directive
        cmdReply(args.join(' '));
      } else {
        printHelp();
      }
      break;
  }
}

function cmdStart() {
  resetGame();
  const state = createGameState();

  // Insert initial employees
  for (const agent of INITIAL_AGENTS) {
    insertEmployee(agent);
  }

  // Auto-set speed to 'fast' (5 sub-ticks/week, 1 min per sub-tick = 5 min/week)
  const defaultSpeed = 'fast';
  const subTicksPerWeek = 5;
  const nextTick = new Date(Date.now() + 1 * 60 * 1000).toISOString();
  updateGameState({
    speed_mode: defaultSpeed,
    tick_interval_minutes: 1,
    next_tick_at: nextTick,
    sub_tick: 0,
    sub_ticks_per_week: subTicksPerWeek,
    paused: 0,
  } as any);

  console.log(formatWelcome(state));
  console.log(`[IMAGE: ${gameStartPrompt()}]`);
}

function cmdStatus() {
  const state = ensureGame();
  console.log(formatStatus(state));

  // Show active employees
  const employees = getActiveEmployees();
  if (employees.length > 0) {
    console.log('\n👥 Team:');
    for (const e of employees) {
      console.log(`  ${e.emoji} ${e.name} (${e.role}) — $${e.salary_per_week}/wk — Morale: ${Math.round(e.morale)}`);
    }
  }
  printActionsRemaining(state);
}

function cmdNext(strategy?: string) {
  const state = ensureGame();

  // If strategy provided, add it as a pending decision
  if (strategy && strategy.trim()) {
    const decision = parseNaturalLanguageDecision(strategy);
    insertDecision({
      id: nanoid(),
      week: state.week,
      raw_input: strategy,
      parsed_json: JSON.stringify(decision),
      result_json: null,
      applied: 0,
      created_at: new Date().toISOString(),
    });
  }

  cmdWeekAdvance();
}

function cmdWeekAdvance() {
  const state = ensureGame();

  // Gather and merge unapplied decisions for this week
  const unapplied = getUnappliedDecisions(state.week);
  let decision: ParsedDecision | undefined;
  if (unapplied.length > 0) {
    const rawInputs = unapplied.map(d => d.raw_input);
    decision = mergeDecisions(rawInputs);
    markDecisionsApplied(state.week);
  }

  const result = advanceWeek(state, decision);

  // Reset sub_tick for new week
  result.newState.sub_tick = 0;

  // Save events
  for (const event of result.events) {
    insertEvent(event);
  }

  // Save week log
  insertWeekLog({
    week: result.newState.week,
    state_before_json: JSON.stringify(result.prevState),
    state_after_json: JSON.stringify(result.newState),
    decision_id: null,
    event_ids_json: JSON.stringify(result.events.map(e => e.id)),
    narrative: null,
    created_at: new Date().toISOString(),
  });

  // Update game state
  updateGameState(result.newState);

  // Output
  if (decision && unapplied.length > 0) {
    const opinions = getAgentReactions(decision.focus, decision.deprioritize);
    const summary = unapplied.map(d => d.raw_input).join(' + ');
    console.log(`📅 Week ${result.newState.week} Directives: ${summary}\n`);
    console.log(formatAgentDebate(opinions));
    console.log('---\n');
  }

  console.log(formatWeeklyReport(result.prevState, result.newState, result.decisionChanges, result.events));
  printActionsRemaining(result.newState);

  // Show event choices if any
  for (const event of result.events) {
    if (!event.resolved) {
      console.log('\n' + formatEventChoices(event));
      console.log(`\nUse: hermes-inc choose ${event.id} <your choice>`);
    }
  }

  // Check ending
  if (result.ending) {
    console.log('\n' + formatEnding(result.ending, result.newState));
  }

  // Output image markers for dramatic moments
  for (const prompt of result.imagePrompts) {
    console.log(`[IMAGE: ${prompt}]`);
  }
}

function cmdDecide(strategy: string) {
  if (!strategy.trim()) {
    console.log('Usage: hermes-inc decide <your strategy>');
    console.log('Example: hermes-inc decide "Focus on Telegram Memory, delay monetization"');
    return;
  }

  const state = ensureGame();
  const decision = parseNaturalLanguageDecision(strategy);
  const opinions = getAgentReactions(decision.focus, decision.deprioritize);

  // Log the decision
  insertDecision({
    id: nanoid(),
    week: state.week,
    raw_input: strategy,
    parsed_json: JSON.stringify(decision),
    result_json: null,
    applied: 0,
    created_at: new Date().toISOString(),
  });

  console.log(`📋 Strategy Analysis: ${strategy}\n`);
  console.log(`Focus: ${decision.focus.join(', ')}`);
  if (decision.deprioritize.length > 0) {
    console.log(`Deprioritize: ${decision.deprioritize.join(', ')}`);
  }
  console.log('');
  console.log(formatAgentDebate(opinions));
  console.log('\nUse "hermes-inc next" to advance the week with this strategy applied.');
}

function cmdPlan() {
  const state = ensureGame();

  // Generate contextual suggestions
  const focusSuggestions: string[] = [];
  if (state.runway_weeks < 6) focusSuggestions.push('monetization', 'fundraise');
  if (state.tech_debt > 50) focusSuggestions.push('quality', 'refactor');
  if (state.security_risk > 40) focusSuggestions.push('security');
  if (state.community_trust < 50) focusSuggestions.push('community', 'open_source');
  if (state.hype < 15) focusSuggestions.push('marketing', 'growth');
  if (focusSuggestions.length === 0) focusSuggestions.push('growth', 'features');

  const opinions = getAgentReactions(focusSuggestions, []);
  console.log(formatPlan(state, opinions));
}

function cmdEvent(eventId?: string) {
  const state = ensureGame();
  if (!useAction(state)) return;

  let template;
  if (eventId && eventId.trim()) {
    template = EVENT_TEMPLATES.find(e => e.id === eventId.trim());
    if (!template) {
      console.log(`Unknown event: ${eventId}`);
      console.log('Available events: ' + EVENT_TEMPLATES.map(e => e.id).join(', '));
      return;
    }
  } else {
    template = rollRandomEvent(state);
    if (!template) {
      console.log('No events available for current state.');
      return;
    }
  }

  const hasChoices = template.choices && template.choices.length > 0;

  const gameEvent: GameEvent = {
    id: nanoid(),
    week: state.week,
    type: template.type,
    title: template.title,
    description: template.description,
    effects_json: JSON.stringify(hasChoices ? {} : template.effects),
    choice_made: null,
    resolved: hasChoices ? 0 : 1,
    created_at: new Date().toISOString(),
  };

  insertEvent(gameEvent);

  console.log(`⚡ Event: ${template.title}\n`);
  console.log(template.description);
  console.log('');

  // Image marker for dramatic events
  if (DRAMATIC_EVENT_IDS.has(template.id)) {
    const imgPrompt = eventImagePrompt(template.id, state);
    if (imgPrompt) console.log(`[IMAGE: ${imgPrompt}]`);
  }

  if (hasChoices) {
    console.log('Choices:');
    for (const choice of template.choices!) {
      console.log(`  ${choice.id}: ${choice.label}`);
      console.log(`     ${choice.description}`);
    }
    console.log(`\nUse: hermes-inc choose ${gameEvent.id} <choice_id>`);
  } else {
    // Apply effects immediately
    const changes = applyEventEffects(state, template.effects);
    updateGameState(state);

    console.log('Effects:');
    for (const [key, value] of Object.entries(changes)) {
      const sign = value > 0 ? '+' : '';
      const label = key.replace(/_/g, ' ');
      console.log(`  ${sign}${value} ${label}`);
    }
  }
  checkAutoAdvance(state);
}

function cmdChoose(input: string) {
  const state = ensureGame();
  if (!useAction(state)) return;
  const parts = input.trim().split(/\s+/);
  const eventId = parts[0];
  const choiceId = parts.slice(1).join(' ');

  if (!eventId || !choiceId) {
    console.log('Usage: hermes-inc choose <event_id> <choice_id>');
    return;
  }

  // Find the event from database
  const db = getDb();
  const event = db.prepare('SELECT * FROM events WHERE id = ? AND resolved = 0').get(eventId) as any;

  if (!event) {
    console.log(`No unresolved event with id: ${eventId}`);
    return;
  }

  // Find the matching template
  const template = EVENT_TEMPLATES.find(t => t.title === event.title);
  if (!template || !template.choices) {
    console.log('This event has no choices.');
    return;
  }

  const choice = template.choices.find(c => c.id === choiceId || c.label.toLowerCase().includes(choiceId.toLowerCase()));
  if (!choice) {
    console.log(`Unknown choice: ${choiceId}`);
    console.log('Available: ' + template.choices.map(c => c.id).join(', '));
    return;
  }

  // Apply choice effects
  const changes = applyEventEffects(state, choice.effects);
  updateGameState(state);

  // Mark event resolved
  db.prepare('UPDATE events SET resolved = 1, choice_made = ? WHERE id = ?').run(choice.id, eventId);

  console.log(`✅ Choice made: ${choice.label}\n`);
  console.log(choice.description);
  console.log('\nEffects:');
  for (const [key, value] of Object.entries(changes)) {
    const sign = value > 0 ? '+' : '';
    const label = key.replace(/_/g, ' ');
    console.log(`  ${sign}${value} ${label}`);
  }
  printActionsRemaining(state);
  checkAutoAdvance(state);
}

function cmdSpeed(mode: string) {
  const state = ensureGame();
  const modes: Record<string, { subTicks: number }> = {
    demo:   { subTicks: 2 },
    fast:   { subTicks: 5 },
    normal: { subTicks: 12 },
    slow:   { subTicks: 60 },
    manual: { subTicks: 0 },
  };

  const config = modes[mode];
  if (!config) {
    console.log('Usage: hermes-inc speed <demo|fast|normal|slow|manual>');
    return;
  }

  const isManual = mode === 'manual';
  const nextTick = isManual
    ? null
    : new Date(Date.now() + 1 * 60 * 1000).toISOString();

  updateGameState({
    speed_mode: mode,
    tick_interval_minutes: isManual ? 0 : 1,
    sub_ticks_per_week: config.subTicks,
    sub_tick: 0,
    next_tick_at: nextTick,
    paused: 0,
  } as any);

  // Show real time per week
  const realTime = isManual ? 'manual only' : `${config.subTicks} min`;
  console.log(formatSpeedChange(mode, config.subTicks));
}

function cmdPause() {
  ensureGame();
  updateGameState({ paused: 1 } as any);
  console.log(formatPause(true));
}

function cmdResume() {
  const state = ensureGame();
  const interval = state.tick_interval_minutes;
  const nextTick = interval > 0
    ? new Date(Date.now() + interval * 60 * 1000).toISOString()
    : null;

  updateGameState({ paused: 0, next_tick_at: nextTick } as any);
  console.log(formatPause(false));
}

function cmdShip(feature: string) {
  if (!feature.trim()) {
    console.log('Usage: hermes-inc ship <feature description>');
    console.log('Example: hermes-inc ship "Telegram persistent memory for developers"');
    return;
  }

  const state = ensureGame();
  if (!useAction(state)) return;
  const parsed = parseShipCommand(feature);
  if (!parsed) {
    console.log('Could not parse feature. Try: hermes-inc ship "Telegram Memory for developers"');
    return;
  }

  const combo = calculateProductEffects(parsed.platform, parsed.capability, parsed.market);

  // Apply effects
  const effects = combo.effects;
  state.users += effects.users;
  state.github_stars += effects.github_stars;
  state.community_trust = Math.min(100, Math.max(0, state.community_trust + effects.community_trust));
  state.tech_debt = Math.min(100, Math.max(0, state.tech_debt + effects.tech_debt));
  state.security_risk = Math.min(100, Math.max(0, state.security_risk + effects.security_risk));
  state.hype = Math.min(100, Math.max(0, state.hype + effects.hype));
  state.mrr += effects.mrr_potential;
  state.weekly_burn += effects.weekly_burn;
  state.product_quality = Math.min(100, Math.max(0, state.product_quality + effects.product_quality));
  state.open_source_karma = Math.min(100, Math.max(0, state.open_source_karma + effects.open_source_karma));
  state.investor_interest = Math.min(100, Math.max(0, state.investor_interest + effects.investor_interest));
  state.a2a_integrations += effects.a2a_integrations;

  updateGameState(state);

  console.log(`🚀 Shipped: ${combo.description}\n`);
  console.log('Effects:');
  for (const [key, value] of Object.entries(effects)) {
    if (value === 0) continue;
    const sign = value > 0 ? '+' : '';
    const label = key.replace(/_/g, ' ');
    console.log(`  ${sign}${value} ${label}`);
  }
  printActionsRemaining(state);
  checkAutoAdvance(state);
}

function cmdHire(role: string) {
  if (!role.trim()) {
    console.log('Usage: hermes-inc hire <role>');
    console.log('Available: engineer, pm, community, security, marketing, data');
    return;
  }

  const state = ensureGame();
  if (!useAction(state)) return;
  const roleMap: Record<string, Partial<typeof INITIAL_AGENTS[0]>> = {
    engineer: { role: 'Engineer', emoji: '🛠', salary_per_week: 1200, personality: 'New hire. Eager but needs onboarding.' },
    pm: { role: 'PM', emoji: '🧠', salary_per_week: 900, personality: 'New product manager. Fresh perspectives.' },
    community: { role: 'Community', emoji: '🌱', salary_per_week: 700, personality: 'New community manager. Building connections.' },
    security: { role: 'Security', emoji: '🛡', salary_per_week: 1000, personality: 'Security specialist. Audit-minded.' },
    marketing: { role: 'Marketing', emoji: '📣', salary_per_week: 800, personality: 'Growth hacker. Hype machine.' },
    data: { role: 'Data', emoji: '📊', salary_per_week: 1100, personality: 'Data engineer. Metrics-driven.' },
  };

  const lower = role.toLowerCase();
  const template = roleMap[lower];
  if (!template) {
    console.log(`Unknown role: ${role}`);
    console.log('Available: ' + Object.keys(roleMap).join(', '));
    return;
  }

  const id = `${lower}_${nanoid(6)}`;
  const name = `New ${template.role}`;

  insertEmployee({
    id,
    name,
    role: template.role!,
    emoji: template.emoji!,
    salary_per_week: template.salary_per_week!,
    morale: 70,
    fatigue: 0,
    loyalty: 40,
    active: 1,
    personality: template.personality!,
    skills_json: '[]',
    values_json: '[]',
  });

  state.weekly_burn += template.salary_per_week!;
  state.team_morale = Math.min(100, state.team_morale + 3);
  updateGameState(state);

  console.log(`✅ Hired: ${template.emoji} ${name} (${template.role})`);
  console.log(`  Salary: $${template.salary_per_week}/week`);
  console.log(`  Weekly burn is now: $${Math.round(state.weekly_burn)}`);
  printActionsRemaining(state);
  checkAutoAdvance(state);
}

function cmdFire(nameOrRole: string) {
  if (!nameOrRole.trim()) {
    console.log('Usage: hermes-inc fire <name or role>');
    return;
  }

  const state = ensureGame();
  if (!useAction(state)) return;
  const employees = getActiveEmployees();
  const lower = nameOrRole.toLowerCase();
  const target = employees.find(e =>
    e.name.toLowerCase() === lower ||
    e.id === lower ||
    e.role.toLowerCase() === lower
  );

  if (!target) {
    console.log(`No active employee matching: ${nameOrRole}`);
    console.log('Active: ' + employees.map(e => `${e.name} (${e.role})`).join(', '));
    return;
  }

  updateEmployee(target.id, { active: 0 });
  state.weekly_burn = Math.max(500, state.weekly_burn - target.salary_per_week);
  state.team_morale = Math.max(0, state.team_morale - 8);
  updateGameState(state);

  console.log(`❌ Fired: ${target.emoji} ${target.name} (${target.role})`);
  console.log(`  Saved: $${target.salary_per_week}/week`);
  console.log(`  ⚠️ Team morale dropped.`);
  console.log(`  Weekly burn is now: $${Math.round(state.weekly_burn)}`);
  printActionsRemaining(state);
  checkAutoAdvance(state);
}

function cmdFundraise() {
  const state = ensureGame();
  if (!useAction(state)) return;

  // Success probability based on investor interest, traction, hype
  const baseProb = state.investor_interest / 100;
  const tractionBonus = Math.min(0.2, state.users / 10000 + state.github_stars / 100000);
  const hypeBonus = state.hype / 500;
  const probability = Math.min(0.8, baseProb + tractionBonus + hypeBonus);

  const roll = Math.random();
  const success = roll < probability;

  if (success) {
    // Amount based on valuation
    const amount = Math.round(state.valuation * 0.15);
    const postVal = state.valuation * 1.5;

    state.cash += amount;
    state.valuation = postVal;
    state.investor_interest = Math.min(100, state.investor_interest + 15);
    state.hype = Math.min(100, state.hype + 10);
    state.weekly_burn += 500; // Higher expectations
    updateGameState(state);

    console.log(`💰 Fundraise SUCCESS!\n`);
    console.log(`Raised: $${Math.round(amount).toLocaleString()}`);
    console.log(`Post-money Valuation: $${formatVal(postVal)}`);
    console.log(`New Runway: ${state.runway_weeks.toFixed(1)} weeks`);
    console.log(`\n⚠️ Note: Investor expectations increase burn.`);
  } else {
    state.investor_interest = Math.max(0, state.investor_interest - 5);
    state.team_morale = Math.max(0, state.team_morale - 3);
    updateGameState(state);

    console.log(`😞 Fundraise FAILED.\n`);
    console.log(`Investors said: "Interesting, but we'd like to see more traction."`);
    console.log(`Probability was: ${(probability * 100).toFixed(0)}%`);
    console.log(`\nTip: Increase investor_interest, users, and hype to improve odds.`);
  }

  printActionsRemaining(state);
  console.log(`[IMAGE: ${fundraisePrompt(success, state)}]`);
  checkAutoAdvance(state);
}

function cmdReply(message: string) {
  if (!message.trim()) {
    console.log('Usage: hermes-inc reply <your message>');
    console.log('Example: hermes-inc reply "Focus on security and reduce tech debt"');
    return;
  }

  const state = ensureGame();
  if (!useAction(state)) return;

  // Parse and show agent debate as immediate feedback
  const decision = parseNaturalLanguageDecision(message);
  const opinions = getAgentReactions(decision.focus, decision.deprioritize);

  // Insert as unapplied decision (accumulated for week advance)
  insertDecision({
    id: nanoid(),
    week: state.week,
    raw_input: message,
    parsed_json: JSON.stringify(decision),
    result_json: null,
    applied: 0,
    created_at: new Date().toISOString(),
  });

  console.log(`📋 CEO directive noted: ${message}\n`);
  console.log(`Focus: ${decision.focus.join(', ')}`);
  if (decision.deprioritize.length > 0) {
    console.log(`Deprioritize: ${decision.deprioritize.join(', ')}`);
  }
  console.log('');
  console.log(formatAgentDebate(opinions));
  console.log(`\n🎬 Directives remaining this week: ${state.actions_remaining}/${MAX_ACTIONS_PER_WEEK}`);

  // If AP=0 after this action → auto-advance the week
  if (state.actions_remaining <= 0) {
    console.log('\n⏰ All action points spent — advancing to next week...\n');
    cmdWeekAdvance();
  }
}

function cmdSubTick(state: GameState) {
  const content = generateSubTickContent(state);
  if (!content) {
    console.log('[SILENT]');
    return;
  }

  console.log(content.output);

  // Apply ephemeral mini-event effects directly
  if (content.effects) {
    const updated = { ...state };
    for (const [key, value] of Object.entries(content.effects)) {
      if (value === undefined || value === 0) continue;
      const stateKey = key as keyof GameState;
      if (typeof (updated as any)[stateKey] === 'number') {
        (updated as any)[stateKey] += value;
      }
    }
    // Clamp bounded metrics
    updated.product_quality = Math.max(0, Math.min(100, updated.product_quality));
    updated.tech_debt = Math.max(0, Math.min(100, updated.tech_debt));
    updated.security_risk = Math.max(0, Math.min(100, updated.security_risk));
    updated.community_trust = Math.max(0, Math.min(100, updated.community_trust));
    updated.open_source_karma = Math.max(0, Math.min(100, updated.open_source_karma));
    updated.team_morale = Math.max(0, Math.min(100, updated.team_morale));
    updated.hype = Math.max(0, Math.min(100, updated.hype));
    updated.investor_interest = Math.max(0, Math.min(100, updated.investor_interest));
    updated.users = Math.max(0, updated.users);
    updated.github_stars = Math.max(0, updated.github_stars);
    updated.mrr = Math.max(0, updated.mrr);
    updated.weekly_burn = Math.max(500, updated.weekly_burn);
    updateGameState(updated);
  }
}

function cmdTick() {
  // Called by cron every minute
  const state = getGameState();
  if (!state || state.game_over || state.paused) {
    console.log('[SILENT]');
    return;
  }

  if (!state.next_tick_at || state.speed_mode === 'manual') {
    console.log('[SILENT]');
    return;
  }

  const now = new Date();
  const nextTick = new Date(state.next_tick_at);

  if (now < nextTick) {
    console.log('[SILENT]');
    return;
  }

  // Increment sub-tick
  state.sub_tick += 1;
  updateGameState({ sub_tick: state.sub_tick } as any);

  // Schedule next tick (always 1 minute intervals)
  const next = new Date(Date.now() + 1 * 60 * 1000).toISOString();
  updateGameState({ next_tick_at: next } as any);

  // Check if week should advance
  if (state.sub_tick >= state.sub_ticks_per_week || state.actions_remaining <= 0) {
    cmdWeekAdvance();
  } else {
    // Generate office activity
    cmdSubTick(state);
  }
}

function cmdChatter() {
  const state = getGameState();
  if (!state || state.game_over || state.paused) {
    console.log('[SILENT]');
    return;
  }

  // Determine if there's something worth chattering about
  // Each trigger has a base probability; multiple triggers stack
  const triggers: { agent: string; emoji: string; message: string; prob: number }[] = [];

  // Runway crisis
  if (state.runway_weeks < 4) {
    triggers.push(
      { agent: 'Voss', emoji: '💰', message: `Runway is ${state.runway_weeks.toFixed(1)} weeks. We need to talk about revenue. Now.`, prob: 0.6 },
      { agent: 'Stella', emoji: '🧠', message: `If we die before shipping the next feature, none of this matters. Can we cut something?`, prob: 0.3 },
    );
  } else if (state.runway_weeks < 8) {
    triggers.push(
      { agent: 'Voss', emoji: '💰', message: `Runway is tightening. ${state.runway_weeks.toFixed(1)} weeks left. We should consider monetization.`, prob: 0.25 },
    );
  }

  // Tech debt warning
  if (state.tech_debt > 60) {
    triggers.push(
      { agent: 'Linus', emoji: '🛠', message: `Tech debt is at ${Math.round(state.tech_debt)}. Every new feature is slower to ship. We need a refactoring sprint.`, prob: 0.35 },
    );
  }

  // Security risk
  if (state.security_risk > 50) {
    triggers.push(
      { agent: 'Nyx', emoji: '🛡', message: `Security risk is at ${Math.round(state.security_risk)}. One breach and we lose everything we've built.`, prob: 0.4 },
    );
  }

  // Community trust erosion
  if (state.community_trust < 40) {
    triggers.push(
      { agent: 'Maya', emoji: '🌱', message: `Community trust is at ${Math.round(state.community_trust)}. I'm seeing fork discussions on GitHub. We need to act.`, prob: 0.4 },
    );
  }

  // Low morale
  if (state.team_morale < 40) {
    triggers.push(
      { agent: 'Stella', emoji: '🧠', message: `Team morale is ${Math.round(state.team_morale)}. People are burning out. Maybe we should slow down.`, prob: 0.35 },
      { agent: 'Linus', emoji: '🛠', message: `I've been working 14-hour days for three weeks. Something has to give.`, prob: 0.2 },
    );
  }

  // Hype momentum
  if (state.hype > 50) {
    triggers.push(
      { agent: 'Stella', emoji: '🧠', message: `Hype is high right now. This is the window to ship something big or it fades.`, prob: 0.25 },
      { agent: 'Voss', emoji: '💰', message: `Investor interest is up. If we're going to fundraise, this is the moment.`, prob: 0.2 },
    );
  }

  // Stars milestone approaching
  if (state.github_stars > 8000 && state.github_stars < 11000) {
    triggers.push(
      { agent: 'Maya', emoji: '🌱', message: `We're close to 10k stars. One more push and we cross a major milestone.`, prob: 0.3 },
    );
  }

  // Good state — agents relax or brainstorm
  if (state.runway_weeks > 12 && state.team_morale > 60 && state.tech_debt < 40) {
    triggers.push(
      { agent: 'Linus', emoji: '🛠', message: `Things are stable. Good time to invest in architecture or try something experimental.`, prob: 0.15 },
      { agent: 'Maya', emoji: '🌱', message: `Community is healthy. Maybe we should host a contributor sprint this week?`, prob: 0.15 },
      { agent: 'Voss', emoji: '💰', message: `Numbers look decent. Should we start thinking about the next funding round?`, prob: 0.1 },
    );
  }

  // Agent disagreements / tensions
  if (state.mrr > 0 && state.community_trust < 60) {
    triggers.push(
      { agent: 'Maya', emoji: '🌱', message: `Voss, every dollar of MRR you celebrate costs us community trust. Is it worth it?`, prob: 0.2 },
      { agent: 'Voss', emoji: '💰', message: `Maya, community trust doesn't pay salaries. We have ${state.runway_weeks.toFixed(0)} weeks of runway.`, prob: 0.2 },
    );
  }

  // No users growing
  if (state.users > 500 && state.hype < 15) {
    triggers.push(
      { agent: 'Stella', emoji: '🧠', message: `Growth has stalled. Hype is at ${Math.round(state.hype)}. We need a demo moment or a marketing push.`, prob: 0.25 },
    );
  }

  // Nothing interesting — stay silent most of the time
  if (triggers.length === 0) {
    console.log('[SILENT]');
    return;
  }

  // Pick one trigger based on probability
  // Shuffle and try each
  const shuffled = triggers.sort(() => Math.random() - 0.5);
  for (const t of shuffled) {
    if (Math.random() < t.prob) {
      console.log(`${t.emoji} ${t.agent}:\n${t.message}`);
      return;
    }
  }

  // All rolls failed — stay silent
  console.log('[SILENT]');
}

function printHelp() {
  console.log(`🏢 Hermes Inc. Simulator v0.1

Commands:
  start                  Start a new company
  status                 View company dashboard
  reply <message>        Send a CEO directive (costs 1 AP)
  next [strategy]        Force-advance to next week
  decide <strategy>      Analyze a strategy (preview only, no AP cost)
  plan                   Get team suggestions for next week
  event [event_id]       Trigger a random or specific event
  choose <eid> <choice>  Make a choice for an event
  speed <mode>           Set speed (demo|fast|normal|slow|manual)
  pause                  Pause auto-advance
  resume                 Resume auto-advance
  ship <feature>         Ship a product feature
  hire <role>            Hire a new team member
  fire <name>            Fire a team member
  fundraise              Attempt to raise funding
  tick                   Cron sub-tick handler

Or just type your message naturally — it's treated as a CEO directive.`);
}

function formatVal(v: number): string {
  if (v >= 1e9) return `${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e3) return `${(v / 1e3).toFixed(0)}k`;
  return Math.round(v).toLocaleString();
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
