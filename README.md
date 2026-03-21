# Meta_Kim

> 一个跨 Claude Code、Codex、OpenClaw 的 **意图放大架构包**。

## 这项目到底是什么

Meta_Kim 不是聊天产品，不是网页，不是 App。

它是一个给 AI 编程助手用的“底层架构包”。

它想解决的问题只有一个：

**让 `meta/meta.md` 所描述的意图放大，在 Claude Code、Codex、OpenClaw 三个软件里都成立。**

也就是说：

- 用户用 Claude Code，就走 Claude Code 的入口
- 用户用 Codex，就走 Codex 的入口
- 用户用 OpenClaw，就走 OpenClaw 的入口

但无论走哪个入口，背后的核心目标都一样：

**把用户原始意图放大成更完整、更清楚、更可执行的结果。**

## “意图放大”是什么意思

用户最开始说的话，通常是短的、糊的、不完整的。

比如：

- “帮我做个项目”
- “帮我改一下这个系统”
- “帮我设计一个 agent 架构”

这种话通常缺很多东西：

- 真实目标是什么
- 边界是什么
- 风险是什么
- 受众是谁
- 交付物应该长成什么样
- 先做什么，后做什么

Meta_Kim 要做的，不是直接糊一份答案。

而是先把这些东西补全，再进入执行。

所以“意图放大”可以简单理解成：

**把一句模糊需求，变成一个结构完整、边界清楚、可以落地的任务。**

## “元”到底是什么

这个项目里最重要的词，就是“元”。

这里的“元”不是玄学，也不是装饰性命名。

在 Meta_Kim 里：

**元 = 为了完成意图放大而存在的最小可治理单元。**

你可以把它理解成：

- 它有独立职责
- 它有明确边界
- 它可以被单独调用
- 它可以被验证
- 它坏了可以被替换

所以“元”不是一个万能 agent。

“元”更像复杂系统里的最小治理角色。

## 最后会做成什么样

最终成品不是一个单独的大模型 prompt，也不是一堆散乱脚本。

最终成品是：

**一套可以直接装进三种运行时里的元架构。**

它在外部应该呈现成这样：

1. 用户提出一个原始需求
2. 系统先做意图放大
3. 必要时把任务拆给不同的元 agent
4. 再把结果收回来
5. 输出一个比原始问题更完整、更强的结果

所以用户真正感受到的，不应该是“这里有 8 个 agent”。

用户真正感受到的，应该是：

**这个系统比普通助手更会理解问题，更会拆问题，也更会把事情做完整。**

## 这 8 个元 agent 是干嘛的

它们是后台分工，不是用户菜单。

- `meta-warden`：总入口、统筹、仲裁、最终整合
- `meta-genesis`：人格、提示词、`SOUL.md`
- `meta-artisan`：skill、MCP、工具能力匹配
- `meta-sentinel`：hook、安全、权限、回滚
- `meta-librarian`：记忆、知识、连续性
- `meta-conductor`：工作流、节奏、编排
- `meta-prism`：质量审查、漂移检测、反 AI 套话
- `meta-scout`：外部工具发现与评估

外部默认入口应该优先理解成：

- `meta-warden`

其他 7 个元 agent 更像后台专员。

## `meta/meta.md` 是什么

`meta/meta.md` 不是运行时配置文件。

它是这个项目的：

- 整体目标参考
- 方法论参考
- 三端对齐参考

也就是说，它定义的是“这个项目到底想成为什么”，不是“每个平台怎么配 JSON”。

## 论文与作者资源

如果你想看这套“基于元的意图放大”背后的详细评测与方法论背景，可以看作者论文：

- 论文页面：<https://zenodo.org/records/18957649>
- DOI：`10.5281/zenodo.18957649`

如果你想看作者的通用模板、中文教程、联系方式，或者请作者喝杯咖啡，可以看这个仓库：

- 模板与作者入口：<https://github.com/KimYx0207/Claude-Code-x-OpenClaw-Guide-Zh>

这个入口里已经包含：

- Claude Code 与 OpenClaw 的中文教程
- 作者联系方式
- 开源知识库入口
- 打赏支持方式

## 三端分别怎么表现

### Claude Code

- 入口：`CLAUDE.md`
- 主体：`.claude/agents/`、`.claude/skills/`、`.mcp.json`
- 目标：让 Claude Code 能直接运行这套围绕意图放大的元架构

### Codex

- 入口：`AGENTS.md`
- 主体：`.codex/agents/`、`.agents/skills/`、`codex/config.toml.example`
- 目标：让 Codex 也走同一套元职责，而不是另起一套逻辑

### OpenClaw

- 入口：`openclaw/workspaces/`
- 主体：`openclaw/openclaw.template.json`、`openclaw/skills/meta-theory.md`
- 目标：让 OpenClaw 的本地 workspace agent 同样围绕意图放大工作

## 哪些文件是主源

真正优先修改的是这三个位置：

- `meta/meta.md`
- `.claude/agents/*.md`
- `.claude/skills/meta-theory/SKILL.md`

其他很多文件都是运行时适配层，或者同步生成的派生产物。

## 最简上手

在仓库根目录执行：

```bash
npm install
npm run sync:runtimes
npm run prepare:openclaw-local
npm run verify:all
```

这四步的意思：

- `npm install`：安装依赖
- `npm run sync:runtimes`：生成三端运行时文件
- `npm run prepare:openclaw-local`：同步 OpenClaw 本机授权
- `npm run verify:all`：做完整检查和三端验收

## 你如果只想一句话记住它

**Meta_Kim 不是“很多 agent 的展示仓库”。**

**它是一个试图把 `meta/meta.md` 的意图放大方法，稳定落到 Claude Code、Codex、OpenClaw 三端的元架构项目。**
