#!/usr/bin/env node
/**
 * agent-health-report.mjs
 * Agent Health Dashboard — aggregates data from canonical definitions,
 * OpenClaw HEARTBEAT files, SOUL.md mirrors, and synced skills.
 * Outputs a structured markdown health report.
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const CLAUDE_AGENTS_DIR = path.join(repoRoot, ".claude", "agents");
const OPENCLAW_WORKSPACES_DIR = path.join(repoRoot, "openclaw", "workspaces");
const REQUIRED_WORKSPACE_FILES = [
  "BOOT.md",
  "BOOTSTRAP.md",
  "IDENTITY.md",
  "MEMORY.md",
  "USER.md",
  "SOUL.md",
  "AGENTS.md",
  "HEARTBEAT.md",
  "TOOLS.md",
];

const ROLE_CONTRACT_MARKERS = {
  "meta-warden": ["## Required Deliverables", "Participation Summary", "Gate Decisions", "Escalation Decisions", "Final Synthesis"],
  "meta-conductor": ["## Required Deliverables", "Dispatch Board", "Card Deck", "Worker Task Board", "Handoff Plan"],
  "meta-genesis": ["## Required Deliverables", "SOUL.md Draft", "Boundary Definition", "Reasoning Rules", "Stress-Test Record"],
  "meta-artisan": ["## Required Deliverables", "Skill Loadout", "MCP / Tool Loadout", "Fallback Plan", "Capability Gap List", "Adoption Notes"],
  "meta-sentinel": ["## Required Deliverables", "Threat Model", "Permission Matrix", "Hook Configuration", "Rollback Rules"],
  "meta-librarian": ["## Required Deliverables", "Memory Architecture", "Continuity Protocol", "Retention Policy", "Recovery Evidence"],
  "meta-prism": ["## Required Deliverables", "Assertion Report", "Verification Closure Packet", "Drift Findings", "Closure Conditions"],
  "meta-scout": ["## Required Deliverables", "Capability Baseline", "Candidate Comparison", "Security Notes", "Adoption Brief"],
};

// --- Data Collection Helpers ---

async function readJsonFrontmatter(filePath) {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
    if (!match) return null;
    const data = {};
    for (const line of match[1].split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      const sep = trimmed.indexOf(":");
      if (sep === -1) continue;
      const key = trimmed.slice(0, sep).trim();
      const value = trimmed.slice(sep + 1).trim().replace(/^['"]|['"]$/g, "");
      data[key] = value;
    }
    return data;
  } catch {
    return null;
  }
}

async function readFileRaw(filePath) {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch {
    return null;
  }
}

async function countLines(filePath) {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return raw.split(/\r?\n/).length;
  } catch {
    return 0;
  }
}

async function getFileMtime(filePath) {
  try {
    const stat = await fs.stat(filePath);
    return stat.mtime.toISOString().split("T")[0];
  } catch {
    return "unknown";
  }
}

async function listAgents() {
  const files = (await fs.readdir(CLAUDE_AGENTS_DIR))
    .filter((f) => f.endsWith(".md"))
    .sort();
  return files.map((f) => f.replace(/\.md$/, ""));
}

async function collectAgentHealth(agentId) {
  const canonicalMdPath = path.join(CLAUDE_AGENTS_DIR, `${agentId}.md`);
  const workspaceDir = path.join(OPENCLAW_WORKSPACES_DIR, agentId);
  const skillPath = path.join(
    workspaceDir,
    "skills",
    "meta-theory",
    "SKILL.md"
  );

  const [frontmatter, canonicalRaw, heartbeatRaw, soulRaw, skillRaw] = await Promise.all([
    readJsonFrontmatter(canonicalMdPath),
    readFileRaw(canonicalMdPath),
    readFileRaw(path.join(workspaceDir, "HEARTBEAT.md")),
    readFileRaw(path.join(workspaceDir, "SOUL.md")),
    readFileRaw(skillPath),
  ]);

  // Collect workspace file completeness
  const workspaceFileStatus = {};
  let workspaceFilesComplete = 0;
  for (const fileName of REQUIRED_WORKSPACE_FILES) {
    const filePath = path.join(workspaceDir, fileName);
    const exists = await (async () => {
      try {
        await fs.access(filePath);
        return true;
      } catch {
        return false;
      }
    })();
    workspaceFileStatus[fileName] = exists ? "✅" : "❌";
    if (exists) workspaceFilesComplete++;
  }

  // Skill sync check — compare canonical SKILL.md with workspace skill
  const canonicalSkillPath = path.join(
    repoRoot,
    ".claude",
    "skills",
    "meta-theory",
    "SKILL.md"
  );
  const canonicalSkillRaw = await readFileRaw(canonicalSkillPath);
  const skillSynced = canonicalSkillRaw && skillRaw === canonicalSkillRaw;

  // Count lines
  const [canonicalLines, soulLines] = await Promise.all([
    countLines(canonicalMdPath),
    countLines(path.join(workspaceDir, "SOUL.md")),
  ]);

  // Version
  const canonicalVersion =
    (canonicalRaw?.match(/^version:\s*([\d.]+)/m)?.[1]) ||
    frontmatter?.version ||
    "unknown";

  // Boundary markers check
  const hasOwnBoundary = canonicalRaw?.includes("只管") || canonicalRaw?.includes("Own") || canonicalRaw?.includes("own");
  const hasRefuseBoundary = canonicalRaw?.includes("不碰") || canonicalRaw?.includes("Refuse") || canonicalRaw?.includes("refuse") || canonicalRaw?.includes("Touch");
  const hasFiveStandard = canonicalRaw?.includes("元理论验证") || canonicalRaw?.includes("五标准") || canonicalRaw?.includes("Meta-Theory Verification") || canonicalRaw?.includes("Meta-Theory Validation") || canonicalRaw?.includes("Five Criteria");
  const hasSoul = soulRaw && soulRaw.length > 100;
  const requiredRoleMarkers = ROLE_CONTRACT_MARKERS[agentId] ?? [];
  const roleContractCoverage = requiredRoleMarkers.length
    ? requiredRoleMarkers.filter((marker) => canonicalRaw?.includes(marker)).length / requiredRoleMarkers.length
    : 1;

  // Health score components (0-1 scale)
  const scoreComponents = {
    frontmatterComplete: frontmatter?.name && frontmatter?.description ? 1 : 0,
    boundaryDefined: hasOwnBoundary && hasRefuseBoundary ? 1 : 0.5,
    workspaceComplete: workspaceFilesComplete / REQUIRED_WORKSPACE_FILES.length,
    skillSynced: skillSynced ? 1 : 0,
    fiveStandard: hasFiveStandard ? 1 : 0,
    soulExists: hasSoul ? 1 : 0,
    roleContract: roleContractCoverage,
  };
  const healthScore = Object.values(scoreComponents).reduce((a, b) => a + b, 0) / Object.keys(scoreComponents).length;

  return {
    agentId,
    canonicalMdPath: path.relative(repoRoot, canonicalMdPath),
    workspaceDir: path.relative(repoRoot, workspaceDir),
    // Version
    version: canonicalVersion,
    // Completeness
    frontmatterComplete: !!frontmatter?.name,
    description: !!frontmatter?.description,
    // Boundaries
    hasOwnBoundary,
    hasRefuseBoundary,
    hasFiveStandard,
    roleContractCoverage: Math.round(roleContractCoverage * 100),
    // Workspace
    workspaceFilesComplete,
    workspaceFilesTotal: REQUIRED_WORKSPACE_FILES.length,
    workspaceFileStatus,
    // Skill sync
    skillSynced,
    // Lines
    canonicalLines,
    soulLines,
    // Health
    healthScore: Math.round(healthScore * 100),
    scoreComponents,
    // Timestamps
    canonicalMtime: await getFileMtime(canonicalMdPath),
    heartbeatMtime: await getFileMtime(path.join(workspaceDir, "HEARTBEAT.md")),
  };
}

// --- Report Generation ---

function renderMarkdown(agents, summary) {
  const lines = [];

  lines.push(`# Meta_Kim Agent Health Report`);
  lines.push(``);
  lines.push(`> Generated: ${new Date().toISOString()}`);
  lines.push(``);

  // Summary table
  lines.push(`## Summary`);
  lines.push(``);
  lines.push(`| Agent | Version | Frontmatter | Boundaries | Workspace | Skill Sync | Health |`);
  lines.push(`|------|---------|-------------|-----------|-----------|------------|--------|`);
  for (const a of agents) {
    lines.push(
      `| ${a.agentId} | ${a.version} | ${a.frontmatterComplete && a.description ? "✅" : "❌"} | ` +
      `${a.hasOwnBoundary && a.hasRefuseBoundary ? "✅" : "⚠️"} | ` +
      `${a.workspaceFilesComplete}/${a.workspaceFilesTotal} | ` +
      `${a.skillSynced ? "✅" : "❌"} | ` +
      `${a.healthScore}% |`
    );
  }
  lines.push(``);

  // Overall health
  const avgHealth = Math.round(
    agents.reduce((s, a) => s + a.healthScore, 0) / agents.length
  );
  lines.push(`**Overall Health**: ${avgHealth}%`);
  lines.push(``);

  // Five-standard coverage
  lines.push(`## Meta Standard Coverage`);
  lines.push(``);
  lines.push(`| Agent | Meta Theory | Boundary Defined | Workspace Complete | Skill Synced |`);
  lines.push(`|------|------------|-----------------|------------------|-------------|`);
  for (const a of agents) {
    lines.push(
      `| ${a.agentId} | ${a.scoreComponents.fiveStandard === 1 ? "✅" : "❌"} | ` +
      `${a.scoreComponents.boundaryDefined === 1 ? "✅" : "⚠️"} | ` +
      `${a.scoreComponents.workspaceComplete === 1 ? "✅" : Math.round(a.scoreComponents.workspaceComplete * 100) + "%"} | ` +
      `${a.scoreComponents.skillSynced === 1 ? "✅" : "❌"} |`
    );
  }
  lines.push(``);

  // Issues
  const issues = [];
  for (const a of agents) {
    if (!a.frontmatterComplete) issues.push(`⚠️ ${a.agentId}: frontmatter incomplete`);
    if (!a.skillSynced) issues.push(`⚠️ ${a.agentId}: SKILL.md not synced to workspace`);
    if (a.scoreComponents.workspaceComplete < 1)
      issues.push(`⚠️ ${a.agentId}: workspace file missing ${REQUIRED_WORKSPACE_FILES.filter((f) => a.workspaceFileStatus[f] === "❌").join(", ")}`);
    if (!a.hasOwnBoundary || !a.hasRefuseBoundary)
      issues.push(`⚠️ ${a.agentId}: boundary definition missing (owns/refuses)`);
    if (!a.hasFiveStandard)
      issues.push(`⚠️ ${a.agentId}: missing meta theory validation table`);
    if (a.scoreComponents.roleContract < 1)
      issues.push(`⚠️ ${a.agentId}: station deliverables markers incomplete (${a.roleContractCoverage}%)`);
  }

  lines.push(`## Issues Found`);
  lines.push(``);
  if (issues.length === 0) {
    lines.push(`✅ All checks passed — no issues found`);
  } else {
    for (const issue of issues) {
      lines.push(`- ${issue}`);
    }
  }
  lines.push(``);

  // Detail per agent
  lines.push(`## Detail`);
  lines.push(``);
  for (const a of agents) {
    lines.push(`### ${a.agentId}`);
    lines.push(``);
    lines.push(`- **Version**: ${a.version}`);
    lines.push(`- **Canonical**: ${a.canonicalMdPath} (${a.canonicalLines} lines, mtime: ${a.canonicalMtime})`);
    lines.push(`- **Workspace**: ${a.workspaceDir}/ (${a.workspaceFilesComplete}/${a.workspaceFilesTotal} files, mtime: ${a.heartbeatMtime})`);
    lines.push(`- **SOUL.md lines**: ${a.soulLines}`);
    lines.push(`- **Health Score**: ${a.healthScore}%`);
    lines.push(`- **Frontmatter**: name=${!!a.frontmatterComplete} description=${!!a.description}`);
    lines.push(`- **Boundaries**: 只管=${a.hasOwnBoundary} 不碰=${a.hasRefuseBoundary}`);
    lines.push(`- **Five-Standard**: ${a.hasFiveStandard ? "✅" : "❌"}`);
    lines.push(`- **Skill Synced**: ${a.skillSynced ? "✅" : "❌"}`);
    lines.push(`- **Role Contract Coverage**: ${a.roleContractCoverage}%`);
    lines.push(``);
  }

  return lines.join("\n");
}

// --- Main ---

async function main() {
  const agentIds = await listAgents();
  console.error(`\n========================================`);
  console.error(`  Meta_Kim Agent Health Check`);
  console.error(`========================================`);
  console.error(`\nCollecting data for ${agentIds.length} agents...\n`);

  const agents = [];
  for (const agentId of agentIds) {
    process.stderr.write(`  Checking ${agentId.padEnd(16)} `);
    const health = await collectAgentHealth(agentId);
    agents.push(health);
    process.stderr.write(`\b\b\b\b ${health.healthScore}% OK\n`);
  }

  const summary = {
    timestamp: new Date().toISOString(),
    totalAgents: agents.length,
    avgHealth: Math.round(agents.reduce((s, a) => s + a.healthScore, 0) / agents.length),
    allSynced: agents.every((a) => a.skillSynced),
    allFrontmatter: agents.every((a) => a.frontmatterComplete && a.description),
    allBoundaries: agents.every((a) => a.hasOwnBoundary && a.hasRefuseBoundary),
  };

  console.error(`\n========================================\n`);

  const report = renderMarkdown(agents, summary);
  console.log(report);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
