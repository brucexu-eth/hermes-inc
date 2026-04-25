# PRD：Hermes Inc. Simulator v0.1

## 1. 基本信息

**产品名**：Hermes Inc.
**域名**：hermesinc.lol
**一句话定位**：A Telegram-native AI startup simulator where agents argue, remember, and evolve your company.
**提交定位**：Creative software / interactive media / long-form simulation game.
**目标平台**：Telegram + VPS self-hosted Hermes Agent.
**开发目标**：Hackathon MVP 可玩、可演示、可部署。

Hermes Agent 本身支持 Telegram bot、群聊、定时任务结果投递、文字/语音/图片/附件等消息能力；这使 Telegram 作为游戏界面是合理的，不需要额外做 UI。([Hermes Agent][1])

---

## 2. 产品目标

### 2.1 用户问题

AI / 开源 / Agent 项目早期常常面临复杂取舍：

- 要不要开源？
- 要不要先商业化？
- 要不要优先增长 GitHub stars？
- 要不要支持 Telegram / A2A / Memory / Skills？
- 要不要裁员延长 runway？
- 如何在 MRR、用户增长、社区信任、技术债、安全风险之间权衡？

真实创业试错成本高，很多 founder、builder、开源维护者没有低成本演练这些 trade-off 的方式。

### 2.2 产品价值

Hermes Inc. 把这些抽象取舍变成一个可玩的模拟器：

> **It does not predict startup outcomes. It makes strategic trade-offs visible and playable.**

它的 useful 不是“准确预测公司未来”，而是帮助玩家理解：某个策略短期会带来什么收益，长期会积累什么风险。

---

## 3. 核心玩法

### 3.1 游戏身份

玩家是 Hermes Inc. 的早期 founder engineer。公司刚起步，有少量现金、几个 Agent 同事、一个开源 repo、一个 Telegram 社区。

### 3.2 核心循环

```text
Week starts
→ Agents discuss company situation
→ Player gives strategy in natural language
→ Game engine parses decision
→ Agents debate trade-offs
→ Rule engine updates numbers
→ Random event may trigger
→ Weekly report is posted
→ Runway decreases or increases
→ Company evolves or collapses
```

### 3.3 最小体验示例

玩家输入：

```text
这周先暂停 A2A，all-in Telegram Memory，同时做 memory export，先不要商业化。
```

系统返回：

```text
📅 Week 4 Decision: Telegram Memory + Memory Export

🧠 PM Agent:
This will improve retention and make the product easier to demo.

🛠 Engineer Agent:
Good direction, but memory export adds complexity.

🌱 Community Agent:
Open-source users will trust us more.

💰 CFO Agent:
No monetization means runway pressure continues.

Result:
+ Users: +280
+ GitHub Stars: +640
+ Community Trust: +9
- Cash: -$4,200
+ Tech Debt: +5
Runway: 11.3 weeks → 9.8 weeks

New Risk:
Privacy debate may appear within 2 weeks.
```

---

## 4. 第一性原理

经营模拟游戏的核心不是画面，而是：**资源稀缺、决策不可逆、反馈可解释**。
在 Hermes Inc. 里，最重要的生命条不是 HP，而是 **Runway Weeks**。玩家必须不断用有限的 runway 换取用户、收入、社区信任、产品质量和估值。

LLM 不能直接决定数值，否则游戏会失去可信度。正确架构是：**规则引擎决定结果，LLM 解释原因。**

---

# 5. 游戏机制设计

## 5.1 Week 与 Runway

游戏里有两个时间概念：

```text
Current Week：公司已经运行到第几周
Runway Weeks：按当前现金、收入、burn rate，公司还能活多少周
```

每次 week tick：

```text
Current Week += 1
Cash = Cash + Weekly Revenue - Weekly Burn
Runway Weeks = Cash / max(Weekly Burn - Weekly Revenue, 1)
```

如果 Cash <= 0 且没有融资、裁员、收购或救援事件，公司破产。

---

## 5.2 Week 触发方式

### 手动模式

用于 demo：

```text
/next
/week
```

立即推进一周。

### 自动模式

用于真实游玩：

```text
/speed demo      1 分钟 = 1 week
/speed fast      5 分钟 = 1 week
/speed normal    1 小时 = 1 week
/speed slow      24 小时 = 1 week
/pause
```

