import { promises as fs } from "node:fs";
import { execFile } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const claudeAgentsDir = path.join(repoRoot, ".claude", "agents");
const claudeSkillReferencesDir = path.join(
  repoRoot,
  ".claude",
  "skills",
  "meta-theory",
  "references"
);
const openclawWorkspacesDir = path.join(repoRoot, "openclaw", "workspaces");
const execFileAsync = promisify(execFile);

/** Must match contracts/workflow-contract.json runDiscipline.publicDisplayRequires (set equality). */
const EXPECTED_PUBLIC_DISPLAY_REQUIRES = [
  "verifyPassed",
  "summaryClosed",
  "singleDeliverableMaintained",
  "deliverableChainClosed",
  "consolidatedDeliverablePresent"
];

/** Documented in AGENTS.md / CLAUDE.md — seven project hook commands. */
const EXPECTED_CLAUDE_HOOK_COMMANDS = [
  "node .claude/hooks/block-dangerous-bash.mjs",
  "node .claude/hooks/pre-git-push-confirm.mjs",
  "node .claude/hooks/post-format.mjs",
  "node .claude/hooks/post-typecheck.mjs",
  "node .claude/hooks/post-console-log-warn.mjs",
  "node .claude/hooks/subagent-context.mjs",
  "node .claude/hooks/stop-console-log-audit.mjs"
];

const forbiddenRuntimeMarkers = [
  "AskUserQuestion",
  'Agent(subagent_type="',
  "Skill(skill=",
  "meta-factory.mjs",
  "evolution-analyzer.mjs",
  "keyword-optimizer.mjs",
  "run_loop.py"
];

const EXPECTED_AGENT_WEAPON_MARKERS = {
  "meta-warden": [
    "## Required Deliverables",
    "Participation Summary",
    "Gate Decisions",
    "Escalation Decisions",
    "Final Synthesis"
  ],
  "meta-conductor": [
    "## Required Deliverables",
    "Dispatch Board",
    "Card Deck",
    "Worker Task Board",
    "Handoff Plan"
  ],
  "meta-genesis": [
    "## Required Deliverables",
    "SOUL.md Draft",
    "Boundary Definition",
    "Reasoning Rules",
    "Stress-Test Record"
  ],
  "meta-artisan": [
    "## Required Deliverables",
    "Skill Loadout",
    "MCP / Tool Loadout",
    "Fallback Plan",
    "Capability Gap List",
    "Adoption Notes"
  ],
  "meta-sentinel": [
    "## Required Deliverables",
    "Threat Model",
    "Permission Matrix",
    "Hook Configuration",
    "Rollback Rules"
  ],
  "meta-librarian": [
    "## Required Deliverables",
    "Memory Architecture",
    "Continuity Protocol",
    "Retention Policy",
    "Recovery Evidence"
  ],
  "meta-prism": [
    "## Required Deliverables",
    "Assertion Report",
    "Verification Closure Packet",
    "Drift Findings",
    "Closure Conditions"
  ],
  "meta-scout": [
    "## Required Deliverables",
    "Capability Baseline",
    "Candidate Comparison",
    "Security Notes",
    "Adoption Brief"
  ]
};

