#!/usr/bin/env node
/**
 * Meta_Kim interactive setup (i18n)
 *
 * Usage:
 *   node setup.mjs              # Interactive first-run setup
 *   node setup.mjs --lang zh    # Skip language selection, use Chinese
 *   node setup.mjs --update     # Update installed skills
 *   node setup.mjs --check      # Environment check only
 *   node setup.mjs --silent     # Non-interactive (CI / scripts)
 */

import { execSync, spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  rmSync,
  readdirSync,
  cpSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { join, resolve } from "node:path";
import { homedir, platform, tmpdir } from "node:os";
import { createInterface } from "node:readline";

// ── Config ──────────────────────────────────────────────

const SKILL_OWNER = process.env.META_KIM_SKILL_OWNER || "KimYx0207";
const SKILLS_DIR = join(homedir(), ".claude", "skills");
const PROJECT_DIR = resolve(import.meta.dirname || ".");
const PROXY = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || "";
const isWin = platform() === "win32";
const args = process.argv.slice(2);
const updateMode = args.includes("--update") || args.includes("-u");
const checkOnly = args.includes("--check");
const silentMode = args.includes("--silent") || !process.stdout.isTTY;

const langIdx = args.indexOf("--lang");
const langArg = langIdx >= 0 && args[langIdx + 1] ? args[langIdx + 1] : null;

const findskillPackSubdir = platform() === "win32" ? "windows" : "original";

const SKILLS = [
  { name: "agent-teams-playbook", repo: `${SKILL_OWNER}/agent-teams-playbook` },
  {
    name: "findskill",
    repo: `${SKILL_OWNER}/findskill`,
    subdir: findskillPackSubdir,
  },
  { name: "hookprompt", repo: `${SKILL_OWNER}/HookPrompt` },
  { name: "superpowers", repo: "obra/superpowers" },
  { name: "everything-claude-code", repo: "affaan-m/everything-claude-code" },
  {
    name: "planning-with-files",
    repo: "OthmanAdi/planning-with-files",
    subdir: "skills/planning-with-files",
  },
  { name: "cli-anything", repo: "HKUDS/CLI-Anything" },
  { name: "gstack", repo: "garrytan/gstack" },
  {
    name: "skill-creator",
    repo: "anthropics/skills",
    subdir: "skills/skill-creator",
  },
];

const packageJsonPath = join(PROJECT_DIR, "package.json");
const packageVersion = existsSync(packageJsonPath)
  ? JSON.parse(readFileSync(packageJsonPath, "utf8")).version || "dev"
  : "dev";

// ── i18n ────────────────────────────────────────────────

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "zh-CN", label: "中文" },
  { code: "ja-JP", label: "日本語" },
  { code: "ko-KR", label: "한국어" },
];

