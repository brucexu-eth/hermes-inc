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
