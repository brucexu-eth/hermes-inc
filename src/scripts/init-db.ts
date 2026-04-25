#!/usr/bin/env node

import { mkdirSync, existsSync } from 'fs';
import { dirname } from 'path';
import { initDb, getDbPath, closeDb } from '../db/database.js';

const dbPath = getDbPath();
const dir = dirname(dbPath);

if (!existsSync(dir)) {
  mkdirSync(dir, { recursive: true });
}

initDb();
closeDb();

console.log(`✅ Database initialized at: ${dbPath}`);
