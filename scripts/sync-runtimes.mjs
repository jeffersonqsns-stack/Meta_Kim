import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const claudeAgentsDir = path.join(repoRoot, ".claude", "agents");
const claudeSkillPath = path.join(
  repoRoot,
  ".claude",
  "skills",
  "meta-theory",
  "SKILL.md"
);
const claudeSkillReferencesDir = path.join(
  repoRoot,
  ".claude",
  "skills",
  "meta-theory",
  "references"
);
const codexLegacySkillsDir = path.join(repoRoot, ".codex", "skills");
const codexAgentsDir = path.join(repoRoot, ".codex", "agents");
const codexProjectSkillsDir = path.join(repoRoot, ".agents", "skills");
const openclawDir = path.join(repoRoot, "openclaw");
const openclawWorkspacesDir = path.join(openclawDir, "workspaces");
const openclawSkillsDir = path.join(openclawDir, "skills");
const sharedSkillsDir = path.join(repoRoot, "shared-skills");
const templateConfigPath = path.join(openclawDir, "openclaw.template.json");
const localConfigPath = path.join(openclawDir, "openclaw.local.json");
const checkOnly = process.argv.includes("--check");
const genericOpenClawModel =
  process.env.META_KIM_TEMPLATE_OPENCLAW_MODEL || "claude-sonnet-4-5";

const preferredOrder = [
  "meta-warden",
  "meta-genesis",
  "meta-artisan",
  "meta-sentinel",
  "meta-librarian",
  "meta-conductor",
  "meta-prism",
  "meta-scout",
];

function parseFrontmatter(raw, filePath) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    throw new Error(`${filePath} is missing YAML frontmatter.`);
  }

  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separator = trimmed.indexOf(":");
    if (separator === -1) {
      throw new Error(`${filePath} has an invalid frontmatter line: ${line}`);
    }

    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    data[key] = value;
  }

  return { data, body: match[2].trimStart() };
}

function extractTitle(body, fallback) {
  const match = body.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : fallback;
}

function extractSummary(body, fallback) {
  const match = body.match(/^>\s+(.+)$/m);
  return match ? match[1].trim() : fallback;
}

function roleFromTitle(title, fallback) {
  const parts = title.split(":");
  return parts.length > 1 ? parts.slice(1).join(":").trim() : fallback;
}

function sortAgents(agents) {
  return [...agents].sort((left, right) => {
    const leftIndex = preferredOrder.indexOf(left.id);
    const rightIndex = preferredOrder.indexOf(right.id);

    if (leftIndex === -1 && rightIndex === -1) {
      return left.id.localeCompare(right.id);
    }
    if (leftIndex === -1) {
      return 1;
    }
    if (rightIndex === -1) {
      return -1;
    }
    return leftIndex - rightIndex;
  });
}

function parseAgentPresentation(agent) {
  const titleMatch = agent.title.match(/^(.*?)(?::\s*(.*?))?(?:\s+([^\s]+))?$/u);
  const displayName = titleMatch?.[1]?.trim() || agent.id;
  const localizedRole = titleMatch?.[2]?.trim() || agent.description;
  const emoji = titleMatch?.[3]?.trim() || "🤖";

  return {
    displayName,
    localizedRole,
    emoji,
  };
}

function buildBootstrap(agent) {
  const { displayName, localizedRole } = parseAgentPresentation(agent);

  return `# BOOTSTRAP.md - ${agent.id}

This workspace already ships Meta_Kim meta-architecture assets; do not invent a persona from scratch.

## Cold-start order

1. Read \`IDENTITY.md\` — confirm you are \`${displayName}\` and your role is ${localizedRole}.
2. Read \`SOUL.md\` — boundaries and quality bar.
3. Read \`TOOLS.md\` and \`AGENTS.md\` — decide what to delegate.
4. Update \`USER.md\` only when the user explicitly asks for long-lived context.

## First reply

- One sentence: what you own (and only that).
- Do not absorb other meta agents' responsibilities.
- Escalate cross-boundary conflicts to \`meta-warden\`.
`;
}

function buildIdentity(agent) {
  const { displayName, localizedRole, emoji } = parseAgentPresentation(agent);

  return `# IDENTITY.md - ${agent.id}

- **Name:** ${displayName}
- **Creature:** Meta_Kim meta agent
- **Vibe:** Focused, minimal, clear boundaries; primary job: ${localizedRole}
- **Emoji:** ${emoji}
- **Avatar:** 

## Identity Notes

- Agent ID: \`${agent.id}\`
- Core role: ${agent.description}
- Canonical source: \`${agent.sourceFile}\`
`;
}