function assert(condition, message) {
  if (!condition) {
    // Human-friendly: strip dev-path jargon from messages
    const clean = message
      .replace(/\.claude\/agents\//g, "Claude agent ")
      .replace(/\.claude\/skills\//g, "Claude skill ")
      .replace(/\.codex\/agents\//g, "Codex agent ")
      .replace(/\.codex\/skills\//g, "Codex skill ")
      .replace(/\.agents\/skills\//g, "Codex项目skill ")
      .replace(/openclaw\/workspaces\//g, "OpenClaw workspace ")
      .replace(/openclaw\/skills\//g, "OpenClaw skill ")
      .replace(/shared-skills\//g, "shared-skill ")
      .replace(/\.md /g, ".md ")
      .replace(/\.toml /g, ".toml ");
    throw new Error(clean);
  }
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function countFiles(rootDir, extension) {
  let count = 0;
  const entries = await fs.readdir(rootDir, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      count += await countFiles(entryPath, extension);
    } else if (entry.isFile() && entry.name.endsWith(extension)) {
      count += 1;
    }
  }
  return count;
}

async function walkFiles(rootDir, extension, bucket = []) {
  const entries = await fs.readdir(rootDir, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      await walkFiles(entryPath, extension, bucket);
    } else if (entry.isFile() && entry.name.endsWith(extension)) {
      bucket.push(entryPath);
    }
  }
  return bucket;
}

async function listCanonicalSkillReferences() {
  const entries = await fs.readdir(claudeSkillReferencesDir, {
    withFileTypes: true,
  });
  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .sort();
}

function assertNoForbiddenMarkers(raw, filePath, markers = forbiddenRuntimeMarkers) {
  for (const marker of markers) {
    assert(!raw.includes(marker), `${filePath} still contains forbidden marker: ${marker}`);
  }
}

/**
 * Skill files may contain `Skill(skill=` in the Dependency Resources section —
 * those are documented invocation examples, not forbidden runtime tool calls.
 * This function strips the Dependency Resources section before checking.
 */
function assertNoForbiddenMarkersInSkill(raw, filePath, markers = forbiddenRuntimeMarkers) {
  // Extract everything before ## Dependency Resources (case-insensitive)
  const depResMatch = raw.match(/\n## Dependency Resources\b/i);
  const contentBeforeDepRes = depResMatch
    ? raw.substring(0, depResMatch.index)
    : raw;

  // Also extract Dependency Skills section (new name in v1.4.0)
  const depSkillsMatch = raw.match(/\n## Dependency Skills\b/i);
  const contentBeforeDepSkills = depSkillsMatch
    ? raw.substring(0, depSkillsMatch.index)
    : contentBeforeDepRes;

  for (const marker of markers) {
    // Check body before the Dependency Resources/Skills section
    assert(
      !contentBeforeDepSkills.includes(marker),
      `${filePath} still contains forbidden marker: ${marker} (outside Dependency Resources section)`
    );
  }
}

function parseFrontmatter(raw, filePath) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    throw new Error(`${filePath} is missing YAML frontmatter.`);
  }

  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) {
      continue;
    }
    const separator = trimmed.indexOf(":");
    if (separator === -1) {
      throw new Error(`${filePath} has an invalid frontmatter line: ${line}`);
    }
    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim();
    data[key] = value.replace(/^['"]|['"]$/g, "");
  }

  return data;
}

async function validateRequiredFiles() {
  const requiredFiles = [
    "README.md",
    "README.zh-CN.md",
    "CLAUDE.md",
    "AGENTS.md",
    "LICENSE",
    ".gitignore",
    ".mcp.json",
    ".claude/settings.json",
    ".claude/skills/meta-theory/SKILL.md",
    ".agents/skills/meta-theory/SKILL.md",
    ".agents/skills/meta-theory/agents/openai.yaml",
    ".codex/skills/meta-theory.md",
    "shared-skills/meta-theory.md",
    "openclaw/skills/meta-theory.md",
    "openclaw/openclaw.template.json",
    "codex/config.toml.example",
    "contracts/workflow-contract.json",
    "scripts/mcp/meta-runtime-server.mjs",
    "scripts/eval-meta-agents.mjs",
    "scripts/prepare-openclaw-local.mjs"
  ];

  for (const relativePath of requiredFiles) {
    assert(
      await exists(path.join(repoRoot, relativePath)),
      `Missing required file: ${relativePath}`
    );
  }
}

async function validateWorkflowContract() {
  const contractPath = path.join(repoRoot, "contracts", "workflow-contract.json");
  const contract = JSON.parse(await fs.readFile(contractPath, "utf8"));

  assert(
    contract.runDiscipline?.singleDepartmentPerRun === true,
    "workflow-contract.json must enforce singleDepartmentPerRun."
  );
  assert(
    contract.runDiscipline?.singlePrimaryDeliverable === true,
    "workflow-contract.json must enforce singlePrimaryDeliverable."
  );
  assert(
    contract.runDiscipline?.rejectMultiTopicRuns === true,
    "workflow-contract.json must reject multi-topic runs."
  );
  assert(
    contract.runDiscipline?.requireClosedDeliverableChain === true,
    "workflow-contract.json must require a closed deliverable chain."
  );

  const requiredRunHeader = [
    "department",
    "primaryDeliverable",
    "audience",
    "freshnessRequirement",
    "visualPolicy",
    "handoffPlan"
  ];
  assert(
    JSON.stringify(contract.runDiscipline?.requiredRunHeader ?? []) ===
      JSON.stringify(requiredRunHeader),
    "workflow-contract.json requiredRunHeader is out of policy."
  );

  for (const field of [
    "todayTask",
    "output",
    "deliverableLink",
    "qualityBar",
    "referenceDirection",
    "handoffTarget",
    "lengthExpectation",
    "visualOrAssetPlan"
  ]) {
    assert(
      contract.runDiscipline?.requiredWorkerFields?.includes(field),
      `workflow-contract.json requiredWorkerFields must include ${field}.`
    );
  }

  const publicDisplayRequires = contract.runDiscipline?.publicDisplayRequires;
  assert(Array.isArray(publicDisplayRequires), "workflow-contract.json must define publicDisplayRequires as an array.");
  assert(
    JSON.stringify([...publicDisplayRequires].sort()) ===
      JSON.stringify([...EXPECTED_PUBLIC_DISPLAY_REQUIRES].sort()),
    "workflow-contract.json publicDisplayRequires must exactly match the canonical public-display gate set."
  );

  assert(
    contract.departmentVisualPolicies?.game?.defaultMode === "generate_or_self_create",
    "workflow-contract.json game visual policy must default to generate_or_self_create."
  );
  assert(
    contract.departmentVisualPolicies?.ai?.defaultMode === "official_or_verified_reference",
    "workflow-contract.json ai visual policy must default to official_or_verified_reference."
  );
}

async function validateClaudeAgents() {
  const files = (await fs.readdir(claudeAgentsDir))
    .filter((file) => file.endsWith(".md"))
    .sort();

  assert(files.length >= 1, "No Claude agent files found.");

  const ids = [];
  for (const file of files) {
    const filePath = path.join(claudeAgentsDir, file);
    const raw = await fs.readFile(filePath, "utf8");
    const frontmatter = parseFrontmatter(raw, filePath);
    assert(frontmatter.name, `${file} is missing frontmatter name.`);
    assert(frontmatter.description, `${file} is missing frontmatter description.`);
    assert(
      frontmatter.name === file.replace(/\.md$/, ""),
      `${file} frontmatter name must match filename.`
    );
    assertNoForbiddenMarkers(raw, filePath);
    for (const marker of EXPECTED_AGENT_WEAPON_MARKERS[frontmatter.name] ?? []) {
      assert(
        raw.includes(marker),
        `${file} must include weapon-pack marker ${marker}.`
      );
    }
    ids.push(frontmatter.name);
  }

  const conductorPath = path.join(claudeAgentsDir, "meta-conductor.md");
  const conductorRaw = await fs.readFile(conductorPath, "utf8");
  for (const marker of [
    "一次 run = 一个部门 = 一件事",
    "唯一主交付物",
    "handoff对象",
    "视觉/素材策略"
  ]) {
    assert(
      conductorRaw.includes(marker),
      `meta-conductor.md must include ${marker}.`
    );
  }

  const wardenPath = path.join(claudeAgentsDir, "meta-warden.md");
  const wardenRaw = await fs.readFile(wardenPath, "utf8");
  for (const marker of [
    "一次 run 必须只有一个部门和一个主交付物",
    "交付链纪律",
    "公开展示纪律",
    "视觉策略与部门性质一致"
  ]) {
    assert(
      wardenRaw.includes(marker),
      `meta-warden.md must include ${marker}.`
    );
  }

  return ids;
}

async function validateOpenClawArtifacts(agentIds) {
  const referenceFiles = await listCanonicalSkillReferences();

  const templateConfigPath = path.join(repoRoot, "openclaw", "openclaw.template.json");
  const templateConfig = JSON.parse(await fs.readFile(templateConfigPath, "utf8"));
  const configIds = templateConfig.agents?.list?.map((agent) => agent.id) ?? [];
  const sortedAgentIds = [...agentIds].sort();
  const sortedConfigIds = [...configIds].sort();

  assert(
    typeof templateConfig.agents?.defaults?.model === "string" &&
      templateConfig.agents.defaults.model.length >= 1,
    "openclaw/openclaw.template.json is missing a default model."
  );

  assert(
    JSON.stringify(sortedConfigIds) === JSON.stringify(sortedAgentIds),
    "openclaw/openclaw.template.json agent list is out of sync with .claude/agents."
  );

  const allowedIds = templateConfig.tools?.agentToAgent?.allow ?? [];
  const sortedAllowedIds = [...allowedIds].sort();
  assert(
    JSON.stringify(sortedAllowedIds) === JSON.stringify(sortedAgentIds),
    "OpenClaw agentToAgent allow-list is out of sync with .claude/agents."
  );

  const hookEntries = templateConfig.hooks?.internal?.entries;
  assert(
    templateConfig.hooks?.internal?.enabled === true,
    "openclaw/openclaw.template.json must enable internal hooks."
  );
  for (const hookName of ["session-memory", "command-logger", "boot-md"]) {
    assert(
      hookEntries?.[hookName]?.enabled === true,
      `openclaw/openclaw.template.json is missing enabled hook ${hookName}.`
    );
  }

  for (const agentId of agentIds) {
    for (const fileName of [
      "BOOT.md",
      "BOOTSTRAP.md",
      "IDENTITY.md",
      "MEMORY.md",
      "USER.md",
      "SOUL.md",
      "AGENTS.md",
      "HEARTBEAT.md",
      "TOOLS.md"
    ]) {
      const workspaceFile = path.join(openclawWorkspacesDir, agentId, fileName);
      assert(await exists(workspaceFile), `Missing OpenClaw workspace file: ${path.relative(repoRoot, workspaceFile)}`);
      if (fileName === "SOUL.md") {
        const workspaceSoul = await fs.readFile(workspaceFile, "utf8");
        assertNoForbiddenMarkers(workspaceSoul, workspaceFile);
      }
    }
    const workspaceSkill = path.join(
      openclawWorkspacesDir,
      agentId,
      "skills",
      "meta-theory",
      "SKILL.md"
    );
    assert(
      await exists(workspaceSkill),
      `Missing OpenClaw workspace skill: ${path.relative(repoRoot, workspaceSkill)}`
    );
    const workspaceSkillRaw = await fs.readFile(workspaceSkill, "utf8");
    assertNoForbiddenMarkersInSkill(workspaceSkillRaw, workspaceSkill);
    for (const referenceFile of referenceFiles) {
      const workspaceReference = path.join(
        openclawWorkspacesDir,
        agentId,
        "skills",
        "meta-theory",
        "references",
        referenceFile
      );
      assert(
        await exists(workspaceReference),
        `Missing OpenClaw workspace skill reference: ${path.relative(repoRoot, workspaceReference)}`
      );
    }
  }
}

async function validatePortableSkill() {
  const referenceFiles = await listCanonicalSkillReferences();
  const skillSourcePath = path.join(
    repoRoot,
    ".claude",
    "skills",
    "meta-theory",
    "SKILL.md"
  );
  const skillSource = await fs.readFile(skillSourcePath, "utf8");

  for (const expected of [
    "name: meta-theory",
    "version:",
    "author:",
    "trigger:",
    "tools:"
  ]) {
    assert(skillSource.includes(expected), `Portable skill is missing ${expected}`);
  }
  for (const marker of [
    "### Station Deliverable Contract (Mandatory)",
    "Required Genesis deliverables",
    "Required Artisan deliverables",
    "Required Conductor deliverables"
  ]) {
    assert(
      skillSource.includes(marker),
      `Portable skill is missing station-deliverable marker ${marker}.`
    );
  }
  assertNoForbiddenMarkers(skillSource, skillSourcePath, ["AskUserQuestion"]);
  const descriptionMatch = skillSource.match(/description:\s*\|\r?\n([\s\S]*?)\r?\n---/);
  if (descriptionMatch) {
    const descriptionLength = descriptionMatch[1].trim().length;
    assert(
      descriptionLength <= 1024,
      `Canonical meta-theory skill description is too long for Codex compatibility (${descriptionLength} > 1024).`
    );
  }

  const sharedSkill = await fs.readFile(
    path.join(repoRoot, "shared-skills", "meta-theory.md"),
    "utf8"
  );
  const codexProjectSkill = await fs.readFile(
    path.join(repoRoot, ".agents", "skills", "meta-theory", "SKILL.md"),
    "utf8"
  );
  const codexSkill = await fs.readFile(
    path.join(repoRoot, ".codex", "skills", "meta-theory.md"),
    "utf8"
  );
  const openclawSkill = await fs.readFile(
    path.join(repoRoot, "openclaw", "skills", "meta-theory.md"),
    "utf8"
  );

  assert(
    sharedSkill === skillSource,
    "shared-skills/meta-theory.md is out of sync with the canonical Claude skill."
  );
  assert(
    codexProjectSkill === skillSource,
    ".agents/skills/meta-theory/SKILL.md is out of sync with the canonical Claude skill."
  );
  assert(
    openclawSkill === skillSource,
    "openclaw/skills/meta-theory.md is out of sync with the canonical Claude skill."
  );
  assert(
    codexSkill === skillSource,
    ".codex/skills/meta-theory.md is out of sync with the canonical Claude skill."
  );

  for (const referenceFile of referenceFiles) {
    const canonicalReferencePath = path.join(claudeSkillReferencesDir, referenceFile);
    const canonicalReference = await fs.readFile(canonicalReferencePath, "utf8");
    assertNoForbiddenMarkers(canonicalReference, canonicalReferencePath, ["AskUserQuestion"]);

    const mirrorTargets = [
      path.join(repoRoot, "shared-skills", "references", referenceFile),
      path.join(repoRoot, ".agents", "skills", "meta-theory", "references", referenceFile),
      path.join(repoRoot, ".codex", "skills", "references", referenceFile),
      path.join(repoRoot, "openclaw", "skills", "references", referenceFile)
    ];

    for (const mirrorPath of mirrorTargets) {
      assert(await exists(mirrorPath), `Missing portable skill reference mirror: ${path.relative(repoRoot, mirrorPath)}`);
      const mirrorContent = await fs.readFile(mirrorPath, "utf8");
      assert(
        mirrorContent === canonicalReference,
        `${path.relative(repoRoot, mirrorPath)} is out of sync with the canonical Claude references.`
      );
    }
  }
}

async function validateCodexArtifacts(agentIds) {
  const codexAgentDir = path.join(repoRoot, ".codex", "agents");

  for (const agentId of agentIds) {
    const agentPath = path.join(codexAgentDir, `${agentId}.toml`);
    assert(await exists(agentPath), `Missing Codex custom agent: .codex/agents/${agentId}.toml`);
    const raw = await fs.readFile(agentPath, "utf8");
    assert(raw.includes(`name = "${agentId}"`), `${agentId}.toml is missing the correct name field.`);
    assert(raw.includes("description = "), `${agentId}.toml is missing description.`);
    assert(
      raw.includes("developer_instructions = "),
      `${agentId}.toml is missing developer_instructions.`
    );
    assertNoForbiddenMarkers(raw, agentPath);
  }

  const configExample = await fs.readFile(
    path.join(repoRoot, "codex", "config.toml.example"),
    "utf8"
  );
  for (const expected of [
    "approval_policy",
    "sandbox_mode",
    "[agents]",
    "[mcp_servers.meta_kim_runtime]",
    "[[skills.config]]",
    ".agents/skills/meta-theory"
  ]) {
    assert(
      configExample.includes(expected),
      `codex/config.toml.example is missing ${expected}`
    );
  }
}

async function validatePackageJson() {
  const packageJsonPath = path.join(repoRoot, "package.json");
  const pkg = JSON.parse(await fs.readFile(packageJsonPath, "utf8"));
  assert(pkg.scripts?.["sync:runtimes"], "package.json is missing sync:runtimes.");
  assert(pkg.scripts?.validate, "package.json is missing validate.");
  assert(pkg.scripts?.["eval:agents"], "package.json is missing eval:agents.");
  assert(pkg.scripts?.["verify:all"], "package.json is missing verify:all.");
  assert(
    pkg.scripts?.["prepare:openclaw-local"],
    "package.json is missing prepare:openclaw-local."
  );
  assert(pkg.dependencies?.["@modelcontextprotocol/sdk"], "package.json is missing @modelcontextprotocol/sdk.");
  assert(pkg.dependencies?.zod, "package.json is missing zod.");
  assert(pkg.license === "MIT", "package.json license must be MIT.");
}

async function validateGitignore() {
  const gitignorePath = path.join(repoRoot, ".gitignore");
  const gitignore = await fs.readFile(gitignorePath, "utf8");
  for (const expected of [
    "node_modules/",
    "docs/",
    "openclaw/openclaw.local.json",
    "openclaw/workspaces/*/.openclaw/"
  ]) {
    assert(gitignore.includes(expected), `.gitignore is missing ${expected}`);
  }
}

function collectClaudeHookCommands(hooksRoot) {
  const commands = [];
  if (!hooksRoot || typeof hooksRoot !== "object") {
    return commands;
  }
  for (const entries of Object.values(hooksRoot)) {
    if (!Array.isArray(entries)) {
      continue;
    }
    for (const entry of entries) {
      for (const hook of entry.hooks ?? []) {
        if (hook?.type === "command" && typeof hook.command === "string") {
          commands.push(hook.command.trim());
        }
      }
    }
  }
  return commands;
}

async function validateClaudeSettings() {
  const settings = JSON.parse(
    await fs.readFile(path.join(repoRoot, ".claude", "settings.json"), "utf8")
  );
  assert(settings.permissions?.deny?.length >= 1, ".claude/settings.json is missing deny rules.");
  const hooks = settings.hooks;
  assert(hooks?.PreToolUse?.length >= 1, ".claude/settings.json is missing PreToolUse hooks.");
  assert(hooks?.PostToolUse?.length >= 1, ".claude/settings.json is missing PostToolUse hooks.");
  assert(hooks?.SubagentStart?.length >= 1, ".claude/settings.json is missing SubagentStart hooks.");
  assert(hooks?.Stop?.length >= 1, ".claude/settings.json is missing Stop hooks.");

  assert(
    hooks.PreToolUse[0]?.matcher === "Bash",
    ".claude/settings.json PreToolUse must target Bash (dangerous bash + git push gates)."
  );
  assert(
    hooks.PostToolUse[0]?.matcher === "Edit|Write",
    ".claude/settings.json PostToolUse must target Edit|Write (format / typecheck / console.log warn)."
  );
  assert(
    hooks.SubagentStart[0]?.matcher === "*",
    ".claude/settings.json SubagentStart must use matcher *."
  );
  assert(
    hooks.Stop[0]?.matcher === "*",
    ".claude/settings.json Stop must use matcher *."
  );

  const found = collectClaudeHookCommands(hooks).sort();
  const expected = [...EXPECTED_CLAUDE_HOOK_COMMANDS].sort();
  assert(
    JSON.stringify(found) === JSON.stringify(expected),
    `.claude/settings.json hook commands must match documented 7-hook coverage (expected ${expected.length}, found ${found.length}).`
  );
}

async function validateMcpConfig() {
  const config = JSON.parse(await fs.readFile(path.join(repoRoot, ".mcp.json"), "utf8"));
  const server = config.mcpServers?.["meta-kim-runtime"];
  assert(server, ".mcp.json is missing meta-kim-runtime.");
  assert(server.command === "node", "meta-kim-runtime must run through node.");
}

async function validateMcpSelfTest() {
  const scriptPath = path.join(repoRoot, "scripts", "mcp", "meta-runtime-server.mjs");
  const { stdout } = await execFileAsync("node", [scriptPath, "--self-test"], {
    cwd: repoRoot
  });
  const parsed = JSON.parse(stdout);
  assert(parsed.ok === true, "MCP self-test did not report ok=true.");
  assert(parsed.agentCount >= 1, "MCP self-test returned no agents.");
}

async function validateFactoryRelease() {
  const factoryRoot = path.join(repoRoot, "factory");
  if (!(await exists(factoryRoot))) {
    return;
  }
  const legacyPaths = [
    "factory/generated",
    "factory/catalog",
    "factory/flagship-20",
    "factory/flagship-batch-1",
    "factory/flagship-batch-2",
    "factory/flagship-batch-3",
    "factory/flagship-batch-4",
    "factory/industry-coverage-matrix.md",
    "factory/flagship-20.md",
    "factory/orchestration-playbooks.md",
    "scripts/generate-industry-agents.mjs",
    "scripts/compile-foundry-runtime-packs.mjs",
    "scripts/build-flagship-batch-1.mjs",
    "scripts/build-flagship-batch-2.mjs",
    "scripts/build-flagship-batch-3.mjs",
    "scripts/build-flagship-batch-4.mjs",
    "scripts/build-flagship-complete.mjs",
    "factory/README.md",
    "factory/README.zh-CN.md",
    "factory/flagship-complete/README.md",
    "factory/flagship-complete/README.zh-CN.md",
    "factory/runtime-packs/README.md",
    "factory/runtime-packs/README.zh-CN.md",
    "factory/flagship-20.json",
    "openclaw/workspaces/meta-artisan/memory/README.md",
    "openclaw/workspaces/meta-conductor/memory/README.md",
    "openclaw/workspaces/meta-genesis/memory/README.md",
    "openclaw/workspaces/meta-librarian/memory/README.md",
    "openclaw/workspaces/meta-prism/memory/README.md",
    "openclaw/workspaces/meta-scout/memory/README.md",
    "openclaw/workspaces/meta-sentinel/memory/README.md",
    "openclaw/workspaces/meta-warden/memory/README.md"
  ];

  for (const relativePath of legacyPaths) {
    assert(
      !(await exists(path.join(repoRoot, relativePath))),
      `Legacy release-build artifact should not exist in public repo: ${relativePath}`
    );
  }

  const factoryRootEntries = await fs.readdir(path.join(repoRoot, "factory"), {
    withFileTypes: true
  });
  for (const entry of factoryRootEntries) {
    assert(
      !(entry.isFile() && entry.name.endsWith(".md")),
      `factory/ should not contain user-facing Markdown docs: factory/${entry.name}`
    );
  }

  const factoryMarkdownFiles = await walkFiles(path.join(repoRoot, "factory"), ".md");
  for (const filePath of factoryMarkdownFiles) {
    const baseName = path.basename(filePath).toLowerCase();
    assert(
      !baseName.startsWith("readme"),
      `Nested README files are not allowed in factory/: ${path.relative(repoRoot, filePath)}`
    );
  }
  const factoryTomlFiles = await walkFiles(path.join(repoRoot, "factory"), ".toml");
  const forbiddenFactoryDocRefs = [
    "factory/industry-coverage-matrix.md",
    "factory/flagship-20.md",
    "factory/orchestration-playbooks.md"
  ];
  for (const filePath of [...factoryMarkdownFiles, ...factoryTomlFiles]) {
    const raw = await fs.readFile(filePath, "utf8");
    for (const marker of forbiddenFactoryDocRefs) {
      assert(
        !raw.includes(marker),
        `${path.relative(repoRoot, filePath)} still references removed release doc ${marker}.`
      );
    }
  }

  const departmentCount = await countFiles(
    path.join(repoRoot, "factory", "agent-library", "departments"),
    ".md"
  );
  const specialistCount = await countFiles(
    path.join(repoRoot, "factory", "agent-library", "specialists"),
    ".md"
  );
  const flagshipCount = await countFiles(
    path.join(repoRoot, "factory", "flagship-complete", "agents"),
    ".md"
  );
  const runtimeClaudeCount = await countFiles(
    path.join(repoRoot, "factory", "runtime-packs", "claude", "agents"),
    ".md"
  );
  const runtimeCodexCount = await countFiles(
    path.join(repoRoot, "factory", "runtime-packs", "codex", "agents"),
    ".toml"
  );
  const runtimeOpenClawCount = (
    await fs.readdir(path.join(repoRoot, "factory", "runtime-packs", "openclaw", "workspaces"), {
      withFileTypes: true
    })
  ).filter((entry) => entry.isDirectory()).length;
  const flagshipClaudeCount = await countFiles(
    path.join(repoRoot, "factory", "flagship-complete", "runtime-packs", "claude", "agents"),
    ".md"
  );
  const flagshipCodexCount = await countFiles(
    path.join(repoRoot, "factory", "flagship-complete", "runtime-packs", "codex", "agents"),
    ".toml"
  );
  const flagshipOpenClawCount = (
    await fs.readdir(
      path.join(repoRoot, "factory", "flagship-complete", "runtime-packs", "openclaw", "workspaces"),
      { withFileTypes: true }
    )
  ).filter((entry) => entry.isDirectory()).length;

  assert(departmentCount === 100, `Expected 100 department briefs, found ${departmentCount}.`);
  assert(specialistCount === 1000, `Expected 1000 specialist briefs, found ${specialistCount}.`);
  assert(flagshipCount === 20, `Expected 20 flagship agents, found ${flagshipCount}.`);
  assert(runtimeClaudeCount === 1100, `Expected 1100 Claude runtime packs, found ${runtimeClaudeCount}.`);
  assert(runtimeCodexCount === 1100, `Expected 1100 Codex runtime packs, found ${runtimeCodexCount}.`);
  assert(runtimeOpenClawCount === 1100, `Expected 1100 OpenClaw workspaces, found ${runtimeOpenClawCount}.`);
  assert(flagshipClaudeCount === 20, `Expected 20 flagship Claude packs, found ${flagshipClaudeCount}.`);
  assert(flagshipCodexCount === 20, `Expected 20 flagship Codex packs, found ${flagshipCodexCount}.`);
  assert(flagshipOpenClawCount === 20, `Expected 20 flagship OpenClaw workspaces, found ${flagshipOpenClawCount}.`);

  const runtimeSummary = JSON.parse(
    await fs.readFile(path.join(repoRoot, "factory", "runtime-packs", "summary.json"), "utf8")
  );
  assert(runtimeSummary.summary?.industries === 20, "runtime-packs/summary.json must report 20 industries.");
  assert(runtimeSummary.summary?.departmentSeeds === 100, "runtime-packs/summary.json must report 100 department seeds.");
  assert(runtimeSummary.summary?.specialistAgents === 1000, "runtime-packs/summary.json must report 1000 specialist agents.");
  assert(runtimeSummary.summary?.totalAgents === 1100, "runtime-packs/summary.json must report 1100 total agents.");

  const flagshipSummary = JSON.parse(
    await fs.readFile(path.join(repoRoot, "factory", "flagship-complete", "summary.json"), "utf8")
  );
  assert(flagshipSummary.counts?.flagshipAgents === 20, "flagship-complete/summary.json must report 20 flagship agents.");
  assert(flagshipSummary.counts?.claudeAgents === 20, "flagship-complete/summary.json must report 20 Claude flagship agents.");
  assert(flagshipSummary.counts?.codexAgents === 20, "flagship-complete/summary.json must report 20 Codex flagship agents.");
  assert(flagshipSummary.counts?.openclawWorkspaces === 20, "flagship-complete/summary.json must report 20 OpenClaw flagship workspaces.");

  const specialistFiles = await walkFiles(
    path.join(repoRoot, "factory", "agent-library", "specialists"),
    ".md"
  );
  const requiredSpecialistSections = [
    "## Strategic Value",
    "## Failure Modes to Avoid",
    "## Escalate Immediately If",
    "## Output Packet",
    "## Review Checklist",
    "## Voice Calibration",
    "## Signature Questions",
    "## Default Reasoning Sequence"
  ];
  for (const specialistPath of specialistFiles) {
    const raw = await fs.readFile(specialistPath, "utf8");
    for (const section of requiredSpecialistSections) {
      assert(
        raw.includes(section),
        `${path.relative(repoRoot, specialistPath)} is missing section ${section}.`
      );
    }

    const industry = path.basename(path.dirname(path.dirname(specialistPath)));
    const department = path.basename(path.dirname(specialistPath));
    const specialist = path.basename(specialistPath, ".md");
    const specialistId = `${industry}-${department}-${specialist}`;
    const runtimeTargets = [
      path.join(repoRoot, "factory", "runtime-packs", "claude", "agents", `${specialistId}.md`),
      path.join(repoRoot, "factory", "runtime-packs", "codex", "agents", `${specialistId}.toml`),
      path.join(
        repoRoot,
        "factory",
        "runtime-packs",
        "openclaw",
        "workspaces",
        specialistId,
        "SOUL.md"
      )
    ];

    for (const runtimePath of runtimeTargets) {
      assert(
        await exists(runtimePath),
        `Missing specialist runtime artifact: ${path.relative(repoRoot, runtimePath)}.`
      );
      const runtimeRaw = await fs.readFile(runtimePath, "utf8");
      for (const section of requiredSpecialistSections) {
        assert(
          runtimeRaw.includes(section),
          `${path.relative(repoRoot, runtimePath)} is missing section ${section}.`
        );
      }
    }
  }
}

function step(num, total, label, detail = "") {
  console.log(`\n[${num}/${total}] ${label}`);
  if (detail) console.log(`    ${detail}`);
}

function pass(msg = "") {
  console.log(`    ✓ ${msg}`);
}

function fail(msg) {
  console.error(`    ✗ ${msg}`);
}

async function main() {
  const TOTAL = 12;
  let current = 1;

  console.log("\n========================================");
  console.log("  Meta_Kim Project Integrity Check");
  console.log("========================================");

  // 1. Required files
  step(current++, TOTAL, "Checking required files", "README.md, CLAUDE.md, package.json, etc. (24 files)");
  await validateRequiredFiles();
  pass("All 24 required files present");

  // 2. Workflow contract
  step(current++, TOTAL, "Validating workflow contract", "single-department run discipline, primary deliverable, closed deliverable chain");
  await validateWorkflowContract();
  pass("Workflow contract is valid");

  // 3. Claude Code agent definitions
  step(current++, TOTAL, "Validating Claude Code agent definitions", "frontmatter completeness + forbidden-marker check + boundary discipline");
  const agentIds = await validateClaudeAgents();
  pass(`${agentIds.length} agents passed: ${agentIds.join(", ")}`);

  // 4. OpenClaw workspace files
  step(current++, TOTAL, "Validating OpenClaw workspace files", "10 required files per agent: BOOT/SOUL/SKILL, etc.");
  await validateOpenClawArtifacts(agentIds);
  pass(`${agentIds.length} workspaces complete (${agentIds.length * 10} files)`);

  // 5. SKILL.md cross-runtime sync
  step(current++, TOTAL, "Checking SKILL.md cross-runtime sync", "Claude Code / Codex / OpenClaw / shared-skills (4 locations)");
  await validatePortableSkill();
  pass("All 4 sync locations are in sync");

  // 6. Codex agent definitions
  step(current++, TOTAL, "Validating Codex agent definitions", "TOML format + name/description fields + config.example");
  await validateCodexArtifacts(agentIds);
  pass(`${agentIds.length} Codex agents passed`);

  // 7. npm scripts
  step(current++, TOTAL, "Checking package.json scripts", "sync:runtimes / validate / eval:agents / verify:all, etc.");
  await validatePackageJson();
  pass("All required scripts registered");

  // 8. .gitignore
  step(current++, TOTAL, "Checking .gitignore rules", "node_modules/ / docs/ / openclaw local config, etc.");
  await validateGitignore();
  pass(".gitignore contains all necessary rules");

  // 9. Claude Code settings
  step(current++, TOTAL, "Checking Claude Code project settings", "permission deny rules / PreToolUse / SubagentStart hooks");
  await validateClaudeSettings();
  pass("Claude Code hooks and permissions configured correctly");

  // 10. MCP config
  step(current++, TOTAL, "Checking MCP server config", "meta-kim-runtime service definition and startup command");
  await validateMcpConfig();
  pass("MCP config is valid");

  // 11. MCP self-test
  step(current++, TOTAL, "Running MCP self-test", "start meta-runtime-server and verify agent count");
  await validateMcpSelfTest();
  pass("MCP self-test passed");

  // 12. Factory release artifacts (skipped if factory/ not in public repo)
  step(current++, TOTAL, "Checking factory release artifacts", "100 departments / 1000 specialists / 20 flagship / 1100 runtime packs");
  await validateFactoryRelease();
  pass("Factory artifacts validated (or skipped — not in public repo)");

  console.log("\n========================================");
  console.log(`  All ${TOTAL} checks passed`);
  console.log(`  8 agents ready`);
  console.log("========================================\n");
}

try {
  await main();
} catch (error) {
  console.error("\n    Validation failed!");
  console.error(`    ${error.message}\n`);
  process.exitCode = 1;
}
