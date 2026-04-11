<div align="center">

<h1 style="font-size: 6em; font-weight: 900; margin-bottom: 0.2em; letter-spacing: 0.1em;">元</h1>
<p style="font-size: 1.2em; color: #7c3aed; font-weight: 600; margin-top: 0;">META_KIM</p>
<p style="color: #dc2626; font-weight: 700; margin-bottom: 0.5em;">⚠️ BETA VERSION — Work in Progress</p>

<p>
  <a href="README.md">English</a> |
  <a href="README.zh-CN.md">简体中文</a> |
  <a href="README.ja-JP.md">日本語</a> |
  <a href="README.ko-KR.md">한국어</a>
</p>

<p>
  <img alt="Runtime" src="https://img.shields.io/badge/runtime-Claude%20Code%20%7C%20Codex%20%7C%20OpenClaw%20%7C%20Cursor-111827"/>
  <img alt="Stars" src="https://img.shields.io/github/stars/KimYx0207/Meta_Kim?style=flat&logo=github"/>
  <img alt="Forks" src="https://img.shields.io/github/forks/KimYx0207/Meta_Kim?style=flat&logo=github"/>
  <img alt="Skill" src="https://img.shields.io/badge/skill-meta--theory%20v2.0.0-7c3aed"/>
  <img alt="License" src="https://img.shields.io/badge/license-MIT-green"/>
</p>

</div>

<!-- 维护者：GitHub 仓库 About 描述建议（勿写「运行时镜像系统」易误解为只做同步）。中文示例：AI 编码助手的治理层：统一元角色、工作流纪律与 meta-theory；主源在 .claude/，并生成 Codex / OpenClaw 的配套副本。 -->

## 简介

**Meta_Kim** 是 AI 编码助手的治理层：一套统一的治理逻辑，同时在 Claude Code、Codex、OpenClaw、Cursor 四个运行时上工作，让复杂任务**做对了再做**。

多数工具上来就写代码；Meta_Kim 在中间加了一步：先搞清楚你到底要什么，再计划谁干什么，最后才执行并审查。结果是跨文件改动少翻车，agent 职责更清晰，沉淀可复用模式而不是一次性 hack。

### 要点速览

- 8 个专业元角色，统一走一个默认公开入口
- **一套统一的治理逻辑**，投影到 Claude Code、Codex、OpenClaw、Cursor 四个运行时
- 每个复杂任务走：追问澄清 → 搜索能力 → 执行 → 审查 → 沉淀进化
- **四条铁律**：追问强于猜测、搜索强于假设、计划强于冲动、验证强于信任
- 纪律：一个部门、一个主交付物、一条闭合交付链
- 长期主源主要在 `canonical/` 和 `config/contracts/workflow-contract.json`


## 它适合谁

### 适合

- 你要处理多文件、跨模块、跨运行时的复杂任务
- 你在维护一套 agent / skill / hook / MCP 的工程资产
- 你希望 AI 协作是可审查、可回滚、可持续维护的

### 不适合

- 你只想临时问几个简单问题
- 你平时只改单个文件，不需要分工和治理
- 你想把它当成一个即装即用的 SaaS 产品

## 联系方式与支持

<div align="center">
  <img src="docs/images/%E4%BA%8C%E7%BB%B4%E7%A0%81%E5%9F%BA%E7%A1%80%E6%AC%BE.png" alt="联系方式" width="560"/>
  <p>
    GitHub <a href="https://github.com/KimYx0207">KimYx0207</a> |
    𝕏 <a href="https://x.com/KimYx0207">@KimYx0207</a> |
    官网 <a href="https://www.aiking.dev/">aiking.dev</a> |
    微信公众号：<strong>老金带你玩AI</strong>
  </p>
  <p>
    飞书知识库：
    <a href="https://my.feishu.cn/wiki/OhQ8wqntFihcI1kWVDlcNdpznFf">长期更新入口</a>
  </p>
</div>

<div align="center">
  <table align="center">
    <tr>
      <td align="center">
        <img src="docs/images/%E5%BE%AE%E4%BF%A1.jpg" alt="微信收款码" width="220"/>
        <br/>
        <strong>微信支付</strong>
      </td>
      <td align="center">
        <img src="docs/images/%E6%94%AF%E4%BB%98%E5%AE%9D.jpg" alt="支付宝收款码" width="220"/>
        <br/>
        <strong>支付宝</strong>
      </td>
    </tr>
  </table>
</div>

### 方法依据与论文

Meta_Kim 的方法依据来自“基于元的意图放大”评测与方法沉淀：

- 论文页面：<https://zenodo.org/records/18957649>
- DOI：`10.5281/zenodo.18957649`

论文负责解释方法论基础。本仓库负责把这套方法落成可运行的工程资产。

## 安装与初始化

<a id="install-quick-zh"></a>