function buildUser() {
  return `# USER.md - About Your Human

- **Name:**
- **What to call them:**
- **Pronouns:** _(optional)_
- **Timezone:**
- **Notes:**

## Context

Record this user's long-term preferences for Meta_Kim work; do not store unrelated private data.
`;
}

function buildBoot(agent) {
  const { displayName } = parseAgentPresentation(agent);

  return `# BOOT.md - ${agent.id}

After the OpenClaw gateway starts, run one-time boot checks in this order when needed.

1. Confirm the workspace path and that \`IDENTITY.md\`, \`SOUL.md\`, \`TOOLS.md\`, and \`AGENTS.md\` are readable.
2. Do not message the user proactively; act only when the boot task explicitly requires it.
3. If you see role-boundary conflicts, record them in \`MEMORY.md\` under open questions — do not rewrite persona on your own.
4. If you are \`${displayName}\`, keep boot checks inside your own boundary only.
`;
}

function buildMemory(agent) {
  return `# MEMORY.md - ${agent.id}

Store information that stays true across sessions.

## Do record

- Stable user preferences
- Recurring architecture decisions
- Confirmed boundary interpretations
- Risk constraints that keep applying

## Do not record

- One-off task state
- Ephemeral command output
- Unconfirmed guesses
- Personal data unrelated to Meta_Kim
`;
}

