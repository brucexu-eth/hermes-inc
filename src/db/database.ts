import Database from 'better-sqlite3';
import { join } from 'path';
import type { GameState, Employee, Decision, GameEvent, WeekLog } from './types.js';

let _db: Database.Database | null = null;

export function getDbPath(): string {
  return process.env.GAME_DB_PATH || join(process.cwd(), 'data', 'game.db');
}

export function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(getDbPath());
    _db.pragma('journal_mode = WAL');
    _db.pragma('foreign_keys = ON');
  }
  return _db;
}

export function closeDb(): void {
  if (_db) {
    _db.close();
    _db = null;
  }
}

export function initDb(): void {
  const db = getDb();
  db.exec(SCHEMA);
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS game_state (
  id INTEGER PRIMARY KEY DEFAULT 1,
  week INTEGER NOT NULL DEFAULT 1,
  cash REAL NOT NULL DEFAULT 50000,
  mrr REAL NOT NULL DEFAULT 0,
  users INTEGER NOT NULL DEFAULT 120,
  paid_users INTEGER NOT NULL DEFAULT 0,
  github_stars INTEGER NOT NULL DEFAULT 420,
  valuation REAL NOT NULL DEFAULT 100000,
  runway_weeks REAL NOT NULL DEFAULT 16,
  weekly_burn REAL NOT NULL DEFAULT 3000,
  product_quality REAL NOT NULL DEFAULT 50,
  tech_debt REAL NOT NULL DEFAULT 20,
  security_risk REAL NOT NULL DEFAULT 18,
  community_trust REAL NOT NULL DEFAULT 70,
  open_source_karma REAL NOT NULL DEFAULT 75,
  team_morale REAL NOT NULL DEFAULT 72,
  hype REAL NOT NULL DEFAULT 25,
  investor_interest REAL NOT NULL DEFAULT 15,
  a2a_integrations INTEGER NOT NULL DEFAULT 0,
  speed_mode TEXT NOT NULL DEFAULT 'manual',
  tick_interval_minutes INTEGER NOT NULL DEFAULT 0,
  next_tick_at TEXT,
  paused INTEGER NOT NULL DEFAULT 0,
  game_over INTEGER NOT NULL DEFAULT 0,
  ending_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS employees (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '🤖',
  salary_per_week REAL NOT NULL,
  morale REAL NOT NULL DEFAULT 70,
  fatigue REAL NOT NULL DEFAULT 0,
  loyalty REAL NOT NULL DEFAULT 50,
  active INTEGER NOT NULL DEFAULT 1,
  personality TEXT NOT NULL DEFAULT '',
  skills_json TEXT NOT NULL DEFAULT '[]',
  values_json TEXT NOT NULL DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS decisions (
  id TEXT PRIMARY KEY,
  week INTEGER NOT NULL,
  raw_input TEXT NOT NULL,
  parsed_json TEXT,
  result_json TEXT,
  applied INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  week INTEGER NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  effects_json TEXT NOT NULL DEFAULT '{}',
  choice_made TEXT,
  resolved INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS week_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  week INTEGER NOT NULL,
  state_before_json TEXT NOT NULL,
  state_after_json TEXT NOT NULL,
  decision_id TEXT,
  event_ids_json TEXT NOT NULL DEFAULT '[]',
  narrative TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`;

// Game State

export function getGameState(): GameState | null {
  const db = getDb();
  return db.prepare('SELECT * FROM game_state WHERE id = 1').get() as GameState | undefined ?? null;
}

export function createGameState(): GameState {
  const db = getDb();
  db.prepare('DELETE FROM game_state WHERE id = 1').run();
  db.prepare('INSERT INTO game_state (id) VALUES (1)').run();
  return getGameState()!;
}

export function updateGameState(updates: Partial<GameState>): GameState {
  const db = getDb();
  const fields = Object.keys(updates).filter(k => k !== 'id');
  if (fields.length === 0) return getGameState()!;

  const sets = fields.map(f => `${f} = @${f}`).join(', ');
  const stmt = db.prepare(`UPDATE game_state SET ${sets}, updated_at = datetime('now') WHERE id = 1`);
  stmt.run(updates);
  return getGameState()!;
}

// Employees

export function getActiveEmployees(): Employee[] {
  const db = getDb();
  return db.prepare('SELECT * FROM employees WHERE active = 1').all() as Employee[];
}

export function getEmployee(id: string): Employee | null {
  const db = getDb();
  return db.prepare('SELECT * FROM employees WHERE id = ?').get(id) as Employee | undefined ?? null;
}

export function insertEmployee(emp: Employee): void {
  const db = getDb();
  db.prepare(`
    INSERT OR REPLACE INTO employees (id, name, role, emoji, salary_per_week, morale, fatigue, loyalty, active, personality, skills_json, values_json)
    VALUES (@id, @name, @role, @emoji, @salary_per_week, @morale, @fatigue, @loyalty, @active, @personality, @skills_json, @values_json)
  `).run(emp);
}

export function updateEmployee(id: string, updates: Partial<Employee>): void {
  const db = getDb();
  const fields = Object.keys(updates).filter(k => k !== 'id');
  if (fields.length === 0) return;
  const sets = fields.map(f => `${f} = @${f}`).join(', ');
  db.prepare(`UPDATE employees SET ${sets} WHERE id = @id`).run({ ...updates, id });
}

// Decisions

export function insertDecision(d: Decision): void {
  const db = getDb();
  db.prepare(`
    INSERT INTO decisions (id, week, raw_input, parsed_json, result_json, applied, created_at)
    VALUES (@id, @week, @raw_input, @parsed_json, @result_json, @applied, @created_at)
  `).run(d);
}

export function getDecisionsForWeek(week: number): Decision[] {
  const db = getDb();
  return db.prepare('SELECT * FROM decisions WHERE week = ? ORDER BY created_at').all(week) as Decision[];
}

// Events

export function insertEvent(e: GameEvent): void {
  const db = getDb();
  db.prepare(`
    INSERT INTO events (id, week, type, title, description, effects_json, choice_made, resolved, created_at)
    VALUES (@id, @week, @type, @title, @description, @effects_json, @choice_made, @resolved, @created_at)
  `).run(e);
}

export function getEventsForWeek(week: number): GameEvent[] {
  const db = getDb();
  return db.prepare('SELECT * FROM events WHERE week = ? ORDER BY created_at').all(week) as GameEvent[];
}

export function getUnresolvedEvents(): GameEvent[] {
  const db = getDb();
  return db.prepare('SELECT * FROM events WHERE resolved = 0 ORDER BY created_at').all() as GameEvent[];
}

// Week Log

export function insertWeekLog(log: Omit<WeekLog, 'id'>): void {
  const db = getDb();
  db.prepare(`
    INSERT INTO week_log (week, state_before_json, state_after_json, decision_id, event_ids_json, narrative, created_at)
    VALUES (@week, @state_before_json, @state_after_json, @decision_id, @event_ids_json, @narrative, @created_at)
  `).run(log);
}

export function getWeekLog(week: number): WeekLog | null {
  const db = getDb();
  return db.prepare('SELECT * FROM week_log WHERE week = ? ORDER BY id DESC LIMIT 1').get(week) as WeekLog | undefined ?? null;
}

// Reset

export function resetGame(): void {
  const db = getDb();
  db.exec('DELETE FROM week_log');
  db.exec('DELETE FROM events');
  db.exec('DELETE FROM decisions');
  db.exec('DELETE FROM employees');
  db.exec('DELETE FROM game_state');
}