Hermes Agent 官方支持 cron / scheduled automations，并且可以投递到平台；MVP 可以用 cron 每分钟检查是否到达 next_tick_at，再决定是否推进 week。([Hermes Agent][2])

### 事件触发模式

重大行为可以立即生效，但不推进 week：

```text
/fire CFO
/hire Security Agent
/ship Telegram Memory
/fundraise seed
```

---

## 5.3 公司状态指标

MVP 初始状态：

```json
{
  "week": 1,
  "cash": 50000,
  "mrr": 0,
  "users": 120,
  "paid_users": 0,
  "github_stars": 420,
  "valuation": 100000,
  "runway_weeks": 16,
  "weekly_burn": 3000,
  "product_quality": 50,
  "tech_debt": 20,
  "security_risk": 18,
  "community_trust": 70,
  "open_source_karma": 75,
  "team_morale": 72,
  "hype": 25,
  "investor_interest": 15,
  "a2a_integrations": 0
}
```

### 指标解释

| 指标              | 含义           | 过低/过高风险                |
| ----------------- | -------------- | ---------------------------- |
| Cash              | 公司现金       | 归零破产                     |
| Runway Weeks      | 公司还能活几周 | <4 周触发危机                |
| MRR               | 月经常性收入   | 决定可持续性                 |
| Users             | 活跃用户       | 增长越快成本越高             |
| GitHub Stars      | 开发者影响力   | 高 stars 但无 MRR 会形成压力 |
| Product Quality   | 产品质量       | 低质量导致 churn             |
| Tech Debt         | 技术债         | 高了会拖慢开发并引发 bug     |
| Security Risk     | 安全风险       | 高了可能触发 memory leak     |
| Community Trust   | 社区信任       | 低了可能 fork                |
| Open-source Karma | 开源声誉       | 决定生态路线                 |
| Team Morale       | 团队士气       | 低了员工离职                 |
| Investor Interest | 投资人兴趣     | 决定融资概率                 |
| Valuation         | 公司估值       | 最终评分之一                 |

---

## 5.4 估值系统

MVP 估值公式：

```text
ARR = MRR * 12

Base Valuation = ARR * Revenue Multiple

Ecosystem Value =
  GitHub Stars * 20
  + Users * 5
  + A2A Integrations * 5000
  + Open-source Karma * 1000

Risk Modifier =
  1
  + Community Trust Bonus
  + Product Quality Bonus
  - Tech Debt Penalty
  - Security Risk Penalty

Valuation = (Base Valuation + Ecosystem Value) * Risk Modifier
```

这样设计的原因：不强迫玩家只追 MRR。一个收入不高但成为开源标准的 Hermes Inc. 也可以获得高分。

---

# 6. 玩家行动

## 6.1 命令列表

| 命令                           | 功能                | MVP |
| ------------------------------ | ------------------- | --- |
| `/start`                       | 开始新公司          | P0  |
| `/status`                      | 查看公司状态        | P0  |
| `/next`                        | 手动推进一周        | P0  |
| `/speed demo/fast/normal/slow` | 设置自动速度        | P0  |
| `/pause`                       | 暂停自动推进        | P0  |
| `/plan`                        | 让 Agent 给本周建议 | P0  |
| `/ship [feature]`              | 发布功能            | P0  |
| `/hire [role]`                 | 招人                | P1  |
| `/fire [role]`                 | 裁员                | P1  |
| `/fundraise`                   | 尝试融资            | P1  |
| `/event`                       | 手动触发随机事件    | P0  |
| `/image`                       | 生成当前里程碑图    | P1  |

## 6.2 自然语言决策

玩家可以直接说：

```text
我想把项目做成 local-first open-source，不急着商业化，先赢得开发者社区。
```

系统解析为：

```json
{
  "focus": ["open_source", "local_first", "developer_community"],
  "deprioritize": ["monetization", "enterprise_sales"],
  "expected_effects": {
    "community_trust": "+",
    "github_stars": "+",
    "mrr_growth": "-",
    "runway_pressure": "+"
  }
}
```

---

# 7. Agent 人物设计

