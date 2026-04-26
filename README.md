# 🏢 Hermes Inc.

**A Telegram-native AI startup simulator where agents argue, remember, and evolve your company.**

You are the founder engineer of Hermes Inc., an early-stage AI agent startup. Make strategic decisions every week — your AI teammates will debate trade-offs, the rule engine will update the numbers, and random events will keep you on your toes.

Survive. Grow. Define the future of personal agents.

> **It does not predict startup outcomes. It makes strategic trade-offs visible and playable.**

---

## Quick Start

```bash
# Install Hermes Agent (if not already installed)
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash

# Clone and install — skill is added to your current Hermes profile
git clone https://github.com/user/hermes-inc
cd hermes-inc
bash install.sh

# Start the gateway (if not already running)
hermes gateway start
```

Then send `/start` to your Hermes bot in Telegram.

---

## Demo

```
📅 Week 4 Decision: Telegram Memory + Memory Export

🧠 Stella (PM):
This will improve retention and make the product easier to demo.

🛠 Linus (Engineer):
Good direction, but memory export adds complexity.

🌱 Maya (Community):
Open-source users will trust us more.

💰 Voss (CFO):
No monetization means runway pressure continues.

Result:
+ Users: +280
+ GitHub Stars: +640
+ Community Trust: +9
- Cash: -$4,200
+ Tech Debt: +5
Runway: 11.3 weeks → 9.8 weeks
```

---

## Installation

### Prerequisites

