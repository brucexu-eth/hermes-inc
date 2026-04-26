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
import sys, os

config_path = sys.argv[1]
project_dir = sys.argv[2]

# Read existing config
content = ""
if os.path.exists(config_path):
    with open(config_path, "r") as f:
        content = f.read()

# Commands to register
commands = {
    "start":     f"cd {project_dir} && node dist/cli.js start",
    "status":    f"cd {project_dir} && node dist/cli.js status",
    "next":      f"cd {project_dir} && node dist/cli.js next",
    "plan":      f"cd {project_dir} && node dist/cli.js plan",
    "event":     f"cd {project_dir} && node dist/cli.js event",
    "pause":     f"cd {project_dir} && node dist/cli.js pause",
    "resume":    f"cd {project_dir} && node dist/cli.js resume",
    "fundraise": f"cd {project_dir} && node dist/cli.js fundraise",
}

# Check if quick_commands section exists
if "quick_commands:" not in content:
    content += "\nquick_commands:\n"

# Append each command if not already present
for name, cmd in commands.items():
    if f"  {name}:" not in content:
        content += f"  {name}:\n"
        content += f"    type: exec\n"
        content += f"    command: \"{cmd}\"\n"

with open(config_path, "w") as f:
    f.write(content)
PYEOF

echo "  ✅ Quick commands registered (start, status, next, plan, event, pause, resume, fundraise)"

# 9. Restart gateway if running
if [ -f "$HERMES_HOME/gateway.pid" ]; then
  echo ""
  echo "🔄 Restarting gateway to pick up new commands..."
  hermes gateway restart 2>/dev/null || echo "  ⚠️  Could not restart gateway. Run: hermes gateway restart"
fi

echo ""
echo "✅ Hermes Inc. installed successfully!"
echo ""
echo "🎮 How to play:"
echo "  In Telegram, send /start to your Hermes bot."
echo ""
echo "  Game commands:  /start /status /next /plan /event /pause /fundraise"
echo "  Natural language: just type your strategy, e.g. 'Focus on Telegram Memory'"
echo ""
echo "  For commands with arguments (ship, hire, fire, speed),"
echo "  type naturally: 'ship Telegram Memory' or 'hire engineer'"
echo ""
echo "To enable auto-advance (cron):"
echo "  hermes cron create \"every 1m\" \\"
echo "    \"Run: cd $SCRIPT_DIR && node dist/cli.js tick — If output is [SILENT], do nothing. Otherwise post the output.\" \\"
echo "    --skill hermes-inc --name \"Hermes Inc Tick\""