MVP 使用 **一个 Hermes profile + 多个虚拟 Agent persona**。不建议 v0.1 创建多个真实 Hermes profile，因为 profile 各自有独立 config、API keys、memory、sessions、skills、cron 和 gateway state，部署复杂度会显著增加。([Hermes Agent][3])

另外，Telegram bot token 不能被多个 profile 共享；多个 profile 同时接同一个 Telegram token 会失败，所以 v0.1 用一个 bot 最稳。([Hermes Agent][4])

## 7.1 初始团队

| Agent  | 角色                 | 性格                     | 工资/周 | 功能                   |
| ------ | -------------------- | ------------------------ | ------: | ---------------------- |
| Stella | PM Agent             | 增长、用户体验、愿意妥协 |    $900 | 提升用户增长           |
| Linus  | Engineer Agent       | 工程质量、讨厌乱 pivot   |   $1200 | 提升质量，降低技术风险 |
| Maya   | Community Agent      | 开源、DevRel、社区信任   |    $700 | 提升 stars、trust      |
| Voss   | CFO/Biz Agent        | runway、收入、融资       |   $1000 | 提升 MRR、投资概率     |
| Nyx    | Security/Ethos Agent | 隐私、安全、原则         |    $900 | 降低 security risk     |

## 7.2 Agent 发言规则

每次讨论最多 5 个 Agent，每人最多 2 句。
必须有分歧，不允许所有 Agent 都同意。
每轮至少指出一个 trade-off。

示例：

```text
💰 Voss:
We need revenue now. Community goodwill does not pay salaries.

🌱 Maya:
If we monetize memory too early, the community will not trust us.

🛠 Linus:
Both plans fail if we ship before fixing session bugs.
```

---

# 8. 产品开发系统

借鉴《游戏发展国》的“类型 + 题材 + 平台”，Hermes Inc. 用：

```text
Platform × Capability × Market
```

## Platform

- Telegram
- CLI
- Discord
- Web UI
- Browser Extension
- API
- Local Desktop
- A2A Gateway

## Capability

- Persistent Memory
- Skills
- Subagents
- Browser Automation
- Image Generation
- Voice
- A2A Communication
- Marketplace
- Sandbox / Security

## Market

- Developers
- Creators
- Open-source maintainers
- AI power users
- Startups
- Enterprises
- Web3 communities

## 组合效果示例

```text
Telegram × Persistent Memory × AI Power Users
```

效果：

```text
+ Retention
+ Demo virality
+ Personal attachment
- Privacy debate risk
- Model cost
```

```text
A2A Gateway × Skills × Developers
```

效果：

```text
+ Ecosystem value
+ GitHub stars
+ Platform narrative
- Security risk
- High complexity
- Slow revenue
```

---

# 9. 随机事件系统

## 9.1 事件类型

| 类型      | 示例                                      |
| --------- | ----------------------------------------- |
| Product   | 重大 bug、爆款功能、用户流失              |
| Community | X viral、GitHub issue、社区 fork          |
| Business  | 融资机会、客户流失、赞助                  |
| AI Market | 模型价格变化、竞争对手发布                |
| Security  | memory leak、token leak、prompt injection |
| A2A       | 外部 agent 请求互通                       |
| Internal  | 员工疲劳、离职、争吵                      |

## 9.2 事件样例

```text
Event: Viral X Thread

A popular AI researcher posts:
"Hermes Inc. feels like the first agent company that actually remembers its users."

Effect:
+ GitHub Stars: +1200
+ Users: +600
+ Hype: +20
+ Model Cost: +15%
```

```text
Event: Privacy Backlash

A user asks why Hermes remembers so much and demands memory export/delete.

Choices:
A. Ship memory export/delete
B. Publish privacy manifesto
C. Ignore for now

Default Effect:
- Community Trust
+ Security Risk
```

```text
Event: A2A Handshake Request

Another agent company wants to exchange skills and access your memory schema.

Choices:
A. Accept
B. Sandbox
C. Reject
```

---

# 10. 结局系统

## 10.1 失败结局

| 结局                       | 条件                                           |
| -------------------------- | ---------------------------------------------- |
| Bankruptcy                 | Cash <= 0                                      |
| Community Fork             | Community Trust < 20 且 Open-source Karma < 30 |
| Security Collapse          | Security Risk > 90 后触发事故                  |
| Founder Burnout            | Team Morale < 15 且连续高压                    |
| Acquisition Under Pressure | Cash < 4 weeks runway 且出现收购事件           |

