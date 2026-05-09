# 🏢 Hermes Inc.

**A Telegram-native AI startup simulator where agents argue, remember, and evolve your company.**

You are the founder engineer of Hermes Inc., an early-stage AI agent startup. Give CEO directives, spend limited action points each week, watch your agent teammates debate the trade-offs, and survive long enough to build something meaningful.

Survive. Grow. Define the future of personal agents.

> **It does not predict startup outcomes. It makes strategic trade-offs visible and playable.**

Demo: <https://x.com/brucexu_eth/status/2048625942416023874>

---

## What It Is

Hermes Inc. is a simulation game that runs inside your existing Hermes Agent + Telegram setup.

- You play as the founder engineer of an AI startup
- Your teammates have distinct roles and conflicting priorities
- Weekly outcomes are resolved by a deterministic TypeScript rule engine
- Telegram acts as the game interface, board room, and activity feed
- The company keeps feeling alive through timed office updates, weekly ticks, events, and milestone images

**Core principle:** LLM narrates, rule engine decides numbers. The model handles dialogue and framing; TypeScript computes the actual game state.

---

## Quick Start

```bash
# Install Hermes Agent if needed
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash

# Clone and install
git clone https://github.com/user/hermes-inc
cd hermes-inc
bash install.sh

# Start the Hermes gateway if it is not already running
hermes gateway start
```

Then send `/inc_start` to your Hermes bot in Telegram.

---

## Demo Loop

A typical session looks like this:

1. Start a company with `/inc_start`
2. Check the dashboard with `/inc_status`
3. Ask the team for advice with `/inc_plan`
4. Type a CEO directive in natural language
5. Spend actions on ship / hire / fire / event / fundraise
6. Let the week auto-advance, or force it with `/inc_next`
7. Handle random events and milestone moments
8. Repeat until you become a standard, a sustainable indie, a unicorn, or a cautionary tale

Example directive:

```text
Focus on Telegram Memory, open-source memory export first, delay monetization.
```

That directive is parsed, stored for the current week, debated by the team, and merged into the next weekly resolution.

---

## Installation

### Prerequisites

