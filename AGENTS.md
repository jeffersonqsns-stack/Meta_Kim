# Meta_Kim Repository Guide

This is not a repository for casually collecting agent prompts.

The goal is to make one meta-based intent-amplification system land consistently across Codex, Claude Code, and OpenClaw.

## Start with “Meta”

In this project:

**meta = the smallest governable unit that exists to support intent amplification**

A valid meta unit should:

- own one clear class of responsibility
- have explicit boundaries against other meta units
- be orchestratable rather than free-floating
- be independently reviewable
- be replaceable or rolled back when it fails

## What This Means for Codex

If you open this repository in Codex, read it as:

- `AGENTS.md` explains what the project is trying to achieve
- `.codex/agents/` maps the eight meta roles into Codex-native custom agents
- `.agents/skills/` provides the project skill mirror

Codex should not just see “many files”.

It should understand:

**this repository is a cross-runtime intent-amplification system.**

## Default Working Model

Users should not need to think in terms of eight specialist agents.

The intended default behavior is:

1. the user gives raw intent
2. the system amplifies the intent first
3. the system decides whether specialist meta agents are needed
4. the system returns a single coherent result

So the external front door should normally be:

- `meta-warden`

The others are backstage specialists, not the public menu.

## The Eight Meta Agents

- `meta-warden`: coordination, arbitration, final synthesis
- `meta-genesis`: prompt identity and `SOUL.md`
- `meta-artisan`: skills, MCP, and tool mapping
- `meta-sentinel`: safety, hooks, permissions, rollback
- `meta-librarian`: memory, knowledge continuity, context policy
- `meta-conductor`: workflow, sequencing, rhythm
- `meta-prism`: quality review and drift detection
- `meta-scout`: external capability discovery and evaluation

## Canonical vs Derived Assets

Preferred edit targets:

- `.claude/agents/*.md`
- `.claude/skills/meta-theory/SKILL.md`

Do not treat these as the long-term maintenance source:

- `.codex/agents`
- `.agents/skills`
- `openclaw/workspaces`

Those are runtime mirrors maintained by sync tooling.

## Working Loop

After changing canonical source files:

1. run `npm run sync:runtimes`
2. run `npm run validate`
3. run `npm run eval:agents` when you need runtime-level acceptance
4. run `npm run verify:all` for full validation + acceptance pass

## Industry Agent Foundry

This repository also contains a department-first industry library.

See:

- `factory/`
- `factory/agent-library/`
- `factory/flagship-complete/`
- `factory/runtime-packs/`

The current matrix is:

- 20 industries
- 5 departments per industry
- 100 department-level agents
- 1000 specialist agents
- organization and orchestration assets for multi-department routing
- runtime-pack projections for Claude Code, Codex, and OpenClaw under `factory/runtime-packs/`

The foundry is for scalable domain expansion.  
It is intentionally separate from the canonical meta-agent source.

## Most Important Instruction

Do not interpret this repository as a showroom for “many agents”.

Interpret it as:

**an architecture pack centered on intent amplification, governed through meta units, and projected consistently across multiple runtimes.**
