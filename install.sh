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
  # Check if already appended
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

echo ""
echo "✅ Hermes Inc. installed successfully!"
echo ""
echo "🎮 How to play:"
echo "  In Telegram, send /start to your Hermes bot."
echo "  Or use the CLI: hermes-inc start"
echo ""
echo "To enable auto-advance (cron):"
echo "  hermes cron create \"every 1m\" \\"
echo "    \"Run hermes-inc tick in the terminal. If output is [SILENT], do nothing. Otherwise post the output.\" \\"
echo "    --skill hermes-inc --name \"Hermes Inc Tick\""