const I18N = {
  en: {
    modeCheck: "check only",
    modeUpdate: "update",
    modeSilent: "silent",
    modeInteractive: "interactive",
    stepEnv: "Step 1/5: Environment Check",
    nodeOld: (v) => `Node.js v${v} too old, need >=18`,
    nodeOk: (v) => `Node.js v${v}`,
    npmNotFound: "npm not found",
    gitNotFound: "git not found — skills install requires git",
    proxyInfo: (p) => `Proxy: ${p}`,
    pkgFound: "package.json found",
    pkgNotFound: "package.json not found — run from Meta_Kim root",
    envFailed: "Environment check failed. Fix the issues above.",
    envOk: "Environment OK!",
    stepRuntime: "Step 2/5: Runtime Detection",
    claudeDetected: (v) => `Claude Code ${v}`,
    claudeNotDetected: "Claude Code CLI not detected",
    codexDetected: (v) => `Codex ${v}`,
    codexNotDetected: "Codex CLI not detected (optional)",
    openclawDetected: (v) => `OpenClaw ${v}`,
    openclawNotDetected: "OpenClaw CLI not detected (optional)",
    noRuntime: "No supported runtime detected.",
    noRuntimeHint1: "Meta_Kim works with Claude Code, Codex, or OpenClaw.",
    noRuntimeHint2:
      "Install at least one: https://docs.anthropic.com/en/docs/claude-code",
    continueAnyway: "Continue setup anyway?",
    setupCancelled: "Setup cancelled. Install a runtime and re-run.",
    stepConfig: "Step 3/5: Project Configuration",
    mcpExists: ".mcp.json already configured",
    mcpCreated: ".mcp.json created — MCP runtime server registered",
    settingsExists: ".claude/settings.json already configured",
    askCreateSettings: "Create .claude/settings.json with hooks?",
    settingsCreated:
      ".claude/settings.json created — hooks + permissions registered",
    settingsSkipped: ".claude/settings.json skipped by user",
    settingsSkippedNoClaude:
      ".claude/settings.json skipped (Claude Code not detected)",
    stepSkills: "Step 4/5: Install Skills",
    shipsSkills: (n) => `Meta_Kim ships ${n} skills:`,
    runningNpm: "Running npm install ...",
    npmDone: "npm dependencies installed",
    npmFailed: "npm install failed",
    nodeModulesExist: "node_modules exists (use --update to reinstall)",
    skillUpdated: (n) => `${n} — updated`,
    skillInstalled: (n) => `${n} — installed`,
    skillExists: (n) => `${n} — already installed`,
    skillSubdirInstalled: (n, s) => `${n} — installed (subdir: ${s})`,
    skillFailed: (n, r) => `${n} — failed (${r})`,
    skillSubdirNotFound: (n) => `${n} — subdir not found`,
    skillsReady: (ok, total, fail) =>
      `${ok}/${total} skills ready${fail > 0 ? `, ${fail} failed` : ""}`,
    stepValidate: "Step 5/5: Validate",
    agentPrompts: (n) => `${n} meta-agent prompts`,
    validationPassed: "Project validation passed",
    validationWarnings: "Validation has warnings (non-blocking)",
    setupComplete: "Setup complete!",
    whatMetaDoes: "What Meta_Kim does:",
    whatMetaDoesDesc1: "Gives your AI coding agent a team of specialists:",
    whatMetaDoesDesc2: "one reviews code, one handles security, one manages",
    whatMetaDoesDesc3: "memory — all coordinated automatically.",
    howToUse: "How to use:",
    step1Open: "Open Claude Code in this directory:",
    step2Try: "Try a meta-theory command:",
    step3Or: "Or just ask Claude to do something complex:",
    step3Hint: "(Meta_Kim will auto-coordinate the specialists)",
    codexNote: "Codex prompts are synced to .codex/",
    openclawNote: "OpenClaw workspace is synced to openclaw/",
    noRuntimeGetStarted:
      "No runtime detected. Install Claude Code to get started:",
    usefulCommands: "Useful commands:",
    cmdUpdate: "Update all skills",
    cmdCheck: "Check environment",
    cmdDoctor: "Diagnose Meta_Kim health",
    cmdVerify: "Full verification",
    setupError: "Setup error:",
    selectLang: "Select language / 选择语言 / 言語を選択 / 언어 선택",
    choose: (n) => `Choose (1-${n})`,
    globalInstallPrompt:
      "Meta_Kim skills install to ~/.claude/skills/ (global). Install globally?",
    globalDirReady: (p) => `Global skills dir ready: ${p}`,
    globalDirCreated: (p) => `Created global skills dir: ${p}`,
    depCheckHeading: "Dependency Check",
    depOk: (n) => `${n} — OK`,
    depMissing: (n) => `${n} — MISSING`,
    depNoFiles: (n) => `${n} — directory exists but no .md files`,
    depSummaryAll: "All 9 dependencies verified",
    depSummarySome: (ok, total) =>
      `Only ${ok}/${total} dependencies verified — re-run with --update`,
    syncHeading: "Cross-Runtime Sync Check",
    syncClaudeAgents: (n) => `Claude Code agents: ${n}/8 .md files`,
    syncClaudeSkills: "Claude Code skills/meta-theory/SKILL.md",
    syncClaudeHooks: (n) => `Claude Code hooks: ${n} scripts`,
    syncClaudeSettings: "Claude Code .claude/settings.json",
    syncClaudeMcp: "Claude Code .mcp.json",
    syncCodexAgents: (n) => `Codex agents: ${n}/8 .toml files`,
    syncCodexSkills: "Codex skills/meta-theory.md",
    syncOpenclawWorkspaces: (n, f) =>
      `OpenClaw workspaces: ${n}/8 agents, ${f} files each`,
    syncOpenclawSkill: "OpenClaw shared meta-theory",
    syncSharedSkills: "shared-skills/meta-theory.md",
    syncOk: "All runtime sync targets verified",
    syncMissing: (p) => `Missing: ${p}`,
    syncPartial: (label, got, need) => `${label}: got ${got}, need ${need}`,
    updateHeading: "Update Mode",
    updateNpm: "Reinstalling npm dependencies...",
    updateSkills: "Updating all skills...",
    updateSyncRuntimes: "Re-sync cross-runtime files (npm run sync:runtimes)?",
    updateSyncing: "Running sync:runtimes...",
    updateSyncDone: "Runtime sync complete",
    updateSyncSkip: "Runtime sync skipped",
    updateReGlobal: "Re-select global skills directory?",
    updateComplete: "Update complete!",
    actionPrompt: "What would you like to do?",
    actionInstall: "Install — Full first-time setup",
    actionUpdate: "Update — Refresh skills & sync runtimes",
    actionCheck: "Check — Verify dependencies & sync status",
    actionExit: "Exit",
    aboutAuthor: "About the Author",
    contactWebsite: "Website",
    contactGithub: "GitHub",
    contactFeishu: "Feishu Wiki",
    contactWechat: "WeChat Official Account",
  },
  "zh-CN": {
    modeCheck: "仅检查",
    modeUpdate: "更新",
    modeSilent: "静默",
    modeInteractive: "交互式",
    stepEnv: "第 1/5 步：环境检查",
    nodeOld: (v) => `Node.js v${v} 版本过低，需要 >=18`,
    nodeOk: (v) => `Node.js v${v}`,
    npmNotFound: "npm 未找到",
    gitNotFound: "git 未找到 — 安装技能需要 git",
    proxyInfo: (p) => `代理: ${p}`,
    pkgFound: "package.json 已找到",
    pkgNotFound: "package.json 未找到 — 请在 Meta_Kim 根目录运行",
    envFailed: "环境检查未通过，请先解决上述问题。",
    envOk: "环境检查通过！",
    stepRuntime: "第 2/5 步：运行时检测",
    claudeDetected: (v) => `Claude Code ${v}`,
    claudeNotDetected: "未检测到 Claude Code CLI",
    codexDetected: (v) => `Codex ${v}`,
    codexNotDetected: "未检测到 Codex CLI（可选）",
    openclawDetected: (v) => `OpenClaw ${v}`,
    openclawNotDetected: "未检测到 OpenClaw CLI（可选）",
    noRuntime: "未检测到支持的运行时。",
    noRuntimeHint1: "Meta_Kim 支持 Claude Code、Codex 或 OpenClaw。",
    noRuntimeHint2:
      "至少安装一个：https://docs.anthropic.com/en/docs/claude-code",
    continueAnyway: "仍然继续安装？",
    setupCancelled: "安装已取消。请先安装运行时。",
    stepConfig: "第 3/5 步：项目配置",
    mcpExists: ".mcp.json 已配置",
    mcpCreated: ".mcp.json 已创建 — MCP 运行时服务器已注册",
    settingsExists: ".claude/settings.json 已配置",
    askCreateSettings: "创建 .claude/settings.json（含 hooks 配置）？",
    settingsCreated: ".claude/settings.json 已创建 — hooks 和权限已注册",
    settingsSkipped: ".claude/settings.json 已跳过（用户选择）",
    settingsSkippedNoClaude:
      ".claude/settings.json 已跳过（未检测到 Claude Code）",
    stepSkills: "第 4/5 步：安装技能",
    shipsSkills: (n) => `Meta_Kim 内置 ${n} 个技能：`,
    runningNpm: "正在运行 npm install ...",
    npmDone: "npm 依赖安装完成",
    npmFailed: "npm install 失败",
    nodeModulesExist: "node_modules 已存在（使用 --update 重新安装）",
    skillUpdated: (n) => `${n} — 已更新`,
    skillInstalled: (n) => `${n} — 已安装`,
    skillExists: (n) => `${n} — 已安装`,
    skillSubdirInstalled: (n, s) => `${n} — 已安装 (子目录: ${s})`,
    skillFailed: (n, r) => `${n} — 安装失败 (${r})`,
    skillSubdirNotFound: (n) => `${n} — 子目录未找到`,
    skillsReady: (ok, total, fail) =>
      `${ok}/${total} 个技能就绪${fail > 0 ? `，${fail} 个失败` : ""}`,
    stepValidate: "第 5/5 步：验证",
    agentPrompts: (n) => `${n} 个 meta-agent 提示词`,
    validationPassed: "项目验证通过",
    validationWarnings: "验证有警告（不影响使用）",
    setupComplete: "安装完成！",
    whatMetaDoes: "Meta_Kim 是什么：",
    whatMetaDoesDesc1: "给你的 AI 编程助手配上一支专家团队：",
    whatMetaDoesDesc2: "有人负责代码审查，有人负责安全，有人负责记忆——",
    whatMetaDoesDesc3: "全部自动协调，无需手动管理。",
    howToUse: "如何使用：",
    step1Open: "在此目录打开 Claude Code：",
    step2Try: "试试 meta-theory 命令：",
    step3Or: "或直接让 Claude 做复杂任务：",
    step3Hint: "（Meta_Kim 会自动协调各专家）",
    codexNote: "Codex 提示词同步到 .codex/",
    openclawNote: "OpenClaw 工作区同步到 openclaw/",
    noRuntimeGetStarted: "未检测到运行时。安装 Claude Code 开始使用：",
    usefulCommands: "常用命令：",
    cmdUpdate: "更新所有技能",
    cmdCheck: "检查环境",
    cmdDoctor: "诊断 Meta_Kim 健康状态",
    cmdVerify: "完整验证",
    setupError: "安装出错：",
    selectLang: "Select language / 选择语言 / 言語を選択 / 언어 선택",
    choose: (n) => `选择 (1-${n})`,
    globalInstallPrompt:
      "Meta_Kim 技能安装到 ~/.claude/skills/（全局）。是否全局安装？",
    globalDirReady: (p) => `全局技能目录就绪：${p}`,
    globalDirCreated: (p) => `已创建全局技能目录：${p}`,
    depCheckHeading: "依赖检查",
    depOk: (n) => `${n} — 正常`,
    depMissing: (n) => `${n} — 缺失`,
    depNoFiles: (n) => `${n} — 目录存在但无 .md 文件`,
    depSummaryAll: "全部 9 个依赖验证通过",
    depSummarySome: (ok, total) =>
      `仅 ${ok}/${total} 个依赖验证通过 — 请使用 --update 重新安装`,
    syncHeading: "跨运行时同步检查",
    syncClaudeAgents: (n) => `Claude Code 智能体: ${n}/8 .md 文件`,
    syncClaudeSkills: "Claude Code 技能/meta-theory/SKILL.md",
    syncClaudeHooks: (n) => `Claude Code 钩子: ${n} 个脚本`,
    syncClaudeSettings: "Claude Code .claude/settings.json",
    syncClaudeMcp: "Claude Code .mcp.json",
    syncCodexAgents: (n) => `Codex 智能体: ${n}/8 .toml 文件`,
    syncCodexSkills: "Codex 技能/meta-theory.md",
    syncOpenclawWorkspaces: (n, f) =>
      `OpenClaw 工作区: ${n}/8 个智能体，每个 ${f} 文件`,
    syncOpenclawSkill: "OpenClaw 共享 meta-theory",
    syncSharedSkills: "共享技能/meta-theory.md",
    syncOk: "所有运行时同步目标验证通过",
    syncMissing: (p) => `缺失：${p}`,
    syncPartial: (label, got, need) => `${label}：实际 ${got}，需要 ${need}`,
    updateHeading: "更新模式",
    updateNpm: "正在重新安装 npm 依赖...",
    updateSkills: "正在更新所有技能...",
    updateSyncRuntimes: "是否重新同步跨运行时文件（npm run sync:runtimes）？",
    updateSyncing: "正在运行 sync:runtimes...",
    updateSyncDone: "运行时同步完成",
    updateSyncSkip: "运行时同步已跳过",
    updateReGlobal: "是否重新选择全局技能目录？",
    updateComplete: "更新完成！",
    actionPrompt: "你想做什么？",
    actionInstall: "安装 — 首次完整安装",
    actionUpdate: "更新 — 刷新技能并同步运行时",
    actionCheck: "检查 — 验证依赖和同步状态",
    actionExit: "退出",
    aboutAuthor: "关于作者",
    contactWebsite: "个人主页",
    contactGithub: "GitHub",
    contactFeishu: "飞书开源知识库",
    contactWechat: "微信公众号",
  },
  "ja-JP": {
    modeCheck: "チェックのみ",
    modeUpdate: "更新",
    modeSilent: "サイレント",
    modeInteractive: "インタラクティブ",
    stepEnv: "ステップ 1/5：環境チェック",
    nodeOld: (v) => `Node.js v${v} は古すぎます。>=18 が必要です`,
    nodeOk: (v) => `Node.js v${v}`,
    npmNotFound: "npm が見つかりません",
    gitNotFound: "git が見つかりません — スキルのインストールに必要です",
    proxyInfo: (p) => `プロキシ: ${p}`,
    pkgFound: "package.json が見つかりました",
    pkgNotFound:
      "package.json が見つかりません — Meta_Kim ルートで実行してください",
    envFailed: "環境チェックに失敗しました。上記の問題を解決してください。",
    envOk: "環境チェックOK！",
    stepRuntime: "ステップ 2/5：ランタイム検出",
    claudeDetected: (v) => `Claude Code ${v}`,
    claudeNotDetected: "Claude Code CLI が検出されませんでした",
    codexDetected: (v) => `Codex ${v}`,
    codexNotDetected: "Codex CLI が検出されませんでした（オプション）",
    openclawDetected: (v) => `OpenClaw ${v}`,
    openclawNotDetected: "OpenClaw CLI が検出されませんでした（オプション）",
    noRuntime: "サポートされているランタイムが検出されませんでした。",
    noRuntimeHint1:
      "Meta_Kim は Claude Code、Codex、または OpenClaw で動作します。",
    noRuntimeHint2:
      "少なくとも1つインストールしてください：https://docs.anthropic.com/en/docs/claude-code",
    continueAnyway: "セットアップを続行しますか？",
    setupCancelled:
      "セットアップがキャンセルされました。ランタイムをインストールして再実行してください。",
    stepConfig: "ステップ 3/5：プロジェクト設定",
    mcpExists: ".mcp.json は既に設定されています",
    mcpCreated: ".mcp.json 作成済み — MCP ランタイムサーバー登録完了",
    settingsExists: ".claude/settings.json は既に設定されています",
    askCreateSettings: ".claude/settings.json（hooks付き）を作成しますか？",
    settingsCreated:
      ".claude/settings.json 作成済み — hooks + パーミッション登録完了",
    settingsSkipped: ".claude/settings.json スキップ（ユーザー選択）",
    settingsSkippedNoClaude:
      ".claude/settings.json スキップ（Claude Code 未検出）",
    stepSkills: "ステップ 4/5：スキルインストール",
    shipsSkills: (n) => `Meta_Kim には ${n} 個のスキルが含まれています：`,
    runningNpm: "npm install を実行中...",
    npmDone: "npm 依存関係のインストール完了",
    npmFailed: "npm install に失敗しました",
    nodeModulesExist: "node_modules が存在します（--update で再インストール）",
    skillUpdated: (n) => `${n} — 更新済み`,
    skillInstalled: (n) => `${n} — インストール済み`,
    skillExists: (n) => `${n} — インストール済み`,
    skillSubdirInstalled: (n, s) =>
      `${n} — インストール済み (サブディレクトリ: ${s})`,
    skillFailed: (n, r) => `${n} — 失敗 (${r})`,
    skillSubdirNotFound: (n) => `${n} — サブディレクトリが見つかりません`,
    skillsReady: (ok, total, fail) =>
      `${ok}/${total} スキル準備完了${fail > 0 ? `、${fail} 失敗` : ""}`,
    stepValidate: "ステップ 5/5：検証",
    agentPrompts: (n) => `${n} 個のメタエージェントプロンプト`,
    validationPassed: "プロジェクト検証に合格しました",
    validationWarnings: "検証に警告があります（機能に影響なし）",
    setupComplete: "セットアップ完了！",
    whatMetaDoes: "Meta_Kim とは：",
    whatMetaDoesDesc1: "AIコーディングエージェントに専門家チームを提供します：",
    whatMetaDoesDesc2: "コードレビュー、セキュリティ、メモリ管理などを",
    whatMetaDoesDesc3: "自動的に調整します。",
    howToUse: "使い方：",
    step1Open: "このディレクトリで Claude Code を開く：",
    step2Try: "meta-theory コマンドを試す：",
    step3Or: "または Claude に複雑なタスクを依頼する：",
    step3Hint: "（Meta_Kim が自動的に専門家を調整します）",
    codexNote: "Codex プロンプトは .codex/ に同期されます",
    openclawNote: "OpenClaw ワークスペースは openclaw/ に同期されます",
    noRuntimeGetStarted:
      "ランタイムが検出されませんでした。Claude Code をインストールしてください：",
    usefulCommands: "便利なコマンド：",
    cmdUpdate: "すべてのスキルを更新",
    cmdCheck: "環境をチェック",
    cmdDoctor: "Meta_Kim の健全性を診断",
    cmdVerify: "フル検証",
    setupError: "セットアップエラー：",
    selectLang: "Select language / 选择语言 / 言語を選択 / 언어 선택",
    choose: (n) => `選択 (1-${n})`,
    globalInstallPrompt:
      "Meta_Kim スキルは ~/.claude/skills/（グローバル）にインストールされます。グローバルインストールしますか？",
    globalDirReady: (p) => `グローバルスキルディレクトリ準備完了：${p}`,
    globalDirCreated: (p) => `グローバルスキルディレクトリ作成：${p}`,
    depCheckHeading: "依存関係チェック",
    depOk: (n) => `${n} — OK`,
    depMissing: (n) => `${n} — 見つかりません`,
    depNoFiles: (n) => `${n} — ディレクトリはありますが.mdファイルがありません`,
    depSummaryAll: "9つの依存関係すべて検証済み",
    depSummarySome: (ok, total) =>
      `${ok}/${total} の依存関係のみ検証 — --update で再インストールしてください`,
    syncHeading: "ランタイム間同期チェック",
    syncClaudeAgents: (n) => `Claude Code エージェント: ${n}/8 .md ファイル`,
    syncClaudeSkills: "Claude Code スキル/meta-theory/SKILL.md",
    syncClaudeHooks: (n) => `Claude Code フック: ${n} スクリプト`,
    syncClaudeSettings: "Claude Code .claude/settings.json",
    syncClaudeMcp: "Claude Code .mcp.json",
    syncCodexAgents: (n) => `Codex エージェント: ${n}/8 .toml ファイル`,
    syncCodexSkills: "Codex スキル/meta-theory.md",
    syncOpenclawWorkspaces: (n, f) =>
      `OpenClaw ワークスペース: ${n}/8 エージェント、各 ${f} ファイル`,
    syncOpenclawSkill: "OpenClaw 共有 meta-theory",
    syncSharedSkills: "共有スキル/meta-theory.md",
    syncOk: "すべてのランタイム同期ターゲット検証済み",
    syncMissing: (p) => `不足：${p}`,
    syncPartial: (label, got, need) => `${label}：実際 ${got}、必要 ${need}`,
    updateHeading: "アップデートモード",
    updateNpm: "npm依存関係を再インストール中...",
    updateSkills: "すべてのスキルを更新中...",
    updateSyncRuntimes:
      "ランタイム間ファイルを再同期しますか（npm run sync:runtimes）？",
    updateSyncing: "sync:runtimes を実行中...",
    updateSyncDone: "ランタイム同期完了",
    updateSyncSkip: "ランタイム同期スキップ",
    updateReGlobal: "グローバルスキルディレクトリを再選択しますか？",
    updateComplete: "アップデート完了！",
    actionPrompt: "何をしますか？",
    actionInstall: "インストール — 初回セットアップ",
    actionUpdate: "アップデート — スキル更新＆ランタイム同期",
    actionCheck: "チェック — 依存関係と同期状態を確認",
    actionExit: "終了",
    aboutAuthor: "作者について",
    contactWebsite: "ウェブサイト",
    contactGithub: "GitHub",
    contactFeishu: "Feishu Wiki",
    contactWechat: "WeChat公式アカウント",
  },
  "ko-KR": {
    modeCheck: "확인만",
    modeUpdate: "업데이트",
    modeSilent: "자동",
    modeInteractive: "대화형",
    stepEnv: "단계 1/5: 환경 확인",
    nodeOld: (v) => `Node.js v${v} 버전이 너무 낮습니다. >=18 필요`,
    nodeOk: (v) => `Node.js v${v}`,
    npmNotFound: "npm을 찾을 수 없습니다",
    gitNotFound: "git을 찾을 수 없습니다 — 스킬 설치에 필요합니다",
    proxyInfo: (p) => `프록시: ${p}`,
    pkgFound: "package.json 찾음",
    pkgNotFound:
      "package.json을 찾을 수 없습니다 — Meta_Kim 루트에서 실행하세요",
    envFailed: "환경 확인 실패. 위 문제를 먼저 해결하세요.",
    envOk: "환경 확인 통과!",
    stepRuntime: "단계 2/5: 런타임 감지",
    claudeDetected: (v) => `Claude Code ${v}`,
    claudeNotDetected: "Claude Code CLI 감지되지 않음",
    codexDetected: (v) => `Codex ${v}`,
    codexNotDetected: "Codex CLI 감지되지 않음 (선택)",
    openclawDetected: (v) => `OpenClaw ${v}`,
    openclawNotDetected: "OpenClaw CLI 감지되지 않음 (선택)",
    noRuntime: "지원되는 런타임이 감지되지 않았습니다.",
    noRuntimeHint1:
      "Meta_Kim은 Claude Code, Codex 또는 OpenClaw에서 작동합니다.",
    noRuntimeHint2:
      "최소 하나를 설치하세요: https://docs.anthropic.com/en/docs/claude-code",
    continueAnyway: "설정을 계속 진행할까요?",
    setupCancelled: "설정이 취소되었습니다. 런타임을 설치하고 다시 실행하세요.",
    stepConfig: "단계 3/5: 프로젝트 설정",
    mcpExists: ".mcp.json이 이미 구성되어 있습니다",
    mcpCreated: ".mcp.json 생성됨 — MCP 런타임 서버 등록 완료",
    settingsExists: ".claude/settings.json이 이미 구성되어 있습니다",
    askCreateSettings: "hooks가 포함된 .claude/settings.json을 생성할까요?",
    settingsCreated: ".claude/settings.json 생성됨 — hooks + 권한 등록 완료",
    settingsSkipped: ".claude/settings.json 건너뜀 (사용자 선택)",
    settingsSkippedNoClaude:
      ".claude/settings.json 건너뜀 (Claude Code 미감지)",
    stepSkills: "단계 4/5: 스킬 설치",
    shipsSkills: (n) => `Meta_Kim에는 ${n}개의 스킬이 포함되어 있습니다:`,
    runningNpm: "npm install 실행 중...",
    npmDone: "npm 의존성 설치 완료",
    npmFailed: "npm install 실패",
    nodeModulesExist: "node_modules가 존재합니다 (--update로 재설치)",
    skillUpdated: (n) => `${n} — 업데이트됨`,
    skillInstalled: (n) => `${n} — 설치됨`,
    skillExists: (n) => `${n} — 이미 설치됨`,
    skillSubdirInstalled: (n, s) => `${n} — 설치됨 (하위디렉토리: ${s})`,
    skillFailed: (n, r) => `${n} — 실패 (${r})`,
    skillSubdirNotFound: (n) => `${n} — 하위디렉토리를 찾을 수 없음`,
    skillsReady: (ok, total, fail) =>
      `${ok}/${total} 스킬 준비 완료${fail > 0 ? `, ${fail} 실패` : ""}`,
    stepValidate: "단계 5/5: 검증",
    agentPrompts: (n) => `${n}개의 메타 에이전트 프롬프트`,
    validationPassed: "프로젝트 검증 통과",
    validationWarnings: "검증에 경고가 있습니다 (기능에 영향 없음)",
    setupComplete: "설정 완료!",
    whatMetaDoes: "Meta_Kim이란:",
    whatMetaDoesDesc1: "AI 코딩 에이전트에 전문가 팀을 제공합니다:",
    whatMetaDoesDesc2: "코드 리뷰, 보안, 메모리 관리 등을",
    whatMetaDoesDesc3: "자동으로 조정합니다.",
    howToUse: "사용 방법:",
    step1Open: "이 디렉토리에서 Claude Code 열기:",
    step2Try: "meta-theory 명령 시도:",
    step3Or: "또는 Claude에게 복잡한 작업 요청:",
    step3Hint: "(Meta_Kim이 자동으로 전문가를 조정합니다)",
    codexNote: "Codex 프롬프트는 .codex/에 동기화됩니다",
    openclawNote: "OpenClaw 워크스페이스는 openclaw/에 동기화됩니다",
    noRuntimeGetStarted:
      "런타임이 감지되지 않았습니다. Claude Code를 설치하세요:",
    usefulCommands: "유용한 명령:",
    cmdUpdate: "모든 스킬 업데이트",
    cmdCheck: "환경 확인",
    cmdDoctor: "Meta_Kim 상태 진단",
    cmdVerify: "전체 검증",
    setupError: "설정 오류:",
    selectLang: "Select language / 选择语言 / 言語を選択 / 언어 선택",
    choose: (n) => `선택 (1-${n})`,
    globalInstallPrompt:
      "Meta_Kim 스킬을 ~/.claude/skills/ (전역)에 설치합니다. 전역 설치할까요?",
    globalDirReady: (p) => `전역 스킬 디렉토리 준비됨: ${p}`,
    globalDirCreated: (p) => `전역 스킬 디렉토리 생성됨: ${p}`,
    depCheckHeading: "의존성 확인",
    depOk: (n) => `${n} — 정상`,
    depMissing: (n) => `${n} — 누락`,
    depNoFiles: (n) => `${n} — 디렉토리는 있으나 .md 파일 없음`,
    depSummaryAll: "9개 의존성 모두 확인 완료",
    depSummarySome: (ok, total) =>
      `${ok}/${total}개 의존성만 확인 — --update로 재설치하세요`,
    syncHeading: "런타임 간 동기화 확인",
    syncClaudeAgents: (n) => `Claude Code 에이전트: ${n}/8 .md 파일`,
    syncClaudeSkills: "Claude Code 스킬/meta-theory/SKILL.md",
    syncClaudeHooks: (n) => `Claude Code 훅: ${n} 스크립트`,
    syncClaudeSettings: "Claude Code .claude/settings.json",
    syncClaudeMcp: "Claude Code .mcp.json",
    syncCodexAgents: (n) => `Codex 에이전트: ${n}/8 .toml 파일`,
    syncCodexSkills: "Codex 스킬/meta-theory.md",
    syncOpenclawWorkspaces: (n, f) =>
      `OpenClaw 워크스페이스: ${n}/8 에이전트, 각 ${f} 파일`,
    syncOpenclawSkill: "OpenClaw 공유 meta-theory",
    syncSharedSkills: "공유 스킬/meta-theory.md",
    syncOk: "모든 런타임 동기화 대상 확인 완료",
    syncMissing: (p) => `누락: ${p}`,
    syncPartial: (label, got, need) => `${label}: 실제 ${got}, 필요 ${need}`,
    updateHeading: "업데이트 모드",
    updateNpm: "npm 의존성 재설치 중...",
    updateSkills: "모든 스킬 업데이트 중...",
    updateSyncRuntimes:
      "런타임 간 파일을 다시 동기화할까요 (npm run sync:runtimes)?",
    updateSyncing: "sync:runtimes 실행 중...",
    updateSyncDone: "런타임 동기화 완료",
    updateSyncSkip: "런타임 동기화 건너뜀",
    updateReGlobal: "전역 스킬 디렉토리를 다시 선택할까요?",
    updateComplete: "업데이트 완료!",
    actionPrompt: "무엇을 하시겠습니까?",
    actionInstall: "설치 — 최초 전체 설정",
    actionUpdate: "업데이트 — 스킬 갱신 및 런타임 동기화",
    actionCheck: "확인 — 의존성 및 동기화 상태 검증",
    actionExit: "종료",
    aboutAuthor: "작성자 소개",
    contactWebsite: "웹사이트",
    contactGithub: "GitHub",
    contactFeishu: "Feishu 위키",
    contactWechat: "WeChat 공식 계정",
  },
};

