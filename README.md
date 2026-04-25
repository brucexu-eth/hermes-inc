# 🏢 Hermes Inc.

**A Telegram-native AI startup simulator where agents argue, remember, and evolve your company.**

You are the founder engineer of Hermes Inc., an early-stage AI agent startup. Make strategic decisions every week — your AI teammates will debate trade-offs, the rule engine will update the numbers, and random events will keep you on your toes.

Survive. Grow. Define the future of personal agents.

> **It does not predict startup outcomes. It makes strategic trade-offs visible and playable.**

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

### Option A: CLI Only (no Hermes Agent)

Play directly in your terminal. No Telegram, no LLM provider needed.

```bash
git clone https://github.com/user/hermes-inc
cd hermes-inc
npm install
npm run build
mkdir -p data && npm run db:init
npm link                          # makes `hermes-inc` available globally
hermes-inc start
```

### Option B: Full Setup with Hermes Agent + Telegram

Turn a Telegram group into your AI startup boardroom.

#### 1. Install Hermes Agent

```bash
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
source ~/.zshrc    # or source ~/.bashrc
hermes doctor      # verify installation
```

#### 2. Configure an LLM Provider

```bash
hermes model       # interactive setup — pick OpenRouter, Anthropic, OpenAI, etc.
```

The model must support **64K+ context tokens** for multi-step tool-calling workflows.

#### 3. Create a Telegram Bot

1. Open Telegram and message [@BotFather](https://t.me/BotFather).
2. Send `/newbot`, follow the prompts, and copy the **bot token**.
3. Send `/setprivacy` → select your bot → **Disable** (so the bot can read group messages).
4. Message [@userinfobot](https://t.me/userinfobot) to get your **numeric Telegram user ID**.

#### 4. Install Hermes Inc.

```bash
git clone https://github.com/user/hermes-inc
cd hermes-inc
bash install.sh
```

The install script will:
- Install Node.js dependencies and build the project
- Initialize the SQLite database
- Detect Hermes Agent and create a `hermesinc` profile
- Copy `SOUL.md` (game master personality) and `SKILL.md` (command mapping)
- Set the working directory for the profile

#### 5. Configure Telegram Credentials

```bash
nano ~/.hermes/profiles/hermesinc/.env
```

Add:

```env
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrSTUvwxYZ
TELEGRAM_ALLOWED_USERS=your_numeric_user_id
```

Replace with your actual values.

#### 6. Start the Telegram Gateway

```bash
hermes -p hermesinc gateway setup
hermes -p hermesinc gateway start
```

Your bot is now live. Send `/start` in a Telegram chat with the bot to begin.

#### 7. (Optional) Enable Auto-Advance via Cron

Set up a cron job so the game advances automatically without typing `/next`:

```bash
hermes -p hermesinc cron create "every 1m" \
  "Run hermes-inc tick in the terminal. If output is [SILENT], do nothing. Otherwise post the output." \
  --skill hermes-inc --name "Hermes Inc Tick"
```

#### 8. (Optional) Create a Telegram Group

For the full boardroom experience:

1. Create a Telegram group named **"Hermes Inc. Board Room"**.
2. Add your bot to the group and **promote it to admin**.
3. Set `TELEGRAM_HOME_CHANNEL` in the profile `.env` to the group chat ID.

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
Hermes Profile (hermesinc)
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