## 10.2 成功结局

| 结局                      | 条件                                            |
| ------------------------- | ----------------------------------------------- |
| Sustainable Indie Company | MRR > weekly burn × 4，trust > 60               |
| Open-source Standard      | Stars > 100k，contributors 高，karma > 85       |
| Agent Platform            | A2A integrations > 50，marketplace active       |
| AI Agent Unicorn          | Valuation > $1B，ARR 高，growth 高              |
| Protocol Civilization     | A2A integrations > 100，ecosystem dependency 高 |

---

# 11. Telegram 交互设计

## 11.1 游戏空间

Telegram 群名：

```text
Hermes Inc. Board Room
```

只有一个真实 bot，但它模拟多个公司同事。

## 11.2 消息类型

### Weekly Report

```text
📅 Week 8 Report — Hermes Inc.

Cash: $36,800
Runway: 9.2 weeks
MRR: $1,400
Users: 1,820
GitHub Stars: 5,940
Valuation: $620k

Biggest Risk:
Runway is shrinking faster than MRR is growing.

Recommended Focus:
Ship a small paid hosted plan without closing the open-source core.
```

### Decision Prompt

```text
This week's strategic tension:

A. Monetize hosted memory now
B. Open-source memory export first
C. Build A2A integrations
D. Propose your own strategy
```

### Milestone Image

仅在关键节点生成图：

- stars 破 10k
- 产品发布
- 融资成功
- 安全事故
- 社区 fork
- 公司破产
- 成为开源标准

Hermes Agent 官方文档列出 image generation / TTS / web control 等能力；但在 MVP 中图片应该作为里程碑奖励，不要作为每个 tick 的常规输出，以免拖慢 demo。([Hermes Agent][2])

---

# 12. 技术实现设计

## 12.1 推荐架构

```text
Telegram Group
  ↓
Hermes Telegram Gateway
  ↓
Hermes Profile: hermesinc
  ↓
Hermes Inc. Skill / Game Master Prompt
  ↓
Game Engine: Node.js or Python
  ↓
SQLite game.db
  ↓
Image API optional
  ↓
Telegram weekly report / image reply
```

Hermes 官方 quickstart 建议先跑通基础 chat，再叠加 gateway、cron、skills、voice、routing；这也符合本项目开发顺序。Hermes 还要求模型至少 64K context，低于该上下文会无法支撑多步 tool-calling 工作流。([Hermes Agent][5])

## 12.2 技术栈建议

考虑你的偏好，建议用 Node.js / TypeScript：

```text
Runtime: Node.js 20+
Language: TypeScript
DB: SQLite
ORM: better-sqlite3 or Drizzle
Bot interface: Hermes Telegram gateway
Game engine: deterministic TypeScript module
LLM role: Hermes prompt + skill
Image: optional OpenAI image API / Hermes image tools
Deployment: Ubuntu VPS + systemd
```

如果想更贴 Hermes/Python 生态，也可以用 Python。但从你习惯和后续维护看，TypeScript 更顺。

---

## 12.3 Repo 结构

```text
hermes-inc/
  README.md
  .env.example
  install.sh
  package.json
  src/
    engine/
      advanceWeek.ts
      applyDecision.ts
      calculateBurn.ts
      calculateGrowth.ts
      calculateValuation.ts
      checkEndings.ts
    data/
      agents.ts
      events.ts
      products.ts
      endings.ts
    db/
      schema.sql
      state.ts
    telegram/
      formatReport.ts
      formatAgentDebate.ts
    llm/
      parseDecisionPrompt.md
      weeklyNarrationPrompt.md
      imagePrompt.md
  hermes/
    SOUL.md
    SKILL.md
  scripts/
    init-db.ts
    tick.ts
    install-cron.sh
```

---

## 12.4 数据表

### game_state