- A working [Hermes Agent](https://hermes-agent.nousresearch.com/) instance with Telegram already configured
- **Node.js 20+** on the same machine

### Install

```bash
git clone https://github.com/user/hermes-inc
cd hermes-inc
bash install.sh
```

The install script will:
- Install Node.js dependencies and build the project
- Initialize the SQLite database
- Install the `hermes-inc` skill into your current Hermes profile (`~/.hermes/skills/hermes-inc/`)
- Append the Game Master personality to your existing `SOUL.md`
- Register game slash commands (`/start`, `/status`, `/next`, etc.) as Hermes quick_commands
- Restart the gateway if it's running

Once installed, send `/start` to your Hermes bot in Telegram to begin.

### (Optional) Enable Auto-Advance via Cron

Set up a cron job so the game advances automatically without typing `/next`:

```bash
hermes cron create "every 1m" \
  "Run hermes-inc tick in the terminal. If output is [SILENT], do nothing. Otherwise post the output." \
  --skill hermes-inc --name "Hermes Inc Tick"
```

### (Optional) Create a Telegram Group

For the full boardroom experience:

1. Create a Telegram group named **"Hermes Inc. Board Room"**.
2. Add your Hermes bot to the group and **promote it to admin**.
3. Set `TELEGRAM_HOME_CHANNEL` in `~/.hermes/.env` to the group chat ID.

---

## How to Play

### Commands

| Command | Description |
|---------|-------------|
| `/start` | Start a new company |
| `/status` | View company dashboard |
| `/next` | Advance one week |
| `/plan` | Get team suggestions for next week |
| `/event` | Trigger a random event |
| `/speed demo\|fast\|normal\|slow` | Set auto-advance speed |
| `/pause` | Pause auto-advance |
| `/ship <feature>` | Ship a product feature |
| `/hire <role>` | Hire a new team member |
| `/fire <name>` | Fire a team member |
| `/fundraise` | Attempt to raise funding |

### Natural Language Strategy

Instead of commands, just describe your strategy:

```
Focus on Telegram Memory, open-source memory export first, delay monetization.
```

The engine parses your intent, agents debate the trade-offs, and the rule engine resolves the outcome.

### Speed Modes

| Mode | Pace |
|------|------|
| `demo` | 1 minute = 1 week |
| `fast` | 5 minutes = 1 week |
| `normal` | 1 hour = 1 week |
| `slow` | 24 hours = 1 week |
| `manual` | Use `/next` to advance |

---

## Game Mechanics

### The Core Loop

```
Week starts
  → Agents discuss company situation
  → You give strategy in natural language
  → Rule engine parses decision
  → Agents debate trade-offs
  → Engine updates numbers (deterministic)
  → Random event may trigger
  → Weekly report posted
  → Runway decreases or increases
  → Company evolves or collapses
```

### Your Team

| Agent | Role | Personality | Salary |
|-------|------|-------------|--------|
| 🧠 Stella | PM | Growth-oriented, user-focused, willing to compromise | $900/wk |
| 🛠 Linus | Engineer | Quality purist, hates messy pivots, clean architecture | $1,200/wk |
| 🌱 Maya | Community | Open-source evangelist, community-first, wary of monetization | $700/wk |
| 💰 Voss | CFO | Revenue-obsessed, runway-conscious, pragmatic | $1,000/wk |
| 🛡 Nyx | Security & Ethos | Privacy-first, principled, safety advocate | $900/wk |

Agents **always disagree** — every discussion surfaces at least one trade-off.

### Key Metrics

| Metric | What It Means | Risk |
|--------|--------------|------|
| **Cash** | Company bank account | Zero = bankruptcy |
| **Runway Weeks** | Weeks until cash runs out | < 4 weeks triggers crisis |
| **MRR** | Monthly recurring revenue | Determines sustainability |
| **Users** | Active user count | More users = higher costs |
| **GitHub Stars** | Developer mindshare | High stars + no MRR = pressure |
| **Product Quality** | How good the product is | Low quality = churn |
| **Tech Debt** | Accumulated shortcuts | High debt = slow development + bugs |
| **Security Risk** | Vulnerability exposure | High risk = breach events |
| **Community Trust** | Open-source reputation | Low trust = fork threat |
| **Open-source Karma** | Ecosystem goodwill | Shapes long-term valuation |
| **Team Morale** | How the team feels | Low morale = resignations |
| **Hype** | Market buzz | Decays naturally over time |
| **Investor Interest** | VC attention level | Determines fundraise success |

### Product Shipping

Ship features using a **Platform × Capability × Market** system:

```
/ship Telegram persistent memory for developers
→ telegram × persistent_memory × developers
→ +350 users, +400 stars, +8 trust, +5 security risk, ...
```

### Random Events

24 events across 7 categories keep the game unpredictable:

- **Product** — Critical bugs, viral features, user churn
- **Community** — HN front page, fork threats, contributor surges
- **Business** — Seed offers, enterprise inquiries, sponsorships
- **AI Market** — Model price drops, competitor launches, regulation
- **Security** — Memory leaks, prompt injection, token exposure
- **A2A** — Agent interop requests, protocol standards
- **Internal** — Burnout, team arguments, poaching attempts

Many events offer **choices** with different trade-offs.

### Endings

**Failure:**
| Ending | Trigger |
|--------|---------|
| 💀 Bankruptcy | Cash ≤ 0 |
| 🍴 Community Fork | Trust < 20, Karma < 30 |
| 🔓 Security Collapse | Security Risk > 90 |
| 😵 Founder Burnout | Team Morale < 15 |
| 🏢 Acqui-hire | Runway < 3 weeks, late game |

**Success:**
| Ending | Trigger |
|--------|---------|
| 🏠 Sustainable Indie | MRR covers burn, trust > 60 |
| 🌍 Open-source Standard | 100k+ stars, karma > 85 |
| 🔗 Agent Platform | 50+ A2A integrations, marketplace |
| 🦄 Unicorn | Valuation > $1B |
| 🌐 Protocol Civilization | 100+ integrations, ecosystem standard |

---

## Architecture

```
Telegram Group
  ↓
Hermes Telegram Gateway
  ↓
Hermes Agent (your existing profile)
  ↓
SOUL.md + SKILL.md (Game Master prompt)
  ↓
hermes-inc CLI (TypeScript)
  ↓
SQLite game.db (deterministic rule engine)
  ↓
Formatted report → Telegram reply
```

**Core principle:** LLM narrates, rule engine decides numbers. The game engine is fully deterministic — no LLM hallucination in game mechanics. All numeric outcomes are computed by TypeScript functions, not generated by the model.

### Tech Stack

- **Runtime:** Node.js 20+
- **Language:** TypeScript
- **Database:** SQLite via better-sqlite3
- **Bot Interface:** Hermes Agent Telegram gateway
- **Game Engine:** Deterministic TypeScript module
- **LLM Role:** Narration and agent debate only (via Hermes prompt + skill)
- **Deployment:** Any VPS with Node.js, or local machine

---

## Development

```bash
npm install          # Install dependencies
npm run build        # Compile TypeScript
npm run dev          # Watch mode
npm run db:init      # Initialize/reset database
```

### Project Structure

```
hermes-inc/
  src/
    cli.ts                        # CLI entry point (15 commands)
    engine/
      advanceWeek.ts              # Main game loop
      applyDecision.ts            # Strategy parsing + effect application
      calculateBurn.ts            # Weekly burn calculation
      calculateGrowth.ts          # Organic growth, churn, decay
      calculateValuation.ts       # Company valuation formula
    data/
      agents.ts                   # 5 agent personas + reaction system
      events.ts                   # 24 random events with choices
      products.ts                 # Platform × Capability × Market combos
      endings.ts                  # 10 ending conditions
    db/
      database.ts                 # SQLite data access layer
      schema.sql                  # Table definitions
      types.ts                    # TypeScript type definitions
    telegram/
      formatReport.ts             # Telegram message formatting
  hermes/
    SOUL.md                       # Hermes Agent personality
    SKILL.md                      # Hermes Agent skill definition
  install.sh                      # One-click installer
```

---

## License

MIT