- A working [Hermes Agent](https://hermes-agent.nousresearch.com/) instance with Telegram configured
- **Node.js 20+** on the same machine

### Install

```bash
git clone https://github.com/user/hermes-inc
cd hermes-inc
bash install.sh
```

The install script will:

- Install dependencies and build the TypeScript project
- Initialize the SQLite database
- Install the `hermes-inc` skill into your current Hermes profile
- Append the Game Master personality to your `SOUL.md`
- Register the prefixed Telegram quick commands:
  `/inc_start`, `/inc_status`, `/inc_next`, `/inc_plan`, `/inc_event`, `/inc_pause`, `/inc_resume`, `/inc_fundraise`
- Create a `Hermes Inc Tick` cron job that runs every minute
- Restart the Hermes gateway if needed

### Optional Telegram Group Setup

For the full boardroom effect:

1. Create a Telegram group named **Hermes Inc. Board Room**
2. Add your Hermes bot to the group and promote it to admin
3. Set `TELEGRAM_HOME_CHANNEL` in `~/.hermes/.env` to the group chat ID

---

## How To Play

### Slash Commands

| Command | Description |
|---------|-------------|
| `/inc_start` | Start a new company |
| `/inc_status` | View the company dashboard |
| `/inc_next` | Force-advance to the next week |
| `/inc_plan` | Ask the team for next-week suggestions |
| `/inc_event` | Trigger a random event |
| `/inc_pause` | Pause timed progression |
| `/inc_resume` | Resume timed progression |
| `/inc_fundraise` | Attempt to raise capital |

### Natural Language Inputs

You can also type directly into Telegram:

| Message | What it does |
|---------|--------------|
| `Focus on security and reduce tech debt` | Adds a CEO directive for the current week |
| `ship Telegram Memory` | Ships a parsed product feature |
| `hire engineer` | Hires a new team member |
| `fire Voss` | Fires a team member |
| `speed demo` | Sets timed progression to demo mode |
| `speed manual` | Disables timed progression |

Natural language directives are treated like `reply <message>` in the CLI. They:

- Cost 1 action point
- Are stored as unapplied directives for the current week
- Trigger immediate team debate
- Are merged together when the week resolves

### Previewing Strategy Without Spending AP

Use the CLI preview mode if you want to inspect how a strategy is interpreted before committing:

```bash
hermes-inc decide "Focus on Telegram Memory, delay monetization"
```

This prints the parsed focus areas and the agent reactions, but does not spend an action point or advance the week.

### Weekly Action Economy

Each week gives you **3 action points**.

Actions that consume 1 AP:

- natural-language directives
- `ship`
- `hire`
- `fire`
- `event`
- `choose`
- `fundraise`

When you run out of action points and timed progression is enabled, the game auto-advances to the next week.

---

## Time And Progression

Hermes Inc. uses **sub-ticks**. The cron job runs every minute, and the game accumulates minute-by-minute office activity until a full week resolves.

### Speed Modes

| Mode | Sub-ticks per week | Real time per week |
|------|--------------------|--------------------|
| `demo` | 2 | 2 minutes |
| `fast` | 5 | 5 minutes |
| `normal` | 12 | 12 minutes |
| `slow` | 60 | 60 minutes |
| `manual` | 0 | manual only |

New games currently start in **fast** mode.

### What Happens On Each Tick

Every minute, the cron tick does one of two things:

- If the week is not ready to resolve yet, it emits office activity
- If enough sub-ticks have passed, or all action points are spent, it resolves the next week

Office activity can include:

- agent chatter
- state-aware observations
- mini-events with small numeric effects
- warning messages when the company is unstable

This is what makes the company feel alive between major decisions.

---

## Core Loop

```text
Week begins
  → You issue directives and spend action points
  → Agents debate the trade-offs
  → Minute-by-minute office activity appears in chat
  → Random events may trigger
  → The week resolves deterministically
  → Cash, runway, growth, trust, risk, and morale all update
  → Milestones or endings may trigger images
  → The company evolves or collapses
```

---

## Team

| Agent | Role | Personality | Salary |
|-------|------|-------------|--------|
| 🧠 Stella | PM | Growth-oriented, user-focused, willing to compromise | $900/wk |
| 🛠 Linus | Engineer | Quality purist, hates messy pivots, clean architecture | $1,200/wk |
| 🌱 Maya | Community | Open-source evangelist, community-first, wary of monetization | $700/wk |
| 💰 Voss | CFO | Revenue-obsessed, runway-conscious, pragmatic | $1,000/wk |
| 🛡 Nyx | Security & Ethos | Privacy-first, principled, safety advocate | $900/wk |

Agents are designed to disagree. A good week is usually still an uncomfortable trade-off.

---

## Key Metrics

| Metric | What It Means | Risk |
|--------|---------------|------|
| **Cash** | Company bank account | Zero means bankruptcy |
| **Runway Weeks** | Weeks until cash runs out | Below 4 weeks is critical |
| **MRR** | Monthly recurring revenue | Drives sustainability |
| **Users** | Active user count | Growth increases support and infra pressure |
| **GitHub Stars** | Developer mindshare | High stars without revenue creates pressure |
| **Product Quality** | Product stability and usefulness | Low quality drives churn |
| **Tech Debt** | Shortcut accumulation | High debt slows shipping |
| **Security Risk** | Vulnerability exposure | High risk can trigger collapse |
| **Community Trust** | Reputation with users and OSS contributors | Low trust risks a fork |
| **Open-source Karma** | Ecosystem goodwill | Feeds long-term value |
| **Team Morale** | Team health and resilience | Low morale leads to burnout |
| **Hype** | Market attention | Decays if not used well |
| **Investor Interest** | Likelihood of funding attention | Affects fundraising success |
| **A2A Integrations** | Ecosystem integrations | Adds platform value and attack surface |

---

## Product Shipping

Features are modeled as a **Platform × Capability × Market** combination.

Example:

```text
ship Telegram persistent memory for developers
```

This is parsed into a product combo and applies deterministic effects such as:

- more users
- more GitHub stars
- more trust
- more MRR potential
- more tech debt or security risk

Shipping is meant to feel like a strategic bet, not a cosmetic action.

---

## Random Events

Events are drawn from categories like:

- Product
- Community
- Business
- AI Market
- Security
- A2A
- Internal team dynamics

Some events apply immediately. Others create a choice prompt and wait for a response via `choose <event_id> <choice_id>`.

Examples include:

- privacy backlash
- community fork pressure
- seed offers
- enterprise inquiries
- prompt injection incidents
- competitor launches
- team arguments

---

## Images And Milestones

The game emits `[IMAGE: ...]` prompts for visually important moments. These are intended to be rendered by the Hermes image stack or an external image generation step.

Current image triggers include:

- game start
- dramatic events such as privacy backlash, seed offers, and security incidents
- successful or failed fundraising
- milestone crossings such as:
  - `10k / 50k / 100k GitHub stars`
  - `1k / 5k / 10k / 50k users`
  - first MRR
  - first paid user
  - valuation milestones from `1M` through `1B`
  - runway crisis
- endings

The current prompt style is cinematic digital illustration.

---

## Endings

### Failure Endings

| Ending | Trigger |
|--------|---------|
| 💀 Bankruptcy | Cash <= 0 |
| 🍴 Community Fork | Trust < 20 and karma < 30 |
| 🔓 Security Collapse | Security risk > 90 |
| 😵 Founder Burnout | Team morale < 15 |
| 🏢 Acqui-hire | Late game with critically low runway |

### Success Endings

| Ending | Trigger |
|--------|---------|
| 🏠 Sustainable Indie | Revenue covers burn and trust stays high |
| 🌍 Open-source Standard | 100k+ stars and strong karma |
| 🔗 Agent Platform | High A2A integration success |
| 🦄 Unicorn | Valuation exceeds $1B |
| 🌐 Protocol Civilization | Ecosystem-scale success |

---

## Architecture

```text
Telegram Chat or Group
  ↓
Hermes Telegram Gateway
  ↓
Hermes Agent profile
  ↓
SOUL.md + SKILL.md
  ↓
hermes-inc CLI (TypeScript)
  ↓
SQLite game.db
  ↓
Weekly reports, office chatter, events, and image prompts
```

### Tech Stack

- Runtime: Node.js 20+
- Language: TypeScript
- Database: SQLite via `better-sqlite3`
- Interface: Hermes Agent Telegram gateway
- Game engine: deterministic TypeScript modules
- LLM role: narration, team debate, and chat framing only

---

## Development

```bash
npm install
npm run build
npm run dev
npm run db:init
```

### Local CLI

```bash
node dist/cli.js start
node dist/cli.js status
node dist/cli.js reply "Focus on security and reduce tech debt"
node dist/cli.js next
node dist/cli.js tick
```

### Project Structure

```text
hermes-inc/
  src/
    cli.ts
    engine/
      advanceWeek.ts
      applyDecision.ts
      calculateBurn.ts
      calculateGrowth.ts
      calculateValuation.ts
    data/
      agents.ts
      events.ts
      products.ts
      endings.ts
      imagePrompts.ts
      subTickContent.ts
    db/
      database.ts
      schema.sql
      types.ts
    telegram/
      formatReport.ts
  hermes/
    SOUL.md
    SKILL.md
  install.sh
```

---

## License

MIT
