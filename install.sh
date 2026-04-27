#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "🏢 Installing Hermes Inc. Simulator..."
echo ""

# 1. Check for Node.js
if ! command -v node &> /dev/null; then
  echo "❌ Node.js is required but not installed."
  echo "   Install it from https://nodejs.org/ (v20+ recommended)"
  exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
  echo "⚠️  Node.js v20+ recommended. Current: $(node -v)"
fi

# 2. Check for Hermes Agent
if ! command -v hermes &> /dev/null; then
  echo "❌ Hermes Agent is required but not installed."
  echo "   Install it first:"
  echo "   curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash"
  exit 1
fi

# 3. Install app dependencies
echo "📦 Installing dependencies..."
cd "$SCRIPT_DIR"
npm install

# 4. Build TypeScript
echo "🔨 Building..."
npm run build

# 5. Init database
echo "💾 Initializing database..."
mkdir -p "$SCRIPT_DIR/data"
npm run db:init

# 6. Link CLI globally
echo "🔗 Linking CLI..."
npm link 2>/dev/null || true

# 7. Install skill into current Hermes profile
HERMES_HOME="${HERMES_HOME:-$HOME/.hermes}"

echo "🤖 Installing skill into Hermes..."

# Copy SKILL.md
SKILL_DIR="$HERMES_HOME/skills/hermes-inc"
mkdir -p "$SKILL_DIR"
cp "$SCRIPT_DIR/hermes/SKILL.md" "$SKILL_DIR/SKILL.md"
echo "  ✅ SKILL.md installed to $SKILL_DIR"

# Append SOUL.md content to existing SOUL.md (or create if not exists)
if [ -f "$HERMES_HOME/SOUL.md" ]; then
  if ! grep -q "Hermes Inc. Game Master" "$HERMES_HOME/SOUL.md"; then
    echo "" >> "$HERMES_HOME/SOUL.md"
    cat "$SCRIPT_DIR/hermes/SOUL.md" >> "$HERMES_HOME/SOUL.md"
    echo "  ✅ SOUL.md appended to existing profile"
  else
    echo "  ✅ SOUL.md already configured"
  fi
else
  cp "$SCRIPT_DIR/hermes/SOUL.md" "$HERMES_HOME/SOUL.md"
  echo "  ✅ SOUL.md installed"
fi

# 8. Register quick_commands in config.yaml so /slash commands work
echo "⚡ Registering game commands..."

CONFIG_FILE="$HERMES_HOME/config.yaml"

python3 - "$CONFIG_FILE" "$SCRIPT_DIR" <<'PYEOF'
import sys, os, yaml

config_path = sys.argv[1]
project_dir = sys.argv[2]

# Load existing config
config = {}
if os.path.exists(config_path):
    with open(config_path, "r") as f:
        config = yaml.safe_load(f) or {}

# Commands to register — prefixed with inc_ to avoid conflicts with Hermes builtins
commands = {
    "inc_start":     f"cd {project_dir} && node dist/cli.js start",
    "inc_status":    f"cd {project_dir} && node dist/cli.js status",
    "inc_next":      f"cd {project_dir} && node dist/cli.js next",
    "inc_plan":      f"cd {project_dir} && node dist/cli.js plan",
    "inc_event":     f"cd {project_dir} && node dist/cli.js event",
    "inc_pause":     f"cd {project_dir} && node dist/cli.js pause",
    "inc_resume":    f"cd {project_dir} && node dist/cli.js resume",
    "inc_fundraise": f"cd {project_dir} && node dist/cli.js fundraise",
}

# Clean up old unprefixed commands if they exist
for old_name in ["start", "status", "next", "plan", "event", "pause", "resume", "fundraise"]:
    config.get("quick_commands", {}).pop(old_name, None)

# Ensure quick_commands exists as a dict
if not isinstance(config.get("quick_commands"), dict):
    config["quick_commands"] = {}

# Write each command
for name, cmd in commands.items():
    config["quick_commands"][name] = {
        "type": "exec",
        "command": cmd,
    }

with open(config_path, "w") as f:
    yaml.dump(config, f, default_flow_style=False, allow_unicode=True, sort_keys=False)
PYEOF

echo "  ✅ Quick commands registered"

# 9. Create cron job for living simulation tick
echo "⏰ Setting up cron jobs..."

# Remove old cron jobs if they exist (idempotent reinstall)
hermes cron delete "Hermes Inc Tick" 2>/dev/null || true
hermes cron delete "Hermes Inc Chatter" 2>/dev/null || true

# Living simulation tick: every minute, produces office activity or advances the week
hermes cron create "every 1m" \
  "Run this command: cd $SCRIPT_DIR && node dist/cli.js tick — If the output contains [SILENT], do nothing and do not reply at all. Otherwise post the full output to the chat, matching the user's language." \
  --name "Hermes Inc Tick" 2>/dev/null && echo "  ✅ Cron: Hermes Inc Tick (every 1m)" || echo "  ⚠️  Could not create tick cron. Create manually."

# 10. Restart gateway if running
if [ -f "$HERMES_HOME/gateway.pid" ]; then
  echo ""
  echo "🔄 Restarting gateway to pick up new commands..."
  hermes gateway restart 2>/dev/null || echo "  ⚠️  Could not restart gateway. Run: hermes gateway restart"
fi

echo ""
echo "✅ Hermes Inc. installed successfully!"
echo ""
echo "🎮 How to play:"
echo "  In Telegram, send /inc_start to your Hermes bot."
echo ""
echo "  Game commands:"
echo "    /inc_start  /inc_status  /inc_next  /inc_plan"
echo "    /inc_event  /inc_pause   /inc_resume /inc_fundraise"
echo ""
echo "  Natural language: just type your strategy, e.g. 'Focus on Telegram Memory'"
echo "  For ship/hire/fire/speed, type naturally: 'ship Telegram Memory' or 'hire engineer'"
echo ""
echo "  Set game speed: type 'speed demo' (1min/week) or 'speed fast' (5min/week)"
echo "  Agents will automatically chat and weeks will auto-advance."
