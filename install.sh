#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROFILE="${HERMES_PROFILE:-hermesinc}"

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

# 2. Install app dependencies
echo "📦 Installing dependencies..."
cd "$SCRIPT_DIR"
npm install

# 3. Build TypeScript
echo "🔨 Building..."
npm run build

# 4. Init database
echo "💾 Initializing database..."
mkdir -p "$SCRIPT_DIR/data"
npm run db:init

# 5. Link CLI globally (optional)
echo "🔗 Linking CLI..."
npm link 2>/dev/null || true

echo ""
echo "✅ Hermes Inc. installed successfully!"
echo ""
echo "Quick start:"
echo "  hermes-inc start     # Start a new game"
echo "  hermes-inc status    # View company dashboard"
echo "  hermes-inc next      # Advance one week"
echo "  hermes-inc --help    # See all commands"
echo ""

# 6. Check for Hermes Agent
if command -v hermes &> /dev/null; then
  echo "🤖 Hermes Agent detected. Setting up integration..."

  # Create profile
  hermes profile create "$PROFILE" --clone 2>/dev/null || true

  # Get Hermes home directory
  HERMES_HOME="${HERMES_HOME:-$HOME/.hermes}"
  PROFILE_DIR="$HERMES_HOME/profiles/$PROFILE"

  if [ -d "$PROFILE_DIR" ]; then
    # Copy SOUL.md
    cp "$SCRIPT_DIR/hermes/SOUL.md" "$PROFILE_DIR/SOUL.md"
    echo "  ✅ SOUL.md installed"

    # Copy SKILL.md
    SKILL_DIR="$PROFILE_DIR/skills/hermes-inc"
    mkdir -p "$SKILL_DIR"
    cp "$SCRIPT_DIR/hermes/SKILL.md" "$SKILL_DIR/SKILL.md"
    echo "  ✅ SKILL.md installed"

    # Set working directory
    echo "$SCRIPT_DIR" > "$PROFILE_DIR/terminal.cwd"
    echo "  ✅ Working directory set"

    echo ""
    echo "🎮 Hermes integration ready!"
    echo ""
    echo "To connect Telegram:"
    echo "  1. Create a bot via @BotFather"
    echo "  2. Set TELEGRAM_BOT_TOKEN in $PROFILE_DIR/.env"
    echo "  3. Set TELEGRAM_ALLOWED_USERS in $PROFILE_DIR/.env"
    echo "  4. Run: hermes -p $PROFILE gateway setup"
    echo "  5. Run: hermes -p $PROFILE gateway start"
    echo ""
    echo "To enable auto-advance (cron):"
    echo "  hermes -p $PROFILE cron create \"every 1m\" \\"
    echo "    \"Run hermes-inc tick in the terminal. If output is [SILENT], do nothing. Otherwise post the output.\" \\"
    echo "    --skill hermes-inc --name \"Hermes Inc Tick\""
  else
    echo "  ⚠️  Profile directory not found: $PROFILE_DIR"
    echo "  Run manually: hermes profile create $PROFILE --clone"
  fi
else
  echo "ℹ️  Hermes Agent not detected."
  echo "   You can still play via CLI: hermes-inc start"
  echo ""
  echo "   To install Hermes Agent:"
  echo "   curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash"
fi