```sql
CREATE TABLE game_state (
  id INTEGER PRIMARY KEY,
  week INTEGER NOT NULL,
  cash REAL NOT NULL,
  mrr REAL NOT NULL,
  users INTEGER NOT NULL,
  paid_users INTEGER NOT NULL,
  github_stars INTEGER NOT NULL,
  valuation REAL NOT NULL,
  runway_weeks REAL NOT NULL,
  weekly_burn REAL NOT NULL,
  product_quality REAL NOT NULL,
  tech_debt REAL NOT NULL,
  security_risk REAL NOT NULL,
  community_trust REAL NOT NULL,
  open_source_karma REAL NOT NULL,
  team_morale REAL NOT NULL,
  hype REAL NOT NULL,
  investor_interest REAL NOT NULL,
  a2a_integrations INTEGER NOT NULL,
  speed_mode TEXT NOT NULL,
  tick_interval_minutes INTEGER NOT NULL,
  next_tick_at TEXT,
  paused INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

### employees

```sql
CREATE TABLE employees (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  salary_per_week REAL NOT NULL,
  morale REAL NOT NULL,
  fatigue REAL NOT NULL,
  loyalty REAL NOT NULL,
  active INTEGER NOT NULL,
  skills_json TEXT NOT NULL,
  values_json TEXT NOT NULL
);
```

### decisions

```sql
CREATE TABLE decisions (
  id TEXT PRIMARY KEY,
  week INTEGER NOT NULL,
  raw_input TEXT NOT NULL,
  parsed_json TEXT,
  result_json TEXT,
  applied INTEGER NOT NULL,
  created_at TEXT NOT NULL
);
```

### events

```sql
CREATE TABLE events (
  id TEXT PRIMARY KEY,
  week INTEGER NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  effects_json TEXT NOT NULL,
  resolved INTEGER NOT NULL,
  created_at TEXT NOT NULL
);
```

---

## 12.5 Week Tick 伪代码

```ts
export function advanceWeek(state: GameState, decision?: ParsedDecision) {
  const next = structuredClone(state);

  next.week += 1;

  if (decision) {
    applyDecisionEffects(next, decision);
  }

  const weeklyRevenue = next.mrr / 4.345;
  const weeklyBurn = calculateWeeklyBurn(next);

  next.cash += weeklyRevenue - weeklyBurn;
  next.weeklyBurn = weeklyBurn;

  updateUserGrowth(next);
  updateGithubStars(next);
  updateProductQuality(next);
  rollRandomEvents(next);

  next.valuation = calculateValuation(next);

  const netBurn = Math.max(weeklyBurn - weeklyRevenue, 1);
  next.runwayWeeks = next.cash / netBurn;

  const ending = checkEndings(next);

  return { state: next, ending };
}
```

---

## 12.6 规则引擎原则

LLM 不允许直接生成：

- cash 变化
- runway 变化
- MRR 变化
- users 变化
- valuation 变化

LLM 只能生成：

- 决策解析
- Agent 讨论
- 事件叙事
- 周报解释
- 图片 prompt
- 玩家风格总结

这样保证游戏可控、可调参、可复盘。

---

# 13. Hermes 集成设计

## 13.1 Hermes Profile

MVP 创建一个 profile：

```bash
hermes profile create hermesinc --clone
```

该 profile 负责：

- Telegram 消息入口
- 读取 game state
- 调用 game engine
- 生成周报
- 运行 cron tick
- 生成里程碑图片 prompt

Hermes profiles 是彼此独立的状态目录，适合未来扩展成多个真实 Agent；但 v0.1 暂时不要使用多 profile。([Hermes Agent][3])

## 13.2 SOUL.md

```md
You are Hermes Inc. Game Master.

The user is the founder engineer of Hermes Inc., an early AI agent startup.

Style:

- Telegram-native.
- Concise.
- Dramatic but not verbose.
- Every week should feel like a startup board-room simulation.
- Agents should disagree.
- Always show numbers clearly.

Core rule:
LLM narrates. Rule engine decides numbers.
Never invent numeric outcomes manually.
```

## 13.3 SKILL.md

```md
# Hermes Inc. Simulator Skill

You run a Telegram-native AI startup simulator.

Responsibilities:

1. Read current game state from SQLite.
2. Parse player strategy into structured decisions.
3. Call the deterministic game engine.
4. Generate short multi-agent debates.
5. Generate weekly reports.
6. Trigger milestone image generation only when appropriate.
7. Never invent numeric results. Use the engine output.

Agents:

- Stella / PM
- Linus / Engineer
- Maya / Community
- Voss / CFO
- Nyx / Security & Ethos
```

---

# 14. VPS 一键部署

## 14.1 用户前置准备

不能完全自动化的部分：

1. 用 BotFather 创建 Telegram bot token。Hermes 官方也要求 Telegram bot 通过 BotFather 获取 token。([Hermes Agent][1])
2. 准备模型 provider key。
3. 准备 VPS。
4. 可选：准备 image generation API key。

`.env.example`：

```bash
TELEGRAM_BOT_TOKEN=
TELEGRAM_ALLOWED_USERS=
TELEGRAM_HOME_CHANNEL=
OPENROUTER_API_KEY=
OPENAI_API_KEY=
HERMES_PROFILE=hermesinc
GAME_MODE=demo
TICK_INTERVAL_MINUTES=5
```

Hermes 环境变量文档中包含 `TELEGRAM_BOT_TOKEN`、`TELEGRAM_ALLOWED_USERS`、`TELEGRAM_HOME_CHANNEL` 等字段，正好对应本项目的 Telegram 权限和 cron 投递需求。([Hermes Agent][6])

## 14.2 安装命令

目标：

```bash
git clone https://github.com/yourname/hermes-inc
cd hermes-inc
cp .env.example .env
nano .env
bash install.sh
```

## 14.3 install.sh 目标流程

```bash
#!/usr/bin/env bash
set -e

# 1. Install Hermes
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash

# 2. Install app dependencies
npm install

# 3. Create Hermes profile
hermes profile create hermesinc --clone || true

# 4. Init database
npm run db:init

# 5. Copy SOUL and Skill files
mkdir -p ~/.hermes/profiles/hermesinc/skills/hermes-inc
cp hermes/SOUL.md ~/.hermes/profiles/hermesinc/SOUL.md
cp hermes/SKILL.md ~/.hermes/profiles/hermesinc/skills/hermes-inc/SKILL.md

# 6. Setup Telegram gateway
hermes -p hermesinc gateway setup

# 7. Install gateway service
hermes -p hermesinc gateway install

# 8. Create cron tick
hermes -p hermesinc cron create "every 1m" \
  "Use the Hermes Inc skill. Check /opt/hermes-inc game state. If next_tick_at is due, advance one week and send a Telegram weekly report. If not due, output [SILENT]." \
  --skill hermes-inc \
  --workdir /opt/hermes-inc \
  --name "Hermes Inc Tick"
```

## 14.4 安全注意

Hermes 默认 local backend 会让 agent 以当前用户权限执行命令；官方文档提醒这意味着 agent 拥有同等文件系统访问权限，需要禁用不需要的 tools 或改用 Docker backend 隔离。MVP 自部署时建议至少限制 allowed users，生产化时改 Docker backend。([Hermes Agent][7])

---

# 15. MVP 范围

## P0：必须完成

- Telegram 可开始游戏
- `/start`
- `/status`
- `/next`
- `/speed`
- `/pause`
- `/plan`
- `/event`
- 自然语言策略输入
- 一个确定性 rule engine
- SQLite 存储
- 5 个虚拟 Agent persona
- 20 个随机事件
- 至少 3 种结局：破产、开源成功、商业成功
- demo 模式：1 分钟推进一周

## P1：增强体验

- `/hire`
- `/fire`
- `/ship`
- `/fundraise`
- 里程碑图片生成
- 玩家风格记忆总结
- A2A handshake 模拟事件
- 估值 leaderboard

## P2：Hackathon 之后

- Web landing page：hermesinc.lol
- 多玩家共享公司
- 多真实 Hermes profile
- 真实 A2A 通信
- 自定义剧本包
- DAO / open-source maintainer simulator 换皮

---

# 16. Demo 脚本

## 0:00–0:15

展示 Telegram：

```text
/start
```

返回：

```text
Welcome to Hermes Inc.
You are founder engineer #001.

