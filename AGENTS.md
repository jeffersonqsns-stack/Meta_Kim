# Meta_Kim 仓库说明

Meta_Kim 是一个跨运行时 Agent 架构仓库，围绕 `meta/meta.md` 里的元理论构建。

## 一、主源定义

- `meta/meta.md`：理论主源
- `.claude/agents/*.md`：Meta_Kim 的 Agent 定义主源
- `.claude/skills/meta-theory/SKILL.md`：可移植 Skill 定义主源

其他文件要么是从这些主源派生出来的，要么是运行时适配层。

## 二、三套运行时入口

| 运行时 | 入口 |
| --- | --- |
| Claude Code | `CLAUDE.md`、`.claude/agents/`、`.claude/skills/`、`.claude/settings.json`、`.mcp.json` |
| OpenClaw | `openclaw/workspaces/*`、`openclaw/skills/meta-theory.md`、`openclaw/openclaw.template.json` |
| Codex | `AGENTS.md`、`codex/config.toml.example`、`shared-skills/meta-theory.md` |

## 三、必须遵守的流程

- 优先修改 `.claude/agents/*.md` 或 `.claude/skills/meta-theory/SKILL.md`
- 改完后执行 `npm run sync:runtimes`
- 再执行 `npm run validate`
- 如果运行时契约变化，再更新 `CLAUDE.md` 和 `README.md`

## 四、可移植能力模型

- 子代理：Claude Code 原生支持，OpenClaw 用独立 workspace 映射，Codex 用仓库规则承接。
- Skill：Claude Code 原生支持，OpenClaw 使用可安装 skill 文件，Codex 用共享 skill 文档承接。
- MCP：通过 `scripts/mcp/meta-runtime-server.mjs` 提供统一本地服务，Claude 和 Codex 都有明确接入方式。
- Hook：Claude 有原生 hooks；其他运行时只用最接近的原生机制，不伪造 1:1 等价层。

## 五、命令

- `npm run sync:runtimes`
- `npm run test:mcp`
- `npm run validate`
- `npm run check`

## 六、核心原则

Meta_Kim 的可移植性来自：
- 一个理论主源
- 一个 Agent 主源
- 一个 Skill 主源
- 明确的运行时适配层

而不是假装所有运行时功能完全相同。
