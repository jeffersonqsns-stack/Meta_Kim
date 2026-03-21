# Meta_Kim 的 Claude Code 说明

Meta_Kim 以 Claude Code 作为主编辑运行时，但仓库目标不是只服务 Claude Code，而是把同一套“元架构”稳定映射到 Claude Code、OpenClaw、Codex。

## 一、哪些文件是主源

- 理论主源：`meta/meta.md`
- Claude 子代理主源：`.claude/agents/*.md`
- Claude Skill 主源：`.claude/skills/meta-theory/SKILL.md`
- Claude Hooks：`.claude/settings.json` 与 `.claude/hooks/*`
- Claude 项目级 MCP：`.mcp.json`
- 共享 MCP 服务：`scripts/mcp/meta-runtime-server.mjs`
- 跨运行时总说明：`AGENTS.md`
- 能力矩阵：`meta/runtime-capability-matrix.md`

## 二、硬规则

- `.claude/agents/*.md` 必须保留合法 YAML frontmatter，至少包含 `name` 和 `description`，否则 Claude Code 不会把它识别为正式子代理。
- `.claude/agents/*.md` 和 `.claude/skills/meta-theory/SKILL.md` 是唯一主编辑源。
- `openclaw/workspaces/*`、`openclaw/skills/*`、`shared-skills/*` 都是派生产物，不要手改后长期维护。
- 任何 prompt、skill、运行时契约改动后，必须执行：
  - `npm run sync:runtimes`
  - `npm run validate`
- `meta/meta.md` 是理论总源，但它很长。引用即可，不要把整篇直播稿无脑塞进每个运行时文件。

## 三、Claude Code 侧已经覆盖的能力面

| 能力面 | 路径 | 作用 |
| --- | --- | --- |
| 项目记忆 | `CLAUDE.md` | 仓库级规则与操作约束 |
| 子代理 | `.claude/agents/*.md` | 8 个原生 Claude Code 子代理 |
| Skill | `.claude/skills/meta-theory/SKILL.md` | 元理论工作流入口 |
| Hooks | `.claude/settings.json` + `.claude/hooks/*` | 安全拦截、子代理上下文注入 |
| MCP | `.mcp.json` | 项目级本地 MCP 服务挂载 |

## 四、8 个元代理

| 代理 | 作用 |
| --- | --- |
| `meta-warden` | 统筹、质量关卡、整合、元评审 |
| `meta-genesis` | SOUL.md 与核心提示词架构 |
| `meta-artisan` | Skill、工具、能力匹配 |
| `meta-sentinel` | 安全边界、Hook、回滚规则 |
| `meta-librarian` | 记忆、连续性、知识沉淀 |
| `meta-conductor` | 工作流编排、节奏控制 |
| `meta-prism` | 质量法医、漂移检测 |
| `meta-scout` | 外部能力发现、引入评估 |

## 五、工作闭环

1. 修改主源 prompt 或主源 skill。
2. 运行 `npm run sync:runtimes`。
3. 运行 `npm run validate`。
4. 如果运行时契约发生变化，再更新 `README.md` 与 `AGENTS.md`。

## 六、可选外部技能包

`install-deps.sh` 可把一些外部 Claude 生态技能安装到 `~/.claude/skills/`：

```bash
bash install-deps.sh
```

这些依赖是增强件，不是 Meta_Kim 的主源。
