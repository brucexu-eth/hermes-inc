#!/usr/bin/env node

// This script is called by Hermes cron to check if a week should auto-advance.
// If not due, it outputs [SILENT] so Hermes knows not to post anything.
// Usage: node dist/scripts/tick.js
// It simply invokes the CLI with the 'tick' argument.

process.argv = [process.argv[0], process.argv[1], 'tick'];
import('../cli.js');