let t = I18N.en; // default, overwritten by selectLanguage()

// ── ANSI colors ─────────────────────────────────────────

const C = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
  blue: "\x1b[34m",
  white: "\x1b[37m",
};

function log(icon, msg) {
  console.log(`  ${icon} ${msg}`);
}
function ok(msg) {
  log(`${C.green}✓${C.reset}`, msg);
}
function skip(msg) {
  log(`${C.yellow}⊘${C.reset}`, `${C.dim}${msg}${C.reset}`);
}
function warn(msg) {
  log(`${C.yellow}⚠${C.reset}`, msg);
}
function fail(msg) {
  log(`${C.red}✗${C.reset}`, msg);
}
function info(msg) {
  log(`${C.cyan}ℹ${C.reset}`, msg);
}
function heading(msg) {
  console.log(`\n${C.bold}${C.magenta}── ${msg} ──${C.reset}\n`);
}

function run(cmd, opts = {}) {
  try {
    return execSync(cmd, {
      encoding: "utf-8",
      stdio: "pipe",
      cwd: PROJECT_DIR,
      shell: isWin,
      ...opts,
    }).trim();
  } catch {
    return null;
  }
}

// Cross-platform CLI detection: tries direct, .exe, then where/which fallback
function detectCli(name) {
  for (const cmd of [name, `${name}.exe`]) {
    const ver = run(`${cmd} --version`);
    if (ver) return ver;
  }
  const resolved = isWin
    ? run(`where ${name} 2>nul`)
    : run(`which ${name} 2>/dev/null`);
  if (resolved) {
    const path = resolved.split(/\r?\n/)[0].trim();
    const ver = run(`"${path}" --version`);
    if (ver) return ver;
  }
  return null;
}

