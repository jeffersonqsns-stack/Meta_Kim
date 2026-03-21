# Meta_Kim 运行时能力矩阵

这个仓库同时面向 Claude Code、OpenClaw、Codex，但三者不是同一种产品，能力面也不完全一致。

## 一、能力映射

| 能力 | Claude Code | OpenClaw | Codex | Meta_Kim 的落地方式 |
| --- | --- | --- | --- | --- |
| 理论总源 | `CLAUDE.md` 可引用仓库文档 | workspace prompt 可引用仓库文档 | `AGENTS.md` 可引用仓库文档 | `meta/meta.md` 作为唯一理论总源 |
| 多代理 / 子代理 | 原生 `.claude/agents/` | 原生多 agent + 独立 workspace | 仓库规则引导委派 | `.claude/agents/*.md` 为主源，`openclaw/workspaces/*` 为映射产物 |
| Skill | 原生 `.claude/skills/` | 可安装 skill 文件 | 没有仓库级原生 skill 装载约定 | `.claude/skills/meta-theory/SKILL.md` 为主源，镜像到 `shared-skills/` 与 `openclaw/skills/` |
| MCP | 项目级 `.mcp.json` | 官方主文档没有稳定同层项目级入口 | 用户级 `~/.codex/config.toml` | 共用 `scripts/mcp/meta-runtime-server.mjs` |
| Hook / 守卫 | 原生 `.claude/settings.json` hooks | 最接近的是 heartbeat / gateway 安全配置 | 没有明确仓库级 hook 文件面 | 只在 Claude 侧做真 Hook，其他运行时不硬做假等价 |
| 记忆 | `CLAUDE.md` + 文件 | workspace memory | 仓库说明 + 宿主上下文 | 记忆策略写入 agent prompt 与 skill 方法论 |

## 二、Meta_Kim 所说的“可移植”是什么意思

可移植不等于：
- 三个平台所有功能 100% 一模一样
- 一个文件原封不动 everywhere 生效
- 一个 Hook 配置自动变成所有平台的 Hook

可移植真正指的是：
- 一个理论总源
- 一个 Agent 定义总源
- 一个 Skill 定义总源
- 每个平台都有明确适配层
- 没有原生等价能力时，明确标注“无 1:1 对应项”

## 三、主源位置

- 理论：`meta/meta.md`
- Claude Agent：`.claude/agents/*.md`
- Claude Skill：`.claude/skills/meta-theory/SKILL.md`
- 共享 Skill 镜像：`shared-skills/meta-theory.md`
- OpenClaw 运行时包：`openclaw/`
- Codex 仓库入口：`AGENTS.md`

## 四、标准工作流

每次修改 Agent prompt 或共享 Skill 后：

1. 先改主源文件。
2. 运行 `npm run sync:runtimes`。
3. 运行 `npm run validate`。
4. 如果运行时契约变化，再更新 `CLAUDE.md` 和 `README.md`。