**后半篇怎么读（任选）：** 只想装完能用 → 跟完下面「一键安装 / 手动安装」，再跳到 [使用指南](#使用指南)；要搞清四端、角色与命令表 → 从 [使用指南](#使用指南) 顺着读；要啃契约、八阶段与 run 产物 → 读 [原理与设计](#原理与设计)。在 Claude Code 里走治理方法论 → 输入 **`/meta-theory`**（见 [`meta-theory` 技能](#meta-theory-skill-zh)）。

### 环境要求

- **Node.js** v18+（用于 sync、validate、OpenClaw 脚本）
- **Git**（用于克隆项目）
- **Python** 3.10+（可选，用于 graphify 代码知识图谱）
- **Claude Code CLI**（可选，仅在运行 `eval:agents` 时需要）
- **Codex CLI**（可选，仅在运行 `eval:agents` 时需要）
- **OpenClaw CLI**（可选，仅在运行 `npm run prepare:openclaw-local` 时需要）

### 一键安装（推荐）

**无需先 clone（`npx` 会临时拉取仓库并执行安装向导）：**

```bash
npx --yes github:KimYx0207/Meta_Kim meta-kim
```

**指定界面语言且只做环境检查（不写盘、不安装）：** `--lang` 与 `setup.mjs` 一致，取值为 `en`、`zh-CN`、`ja-JP`、`ko-KR`。

<div align="center">

| 界面语言 | 命令 |
| --- | --- |
| English | `npx --yes github:KimYx0207/Meta_Kim meta-kim -- --lang en --check` |
| 简体中文 | `npx --yes github:KimYx0207/Meta_Kim meta-kim -- --lang zh-CN --check` |
| 日本語 | `npx --yes github:KimYx0207/Meta_Kim meta-kim -- --lang ja-JP --check` |
| 한국어 | `npx --yes github:KimYx0207/Meta_Kim meta-kim -- --lang ko-KR --check` |

</div>

**经典方式（克隆后进目录）：**

```bash
git clone https://github.com/KimYx0207/Meta_Kim.git
cd Meta_Kim
node setup.mjs
```

<div align="center">

| 用法 | 说明 |
| --- | --- |
| `npx --yes github:KimYx0207/Meta_Kim meta-kim` | 与 `node setup.mjs` 相同，省略手动 `git clone` / `cd` |
| `node setup.mjs` | 交互式向导（选语言 → 安装 / 更新 / 检查，并选择本机 active runtimes） |
| `node setup.mjs --targets claude,codex` | 非交互指定启用运行时 | 保存本机 `activeTargets`，只对这些 runtime 做本机同步/安装 |
| `node setup.mjs --lang en` | 跳过语言选择，界面英语 |
| `node setup.mjs --lang zh-CN` | 跳过语言选择，界面简体中文 |
| `node setup.mjs --lang ja-JP` | 跳过语言选择，界面日本語 |
| `node setup.mjs --lang ko-KR` | 跳过语言选择，界面 한국어 |
| `node setup.mjs --update` | 更新所有技能和依赖（询问安装范围） |
| `node setup.mjs --check` | 环境 + 依赖 + 跨运行时同步检查 |
| `node setup.mjs --silent` | 非交互模式（CI / 脚本） |
| `node setup.mjs --targets claude,codex,openclaw` | 非交互多运行时激活 |

</div>

向导流程与 `--check` 行为见上表；完整步骤见下文 [手动安装（逐步）](#manual-install-zh)。

> **第三方元技能 findskill**：请**以本仓库为准**。`setup.mjs` 安装 **`KimYx0207/findskill`**（在公开生态能力上的维护与优化版）至 `~/.claude/skills/findskill/`。**本仓库内文档与 agent 统一使用名称 `findskill`**，勿与旧写法混用。勿在不同渠道重复安装同能力。

> 纯 Node.js 脚本，Windows / macOS / Linux 通用，不依赖 bash。

---

<a id="manual-install-zh"></a>

### 手动安装（逐步）

下面是更完整的维护者手动流程。它覆盖了 `node setup.mjs` 的核心安装动作，并额外补上 runtime 镜像同步、全局能力发现和全局 meta-theory 便携技能同步。

#### 1. 克隆并安装依赖

```bash
git clone https://github.com/KimYx0207/Meta_Kim.git
cd Meta_Kim
npm install
```

#### 2. 同步四端镜像

```bash
npm run sync:runtimes
```

作用：

- 从 `.claude/` 主源重新生成 Codex / OpenClaw / shared-skills 镜像
- 检查主源和派生产物是否一致

如果你只是想确认有没有不同步，也可以用：

```bash
npm run check:runtimes
```

#### 3. 安装元技能依赖（可选，但推荐）

```bash
npm run deps:install
```

这一步会把 Meta_Kim 依赖的 9 个社区 skill 安装到 `~/.claude/skills/`。

注意：

- 这是 **Claude Code 生态** 的全局安装，不是安装到当前仓库里
- 这个脚本通过 `bash install-deps.sh` 运行
- **Windows 用户请确保机器上有 `bash`**，通常用 Git Bash 或 WSL 即可

更新这些依赖时用：

```bash
npm run deps:update
```

#### 4. 扫描全局能力

```bash
npm run discover:global
```

这一步会扫描你电脑里的全局能力，并生成：

```text
.claude/capability-index/meta-kim-capabilities.json
.claude/capability-index/global-capabilities.json   # 兼容镜像
```

扫描范围包括：

- `~/.claude/`：agents、skills、hooks、plugins、commands
- `~/.openclaw/`：agents、skills、hooks、commands
- `~/.codex/`：agents、skills、commands

如果你想先看 CLI 探测结果，可以先跑：

```bash
npm run probe:clis
```

#### 5. 可选：同步全局 meta-theory 便携技能

```bash
npm run show:global:meta-theory-targets
npm run sync:global:meta-theory
```

这一步会把 canonical 的 `canonical/skills/meta-theory/` 同步到用户级 runtime home。默认按本机 `activeTargets` 执行，也可以用 `--targets claude,codex` 显式覆盖：

- `~/.claude/skills/meta-theory`
- `~/.openclaw/skills/meta-theory`
- `~/.codex/skills/meta-theory`

如果你只想检查有没有漂移，用：

```bash
npm run check:global:meta-theory
```

需要显式指定用户级 runtime home 时，可设置：

- `META_KIM_CLAUDE_HOME` 或 `CLAUDE_HOME`
- `META_KIM_OPENCLAW_HOME` 或 `OPENCLAW_HOME`
- `META_KIM_CODEX_HOME` 或 `CODEX_HOME`

#### 6. 做项目完整性校验

```bash
npm run validate
```

这会检查：

- 必要文件是否存在
- workflow contract 是否完整
- 8 个 Claude agents 是否合规
- OpenClaw workspaces 是否齐全
- `SKILL.md` 多端镜像是否同步
- Codex agents 是否有效
- hooks / MCP / package scripts 是否配置正确

#### 7. 跑一次 MCP 自测

```bash
npm run test:mcp
```

这一步会自测 `meta-runtime-server`，也是 `node setup.mjs` 默认会执行的一项检查。

#### 8. 需要时再跑轻量运行时 smoke

```bash
npm run eval:agents
```

默认的 `eval:agents` 是轻量、无 LLM 的 runtime smoke：

- 可用且通过的运行时会显示 `passed`
- 没装或当前不可用的可选运行时可能显示 `skipped`
- 配置错误、注册表接线错误会显示 `failed`
- 它**不会**主动打开 Claude / Codex / OpenClaw 的实时 prompt 会话

如果你明确要跑较慢的、带实时 prompt 的运行时验收：

```bash
npm run eval:agents:live
```

全部一起跑：

```bash
npm run verify:all
```

需要完整 live 验收时：

```bash
npm run verify:all:live
```

如果你手头有真实 run artifact，想核对整个 packet 链：

```bash
npm run validate:run -- tests/fixtures/run-artifacts/valid-run.json
```

#### 9. OpenClaw 本地运行前，额外准备一次

```bash
npm run prepare:openclaw-local
```

只有你准备在本机真正跑 OpenClaw 时才需要这一步。

#### 10. 快速健康度检查

```bash
node scripts/agent-health-report.mjs
```

可以快速看 8 个 agent 的版本号、frontmatter 完整性、边界定义、workspace 文件和 skill 同步状态。

#### 11. 开始使用（Claude Code）

你可以直接说：

```text
认证系统要重构，散在 5 个文件里，没人知道 token 刷新到底是哪个文件在处理。
```

```text
帮我设计一个 agent，处理这个项目的数据导出任务。
```

```text
有问题，我的 agent 写的代码老是互相冲突。
```

系统会根据任务类型，把请求路由到匹配的治理阶段。

## 使用指南

### 四个运行时怎么承接

最重要的一句：

**Meta_Kim 只有一套方法，不是四个独立项目。**

<div align="center">

| 运行时 | 入口 | 仓库里的主要落点 | 角色 |
| --- | --- | --- | --- |
| Claude Code | [CLAUDE.md](CLAUDE.md) | `.claude/`、`.mcp.json` | 规范主源和默认编辑运行时 |
| Codex | [AGENTS.md](AGENTS.md) | `.codex/`、`.agents/`、`codex/` | Codex 原生 custom agents / skills 映射 |
| OpenClaw | `openclaw/workspaces/` | `openclaw/` | OpenClaw 本地 workspace 映射 |
| Cursor | `.cursor/agents/` | `.cursor/` | Cursor agent 与 MCP 投影 |

</div>

一图概括「**同一套方法，四处落地**」（细部与同步命令见 [原理与设计 · 元架构视角](#元架构视角) 主源图示）：

```mermaid
flowchart LR
  SRC[主源 .claude 与 contracts] --> CC[Claude Code 编辑运行时]
  SRC -->|镜像| CX[Codex]
  SRC -->|workspace 映射| OW[OpenClaw]
  SRC -->|agent 投影| CU[Cursor]
```

关键点：

- **Claude Code 是 canonical（正典 / 主编辑源）编辑运行时。**
- 长期主源主要在 `canonical/` 和 `config/contracts/workflow-contract.json`。
- `.codex/`、`.agents/`、`openclaw/`、`.cursor/` 里大多数内容是同步产物或运行时适配层。
- 改完主源以后，再用脚本把四端重新对齐。

#### 各运行时怎么接

##### 在 Claude Code 里

Claude Code 自动读取 `CLAUDE.md`、`.claude/agents/`、`.claude/skills/`、`.mcp.json`。打开项目直接聊。

<a id="meta-theory-skill-zh"></a>

###### `meta-theory` 技能（治理方法论）

**meta-theory** 是可随仓库同步的治理技能（主源 [`canonical/skills/meta-theory/SKILL.md`](canonical/skills/meta-theory/SKILL.md)）。在 Claude Code 中可**由用户主动唤起**：输入 **`/meta-theory`** 即可加载。它会区分 **元架构**（agent 边界、协作、治理）与 **项目技术架构**（栈、模块、代码组织），把请求归入 A–E 类流程，并沿八阶段脊柱推进（**Critical → Fetch → Thinking → Execution → Review → Meta-Review → Verification → Evolution**）。它是**调度层**，不能代替具名 agent 的执行：**Gate 3 强制要求 meta-theory 在分派任何执行 agent 之前，必须将分派决策交给 `meta-warden` 验证通过** — `meta-warden` 既是默认公开前门，也是验证分派决策、强制调度纪律的角色。

##### 在 Codex 里

Codex 读取 `AGENTS.md`、`.codex/agents/`、`.agents/skills/`，MCP 接法见 `codex/config.toml.example`。注意：**Codex 是读取 / 执行运行时，不是主编辑运行时**。你应该先在 `.claude/` 改，再通过 `npm run sync:runtimes` 同步到 Codex。

##### 在 OpenClaw 里

```bash
npm install
npm run prepare:openclaw-local
```

然后可直接调用：

```bash
openclaw agent --local --agent meta-warden --message "帮我搞一个批量数据导出的系统，要带进度跟踪。" --json --timeout 120
```

##### 在 Cursor 里

Cursor 读取 `.cursor/agents/` 目录下的 agent 定义和 `.cursor/mcp.json` 的 MCP 配置。这些都是从主源生成的投影：

```bash
npm run sync:runtimes -- --targets cursor
```

这会生成 `.cursor/agents/meta-warden.md`（以及其他 7 个 agent）、`.cursor/skills/meta-theory/` 和 `.cursor/mcp.json`。Cursor agent 使用纯 Markdown 格式（无 YAML frontmatter）。

### 8 个元角色

<div align="center">

| Agent | 主要职责 | 你可以怎么理解 |
| --- | --- | --- |
| `meta-warden` | 默认入口、仲裁、最终汇总 | 项目经理 / 总协调 |
| `meta-conductor` | 编排阶段、控制节奏 | 调度员 |
| `meta-genesis` | 设计 `SOUL.md`、人格和认知结构 | 提示词 / 角色架构师 |
| `meta-artisan` | skill、MCP、工具装配 | 工具与能力工程师 |
| `meta-sentinel` | 安全、权限、hook、回滚 | 安全与守卫 |
| `meta-librarian` | 记忆、上下文、连续性 | 知识管理员 |
| `meta-prism` | 质量审查、漂移检测、反 AI 套话 | 质量法医 |
| `meta-scout` | 外部能力发现与评估 | 侦察与选型 |

</div>

组织关系（**只记前门**即可，不必先背全表）：

```mermaid
flowchart LR
  U[用户意图] --> W[meta-warden 默认前门]
  W --> R[其余 7 元角色 后台专精]
```

如果你是普通使用者，只需要记住一件事：

**默认公开前门是 `meta-warden`。**

入口与 skill、八阶段开合关系的**略图**见 [原理与设计 · 元架构视角](#元架构视角)（默认路径与主源闭环图示）。

### 系统怎么工作

你不需要知道内部机制。但如果你好奇，下面是一张**外行可读的执行链**（与上文「略图」互补：这里偏「一次任务里发生什么」）：

```mermaid
flowchart TD
    A[你说你要什么] --> B[系统澄清范围]
    B --> C[搜索现有能力]
    C --> D[分配给专家]
    D --> E[agent 执行]
    E --> F[审查产出]
    F --> G[沉淀模式]
```

任务类型怎么分流、多路径怎么叠在一起，见 [项目里的流程关系总图](#项目里的流程关系总图)。

每一条有效的业务 run，都必须保持一条唯一主线：

- 一个部门
- 一个主交付物
- 一条闭合交付链

如果同一轮里塞进多个互不相干的目标，`meta-conductor` 应该直接打回，`meta-warden` 也不应让它进入公开展示态。

### 怎么用

#### 自动模式（正常聊天就行）

复杂任务直接描述你的需求。系统检测到跨文件或跨模块的工作时，治理流程自动激活。

```text
帮我搞一个通知系统，邮件、短信、站内信都要，带共享队列和重试逻辑。
```

```text
支付流程在 3 个服务之间有竞态条件，修一下，再补上错误处理。
```

系统会：追问澄清（如果需要）→ 搜索现有 agent → 路由给对的人 → 执行 → 审查 → 沉淀模式。

如果 Fetch 发现没有合适 owner，正常路径不是“直接硬做”，而是：

- 先判断这是长期缺口还是一次性缺口
- 长期缺口：先走 Type B 补 owner，再执行
- 一次性低风险缺口：允许临时 `generalPurpose` owner 兜底，但必须在 Evolution 里复盘是否要升格

如果你把真实治理 run 记录成 JSON，可以直接验：

```bash
npm run validate:run -- tests/fixtures/run-artifacts/valid-run.json
```

这个脚本不只是看字段齐不齐，还会检查 findingId 是否贯通、closeState 是否合法、delivery shell 是否可追溯，以及 `publicReady` 有没有被乱标。

#### 手动模式（你知道你要什么的时候）

如果你明确要设计、审查、审计 agent：

```text
帮我设计一个 agent，处理这个项目的数据导出任务。
```

```text
审查一下我的 agent 定义，边界干不干净？
```

```text
我的 agent 职责老是重叠，帮我修正组织结构。
```

### 项目结构

（树状图在部分阅读器里会因**居中**与**中英混排**错位；下表与仓库布局一致，对齐稳定。）

<div align="center">

| 路径 | 说明 |
| --- | --- |
| `.claude/` | 主源：agents、skills、hooks、settings |
| `.codex/` | Codex custom agents 镜像 |
| `.agents/` | Codex 项目级 skills 镜像 |
| `codex/` | Codex 全局配置示例 |
| `openclaw/` | OpenClaw workspaces、skills、配置模板 |
| `.cursor/` | Cursor agent 与 MCP 投影（生成产物） |
| `config/contracts/` | 运行时治理合约 |
| `docs/` | 内部/私有说明文档，以及少量已纳入版本控制的 runtime 文档 |
| `scripts/` | 同步、校验、探测、MCP、自检脚本 |
| `shared-skills/` | 跨运行时共享 skill 镜像 |
| `README.md` | 英文主文档（外链锚点常以本文为基准） |
| `README.zh-CN.md` | 简体中文 |
| `README.ja-JP.md` | 日本語 |
| `README.ko-KR.md` | 한국어 |
| `CLAUDE.md` | Claude Code 项目入口说明 |
| `AGENTS.md` | Codex 项目入口说明 |
| `CHANGELOG.md` | 变更记录 |

</div>

#### 你应该优先改哪里

长期维护时，优先编辑这些文件：

- `canonical/agents/*.md`
- `canonical/skills/meta-theory/SKILL.md`
- `canonical/skills/meta-theory/references/*.md`
- `config/contracts/workflow-contract.json`
- `README.md`
- `README.zh-CN.md`
- `README.ja-JP.md`
- `README.ko-KR.md`
- `CLAUDE.md`
- `AGENTS.md`

#### 哪些文件通常不要手改

除非你很清楚自己在做什么，否则不要把这些当主源：

- `.codex/agents/*.toml`
- `.agents/skills/meta-theory/`
- `.codex/skills/meta-theory.md`
- `shared-skills/meta-theory.md`
- `openclaw/skills/meta-theory.md`
- `openclaw/workspaces/*`

这些通常由脚本维护：

- `npm run sync:runtimes`

#### 为什么会有 `codex/`

Codex 的配置分两层：

- 仓库内资产：放在 `.codex/` 和 `.agents/`
- 用户电脑里的全局配置：不能直接写进仓库根部

所以：

- `.codex/` 是 Codex 真正会直接读取的仓库内内容
- `codex/` 只是一个配置示例目录，用来说明 `~/.codex/config.toml` 应该怎么接

### Hooks（Claude Code）

Meta_Kim 在 `.claude/settings.json` 中配置了 8 个 hook 脚本（`Stop` 事件上会顺序执行其中 2 个）：

<div align="center">

| Hook | 类型 | 用途 |
| --- | --- | --- |
| `block-dangerous-bash.mjs` | PreToolUse/Bash | 阻止危险命令（rm -rf、DROP TABLE、force-push） |
| `pre-git-push-confirm.mjs` | PreToolUse/Bash | `git push` 前提醒检查 |
| `post-format.mjs` | PostToolUse/Edit,Write | 自动 prettier 格式化 JS/TS 文件 |
| `post-typecheck.mjs` | PostToolUse/Edit,Write | 编辑 `.ts` / `.tsx` 后自动做类型检查 |
| `post-console-log-warn.mjs` | PostToolUse/Edit,Write | 编辑后检测 `console.log` 并警告 |
| `subagent-context.mjs` | SubagentStart | 给子 agent 注入项目上下文 |
| `stop-console-log-audit.mjs` | Stop | 会话结束前审计改动文件里的 `console.log` |
| `stop-completion-guard.mjs` | Stop | 可选弱哨兵：防未对齐治理流程就宣称「完成」（默认关闭，靠环境变量开启） |

</div>

Codex 和 OpenClaw 使用各自原生机制实现等效行为。

### 代码知识图谱（graphify）（进阶）

Meta_Kim 可以利用 [graphify](https://github.com/safishamsi/graphify)（`pip install graphifyy`）为**目标项目**生成压缩的代码知识图谱 — 不是 Meta_Kim 自身。通过子图提取代替全文件读取，最高实现 **71 倍 token 压缩**。

#### 工作原理

1. **graphify** 在目标项目根目录生成 `graphify-out/graph.json`（NetworkX node-link JSON，含节点、边、置信度分数）
2. Meta_Kim 的 Fetch 阶段自动检测图谱 — 无需手动干预
3. 所有派发智能体通过 `subagent-context.mjs` hook 获得图谱上下文
4. 复杂项目（图谱节点 >50）可自动通过 Type B 管线创建**项目级编排智能体**

#### 自动触发条件

当以下条件**全部满足**时自动使用图谱上下文：
- 源文件数 > 20（排除 `node_modules/`、`.git/`、`dist/`）
- 已安装 Python 3.10+
- 已安装 graphify（`pip install graphifyy`）
- 当前项目不是 Meta_Kim 自身

#### 安装

```bash
# 通过 setup.mjs（交互式，自动检测 Python）
node setup.mjs

# 通过 install-deps.sh
npm run deps:install

# 手动安装
pip install graphifyy && graphify claude install

# 检查状态
npm run graphify:check
```

#### 质量门控

- AMBIGUOUS 节点占比 > 30% → 图谱标记为低质量，智能体以直接 `Read` 为主
- 节点总数 < 10 → 图谱过于稀疏，回退到 `Glob`/`Grep`
- God nodes（入度高的节点）→ 标记为串行瓶颈，由 `meta-conductor` 处理

### 这些命令什么时候要跑

<div align="center">

| 命令 | 什么时候用 | 作用 |
| --- | --- | --- |
| `npx --yes github:KimYx0207/Meta_Kim meta-kim` | **不想先 clone** | 与 `node setup.mjs` 相同（`npx` 会拉取本仓库） |
| `node setup.mjs` | **首次拉仓库** | **交互式向导：语言 → 安装 / 更新 / 检查 + 选择本机 active runtimes** |
| `node setup.mjs --update` | 依赖/技能需要更新时 | 更新所有技能（询问安装范围：project/global/both） |
| `node setup.mjs --check` | 想先做环境体检时 | 环境 + 依赖 + 跨运行时同步验证 |
| `npm install` | 手动安装时 | 安装 Node 依赖 |
| `npm run sync:runtimes` | 改完主源后 | 重建四端镜像（默认：project 范围 → repo 本地目录） |
| `npm run sync:runtimes -- --scope project` | 仅 repo 本地同步 | 写到 `.claude/`、`.codex/`、`openclaw/`、`shared-skills/` |
| `npm run sync:runtimes -- --scope global` | 仅全局运行时目录 | 写到 `~/.claude/`、`~/.codex/`、`~/.openclaw/` |
| `npm run sync:runtimes -- --scope both` | 同时同步两个范围 | 同时写到 repo 本地和全局目录 |
| `npm run sync:runtimes -- --scope global --targets claude` | 全局 + 仅 Claude | 只写到 `~/.claude/` |
| `npm run sync:runtimes -- --check` | 预览改动不写入 | 显示哪些文件会更新 |
| `npm run check:runtimes` | 不想写文件时 | 只检查镜像是否最新 |
| `npm run show:global:meta-theory-targets` | 想确认会写到哪些用户级目录 | 打印 Claude / OpenClaw / Codex 的全局 meta-theory 目标及 Claude hooks 路径 |
| `npm run sync:global:meta-theory` | 改了 canonical `meta-theory` 或 `canonical/runtime-assets/claude/hooks` 后 | 默认按本机 `activeTargets` 同步用户级 `meta-theory`；若启用 Claude，还会把 hooks 复制到 `~/.claude/hooks/meta-kim/` 并合并到 `~/.claude/settings.json` |
| `npm run sync:global:meta-theory -- --skip-global-hooks` | 不能动用户级 settings/hooks 时 | 同上但不写 Claude 全局 hooks |
| `npm run check:global:meta-theory` | 不想改用户级文件时 | 检查全局 meta-theory 与 Claude `hooks/meta-kim` 是否与 canonical 一致 |
| `npm run deps:install` | 第一次配置 Claude 生态 | 安装 9 个全局元技能 |
| `npm run deps:update` | 依赖需要更新时 | 更新已安装的元技能 |
| `npm run deps:install:all-runtimes` | 需要给本机 `activeTargets` 装同一套 skills | 把同一批 skill 仓库 clone 到已启用 runtime 的 home；若启用了 Claude 且 PATH 上有 `claude`，会执行 `claude plugin install superpowers@claude-plugins-official` |
| `npm run deps:update:all-runtimes` | 四端 skills 都要更新 | 同上并带 `--update` |
| `npm run deps:install:claude-plugins` | 只装 Claude Code 官方 plugin 包 | 只跑 `claude plugin install …`，不做 git clone |
| `npm run graphify:check` | 检查 graphify 是否可用 | 验证 Python 3.10+ 和 graphify CLI |
| `npm run graphify:install` | 安装 graphify | `pip install graphifyy` + 注册 Claude 技能 |
| `npm run graphify:update` | 更新目标项目图谱 | 对目标项目执行增量 `graphify --update` |
| `npm run discover:global` | 首次安装后、装了新全局能力后 | 生成 `.claude/capability-index/meta-kim-capabilities.json`（并同步兼容镜像 `global-capabilities.json`） |
| `npm run index:runs -- <目录或文件>` | 录完 governed run 后 | 先做 contract 校验，再把合法 run 索引进 `.meta-kim/state/{profile}/run-index.sqlite` |
| `npm run query:runs -- --owner meta-warden` | 想快速做 continuity / retrieval 时 | 按 flow、owner、publicReady、open findings 查询本地 run index |
| `npm run rebuild:run-index -- <目录或文件>` | 想重建本地索引时 | 清空并重建 profile-local SQLite run index |
| `npm run migrate:meta-kim -- <source-dir> --apply` | 从 prompt pack / 单 agent 仓库迁入时 | 只暂存 persona / skill / contract 相关资产，拒绝导入未验证 run state |
| `npm run probe:clis` | 怀疑 CLI 没配好时 | 探测 Claude / Codex / OpenClaw CLI |
| `npm run test:mcp` | 改了 MCP 相关逻辑时 | 自测 `meta-runtime-server` |
| `npm run test:meta-theory` | 改了 `meta-theory` skill / contract / tests 时 | 跑 `tests/meta-theory/*.test.mjs` |
| `npm run validate` | 每次准备提交前 | 做静态完整性校验 |
| `npm run validate:run -- <run.json>` | 要校验真实 run 产物链时 | 检查 packet 对齐、finding closure、summary/public-ready 是否真实 |
| `npm run doctor:governance` | 发布前或怀疑 hook/镜像漂移时 | 分层体检：canonical contract + mirror parity + runtime hooks + 本地 profile/run-index 健康 |
| `npm run prompt:next-iteration -- <run.json>` | run 未过校验或 finding 未关时 | 从 artifact 打印下一轮闭环待办 |
| `npm run check` | 想快速做一轮静态检查 | `check:runtimes + validate` |
| `npm run eval:agents` | 要快速做一轮 runtime smoke 时 | 做 CLI / 配置 / hook / registry 级别的轻量检查，不跑 LLM prompt 验收 |
| `npm run eval:agents:live` | 要做真实 live 运行时验收时 | 运行较慢的 Claude / Codex / OpenClaw prompt 验收 |
| `npm run verify:all` | 发布前 / 大改后 | `check + check:global:meta-theory + 轻量 eval + tests` |
| `npm run verify:all:live` | runtime 敏感发布前 | `check + check:global:meta-theory + live eval + tests` |
| `node scripts/agent-health-report.mjs` | 想看总体健康度时 | 生成 8 个 agent 的健康报告 |

</div>

**Windows / PATH：** 从图形界面或编辑器里启动任务时，Node 子进程继承到的 `PATH` 有时比你单独开的终端更短。遇到 `eval:agents` 找不到 CLI 时，优先检查 `%APPDATA%\\npm\\`、`where.exe` 结果，仍不行就设置绝对路径环境变量：

- `META_KIM_CLAUDE_BIN`
- `META_KIM_CODEX_BIN`
- `META_KIM_OPENCLAW_BIN`

### 一个安全的维护流程

如果你要改 agent、skill、README 或运行时配置，推荐始终按这个顺序做：

1. 改 `.claude/` 主源或公共说明文件
2. 如果改动涉及调度纪律、闸门或交付合约，同时更新 `config/contracts/workflow-contract.json`
3. 跑 `npm run sync:runtimes`
4. 如果改了 canonical `meta-theory`，并且你维护用户级 runtime home，再跑 `npm run sync:global:meta-theory`
5. 跑 `npm run discover:global`
6. 跑 `npm run validate`
7. 如果改了 MCP runtime 相关逻辑，再跑 `npm run test:mcp`
8. 需要 smoke 级运行时验收时，再跑 `npm run eval:agents`
9. 只有明确需要 live prompt 验收时，再跑 `npm run eval:agents:live`

这样最不容易把四端镜像改乱。

### 新手最常见的 10 个问题

#### 1. 我必须同时安装 Claude Code、Codex、OpenClaw、Cursor 吗？

不用。你可以只用其中一个运行时。Meta_Kim 设计成跨运行时兼容，但不是强制四端全装。

#### 2. 我能不能只改 `.codex/` 或 `openclaw/`？

技术上可以，长期维护上不推荐。大多数情况下，你应该改 `.claude/` 主源，再同步。

#### 3. `discover:global` 生成的索引要提交吗？

通常不用。`meta-kim-capabilities.json` 以及兼容镜像 `global-capabilities.json` 都是本机能力索引，带本地路径，按机器重新生成。

#### 4. 旧 prompt pack / 单 agent 仓库怎么迁到 Meta_Kim？

先用本地迁移脚本做 staging：

```bash
npm run migrate:meta-kim -- ../old-agent-repo --apply
```

它会把 persona / skill / contract 相关资产暂存到 `.meta-kim/state/{profile}/migrations/...`，并明确拒绝未验证 run state、SQLite 缓存、日志和 artifacts。先审 `manifest.json`，再决定哪些内容值得进入 `canonical/` 或 `config/contracts/`。

#### 4. `eval:agents` 里看到 `skipped` 是不是就说明项目坏了？

不一定。`skipped` 常见原因是对应 CLI 没装，或者对应 runtime 当前不可用。真正的硬失败会标成 `failed`。

#### 5. `eval:agents` 和 `eval:agents:live` 有什么区别？

`eval:agents` 是轻量 runtime smoke，只检查 CLI 可用性、配置接线、hook 和 runtime scaffolding，不主动打开 LLM prompt 会话。

`eval:agents:live` 是更重的 live runtime 验收，会真实调用 Claude / Codex / OpenClaw，会慢很多。

#### 6. 为什么默认入口不是 8 个 agent 直接给用户选？

因为 Meta_Kim 的设计目标不是“给你一排角色菜单”，而是先用统一前门接住需求，再在后台做分工。

#### 7. 什么情况下可以不走 agent？

只有纯 `Q / Query`。也就是纯解释、纯问答、没有改代码、没有外部副作用、没有交付链要求。只要任务会执行、会产生产物、会进入审查或验证，就必须有 owner。

#### 8. `.claude/skills/meta-theory/references/meta-theory.md` 是不是必读？

不是。它更像从 canonical skill references 映射出来的方法长文。第一次上手先读本 README 即可。

#### 9. 我只想看仓库地图，应该读什么？

直接读本 README 里的仓库结构树即可。

#### 10. 我想看四端能力差异，应该读什么？

内部说明：运行时一致性参考在 `docs/` 下，不属于公开内容。

### 最简单的开始方式

上面的 [安装与初始化章节](#install-quick-zh) 已经包含了从克隆到跑起来的完整步骤。

如果你是第一次接触这个项目，按下面顺序最省力：

1. 先读本文件 `README.zh-CN.md`
2. 再读 [CLAUDE.md](CLAUDE.md) 或 [AGENTS.md](AGENTS.md)
3. 再看本 README 里的仓库结构树
4. 需要方法细节时再读 `.claude/skills/meta-theory/references/meta-theory.md`

## 原理与设计

以下章节适合在**完成安装并开始使用**之后阅读。相对文首「简介」：那里是一句话定位与要点列表；**这里展开**失败模式、工程分层、八阶段脊柱（Critical / Fetch / Thinking …）、契约与状态骨架——**配图嵌在讲到该概念的各节里**，不单独堆一整块「流程图附录」。不重复抄简介，只补推理链。

### 这是什么项目

Meta_Kim 不是“让 AI 多写点代码”的项目，它解决的是另一类问题：

- 需求是模糊的，AI 容易乱猜
- 改动跨多个文件或模块，AI 容易串改
- 同一套 agent / skill / 配置要同时跑在多个运行时里，容易越改越乱
- 改完之后没人做统一审查、验证和经验沉淀

Meta_Kim 的核心思路是：先做 **意图放大**，再做执行。

这里的“意图放大”，用人话说就是：

- 把一句模糊的话补成可执行任务
- 把任务边界、约束、交付物和风险说清楚
- 把工作分给合适的角色，而不是让一个大上下文硬扛到底

工程上它同时组织这些层：

- `agent`：职责边界和组织角色
- `skill`：可复用能力块
- `MCP`：外部能力接口
- `hook`：运行时约束和自动化拦截
- `memory`：长期上下文与连续性
- `workspace`：运行时本地工作空间
- `sync / validate / eval`：同步、校验、验收工具链

一句话说：

**Meta_Kim 关心的不是“单次答得像不像”，而是“复杂任务能不能被持续、稳定、可治理地完成”。**

### 为什么它会越用越轻

在弄清「解决什么问题」之后，再看**长期成本曲线**：Meta_Kim 很吸引人的一点，不是“第一次就最省 token”，而是：

**它会把高成本的临时思考，逐步沉淀成可复用的长期能力资产。**

这意味着：

- **刚开始会更重**：因为你在补 agent、skill、hook、tool、contract、memory 和 review / verification 规则
- **越往后越轻**：因为很多任务不需要再从零现找能力、现补边界、现踩同样的坑
- **省下来的不是所有 token，而是重复性 token**：重复任务、同类任务、已知任务的平均成本会明显下降

更准确地说：

**Meta_Kim 的目标不是让每次任务都最便宜，而是把临时推理成本，慢慢转成一次建设、长期复用的能力成本。**

### 元架构视角

看这个仓库，最稳的方式不是把它理解成“一堆 prompt 加一些配置文件”，而是把它理解成一套分层治理系统：

- **理论主源层**：`.claude/skills/meta-theory/` 及其 `references/` 定义方法本身
- **组织主源层**：`canonical/agents/*.md` 定义 8 个元角色及其边界
- **契约主源层**：`config/contracts/workflow-contract.json` 及相关 contract 定义 run 纪律、闸门和交付闭环
- **运行时投影层**：`.codex/`、`.agents/`、`openclaw/`、`shared-skills/` 是同一套系统在不同运行时里的投影
- **工具与验证层**：`scripts/`、`validate`、`eval:agents`、`tests/meta-theory/` 负责让这些投影持续和主源对齐

所以，`Meta_Kim` 更准确的结构应该记成：

**一套 meta-theory 主源系统 -> 一套可治理的元组织 -> 一套 workflow contract -> 多 runtime 投影 -> 一条同步与验证闭环**

它的默认运行路径也不是偶然拼出来的，而是架构的一部分：

`用户意图 -> meta-warden -> Critical -> Fetch -> Thinking -> 专业角色执行 -> Review -> Verification -> Evolution`

对应的维护原则也很直接：

**优先改 `canonical/` 和 `config/contracts/`，然后再同步并校验各 runtime 镜像。**

<a id="meta-kim-visual-maps-zh"></a>

#### 图示：主源、工具链与运行时镜像

主源改在 `canonical/` 与 `config/contracts/`，经同步与校验落到四端镜像；与上表「分层」一一对应。英文版同构图示见 [README.md#meta-kim-visual-maps-en](README.md#meta-kim-visual-maps-en)。

```mermaid
flowchart TB
  subgraph Canon["主源层, 优先在这里改"]
    MT["meta-theory skill + references"]
    AG["agents 8 roles"]
    WC["workflow-contract.json"]
    HK["settings.json hooks"]
  end
  subgraph Tooling["工具链"]
    SYNC["npm run sync:runtimes"]
    VAL["npm run validate"]
    DISC["npm run discover:global"]
  end
  subgraph Mirror["运行时镜像, 多为同步生成"]
    CODEX[".codex + .agents"]
    OW["openclaw workspaces skills"]
    SK["shared-skills"]
  end
  MT --> SYNC
  AG --> SYNC
  WC --> SYNC
  HK --> SYNC
  SYNC --> CODEX
  SYNC --> OW
  SYNC --> SK
  DISC --> VAL
  HK --> VAL
  SK --> VAL
```

<a id="default-path-zh"></a>

#### 图示：默认路径（入口、meta-theory skill 与八阶段）

`meta-theory`（**skill**）是触发时加载的**方法说明书**；`meta-warden`（**agent**）是**默认公开入口角色**，负责闸门与综合收口。流程为：用户意图 → `meta-warden` 入口 → `meta-theory` 分类 + 制定分派计划 → **`meta-warden` 验证分派决策（Gate 3，不可跳过）** → agent 执行 → review → verify → evolve。下图是「意图进来之后先经过谁」的缩略关系（不是把八阶段展开，展开见 [复杂任务治理主轴](#complex-spine-zh)）。

```mermaid
flowchart LR
  U["用户意图"] --> W["meta-warden 入口"]
  W --> SK["meta-theory skill\n分类 + 分派计划"]
  SK --> V["meta-warden 验证\n分派决策 (Gate 3)"]
  V --> A["agent 执行"]
  A --> OUT["review verify evolve"]
```

### 元的理念

在 Meta_Kim 里：

**元 = 为了支持意图放大而存在的最小可治理单元。**

它至少要满足五个条件：

- 能独立理解
- 足够小，便于控制
- 边界清晰，知道自己不负责什么
- 可替换，不会一换就让系统整体塌掉
- 可复用，能被重复编排

Meta_Kim 不把“元”当修辞，而是把它当架构粒度。

#### 元和工程的关系

一个更接近项目设计的说法是：

**工程是元要治理的对象之一。元系统可以把工程任务纳入完整闭环，但元本身不等于一个全能工程师。**

这句话拆开看：

- **工程能做的事，元系统通常也能把它做成**，因为它可以通过 `Critical / Fetch / Thinking / Execution / Review / Meta-Review / Verification / Evolution` 这条链，把执行层 agent 编排起来。
- **但元自己不是直接包办所有工程细节的执行者**。项目主源明确要求：元理论是 dispatcher，不是 executor；只要是可执行任务，就应该交给具名 owner。
- **反过来，元能做的治理动作，普通工程流不一定天然会做**，比如 owner 解析、协议先行、review of review、验证闭环、Evolution 落盘。

如果你只想记一句，可以记成：

**工程是元的被治理域，不是元的下位替代品；元强在把工程做成闭环，而不是自己亲手做完一切工程。**

### 方法主线

Meta_Kim 的核心链路只有一条：

```mermaid
flowchart LR
    A["元"] --> B["组织镜像"]
    B --> C["节奏编排"]
    C --> D["意图放大"]
```

- `元`：怎么拆
- `组织镜像`：怎么组
- `节奏编排`：怎么发
- `意图放大`：怎么成

缺任何一段，这套方法都不完整。

**配图在哪里：** 主源与镜像、入口与 skill 的缩略关系见 [元架构视角](#元架构视角)；八阶段每一步的展开与铁律见 [复杂任务治理主轴](#complex-spine-zh)；「执行脊柱」与「部门业务合同」两套词汇的对照见 [八阶段脊柱和 business workflow 不是一回事](#meta-kim-diagram-two-layers-zh)；任务类型路网见 [项目里的流程关系总图](#task-routing-zh)。

<a id="complex-spine-zh"></a>

### 复杂任务治理主轴（核心必读）

**复杂任务**（多文件 / 跨模块 / 需要多种能力协作）走八阶段脊柱。前半段对应四条铁律：**先追问再猜、先搜索再假设、先计划再冲动、先验证再信任**，中间由 **Thinking** 产出牌组与交付外壳计划。

八阶段在纸面上很长，下图用**两行各四步**压缩高度；阶段全称与下表一致。（`flowchart TB` + 两个横向 `subgraph` 在 Mermaid 里常被排成左右并排，故拆成上下两个 `LR` 图，保证真·两排。）

**上行 1–4（澄清 → 执行）**

```mermaid
flowchart LR
  S1["1 Critical"] --> S2["2 Fetch"] --> S3["3 Thinking"] --> S4["4 Execution"]
```

**衔接：** `4 Execution` → `5 Review`

**下行 5–8（审查 → 进化）**

```mermaid
flowchart LR
  S5["5 Review"] --> S6["6 Meta-Review"] --> S7["7 Verification"] --> S8["8 Evolution"]
```

阶段全称与职责：1 澄清范围（元架构 vs 技术架构）；2 搜索 agent / skill；3 `dispatchBoard` / `mergeOwner`；4 派给 owner；5 质量边界；6 审查标准；7 闸门闭环；8 模式与伤疤写回。

与四条铁律的对齐（对应 1–3 阶段与审查）：

```mermaid
graph LR
  I1[追问强于猜测] --> I2[搜索强于假设]
  I2 --> I3[计划强于冲动]
  I3 --> I4[验证强于信任]
```

<div align="center">

| 阶段 | 作用 | 用人话解释 |
| --- | --- | --- |
| `Critical` | 澄清 | 先确认你到底要什么，不猜 |
| `Fetch` | 检索 | 先找现成能力，不假设不存在 |
| `Thinking` | 规划 | 设计拆分方式、交付物和顺序 |
| `Execution` | 执行 | 把子任务派给合适的 agent |
| `Review` | 审查 | 审代码、审边界、审质量 |
| `Meta-Review（元审查）` | 审查审查本身 | 检查审查标准有没有偏 |
| `Verification` | 验证闭环 | 确认修复真的生效 |
| `Evolution` | 沉淀 | 把模式、伤疤、经验留下来 |

</div>

- `Critical > Guessing`
- `Fetch > Assuming`
- `Thinking > Rushing`
- `Review > Trusting`

各阶段说明：

- **Stage 1 Critical**：明确范围，不猜
- **Stage 2 Fetch**：搜索现有 agent / skill，不假设不存在
- **Stage 3 Thinking**：规划子任务，设计牌组，准备交付外壳
- **Stage 4 Execution**：通过分派机制把工作交给合适角色，而不是一股脑自己硬做
- **Stage 5 Review**：对每个产出做质量审查
- **Stage 6 Meta-Review（元审查）**：审查审查标准本身
- **Stage 7 Verification**：验证修复已实际应用，关闭发现项
- **Stage 8 Evolution**：捕获模式，更新伤疤记录，反哺系统

这里还有 4 条容易被忽略、但现在已经写入主源规则的补充：

- **只有纯 `Q / Query` 可以不走 agent**：也就是纯解释、纯问答、没有改文件、没有外部副作用、没有交付物交接
- **任何可执行任务都必须有 owner**：能直接找到就用现成 owner；找不到就先补 owner，再执行
- **Thinking 必须协议先行**：`runHeader`、`dispatchBoard`、`workerTaskPacket`、`reviewPacket`、`verificationPacket`、`evolutionWritebackPacket` 没定出来，Execution 不应开始
- **能并行就并行**：独立子任务必须声明 `dependsOn`、`parallelGroup`、`mergeOwner`，不应该无故串行

`meta-conductor` 维护 `stageState` / `controlState`（含跳过 / 中断 / 迭代）；`meta-warden` 与 `meta-prism` 负责闸门与验证闭环（`gateState` 等）。隐形骨架不是第二套用户界面。细则见 `.claude/skills/meta-theory/references/dev-governance.md`（元理论治理参考）。

### 8 阶段脊柱和 business workflow 不是一回事

这块很重要，因为它是 Meta_Kim 最容易被误读的地方。

Meta_Kim 里同时存在两层流程语言：

<div align="center">

| 层级 | 定义位置 | 作用 |
| --- | --- | --- |
| **8 阶段脊柱** | `meta-theory` / `dev-governance.md` | 元理论定义的复杂开发任务标准执行链 |
| **business workflow 10 phases** | `config/contracts/workflow-contract.json` | 部门 run 的合约语言、展示语言、交付纪律 |

</div>

<a id="meta-kim-diagram-two-layers-zh"></a>

**对照图：** 上行是**执行骨架**（八阶段脊柱），下行是**部门 run 合约**（十阶段业务词汇）；两套词并行存在，业务阶段不会改名替换脊柱阶段。（`flowchart TB` 里两个横向 `subgraph` 常被并排，故拆成上下两个 `LR` 图。）

**上行：八阶段脊柱（执行骨架）**

```mermaid
graph LR
  A1[critical] --> A2[fetch] --> A3[thinking] --> A4[execution]
  A4 --> A5[review] --> A6[meta_review] --> A7[verification] --> A8[evolution]
```

**下行：十阶段业务合同（部门 run）**

```mermaid
graph LR
  B1[direction] --> B2[planning] --> B3[execution] --> B4[review]
  B4 --> B5[meta_review] --> B6[revision] --> B7[verify]
  B7 --> B8[summary] --> B9[feedback] --> B10[evolve]
```

文字版速记（与上图同一套顺序）——**8 阶段脊柱**：

<div align="center">

```text
Critical -> Fetch -> Thinking -> Execution -> Review -> Meta-Review（元审查） -> Verification -> Evolution
```

</div>

**business workflow** 的另一套「业务 run 词汇」：

<div align="center">

```text
direction -> planning -> execution -> review -> meta_review -> revision -> verify -> summary -> feedback -> evolve
```

</div>

重点不是背两套名词，而是理解关系：

- **business workflow 不会替代 8 阶段脊柱**
- 它更像“部门级 run contract 和交付包装层”
- 真正的复杂开发治理，底层还是走 8 阶段
- `summary / feedback / evolve` 这些更偏 run 管理和展示闭环，不等于把底层阶段改名

如果你只记一句：

**8 阶段是执行骨架，10 phases 是部门级运行合约。**

### 项目里的流程关系总图

<a id="task-routing-zh"></a>

下面是一张**任务类型路网**（任务到达 → 是否纯 Query → 简单 / 复杂 Type C / 元分析 / Type D → 是否再叠加十步治理）。与 [使用指南 · 系统怎么工作](#系统怎么工作) 里的外行链、[元架构视角 · 默认路径](#default-path-zh) 互补：这里回答「需求进来之后走哪条分叉」。

```mermaid
flowchart LR
  T[任务到达] --> Q{纯 Query?}
  Q -->|是| D[直接作答]
  Q -->|否| K{路由}
  K -->|简单| P1[压缩脊柱尾段]
  K -->|复杂 Type C| P2[八阶段全链]
  K -->|元分析| P3[mw: analyze / propose / report]
  K -->|审方案| P4[Type D]
  P1 --> E[ERV → Evo]
  P2 --> UP{再升高?}
  UP -->|是| G["叠加十步治理"]
  UP -->|否| E
  P3 --> E
  P4 --> E
```

<div align="center">

| 分支 | 含义 |
| --- | --- |
| 简单单 owner | 压缩脊柱片段，走 Exec → Review → Verify → Evolution |
| 复杂多文件 | `Critical`…`Evolution` 全链；若复杂度继续升高再叠加十步治理 |
| 元部门分析 | `metaWorkflow`：analyze → propose → report |
| Type D | 读提案、清单、prism / scout / warden 审查报告 |

</div>

**与上文一致：** 下面文字只收拢**同一路网下最容易误解的落地口径**（不再重复解释分叉本身）。

如果按主项目真实设计来讲，Meta_Kim 不是“只有一条流程”，而是几条路径叠在一起（与上图同一张路网）。

这里最容易误解的 4 件事：

- **最简单路径不是“裸执行”**。只有纯 `Q / Query` 才能直答；只要任务会执行、会落盘、会交接，就仍然需要 owner。
- **简单任务有压缩路径**，但它也不是跳过治理，而是走 `Execution → Review → Verification → Evolution` 这条 owner-driven shortcut。
- **8 阶段才是复杂开发任务的正式主骨架**，10 步治理是它的升级层，不是替代品。
- **3 phases 真正存在，但它指的是 `metaWorkflow = analyze → propose → report`**，不是“审查输出 → 验证修复 → evolution”这条你想象中的独立验证流。

#### 那能不能“先手搓完，再交给后三段做验证”？

可以分两种情况看：

- **如果你手里的是一个现成方案 / 提案 / agent 定义文档**，那更接近 `Type D`，也就是“读提案 → checklist → 输出审查报告”。
- **如果你手里的是已经写好的代码或可执行产物**，理论上可以把它当成“外部先做完的产物”接进后半段，但不能假装前面流程不存在。

项目主源的真实要求是：

- `Review` 会先检查 owner coverage 和 protocol compliance
- 没有 owner、没有 `dispatchBoard`、没有 `workerTaskPacket`、没有 `mergeOwner`，即使代码看起来能跑，也应该先记为协议不合规
- 所以不能把“手搓完 → 只走一个想象中的 3 阶段验证流”当成项目里的正式默认路径

更准确地说：

- **审文档 / 审方案** → 走 `Type D`
- **补验已有代码产物** → 可以接入 Review 之后的尾链，但必须补齐 owner 和协议包
- **真正按项目做复杂开发** → 仍然应从 `Critical / Fetch / Thinking` 开始

### 它是不是仍然带着“链式法则”？

是，**当前 Meta_Kim 仍然保留明显的链式脊柱**。

如果只看表层，你看到的还是：

<div align="center">

```text
Critical -> Fetch -> Thinking -> Execution -> Review -> Meta-Review -> Verification -> Evolution
```

</div>

所以如果有人说“你这本质上还是一条增强版流水线”，这个判断不算错。

但项目现在的真实状态不是“只有链”，而是：

**以链为表，以状态、事件、owner 和协议为里。**

也就是说：

- **链还在**：8 阶段仍然是人类最容易理解的标准执行骨架
- **状态在兜底**：`stageState`、`controlState`、`gateState`、`surfaceState`、`capabilityState`、`agentInvocationState` 让系统不只是“往下走一步”
- **事件在打断和改道**：skip、interrupt、intentional-silence、rollback、owner-resolution branch 都会改变运行路径
- **并行在削弱单链**：独立任务要求声明 `parallelGroup` 和 `mergeOwner`，不再默认一律串行
- **治理尾链在纠偏**：`Review / Meta-Review / Verification / Evolution` 不是装饰，而是用来判断、回修、闭环和写回

所以更准确的表述不是“Meta_Kim 已经摆脱链式法则”，而是：

**Meta_Kim 现在是“链式脊柱 + 状态骨架 + 事件控制 + owner 协议 + 并行编排”的混合系统。**

如果你想再压缩成一句话，可以这样说：

**它还不是纯状态机系统，但也不再是单纯的链式流程系统。链是可读骨架，不再是唯一的系统本体。**

### 隐形状态骨架和公开展示闸门

Meta_Kim 不只是“按顺序走完几个阶段”。

在 8 阶段表层下面，还有一层隐形治理骨架，用来保证 run 没有假完成、假通过、假展示。

常见状态层包括：

<div align="center">

| 状态层 | 典型值 | 主要责任方 | 作用 |
| --- | --- | --- | --- |
| `stageState` | `Critical -> ... -> Evolution` | Conductor | 当前处在哪个标准阶段 |
| `controlState` | `normal / skip / interrupt / intentional-silence / iteration` | Conductor | 控制发牌节奏，而不是乱加伪阶段 |
| `gateState` | `planning-open / verification-open / synthesis-ready` | Warden + Prism | 区分“阶段走完了”与“真的过闸了” |
| `surfaceState` | `debug-surface / internal-ready / public-ready` | Warden | 决定这轮结果能不能被当成正式输出展示 |
| `capabilityState` | `covered / partial / gap / escalated` | Scout + Artisan | 显式记录能力覆盖情况 |
| `agentInvocationState` | `idle / discovered / matched / dispatched / returned / escalated` | `meta-theory`（元理论） | 约束系统先搜索再分派，不要偷懒自干 |

</div>

这层骨架是**隐形的**：

- 它不是第二套 UI
- 它不是给用户多看几层状态名
- 它的作用是支撑 skip / interrupt / gate / verification / evolution 这些治理动作

#### 什么叫“可以公开展示”

项目设计里，run 要进入 public display，至少要同时满足这些条件：

- `verifyPassed`
- `summaryClosed`
- `singleDeliverableMaintained`
- `deliverableChainClosed`
- `consolidatedDeliverablePresent`

这意味着：

- 不是“看起来做完了”就算完成
- 不是“有内容可看了”就能展示
- 只要交付链断了、验证没关、总结没闭环，就应该继续留在 debug / internal surface

现在 canonical contract 还把它硬化成了真正发布门：

- 没有 `verifyPassed`：不能出最终公开稿
- 没有 `summaryClosed`：不能标记成外显结果
- 交付链没闭合：不能标记完成

### 回滚协议

Verification 阶段不是只负责说“过 / 不过”，还负责判断要不要回滚。

Meta_Kim 的设计里，回滚不是一刀切，而是分层处理：

<div align="center">

| 回滚级别 | 触发条件 | 动作 |
| --- | --- | --- |
| 文件级 | 单文件回归 | 回退这个文件到上一个已知正常状态 |
| 子任务级 | 某个子任务改崩了相邻路径 | 只回滚该子任务相关文件集 |
| 部分回滚 | 一部分子任务成功、一部分失败 | 保留成功部分，失败部分回滚后重新进入 Thinking |
| 全量回滚 | 跨模块污染、原始假设失效 | 暂存未提交改动，回到 Stage 1 重新定义范围 |

</div>

简单理解：

- 问题小，就小范围回滚
- 问题跨模块，就不要硬顶着往前推
- 一套没有回滚能力的治理系统，不算完整系统

铁律是：

**回滚不是失败，回滚是系统知道什么时候该停。**

### Evolution 不只是“复盘一下”，而是要落盘

Meta_Kim 的 `Evolution` 不是聊天式总结，而是明确要求把结构性学习写回磁盘。

典型产出物和落点如下：

<div align="center">

| 产出物 | 存储位置 | 说明 |
| --- | --- | --- |
| 可复用模式 | `memory/patterns/{pattern-name}.md` | 给以后复用 |
| 伤疤记录 | `memory/scars/{scar-id}.yaml` | 让失败变成下一轮的预防规则 |
| 新技能 | `.claude/skills/{skill-name}/SKILL.md` | 沉淀成真正可调用能力 |
| Agent 边界调整 | `.claude/agents/{agent}.md` | 改完后通常要跑 `npm run sync:runtimes` |
| 节奏优化 | `config/contracts/workflow-contract.json` 或 Conductor 默认配置 | 让下一轮调度更稳 |
| 能力缺口记录 | `memory/capability-gaps.md` | 给 Scout 持续追踪 |

</div>

如果一轮 Evolution 没有明确落盘位置，就不算真正“捕获了经验”。

现在主源还额外要求问一句：

- 这轮用的 owner 还够不够？
- 是继续沿用、调整边界、还是应该新建 owner？
- 如果这轮用了临时 `generalPurpose` owner，是否已经值得升级成正式能力？

并且每轮都必须显式给出 `writebackDecision`：

- `writeback`：列出具体写回目标
- `none`：说明为什么这轮没有可落盘的结构性写回

### 什么时候需要它

<div align="center">

| 你的场景 | 没有 Meta_Kim | 有 Meta_Kim |
| --- | --- | --- |
| “帮我把认证模块重构了，横跨 6 个文件” | AI 直接上手改，改着改着把别的模块搞崩了 | 先确认范围，分配给合适的 agent，审查跨模块影响 |
| “帮我设计一个新 agent” | 拿到一个通用模板，跟你的业务对不上 | 系统先问你需求，检查现有 agent，必要时才创建 |
| “我的 agent 老是互相打架” | 职责混乱，重复劳动，没人知道谁该干什么 | 清晰的职责边界，治理流程，质量关卡 |

</div>

**如果你每次只改一个文件，不需要它。** Meta_Kim 帮的是跨文件、跨模块、需要多种能力协作的复杂任务。

### 它干了什么

1. **先追问再执行**：需求模糊时追问澄清，而不是猜
2. **先搜索再假设**：先检查现有 agent / skill 能不能干，不假设不存在就从头搞
3. **先确定 owner 再执行**：除了纯问答，任何可执行任务都必须有明确 owner
4. **先做任务判定再路由**：`taskClass + requestClass + governanceFlow + trigger/upgrade/bypass reasons` 先定下来
5. **先决定发不发再干预**：`meta-conductor` 是主发牌员，`meta-warden` 是升级裁定方，`cardPlanPacket` 负责记录 deal / suppress / defer / skip / interrupt
6. **核和壳分离**：同一意图核可以换不同 `deliveryShell` 外显，不把事实和交付壳绑死
7. **先定协议再开工**：task classification、card plan、任务包、交付链、summary packet、审查包、验证包先说清楚，再分派
8. **review finding 要真闭环**：review finding、revision response、verification result、`closeFindings` 必须对上
9. **能并行就并行**：独立子任务不应该被无意义串行拖慢
10. **每个产出都要审查**：代码质量、安全性、架构合规、协议合规、边界越界检测
11. **真实 run 要能验真**：`validate:run` 会检查 packet 链、closeState 流转、publicReady 是否诚实
12. **每次都沉淀经验**：捕获可复用模式，记录失败，并把经验回写到 agent / skill / contract

> **读者提示**：以下面向**复杂任务**、JSON **run 产物**与契约字段校验；日常聊天式使用可跳过。

### 治理 run 产物（复杂任务）

当 `governanceFlow` 为 `complex_dev` 或 `meta_analysis` 时，除对话外应用 **一份 JSON run artifact** 作为事实源：

1. Thinking 阶段写入 **`intentPacket`**（`trueUserIntent`、`successCriteria`、`nonGoals`、`intentPacketVersion: v1`）——重执行前的意图锁定（见 `protocols.intentPacket` 与 `intentPacketRequiredWhenGovernanceFlows`）。
2. 写入 **`intentGatePacket`**（`ambiguitiesResolved`、`requiresUserChoice`、`defaultAssumptions`、`intentGatePacketVersion: v1`；若 `requiresUserChoice` 为 true 则填 `pendingUserChoices[]`）——结构化歧义/假设闸门（见 `protocols.intentGatePacket` 与 `intentGatePacketRequiredWhenGovernanceFlows`）。
3. 按 `runDiscipline.protocolFirst.requiredPackets` 维护完整 packet 链（可每轮增量合并）。
4. 在宣称 **对外可发** 或 **已完成** 之前执行：

```bash
npm run validate:run -- path/to/your-run.json
```

5. 若校验失败或 finding 仍开：生成下一轮待办清单：

```bash
npm run prompt:next-iteration -- path/to/your-run.json
```

可选 **Stop hook** 弱哨兵（默认关闭）：设置环境变量 `META_KIM_STOP_COMPLETION_GUARD=hint` 仅 stderr 提示，或 `=block` 在末条 assistant 声称完成却缺少治理关键词时强制再跑一轮。详见 `.claude/hooks/stop-completion-guard.mjs`。

**`npm run doctor:governance`**：窄域体检（契约可读、hook 命令集合、`check:runtimes`、样例 `validate:run`）。

可选 **软 todo 闸门**（跑 `validate:run` 时）：设置 `META_KIM_SOFT_PUBLIC_READY_GATES=1` 时，若 `summaryPacket.publicReady` 为 true，则任一 `workerTaskPacket` 不得为 `taskTodoState: "open"`；不跟踪 todo 时可省略 `taskTodoState`。见契约中 `runDiscipline.runArtifactValidation.softPublicReadyTodoGate`。

可选 **软注释/文档审查闸门**：设置 `META_KIM_SOFT_COMMENT_REVIEW=1` 且 `summaryPacket.publicReady` 为 true 时，须 `summaryPacket.commentReviewAcknowledged === true`。见 `softCommentReviewGate`。

## License

本项目采用 [MIT License](LICENSE)。
