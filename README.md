# Meta_Kim

> 基于 `meta/meta.md` 的跨运行时元架构仓库。

Meta_Kim 不是业务应用，而是一套可移植的 Agent 架构包。它把“元 = 最小可治理单元”这套理论，落成能在 Claude Code、OpenClaw、Codex 三个运行时中复用的资产。

## 一、这个仓库到底提供什么

### Claude Code 运行时包

- `CLAUDE.md`
- `.claude/agents/*.md`
- `.claude/skills/meta-theory/SKILL.md`
- `.claude/settings.json`
- `.mcp.json`

### OpenClaw 运行时包

- `openclaw/workspaces/*`
- `openclaw/skills/meta-theory.md`
- `openclaw/openclaw.template.json`

### Codex 运行时包

- `AGENTS.md`
- `codex/config.toml.example`

### 共享基础设施

- `scripts/sync-runtimes.mjs`
- `scripts/validate-project.mjs`
- `scripts/mcp/meta-runtime-server.mjs`
- `meta/runtime-capability-matrix.md`

## 二、哪些文件才是主源

- `meta/meta.md`：理论总源
- `.claude/agents/*.md`：Agent 定义总源
- `.claude/skills/meta-theory/SKILL.md`：Skill 定义总源

其他文件基本都属于两类：
- 从主源生成出来的派生产物
- 针对某个运行时的适配层

## 三、三套运行时的能力覆盖方式

| 能力 | Claude Code | OpenClaw | Codex |
| --- | --- | --- | --- |
| 多代理 / 子代理 | 原生 `.claude/agents/` | 原生独立 workspace | 用仓库规则驱动委派 |
| Skill | 原生 `.claude/skills/` | 可安装 skill 文件 | 用共享 skill 文档承载方法 |
| MCP | 原生 `.mcp.json` | 官方主文档里没有稳定的同层项目级 MCP 接口 | 用户级 MCP 配置 |
| Hook / 守卫 | 原生 `.claude/settings.json` hooks | 用 heartbeat / gateway 规则代替最接近能力 | 没有仓库级原生 hook 文件面 |
| 记忆 | `CLAUDE.md` + 文件 | workspace 记忆 | 仓库说明 + 宿主上下文 |

完整说明见 `meta/runtime-capability-matrix.md`。

## 四、快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 生成派生产物

```bash
npm run sync:runtimes
```

### 3. 验证仓库状态

```bash
npm run validate
```

### 4. 全量检查

```bash
npm run check
```

## 五、怎么在不同运行时使用

### Claude Code

1. 用 Claude Code 打开仓库。
2. 8 个子代理从 `.claude/agents/` 自动加载。
3. `meta-theory` 从 `.claude/skills/meta-theory/SKILL.md` 加载。
4. 项目 Hook 从 `.claude/settings.json` 生效。
5. 项目 MCP 从 `.mcp.json` 生效。
6. 如需额外生态技能，可运行：

```bash
bash install-deps.sh
```

### Codex

1. 用 Codex 或 Codex CLI 打开仓库。
2. 仓库根目录 `AGENTS.md` 是主入口。
3. 如需接入本地 MCP，把 `codex/config.toml.example` 复制到 `~/.codex/config.toml`，并把 `REPLACE_WITH_REPO_ROOT` 改成你的真实路径。
4. 共享 skill 文档在 `shared-skills/meta-theory.md`。

### OpenClaw

1. 先执行：

```bash
npm install
npm run sync:runtimes
```

2. 把 `openclaw/openclaw.template.json` 或本机生成的 `openclaw/openclaw.local.json` 合并到你的 OpenClaw 配置里。
3. 安装 portable skill：

```bash
openclaw skill install ./openclaw/skills/meta-theory.md
```

4. 让 OpenClaw 的 agent workspace 指向 `openclaw/workspaces/<agent-id>/`。
5. 冒烟测试：

```bash
openclaw agent --local --agent meta-warden -m "Read your SOUL.md first, then introduce the team."
```

## 六、仓库命令

- `npm run sync:runtimes`：重新生成 OpenClaw workspace、共享 skill 镜像、OpenClaw 配置模板
- `npm run test:mcp`：测试本地 MCP 服务是否能启动
- `npm run validate`：校验主源、派生产物、Hook、MCP 配置是否一致
- `npm run check`：先检查派生产物是否最新，再执行完整校验

## 七、项目结构

```text
Meta_Kim/
├── AGENTS.md
├── CLAUDE.md
├── .claude/
│   ├── agents/
│   ├── hooks/
│   ├── settings.json
│   └── skills/meta-theory/
├── .mcp.json
├── codex/config.toml.example
├── meta/
│   ├── meta.md
│   └── runtime-capability-matrix.md
├── openclaw/
│   ├── openclaw.template.json
│   ├── skills/
│   └── workspaces/
├── scripts/
│   ├── mcp/meta-runtime-server.mjs
│   ├── sync-runtimes.mjs
│   └── validate-project.mjs
└── shared-skills/
```

## 八、最重要的原则

Meta_Kim 的“跨运行时”不是假装三套系统完全一样。

真正的做法是：
- 一套理论主源
- 一套 Agent 主源
- 一套 Skill 主源
- 每个运行时各自有明确适配层
- 没有原生等价能力的地方，明确写出来，不硬编

这才是能长期维护的“元架构”。

## 九、许可证

MIT