Cash: $50,000
Runway: 16 weeks
Users: 120
GitHub Stars: 420
Goal: survive, grow, and define the future of personal agents.
```

## 0:15–0:45

Agent 争论：

```text
PM: Ship Telegram Memory.
Engineer: Fix skills first.
CFO: We need paid hosting.
Ethos: Do not monetize memory before export/delete.
```

玩家输入：

```text
All-in Telegram Memory, but open-source memory export first.
```

## 0:45–1:10

系统结算：

```text
+ GitHub Stars
+ Users
+ Community Trust
- Runway
+ Tech Debt
New Event: Privacy Manifesto goes viral
```

## 1:10–1:30

切换速度：

```text
/speed demo
/next
/next
/next
```

连续推进几周，出现 runway 危机。

## 1:30–1:50

玩家选择商业化或融资：

```text
Launch paid hosted memory for teams, but keep core open source.
```

系统显示：

```text
+ MRR
+ Investor Interest
- Community Trust slightly
Runway recovered to 12.4 weeks
```

## 1:50–2:00

里程碑图：

```text
🎉 GitHub Stars crossed 10k.
Generating milestone poster...
```

结尾字幕：

```text
Hermes Inc. is not a chatbot.
It is a company that remembers your strategy.
```

---

# 17. 验收标准

## 功能验收

- 用户可以在 Telegram 完成完整 5-week game loop。
- Runway 会随时间自然下降。
- 玩家策略会影响公司状态。
- Agent 之间会产生有意义分歧。
- 数值由 rule engine 决定。
- 至少一次随机事件改变局势。
- 至少一次出现结局或重大转折。
- demo 模式能在 2 分钟内展示核心体验。

## 体验验收

试玩者 2 分钟内能理解：

1. 我在经营一家 AI Agent 公司。
2. Week 是游戏节奏。
3. Runway 是生命条。
4. Agent 是团队成员，不只是聊天装饰。
5. 我的策略会改变公司未来。

---

# 18. 主要风险与解决方案

| 风险                 | 解决                                  |
| -------------------- | ------------------------------------- |
| 看起来像普通 chatbot | 固定状态面板 + week tick + 数值变化   |
| LLM 胡编结果         | rule engine 决定数值                  |
| Telegram 消息太长    | Agent 每人最多 2 句                   |
| 自动 tick 失控       | 支持 `/pause`，cron 只检查 due time   |
| 部署复杂             | v0.1 单 profile、单 bot、SQLite       |
| 安全风险             | allowed users + Docker backend V2     |
| Usefulness 弱        | 强调 decision sandbox，不强调预测未来 |

---

# 19. 开发计划

## Day 1：核心可玩

- 初始化 repo
- SQLite schema
- Game state
- advanceWeek
- valuation
- random events
- `/start`
- `/status`
- `/next`
- Telegram 文本模板

## Day 2：Agent 与策略

- 5 个 Agent persona
- 自然语言策略解析 prompt
- `/plan`
- `/event`
- speed mode
- cron tick
- README 安装说明

## Day 3：Presentation

- 里程碑图片
- demo seed 剧本
- 2 分钟 demo 视频
- hermesinc.lol landing page
- hackathon submission writeup

---

# 20. 下一步开发 Todo

1. 建 GitHub repo：`hermes-inc`
2. 写 `README.md`：one-liner、demo、install
3. 搭 SQLite schema
4. 实现 `advanceWeek()`
5. 做 20 个事件 seed
6. 写 5 个 Agent persona
7. 接 Telegram 命令
8. 接 Hermes skill / SOUL
9. 做 `/speed demo`
10. 录 90–120 秒 demo

第一版不要追求复杂，目标是：**5 分钟内能玩，2 分钟内能看懂，30 秒内能记住。**

[1]: https://hermes-agent.nousresearch.com/docs/user-guide/messaging/telegram "Telegram | Hermes Agent"
[2]: https://hermes-agent.nousresearch.com/docs/ "Hermes Agent Documentation | Hermes Agent"
[3]: https://hermes-agent.nousresearch.com/docs/user-guide/profiles "Profiles: Running Multiple Agents | Hermes Agent"
[4]: https://hermes-agent.nousresearch.com/docs/reference/faq "FAQ & Troubleshooting | Hermes Agent"
[5]: https://hermes-agent.nousresearch.com/docs/getting-started/quickstart "Quickstart | Hermes Agent"
[6]: https://hermes-agent.nousresearch.com/docs/reference/environment-variables "Environment Variables | Hermes Agent"
[7]: https://hermes-agent.nousresearch.com/docs/user-guide/configuration "Configuration | Hermes Agent"