async function readJsonIfExists(filePath) {
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

function pickPreferredModelFromProviders(providers) {
  const candidates = [];

  for (const [providerId, provider] of Object.entries(providers || {})) {
    for (const model of provider.models || []) {
      if (!Array.isArray(model.input) || !model.input.includes("text")) {
        continue;
      }

      candidates.push({
        qualifiedId: `${providerId}/${model.id}`,
        reasoning: Boolean(model.reasoning),
      });
    }
  }

  if (candidates.length === 0) {
    return null;
  }

  const preferredPatterns = [/M2\.7/i, /M2\.5/i, /sonnet/i, /opus/i, /gpt/i];
  for (const pattern of preferredPatterns) {
    const match = candidates.find((candidate) => pattern.test(candidate.qualifiedId));
    if (match) {
      return match.qualifiedId;
    }
  }

  return (
    candidates.find((candidate) => candidate.reasoning)?.qualifiedId ||
    candidates[0].qualifiedId
  );
}

async function detectLocalOpenClawModel() {
  const explicit =
    process.env.META_KIM_OPENCLAW_MODEL || process.env.OPENCLAW_DEFAULT_MODEL;
  if (explicit) {
    return explicit;
  }

  const globalConfig = await readJsonIfExists(
    path.join(os.homedir(), ".openclaw", "openclaw.json")
  );
  const configuredPrimary = globalConfig?.agents?.defaults?.model?.primary;
  if (typeof configuredPrimary === "string" && configuredPrimary.trim()) {
    return configuredPrimary.trim();
  }

  const mainModels = await readJsonIfExists(
    path.join(os.homedir(), ".openclaw", "agents", "main", "agent", "models.json")
  );
  return pickPreferredModelFromProviders(mainModels?.providers) || genericOpenClawModel;
}

async function loadAgents() {
  const files = (await fs.readdir(claudeAgentsDir))
    .filter((file) => file.endsWith(".md"))
    .sort();

  const agents = [];
  for (const file of files) {
    const filePath = path.join(claudeAgentsDir, file);
    const raw = await fs.readFile(filePath, "utf8");
    const { data, body } = parseFrontmatter(raw, filePath);

    if (!data.name || !data.description) {
      throw new Error(`${filePath} must define frontmatter name and description.`);
    }

    agents.push({
      id: data.name,
      description: data.description,
      sourceFile: path.relative(repoRoot, filePath).replace(/\\/g, "/"),
      title: extractTitle(body, data.name),
      summary: extractSummary(body, data.description),
      role: roleFromTitle(extractTitle(body, data.name), data.description),
      body: body.trim(),
    });
  }

  return sortAgents(agents);
}

function buildWorkspaceDirectory(agents) {
  const rows = agents
    .map(
      (agent) =>
        `| \`${agent.id}\` | ${agent.title} | ${agent.description} |`
    )
    .join("\n");

  return `# AGENTS.md - Meta_Kim Team Directory

This file is generated from \`.claude/agents/*.md\` by \`npm run sync:runtimes\`.

Use the smallest agent whose boundary matches the task. Escalate to \`meta-warden\` when the task spans multiple agent boundaries.

Important: this file lists only the Meta_Kim team. It is not the full OpenClaw registry. If the user asks how many agents exist, which agents are currently registered, or who can collaborate right now, query the live runtime registry first instead of answering from this file alone.

| Agent ID | Name | Responsibility |
| --- | --- | --- |
${rows}
`;
}

function buildSoul(agent) {
  return `# SOUL.md - ${agent.id}

Generated from \`${agent.sourceFile}\`. Edit the Claude source file first, then run \`npm run sync:runtimes\`.

## Runtime Notes

- You are running inside OpenClaw.
- Read the local \`AGENTS.md\` before delegating with \`sessions_send\`.
- \`AGENTS.md\` only lists the Meta_Kim team, not the full OpenClaw registry.
- When the user asks which agents exist, how many agents exist, or who can collaborate right now, query the live runtime registry first through \`agents_list\`. If that tool is unavailable, fall back to an explicit runtime command and state the result source.
- Stay inside your own responsibility boundary unless the user explicitly asks you to coordinate broader work.
- An optional local research note may exist at \`docs/meta.md\`, but public runtime behavior must not depend on it.

${agent.body}
`;
}

function buildHeartbeat(agent) {
  return `# HEARTBEAT.md - ${agent.id}

Default heartbeat policy:

- If there is no explicit scheduled work, respond with \`HEARTBEAT_OK\`.
- Do not create autonomous tasks or self-assign missions by default.
- Only act proactively after the deployment owner adds concrete heartbeat tasks below.

## Deployment Tasks

- None by default.
`;
}

function buildTools(agent, agents) {
  const teammates = agents
    .filter((item) => item.id !== agent.id)
    .map((item) => `- \`${item.id}\`: ${item.description}`)
    .join("\n");

  return `# TOOLS.md - ${agent.id}

Auto-generated by \`npm run sync:runtimes\`. Edit templates in \`scripts/sync-runtimes.mjs\`, then re-sync.

## OpenClaw runtime conventions

- Read \`SOUL.md\` and \`AGENTS.md\` in this directory first.
- For collaboration, prefer OpenClaw native agent-to-agent routing.
- \`AGENTS.md\` lists the Meta_Kim team only — it is not the full OpenClaw registry.
- When the user asks for agent counts, names, or who can collaborate, call \`agents_list\` first; if unavailable, use an explicit command and state the source.
- Shared skill: \`../../skills/meta-theory.md\` (single copy under \`openclaw/skills/\`, not duplicated per workspace).
- Do not absorb other agents' duties; delegate or escalate to \`meta-warden\` when out of scope.

## Teammates

${teammates || "- None"}
`;
}

function buildOpenClawHooks() {
  return {
    internal: {
      enabled: true,
      entries: {
        "session-memory": {
          enabled: true,
        },
        "command-logger": {
          enabled: true,
        },
        "boot-md": {
          enabled: true,
        },
      },
    },
  };
}

function buildOpenClawConfig(agents, workspaceRoot) {
  return {
    agents: {
      defaults: {
        model: genericOpenClawModel,
      },
      list: agents.map((agent, index) => ({
        id: agent.id,
        default: index === 0,
        name: agent.title,
        workspace: path.join(workspaceRoot, agent.id),
      })),
    },
    bindings: [],
    hooks: buildOpenClawHooks(),
    tools: {
      agentToAgent: {
        enabled: true,
        allow: agents.map((agent) => agent.id),
      },
    },
  };
}

function buildLocalOpenClawConfig(agents, workspaceRoot, model) {
  return {
    agents: {
      defaults: {
        model,
      },
      list: agents.map((agent, index) => ({
        id: agent.id,
        default: index === 0,
        name: agent.title,
        workspace: path.join(workspaceRoot, agent.id),
        model,
      })),
    },
    bindings: [],
    hooks: buildOpenClawHooks(),
    tools: {
      agentToAgent: {
        enabled: true,
        allow: agents.map((agent) => agent.id),
      },
    },
  };
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function loadSkillReferences() {
  const entries = await fs.readdir(claudeSkillReferencesDir, {
    withFileTypes: true,
  });
  const files = entries.filter((entry) => entry.isFile());

  return Promise.all(
    files.map(async (file) => ({
      name: file.name,
      content: await fs.readFile(
        path.join(claudeSkillReferencesDir, file.name),
        "utf8"
      ),
    }))
  );
}

function escapeTomlBasicMultiline(value) {
  return value.replace(/\\/g, "\\\\").replace(/"""/g, '\\"\\"\\"');
}

function buildCodexAgentInstructions(agent) {
  return [
    `You are the Codex custom agent mirror of Meta_Kim agent \`${agent.id}\`.`,
    `Primary responsibility: ${agent.description}`,
    "Stay inside your own responsibility boundary.",
    "If the task crosses agent boundaries, hand the decision back to the parent session or recommend the correct sibling meta agent.",
    "Use the portable meta-theory skill when it helps, but do not claim ownership of another agent's deliverable.",
    "",
    agent.body.trim(),
  ].join("\n");
}

function buildCodexAgent(agent) {
  const instructions = escapeTomlBasicMultiline(buildCodexAgentInstructions(agent));

  return `name = "${agent.id}"
description = "${agent.description.replace(/"/g, '\\"')}"
developer_instructions = """
${instructions}
"""
`;
}

function buildCodexSkillMetadata() {
  return `interface:
  display_name: "Meta Theory"
  short_description: "Meta_Kim cross-runtime meta-theory and collaboration method"
policy:
  allow_implicit_invocation: true
dependencies:
  mcp_servers:
    - meta_kim_runtime
`;
}

async function writeGeneratedFile(filePath, nextContent) {
  let currentContent = null;
  try {
    currentContent = await fs.readFile(filePath, "utf8");
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }

  if (currentContent === nextContent) {
    return { changed: false };
  }

  if (checkOnly) {
    return { changed: true };
  }

  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, nextContent, "utf8");
  return { changed: true };
}

async function writeGeneratedJson(filePath, value) {
  const nextContent = `${JSON.stringify(value, null, 2)}\n`;
  return writeGeneratedFile(filePath, nextContent);
}

async function main() {
  const agents = await loadAgents();
  const teamDirectory = buildWorkspaceDirectory(agents);
  const portableSkill = await fs.readFile(claudeSkillPath, "utf8");
  const skillReferences = await loadSkillReferences();
  const localOpenClawModel = await detectLocalOpenClawModel();
  const changedFiles = [];

  for (const agent of agents) {
    const workspaceDir = path.join(openclawWorkspacesDir, agent.id);
    const writes = await Promise.all([
      writeGeneratedFile(path.join(workspaceDir, "BOOT.md"), buildBoot(agent)),
      writeGeneratedFile(
        path.join(workspaceDir, "BOOTSTRAP.md"),
        buildBootstrap(agent)
      ),
      writeGeneratedFile(
        path.join(workspaceDir, "IDENTITY.md"),
        buildIdentity(agent)
      ),
      writeGeneratedFile(
        path.join(workspaceDir, "MEMORY.md"),
        buildMemory(agent)
      ),
      writeGeneratedFile(path.join(workspaceDir, "USER.md"), buildUser()),
      writeGeneratedFile(path.join(workspaceDir, "SOUL.md"), buildSoul(agent)),
      writeGeneratedFile(path.join(workspaceDir, "AGENTS.md"), teamDirectory),
      writeGeneratedFile(
        path.join(workspaceDir, "HEARTBEAT.md"),
        buildHeartbeat(agent)
      ),
      writeGeneratedFile(
        path.join(workspaceDir, "TOOLS.md"),
        buildTools(agent, agents)
      ),
    ]);

    if (writes.some((result) => result.changed)) {
      changedFiles.push(`openclaw/workspaces/${agent.id}`);
    }
  }

  const templateConfig = buildOpenClawConfig(
    agents,
    "__REPO_ROOT__/openclaw/workspaces"
  );
  const localConfig = buildLocalOpenClawConfig(
    agents,
    path.join(repoRoot, "openclaw", "workspaces"),
    localOpenClawModel
  );

  if ((await writeGeneratedJson(templateConfigPath, templateConfig)).changed) {
    changedFiles.push("openclaw/openclaw.template.json");
  }
  if ((await writeGeneratedJson(localConfigPath, localConfig)).changed) {
    changedFiles.push("openclaw/openclaw.local.json");
  }
  if (
    (await writeGeneratedFile(
      path.join(sharedSkillsDir, "meta-theory.md"),
      portableSkill
    )).changed
  ) {
    changedFiles.push("shared-skills/meta-theory.md");
  }
  for (const reference of skillReferences) {
    if (
      (
        await writeGeneratedFile(
          path.join(sharedSkillsDir, "references", reference.name),
          reference.content
        )
      ).changed
    ) {
      changedFiles.push(`shared-skills/references/${reference.name}`);
    }
  }
  if (
    (await writeGeneratedFile(
      path.join(openclawSkillsDir, "meta-theory.md"),
      portableSkill
    )).changed
  ) {
    changedFiles.push("openclaw/skills/meta-theory.md");
  }
  for (const reference of skillReferences) {
    if (
      (
        await writeGeneratedFile(
          path.join(openclawSkillsDir, "references", reference.name),
          reference.content
        )
      ).changed
    ) {
      changedFiles.push(`openclaw/skills/references/${reference.name}`);
    }
  }
  if (
    (await writeGeneratedFile(
      path.join(codexLegacySkillsDir, "meta-theory.md"),
      portableSkill
    )).changed
  ) {
    changedFiles.push(".codex/skills/meta-theory.md");
  }
  for (const reference of skillReferences) {
    if (
      (
        await writeGeneratedFile(
          path.join(codexLegacySkillsDir, "references", reference.name),
          reference.content
        )
      ).changed
    ) {
      changedFiles.push(`.codex/skills/references/${reference.name}`);
    }
  }
  if (
    (await writeGeneratedFile(
      path.join(codexProjectSkillsDir, "meta-theory", "SKILL.md"),
      portableSkill
    )).changed
  ) {
    changedFiles.push(".agents/skills/meta-theory/SKILL.md");
  }
  for (const reference of skillReferences) {
    if (
      (
        await writeGeneratedFile(
          path.join(
            codexProjectSkillsDir,
            "meta-theory",
            "references",
            reference.name
          ),
          reference.content
        )
      ).changed
    ) {
      changedFiles.push(`.agents/skills/meta-theory/references/${reference.name}`);
    }
  }
  if (
    (await writeGeneratedFile(
      path.join(codexProjectSkillsDir, "meta-theory", "agents", "openai.yaml"),
      buildCodexSkillMetadata()
    )).changed
  ) {
    changedFiles.push(".agents/skills/meta-theory/agents/openai.yaml");
  }

  for (const agent of agents) {
    if (
      (await writeGeneratedFile(
        path.join(codexAgentsDir, `${agent.id}.toml`),
        buildCodexAgent(agent)
      )).changed
    ) {
      changedFiles.push(`.codex/agents/${agent.id}.toml`);
    }
  }

  if (checkOnly && changedFiles.length > 0) {
    console.error("Generated runtime assets are out of date:");
    for (const file of changedFiles) {
      console.error(`- ${file}`);
    }
    process.exitCode = 1;
    return;
  }

  if (checkOnly) {
    console.log("Runtime assets are up to date.");
    return;
  }

  const byLayer = {
    "Claude Code/.claude/agents/": changedFiles.filter((f) => f.startsWith(".claude/agents/")).length,
    "Claude Code/.claude/skills/": changedFiles.filter((f) => f.startsWith(".claude/skills/")).length,
    "Codex/.codex/agents/": changedFiles.filter((f) => f.startsWith(".codex/agents/")).length,
    "Codex/.codex/skills/": changedFiles.filter((f) => f.startsWith(".codex/skills/")).length,
    "Codex/.agents/skills/": changedFiles.filter((f) => f.startsWith(".agents/skills/")).length,
    "OpenClaw/openclaw/workspaces/": changedFiles.filter((f) => f.startsWith("openclaw/workspaces/")).length,
    "OpenClaw/openclaw/skills/": changedFiles.filter((f) => f.startsWith("openclaw/skills/")).length,
    "OpenClaw/shared-skills/": changedFiles.filter((f) => f.startsWith("shared-skills/")).length,
    "OpenClaw/model:": 0,
  };

  // Group by runtime
  const groups = {
    "Claude Code": ["Claude Code/.claude/agents/", "Claude Code/.claude/skills/"],
    "Codex": ["Codex/.codex/agents/", "Codex/.codex/skills/", "Codex/.agents/skills/"],
    "OpenClaw": ["OpenClaw/openclaw/workspaces/", "OpenClaw/openclaw/skills/", "OpenClaw/shared-skills/", "OpenClaw/model:"],
  };

  for (const [group, keys] of Object.entries(groups)) {
    console.log(`${group}:`);
    for (const key of keys) {
      if (key === "OpenClaw/model:") {
        console.log(`  model: ${localOpenClawModel}`);
      } else {
        const count = byLayer[key] ?? 0;
        const relPath = key.split("/").slice(1).join("/");
        console.log(`  ${relPath} ${count} files`);
      }
    }
  }
}

await main();