function gitProxyArgs() {
  if (!PROXY) return "";
  return `-c http.proxy=${PROXY} -c https.proxy=${PROXY}`;
}

// ── Interactive prompt ──────────────────────────────────

function ask(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(`  ${C.bold}${C.cyan}?${C.reset} ${question} `, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function askYesNo(question, defaultYes = true) {
  if (silentMode) return defaultYes;
  const hint = defaultYes ? "[Y/n]" : "[y/N]";
  const answer = await ask(`${question} ${C.dim}${hint}${C.reset}`);
  if (!answer) return defaultYes;
  return answer.toLowerCase().startsWith("y");
}

async function askSelect(question, options) {
  console.log(`\n  ${C.bold}${C.cyan}?${C.reset} ${question}`);
  options.forEach((opt, i) => {
    console.log(`    ${C.dim}${i + 1}.${C.reset} ${opt}`);
  });
  const answer = await ask(t.choose(options.length));
  const idx = parseInt(answer, 10) - 1;
  return idx >= 0 && idx < options.length ? idx : 0;
}

// ── Step 0: Language selection ───────────────────────────

async function selectLanguage() {
  if (langArg) {
    const match = LANGUAGES.find((l) => l.code === langArg);
    if (match) {
      t = I18N[match.code];
      return match;
    }
  }

  if (silentMode) return LANGUAGES[0];

  const labels = LANGUAGES.map((l) => `${l.label} (${l.code})`);
  const idx = await askSelect(t.selectLang, labels);
  t = I18N[LANGUAGES[idx].code];
  return LANGUAGES[idx];
}

// ── Global install guidance ─────────────────────────────

async function ensureGlobalSkillsDir() {
  if (existsSync(SKILLS_DIR)) {
    ok(t.globalDirReady(SKILLS_DIR));
    return true;
  }

  const shouldInstall = await askYesNo(t.globalInstallPrompt, true);
  if (!shouldInstall) {
    skip(t.globalInstallPrompt.split("?")[0] + " — skipped");
    return false;
  }

  mkdirSync(SKILLS_DIR, { recursive: true });
  ok(t.globalDirCreated(SKILLS_DIR));
  return true;
}

// ── Dependency verification ─────────────────────────────

function checkDependencies() {
  heading(t.depCheckHeading);
  let verified = 0;

  for (const skill of SKILLS) {
    const dir = join(SKILLS_DIR, skill.name);
    if (!existsSync(dir)) {
      fail(t.depMissing(skill.name));
      continue;
    }
    // Check for at least one .md file (SKILL.md or any .md)
    const files = readdirSync(dir).filter((f) => f.endsWith(".md"));
    if (files.length === 0) {
      warn(t.depNoFiles(skill.name));
      continue;
    }
    ok(t.depOk(skill.name));
    verified++;
  }

  console.log();
  if (verified === SKILLS.length) {
    info(t.depSummaryAll);
  } else {
    warn(t.depSummarySome(verified, SKILLS.length));
  }
  return verified === SKILLS.length;
}

// ── Cross-runtime sync verification ─────────────────────

const META_AGENTS = [
  "meta-artisan",
  "meta-conductor",
  "meta-genesis",
  "meta-librarian",
  "meta-prism",
  "meta-scout",
  "meta-sentinel",
  "meta-warden",
];
const OPENCLAW_WS_FILES = 10; // expected files per workspace

function checkSync(runtimes) {
  heading(t.syncHeading);
  let allOk = true;

  // --- Claude Code ---
  const claudeAgentsDir = join(PROJECT_DIR, ".claude", "agents");
  if (existsSync(claudeAgentsDir)) {
    const agents = readdirSync(claudeAgentsDir).filter((f) =>
      f.endsWith(".md"),
    );
    if (agents.length === META_AGENTS.length)
      ok(t.syncClaudeAgents(agents.length));
    else {
      warn(t.syncPartial("Claude agents", agents.length, META_AGENTS.length));
      allOk = false;
    }
  } else {
    fail(t.syncMissing(".claude/agents/"));
    allOk = false;
  }

  const claudeSkillPath = join(
    PROJECT_DIR,
    ".claude",
    "skills",
    "meta-theory",
    "SKILL.md",
  );
  if (existsSync(claudeSkillPath)) ok(t.syncClaudeSkills);
  else {
    fail(t.syncMissing(".claude/skills/meta-theory/SKILL.md"));
    allOk = false;
  }

  const hooksDir = join(PROJECT_DIR, ".claude", "hooks");
  if (existsSync(hooksDir)) {
    const hooks = readdirSync(hooksDir).filter((f) => f.endsWith(".mjs"));
    ok(t.syncClaudeHooks(hooks.length));
  } else {
    fail(t.syncMissing(".claude/hooks/"));
    allOk = false;
  }

  if (existsSync(join(PROJECT_DIR, ".claude", "settings.json")))
    ok(t.syncClaudeSettings);
  else {
    warn(t.syncMissing(".claude/settings.json"));
    allOk = false;
  }

  if (existsSync(join(PROJECT_DIR, ".mcp.json"))) ok(t.syncClaudeMcp);
  else {
    warn(t.syncMissing(".mcp.json"));
    allOk = false;
  }

  // --- Codex ---
  if (runtimes.codex || existsSync(join(PROJECT_DIR, ".codex"))) {
    const codexAgentsDir = join(PROJECT_DIR, ".codex", "agents");
    if (existsSync(codexAgentsDir)) {
      const agents = readdirSync(codexAgentsDir).filter((f) =>
        f.endsWith(".toml"),
      );
      if (agents.length === META_AGENTS.length)
        ok(t.syncCodexAgents(agents.length));
      else {
        warn(t.syncPartial("Codex agents", agents.length, META_AGENTS.length));
        allOk = false;
      }
    } else {
      fail(t.syncMissing(".codex/agents/"));
      allOk = false;
    }

    const codexSkillPath = join(
      PROJECT_DIR,
      ".codex",
      "skills",
      "meta-theory.md",
    );
    if (existsSync(codexSkillPath)) ok(t.syncCodexSkills);
    else {
      fail(t.syncMissing(".codex/skills/meta-theory.md"));
      allOk = false;
    }
  }

  // --- OpenClaw ---
  if (runtimes.openclaw || existsSync(join(PROJECT_DIR, "openclaw"))) {
    const ocWorkspaces = join(PROJECT_DIR, "openclaw", "workspaces");
    if (existsSync(ocWorkspaces)) {
      const wsDirs = readdirSync(ocWorkspaces, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name);
      const wsCount = wsDirs.filter((n) => META_AGENTS.includes(n)).length;
      // Check each workspace has expected file count
      const minFiles = wsDirs.reduce((min, name) => {
        const files = readdirSync(join(ocWorkspaces, name));
        return Math.min(min, files.length);
      }, Infinity);
      if (wsCount === META_AGENTS.length && minFiles >= OPENCLAW_WS_FILES) {
        ok(t.syncOpenclawWorkspaces(wsCount, minFiles));
      } else {
        warn(
          t.syncPartial(
            "OpenClaw workspaces",
            `${wsCount} agents, ${minFiles} files`,
            `${META_AGENTS.length} agents, ${OPENCLAW_WS_FILES}+ files`,
          ),
        );
        allOk = false;
      }
    } else {
      fail(t.syncMissing("openclaw/workspaces/"));
      allOk = false;
    }
  }

  // --- Shared ---
  const sharedSkill = join(PROJECT_DIR, "shared-skills", "meta-theory.md");
  if (existsSync(sharedSkill)) ok(t.syncSharedSkills);
  else {
    warn(t.syncMissing("shared-skills/meta-theory.md"));
    allOk = false;
  }

  console.log();
  if (allOk) info(t.syncOk);
  return allOk;
}

// ── Step 1: Pre-flight checks ───────────────────────────

function preflight() {
  heading(t.stepEnv);
  let passed = true;

  const nodeVer = process.versions.node;
  const major = parseInt(nodeVer.split(".")[0], 10);
  if (major >= 18) ok(t.nodeOk(nodeVer));
  else {
    fail(t.nodeOld(nodeVer));
    passed = false;
  }

  const npmVer = run("npm --version");
  if (npmVer) ok(`npm v${npmVer}`);
  else {
    fail(t.npmNotFound);
    passed = false;
  }

  const gitVer = run("git --version");
  if (gitVer) ok(`${gitVer}`);
  else {
    fail(t.gitNotFound);
    passed = false;
  }

  if (PROXY) info(t.proxyInfo(PROXY));
  if (existsSync(join(PROJECT_DIR, "package.json"))) ok(t.pkgFound);
  else {
    fail(t.pkgNotFound);
    passed = false;
  }

  return passed;
}

// ── Step 2: Runtime detection ───────────────────────────

async function detectRuntimes() {
  heading(t.stepRuntime);
  const runtimes = { claude: false, codex: false, openclaw: false };

  const claudeVer = detectCli("claude");
  if (claudeVer) {
    ok(t.claudeDetected(claudeVer));
    runtimes.claude = true;
  } else warn(t.claudeNotDetected);

  const codexVer = detectCli("codex");
  if (codexVer) {
    ok(t.codexDetected(codexVer));
    runtimes.codex = true;
  } else skip(t.codexNotDetected);

  const openclawVer = detectCli("openclaw") || detectCli("oc");
  if (openclawVer) {
    ok(t.openclawDetected(openclawVer));
    runtimes.openclaw = true;
  } else skip(t.openclawNotDetected);

  if (!runtimes.claude && !runtimes.codex && !runtimes.openclaw) {
    console.log(`\n  ${C.yellow}⚠ ${t.noRuntime}${C.reset}`);
    console.log(`  ${C.dim}${t.noRuntimeHint1}${C.reset}`);
    console.log(`  ${C.dim}${t.noRuntimeHint2}${C.reset}\n`);
    const proceed = await askYesNo(t.continueAnyway, true);
    if (!proceed) {
      console.log(`\n  ${C.dim}${t.setupCancelled}${C.reset}\n`);
      process.exit(0);
    }
  }

  return runtimes;
}

// ── Step 3: Auto-configure project files ────────────────

async function autoConfigure(runtimes) {
  heading(t.stepConfig);

  const mcpPath = join(PROJECT_DIR, ".mcp.json");
  if (existsSync(mcpPath)) {
    ok(t.mcpExists);
  } else {
    const mcpConfig = {
      mcpServers: {
        "meta-kim-runtime": {
          type: "stdio",
          command: "node",
          args: ["scripts/mcp/meta-runtime-server.mjs"],
          env: {},
        },
      },
    };
    writeFileSync(mcpPath, JSON.stringify(mcpConfig, null, 2) + "\n");
    ok(t.mcpCreated);
  }

  if (runtimes.claude) {
    const settingsDir = join(PROJECT_DIR, ".claude");
    const settingsPath = join(settingsDir, "settings.json");
    if (existsSync(settingsPath)) {
      ok(t.settingsExists);
    } else {
      const shouldCreate = await askYesNo(t.askCreateSettings, true);
      if (shouldCreate) {
        mkdirSync(settingsDir, { recursive: true });
        const settings = {
          permissions: {
            deny: [
              "Read(./.env)",
              "Read(./.env.*)",
              "Read(./secrets/**)",
              "Read(./**/*.pem)",
              "Read(./**/*.key)",
            ],
          },
          hooks: {
            PreToolUse: [
              {
                matcher: "Bash",
                hooks: [
                  {
                    type: "command",
                    command: "node .claude/hooks/block-dangerous-bash.mjs",
                  },
                  {
                    type: "command",
                    command: "node .claude/hooks/pre-git-push-confirm.mjs",
                  },
                ],
              },
            ],
            PostToolUse: [
              {
                matcher: "Edit|Write",
                hooks: [
                  {
                    type: "command",
                    command: "node .claude/hooks/post-format.mjs",
                  },
                  {
                    type: "command",
                    command: "node .claude/hooks/post-typecheck.mjs",
                  },
                  {
                    type: "command",
                    command: "node .claude/hooks/post-console-log-warn.mjs",
                  },
                ],
              },
            ],
            SubagentStart: [
              {
                matcher: "*",
                hooks: [
                  {
                    type: "command",
                    command: "node .claude/hooks/subagent-context.mjs",
                  },
                ],
              },
            ],
            Stop: [
              {
                matcher: "*",
                hooks: [
                  {
                    type: "command",
                    command: "node .claude/hooks/stop-console-log-audit.mjs",
                  },
                  {
                    type: "command",
                    command: "node .claude/hooks/stop-completion-guard.mjs",
                  },
                ],
              },
            ],
          },
        };
        writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + "\n");
        ok(t.settingsCreated);
      } else {
        skip(t.settingsSkipped);
      }
    }
  } else {
    skip(t.settingsSkippedNoClaude);
  }

  return true;
}

// ── Step 4: npm install + skills ────────────────────────

function installDeps() {
  if (existsSync(join(PROJECT_DIR, "node_modules", "@modelcontextprotocol"))) {
    if (!updateMode) {
      skip(t.nodeModulesExist);
      return true;
    }
  }
  info(t.runningNpm);
  const result = spawnSync("npm", ["install"], {
    cwd: PROJECT_DIR,
    stdio: "inherit",
    shell: isWin,
  });
  if (result.status === 0) {
    ok(t.npmDone);
    return true;
  }
  fail(t.npmFailed);
  return false;
}

function installSkill(skill) {
  const target = join(SKILLS_DIR, skill.name);
  const proxy = gitProxyArgs();

  if (existsSync(target)) {
    if (updateMode) {
      if (skill.subdir) {
        rmSync(target, { recursive: true, force: true });
      } else {
        const pullResult = run(`git ${proxy} pull --ff-only`.trim(), {
          cwd: target,
        });
        if (pullResult !== null) {
          ok(t.skillUpdated(skill.name));
          return true;
        }
        rmSync(target, { recursive: true, force: true });
      }
    } else {
      skip(t.skillExists(skill.name));
      return true;
    }
  }

  if (skill.subdir) return installSkillFromSubdir(skill, target, proxy);

  const url = `https://github.com/${skill.repo}.git`;
  const cloneResult = run(
    `git ${proxy} clone --depth 1 "${url}" "${target}"`.trim(),
  );
  if (cloneResult !== null) {
    ok(t.skillInstalled(skill.name));
    return true;
  }
  fail(t.skillFailed(skill.name, skill.repo));
  return false;
}

function installSkillFromSubdir(skill, target, proxy) {
  const url = `https://github.com/${skill.repo}.git`;
  const tmp = join(tmpdir(), `meta-kim-skill-${Date.now()}`);
  try {
    run(
      `git ${proxy} clone --depth 1 --filter=blob:none --sparse "${url}" "${tmp}"`.trim(),
    );
    run(`git sparse-checkout set "${skill.subdir}"`, { cwd: tmp });
    const src = join(tmp, skill.subdir);
    if (existsSync(src)) {
      mkdirSync(target, { recursive: true });
      cpSync(src, target, { recursive: true });
      ok(t.skillSubdirInstalled(skill.name, skill.subdir));
      return true;
    }
    fail(t.skillSubdirNotFound(skill.name));
    return false;
  } catch {
    fail(t.skillFailed(skill.name, ""));
    return false;
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

async function installAllSkills() {
  heading(t.stepSkills);
  if (!silentMode) {
    console.log(`  ${C.dim}${t.shipsSkills(SKILLS.length)}${C.reset}`);
    SKILLS.forEach((s) => console.log(`    ${C.dim}•${C.reset} ${s.name}`));
    console.log();
  }
  installDeps();
  mkdirSync(SKILLS_DIR, { recursive: true });
  let installed = 0,
    failed = 0;
  for (const skill of SKILLS) {
    if (installSkill(skill)) installed++;
    else failed++;
  }
  console.log();
  info(t.skillsReady(installed, SKILLS.length, failed));
  return failed === 0;
}

// ── Step 5: Validate + next steps ───────────────────────

async function validate() {
  heading(t.stepValidate);
  const agentsDir = join(PROJECT_DIR, ".claude", "agents");
  if (existsSync(agentsDir)) {
    const agents = readdirSync(agentsDir).filter((f) => f.endsWith(".md"));
    ok(t.agentPrompts(agents.length));
  }
  const validateResult = spawnSync("node", ["scripts/validate-project.mjs"], {
    cwd: PROJECT_DIR,
    stdio: "inherit",
    shell: isWin,
  });
  if (validateResult.status === 0) ok(t.validationPassed);
  else warn(t.validationWarnings);
}

function showNextSteps(runtimes) {
  console.log(`
${C.bold}${C.green}  ──────────────────────────────────────────────
  ${t.setupComplete}
  ──────────────────────────────────────────────${C.reset}

${C.bold}  ${t.whatMetaDoes}${C.reset}
  ${C.dim}${t.whatMetaDoesDesc1}${C.reset}
  ${C.dim}${t.whatMetaDoesDesc2}${C.reset}
  ${C.dim}${t.whatMetaDoesDesc3}${C.reset}

${C.bold}  ${t.howToUse}${C.reset}
`);

  if (runtimes.claude) {
    console.log(`  ${C.cyan}1.${C.reset} ${t.step1Open}
     ${C.dim}cd "${PROJECT_DIR}" && claude${C.reset}

  ${C.cyan}2.${C.reset} ${t.step2Try}
     ${C.dim}/meta-theory review my agent definitions${C.reset}

  ${C.cyan}3.${C.reset} ${t.step3Or}
     ${C.dim}Build a user authentication system${C.reset}
     ${C.dim}${t.step3Hint}${C.reset}
`);
  }

  if (runtimes.codex)
    console.log(`  ${C.cyan}Codex:${C.reset} ${C.dim}${t.codexNote}${C.reset}`);
  if (runtimes.openclaw)
    console.log(
      `  ${C.cyan}OpenClaw:${C.reset} ${C.dim}${t.openclawNote}${C.reset}`,
    );

  if (!runtimes.claude && !runtimes.codex && !runtimes.openclaw) {
    console.log(`  ${C.yellow}${t.noRuntimeGetStarted}${C.reset}`);
    console.log(
      `  ${C.dim}https://docs.anthropic.com/en/docs/claude-code${C.reset}`,
    );
  }

  console.log(`${C.bold}  ${t.usefulCommands}${C.reset}
    ${C.dim}node setup.mjs --update      # ${t.cmdUpdate}${C.reset}
    ${C.dim}node setup.mjs --check       # ${t.cmdCheck}${C.reset}
    ${C.dim}npm run doctor:governance     # ${t.cmdDoctor}${C.reset}
    ${C.dim}npm run verify:all            # ${t.cmdVerify}${C.reset}
`);
}

// ── Main ────────────────────────────────────────────────

function bannerLogo() {
  const G = {
    M: [
      "1000001",
      "1100011",
      "1010101",
      "1001001",
      "1000001",
      "1000001",
      "1000001",
    ],
    E: [
      "1111111",
      "1000000",
      "1000000",
      "1111100",
      "1000000",
      "1000000",
      "1111111",
    ],
    T: [
      "1111111",
      "0011100",
      "0011100",
      "0011100",
      "0011100",
      "0011100",
      "0011100",
    ],
    A: [
      "0011100",
      "0100010",
      "0100010",
      "0111110",
      "0100010",
      "0100010",
      "0100010",
    ],
    _: [
      "0000000",
      "0000000",
      "0000000",
      "0111110",
      "0000000",
      "0000000",
      "0000000",
    ],
    K: [
      "1100011",
      "1100110",
      "1101100",
      "1111000",
      "1101100",
      "1100110",
      "1100011",
    ],
    I: [
      "0111110",
      "0011100",
      "0011100",
      "0011100",
      "0011100",
      "0011100",
      "0111110",
    ],
  };
  const word = ["M", "E", "T", "A", "_", "K", "I", "M"];
  const art = [];
  for (let row = 0; row < 7; row++) {
    let line = "";
    word.forEach((ch, idx) => {
      line += G[ch][row].replace(/1/g, "█").replace(/0/g, " ");
      if (idx < word.length - 1) line += " ";
    });
    art.push(line);
  }
  const contacts = [
    "Website: https://www.aiking.dev/",
    "GitHub:  https://github.com/KimYx0207",
    "Feishu:  https://my.feishu.cn/wiki/OhQ8wqntFihcI1kWVDlcNdpznFf",
    "WeChat:  老金带你玩AI",
  ];
  const dw = (s) =>
    [...s].reduce((w, ch) => {
      const cp = ch.codePointAt(0);
      const isCJK =
        (cp >= 0x4e00 && cp <= 0x9fff) ||
        (cp >= 0x3040 && cp <= 0x30ff) ||
        (cp >= 0xac00 && cp <= 0xd7af) ||
        (cp >= 0xff00 && cp <= 0xffef) ||
        (cp >= 0x3000 && cp <= 0x303f);
      return w + (isCJK ? 2 : 1);
    }, 0);
  const padVis = (s, width) => s + " ".repeat(Math.max(0, width - dw(s)));
  const artW = art[0].length;
  const contentW = Math.max(artW, ...contacts.map(dw));
  const PAD = 3;
  const innerW = contentW + PAD * 2;
  const bar = "━".repeat(innerW);
  const blank = " ".repeat(innerW);
  const center = (text) => {
    const p = innerW - dw(text);
    const l = Math.floor(p / 2);
    return " ".repeat(l) + text + " ".repeat(p - l);
  };
  const leftPad = (text) =>
    " ".repeat(PAD) + padVis(text, contentW) + " ".repeat(PAD);

  console.log(`
${C.bold}${C.cyan}  ┏${bar}┓
  ┃${blank}┃
${art.map((l) => `  ┃${C.bold}${C.white}${leftPad(l)}${C.reset}${C.bold}${C.cyan}┃`).join("\n")}
  ┃${blank}┃
  ┃${C.green}${center(`Setup ${packageVersion}`)}${C.reset}${C.bold}${C.cyan}┃
  ┃${blank}┃
  ┃${C.dim}${center("─".repeat(30))}${C.reset}${C.bold}${C.cyan}┃
${contacts.map((c) => `  ┃${C.dim}${leftPad(c)}${C.reset}${C.bold}${C.cyan}┃`).join("\n")}
  ┃${blank}┃
  ┗${bar}┛${C.reset}`);
}

function showModeInfo() {
  const modeStr = checkOnly
    ? t.modeCheck
    : updateMode
      ? t.modeUpdate
      : silentMode
        ? t.modeSilent
        : t.modeInteractive;
  console.log(`${C.dim}  Mode: ${modeStr}${C.reset}
${C.dim}  OS: ${platform()} | Node ${process.versions.node}${C.reset}
${C.dim}  Dir: ${PROJECT_DIR}${C.reset}
`);
}

async function main() {
  // Show logo before language selection
  bannerLogo();

  // Step 0: Language selection
  await selectLanguage();
  showModeInfo();

  if (!preflight()) {
    console.log(`\n${C.red}  ${t.envFailed}${C.reset}\n`);
    process.exit(1);
  }

  // ── CLI shortcut modes (non-interactive) ──
  if (checkOnly) {
    console.log(`\n${C.green}  ${t.envOk}${C.reset}\n`);
    checkDependencies();
    const fakeRuntimes = {
      claude: true,
      codex: existsSync(join(PROJECT_DIR, ".codex")),
      openclaw: existsSync(join(PROJECT_DIR, "openclaw")),
    };
    checkSync(fakeRuntimes);
    process.exit(0);
  }

  if (silentMode) {
    await runInstall();
    process.exit(0);
  }

  if (updateMode) {
    await runUpdate();
    process.exit(0);
  }

  // ── Interactive: choose action ──
  const actionLabels = [
    t.actionInstall,
    t.actionUpdate,
    t.actionCheck,
    t.actionExit,
  ];
  const actionIdx = await askSelect(t.actionPrompt, actionLabels);

  if (actionIdx === 0) await runInstall();
  else if (actionIdx === 1) await runUpdate();
  else if (actionIdx === 2) await runCheck();
  else process.exit(0);
}

// ── Action runners ──────────────────────────────────────

async function runInstall() {
  const hasGlobalDir = await ensureGlobalSkillsDir();
  const runtimes = await detectRuntimes();
  await autoConfigure(runtimes);
  if (hasGlobalDir) await installAllSkills();
  checkDependencies();
  checkSync(runtimes);
  await validate();
  showNextSteps(runtimes);
}

async function runUpdate() {
  heading(t.updateHeading);
  const reGlobal = await askYesNo(t.updateReGlobal, false);
  if (reGlobal) await ensureGlobalSkillsDir();

  info(t.updateNpm);
  const npmResult = spawnSync("npm", ["install"], {
    cwd: PROJECT_DIR,
    stdio: "inherit",
    shell: isWin,
  });
  if (npmResult.status === 0) ok(t.npmDone);
  else warn(t.npmFailed);

  heading(t.updateSkills);
  mkdirSync(SKILLS_DIR, { recursive: true });
  for (const skill of SKILLS) installSkill(skill);

  const doSync = await askYesNo(t.updateSyncRuntimes, true);
  if (doSync) {
    info(t.updateSyncing);
    const syncResult = spawnSync("npm", ["run", "sync:runtimes"], {
      cwd: PROJECT_DIR,
      stdio: "inherit",
      shell: isWin,
    });
    if (syncResult.status === 0) ok(t.updateSyncDone);
    else warn(t.updateSyncSkip);
  }

  const runtimes = await detectRuntimes();
  checkDependencies();
  checkSync(runtimes);
  console.log(`\n${C.bold}${C.green}  ${t.updateComplete}${C.reset}\n`);
}

async function runCheck() {
  console.log(`\n${C.green}  ${t.envOk}${C.reset}\n`);
  checkDependencies();
  const fakeRuntimes = {
    claude: true,
    codex: existsSync(join(PROJECT_DIR, ".codex")),
    openclaw: existsSync(join(PROJECT_DIR, "openclaw")),
  };
  checkSync(fakeRuntimes);
}

main().catch((err) => {
  console.error(`\n${C.red}  ${t.setupError} ${err.message}${C.reset}\n`);
  process.exit(1);
});
