# Meta_Kim 仓库说明

这不是一个“随便造几个 agent”的仓库。

这个仓库的目标，是让 `meta/meta.md` 所代表的意图放大方向，在 Codex、Claude Code、OpenClaw 三个运行时里都能落地。

## 先理解“元”

在这个项目里：

**元 = 为了完成意图放大而存在的最小可治理单元。**

它不是一个模糊角色，不是一个全能助手，也不是一个方便堆叠的功能块。

一个合格的元，至少要：

- 只负责一类清晰职责
- 和其他元有明确边界
- 能被编排调用
- 能被单独验证
- 失败时可以被替换或回退

## 这个仓库对 Codex 的意义

如果你在 Codex 里打开这个仓库，应该把它理解成：

- `meta/meta.md` 负责提供整体目标参考
- `AGENTS.md` 负责告诉 Codex 这个项目到底想做什么
- `.codex/agents/` 负责把 8 个元角色映射成 Codex custom agents
- `.agents/skills/` 负责提供项目级 skill

也就是说，Codex 在这个仓库里不应该只是“看见很多文件”，而应该明白：

**这是一个跨运行时意图放大系统。**

## 默认工作方式

用户真正需要面对的，不应该是 8 个元 agent 的细节。

默认应该这样理解：

1. 用户给出原始需求
2. 系统先做意图放大
3. 再决定要不要调用别的元 agent
4. 最后回到一个统一的、更完整的结果

所以外部主入口应该优先看作：

- `meta-warden`

其他元 agent 是后台分工，不是用户层菜单。

## 8 个元 agent 的后台分工

- `meta-warden`：统筹、仲裁、整合
- `meta-genesis`：提示词人格与 `SOUL.md`
- `meta-artisan`：skill、MCP、工具匹配
- `meta-sentinel`：安全、hook、权限、回滚
- `meta-librarian`：记忆、知识、连续性
- `meta-conductor`：工作流、节奏、编排
- `meta-prism`：质量审查、漂移检测
- `meta-scout`：外部能力发现与评估

## 主源与派生产物

优先修改：

- `meta/meta.md`
  这里不是运行时配置，而是整体目标参考
- `.claude/agents/*.md`
- `.claude/skills/meta-theory/SKILL.md`

通常不要手改长期维护：

- `.codex/agents`
- `.agents/skills`
- `openclaw/workspaces`

这些由同步脚本维护。

## 工作闭环

修改主源后：

1. 运行 `npm run sync:runtimes`
2. 运行 `npm run validate`
3. 运行 `npm run eval:agents`

## 对 Codex 最重要的一条要求

不要把这个仓库理解成“一个展示很多 agent 的样板间”。

要把它理解成：

**一个以意图放大为中心、以元为治理单元、并试图在多个运行时里保持一致行为的架构包。**
