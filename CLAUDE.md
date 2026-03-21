# Meta_Kim 的 Claude Code 说明

这个仓库的目标，不是单独服务 Claude Code。

它要做的是：

**让 `meta/meta.md` 所代表的意图放大方向，在 Claude Code、Codex、OpenClaw 三个运行时里都成立。**

Claude Code 只是当前最主要的主编辑运行时。

## 先把“元”讲清楚

在 Meta_Kim 里：

**元 = 为了完成意图放大而存在的最小可治理单元。**

所以这里的 8 个元 agent，不是为了好看，也不是为了做一个“很多 agent 的展示仓库”。

它们存在的原因是：

- 让复杂问题能被拆开
- 让拆开的职责能被治理
- 让治理后的结果仍然服务于“意图放大”这个核心目标

## `meta/meta.md` 在这里的角色

`meta/meta.md` 是：

- 项目整体目标参考
- 方法论参考
- 三端对齐参考

它不是：

- Claude 运行时配置
- 生成脚本源
- 要逐字塞进每个 prompt 的长文本

Claude 侧所有实现，都应该朝它对齐，而不是机械复制它。

## 外部参考

除了仓库内主源，这个项目还有两个作者提供的外部参考：

- 详细评测论文：<https://zenodo.org/records/18957649>
- 通用模板、联系方式与支持入口：<https://github.com/KimYx0207/Claude-Code-x-OpenClaw-Guide-Zh>

Claude 侧应把它们理解成补充背景，而不是运行时配置。

## Claude Code 这边真正要成立成什么样

在 Claude Code 里，理想状态不是让用户记住 8 个元 agent。

理想状态是：

1. 用户提出原始需求
2. 系统先做意图放大
3. 需要时再调用后台元 agent 分工
4. 最后回到统一结果

所以在 Claude 侧，`meta-warden` 应该被理解为默认入口，
其他元 agent 是后台分工。

## Claude 侧主源

- `.claude/agents/*.md`
  8 个元 agent 的定义主源
- `.claude/skills/meta-theory/SKILL.md`
  skill 主源
- `.claude/settings.json`
  Claude Code 的权限与 hooks
- `.mcp.json`
  Claude Code 的项目级 MCP 入口

## 8 个元 agent 的后台职责

- `meta-warden`：统筹、仲裁、整合
- `meta-genesis`：提示词人格与 `SOUL.md`
- `meta-artisan`：skill、MCP、工具能力匹配
- `meta-sentinel`：安全、hook、权限、回滚
- `meta-librarian`：记忆、知识、连续性
- `meta-conductor`：工作流、节奏、编排
- `meta-prism`：质量审查、漂移检测
- `meta-scout`：外部能力发现与评估

## 硬规则

- `.claude/agents/*.md` 必须保留合法 YAML frontmatter，否则 Claude Code 不会把它识别为正式子代理。
- `.claude/agents/*.md` 和 `.claude/skills/meta-theory/SKILL.md` 是唯一主编辑源。
- `.codex/agents/*`、`.agents/skills/*`、`openclaw/workspaces/*` 都是派生产物，不要长期手改。
- prompt、skill、运行时契约改动后，必须执行：
  - `npm run sync:runtimes`
  - `npm run validate`
- 如果要确认三端不只是文件存在，而是真的能工作，再执行：
  - `npm run eval:agents`

## 一句话总结

Claude Code 在这个仓库里的职责，不是单独形成一套“Claude 专属逻辑”。

而是作为主编辑运行时，帮助这套以“元”为治理单元、以“意图放大”为核心目标的系统首先落地，然后再同步到另外两个运行时。
