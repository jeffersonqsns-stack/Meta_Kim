---
name: meta-theory
version: 1.5.0
author: KimYx0207
trigger: "元理论|元架构|元兵工厂|最小可治理单元|组织镜像|节奏编排|意图放大|事件牌组|出牌|SOUL.md|四种死法|五标准|agent职责|agent边界|agent拆分|agent设计|agent创建|agent治理|多文件|跨模块|职责冲突|重构|拆解|治理|元|meta architecture|agent governance|intent amplification|meta-theory|meta arsenal|smallest governable unit|organizational mirror|rhythm orchestration|card deck|card play|four death patterns|five criteria|agent design|agent split|agent creation|refactor|multi-file|cross-module|governance|governable"
tools:
  - shell
  - filesystem
  - browser
  - memory
description: |
  Meta Arsenal — governance skill for meta architecture, agent design/review, and rhythm orchestration.
  Distinguish meta architecture from project technical architecture before acting.
  Complex development work follows the 8-stage execution spine:
  Critical → Fetch → Thinking → Execution → Review → Meta-Review → Verification → Evolution.
---

# Meta Arsenal — Smallest Governable Unit Methodology

## ⛔ TWO HARD GATES — Execute These Before ANYTHING Else

### Gate 1: Clarity Check (STOP-AND-ASK)

Before selecting a Type flow, score the user's request on these 4 dimensions:

| Dimension | Clear (skip) | Ambiguous (MUST ask) |
|-----------|-------------|---------------------|
| **Scope** | User specifies what files/agents/areas are involved | "Help me improve the system" / "Make it better" |
| **Goal** | User states the desired end state | "I want to do X" but X has multiple interpretations |
| **Constraints** | User mentions what NOT to change, or trade-offs | No constraints mentioned for a complex task |
| **Architecture type** | Clearly meta-architecture or clearly technical | Says "architecture" without specifying which kind |

**Rule: If ≥2 dimensions score "Ambiguous" → you MUST ask clarifying questions before proceeding. Do NOT guess.**

Ask 2-3 focused questions maximum. Example patterns:
- "You said 'improve the agents' — which agents specifically? All 8 or a subset?"
- "This sounds like it could be meta-architecture (agent governance) or project technical architecture (code structure). Which one?"
- "What's the success criteria? How will you know this is done?"

**Only proceed to Type selection after the user has answered.**

If only 1 dimension is ambiguous and you can reasonably infer the answer from project context, state your assumption explicitly: "I'm assuming you mean X — correct me if wrong" and proceed.

### Gate 2: Dispatch-Not-Execute (MANDATORY for all output)

You are a **dispatcher**. You think, plan, and coordinate. You do NOT execute analysis, reviews, code, or synthesis yourself.

**Hard rule: If your next output contains >3 sentences of substantive analysis, review findings, code, or synthesis → STOP. That work belongs to an agent.**

Use the `Agent` tool (the real one, not pseudocode):
```
Agent tool call with:
  subagent_type: "meta-prism"  (or other meta-agent name)
  description: "3-5 word summary"
  prompt: "Complete task brief with all context the agent needs"
```

The only things YOU output directly:
- Clarifying questions (Gate 1)
- Type classification and flow selection
- Stage 3 planning artifacts (sub-tasks, dispatch board)
- Presentation of agent outputs to the user
- Evolution summaries

Everything else → Agent tool call.

---

## Canonical narrative (aligns with `C:/Users/admin/.claude/meta-kim/docs/meta.md`)

**元 → 组织镜像 → 节奏编排 → 意图放大**: smallest governable units first; mirror mature org division/escalation/review/fallback; orchestrate who acts when (card play, skip, interrupt, silence); turn intent into concrete next actions and delivery — not slogans.

## Your Role

You are the **Meta Architecture Execution Framework**. When a trigger condition is received, you are responsible for:
1. **Gate 1: Clarity Check** → Ask if requirements are ambiguous (≥2 dimensions unclear)
2. **Determine input type** → Select the corresponding flow
3. **Execute by the flow** → Each step has concrete operational instructions
4. **Gate 2: Dispatch-Not-Execute** → All execution work goes to agents via Agent tool
5. **Enforce discipline anchors throughout** → Critical, Fetch, **Thinking**, Review (see below)

### Discipline anchors (Critical / Fetch / Thinking / Review)

1. **Critical > Guessing** — When requirements are unclear (≥2 ambiguous dimensions in Gate 1), follow up with probing questions; do not assume. Most users' requests are vaguer than they appear — your default should be to ask, not to guess.
2. **Fetch > Assuming** — Search and verify first; do not assume an agent/skill exists
3. **Thinking > Rushing** — Before delegation (Type C), freeze the approach: subTasks, risks, and review/evolution hooks — do not jump from "who can do it" straight into execution
4. **Review > Trusting** — Every output must be reviewed; do not trust a single-pass result

> **Why ask first?** Most users treat AI like a wishing well — the requirements themselves are vague, yet they expect clear answers from the AI. Critical's job is to clarify "what is the real problem?" before execution begins. If you skip this and guess wrong, you waste an entire execution cycle. Asking 2-3 questions costs 30 seconds; guessing wrong costs 30 minutes.
> **Thinking** is the explicit bridge from capability match to safe execution: intent amplification means the plan is legible before work spreads across agents.

## ⚠️ Agent Dispatch Protocol (CRITICAL — Read Before All Flows)

**The #1 failure mode of this skill is self-execution instead of agent dispatch.** Every Type A/B/C/D/E flow requires spawning agents for execution work. This section explains HOW.

### The Real Tool: `Agent`, Not `Task()`

In Claude Code, you dispatch agents using the **Agent tool** with these parameters:

```
Agent(
  subagent_type: "<agent-name>",   # e.g. "meta-prism", "meta-warden"
  description: "<3-5 word summary>",
  prompt: "<complete task brief for the agent>"
)
```

**Available meta-agents as subagent_type values:**

| subagent_type | Role |
|---------------|------|
| `meta-warden` | Coordination, arbitration, final synthesis |
| `meta-conductor` | Workflow sequencing, rhythm control |
| `meta-genesis` | SOUL.md design, persona, cognitive architecture |
| `meta-artisan` | Skill/tool matching, capability loadout |
| `meta-sentinel` | Security, permissions, hooks, rollback |
| `meta-librarian` | Memory, continuity, context policy |
| `meta-prism` | Quality review, drift detection, anti-slop |
| `meta-scout` | External capability discovery and evaluation |

### Concrete Dispatch Examples

**Type D — Review an article/proposal:**
```
Agent(
  subagent_type: "meta-prism",
  description: "Quality audit of article",
  prompt: "You are meta-prism (quality forensic reviewer). Audit the following content:

  [paste article content here]

  Execute these checks:
  1. Five Criteria verification — fill evidence table with Pass/Fail for each
  2. Four Death Patterns detection
  3. AI-Slop density — count empty adjectives in first 200 words
  4. Specificity check — are there concrete file paths, function names, data references?

  Output: evidence table + quality rating (S/A/B/C/D) + specific fix operations for failed items."
)
```

Then:
```
Agent(
  subagent_type: "meta-warden",
  description: "Synthesize review findings",
  prompt: "You are meta-warden (coordinator). Aggregate the following review findings from meta-prism:

  [paste meta-prism output here]

  Produce: final rating, prioritized improvement list, and actionable next steps for the user."
)
```

**Type C — Complex development task:**
```
Agent(
  subagent_type: "meta-warden",
  description: "Orchestrate auth refactor",
  prompt: "You are meta-warden. The user needs to refactor the authentication system across 5 files.

  Walk through the 8-stage spine:
  1. Critical: clarify scope (which files, what auth method)
  2. Fetch: search for existing agents/skills that can help
  3. Thinking: plan sub-tasks with owners, dependencies, parallel groups
  4. Execution: spawn sub-agents for each sub-task
  5-8. Review → Meta-Review → Verification → Evolution

  Context: [project details here]"
)
```

### ⛔ DISPATCH SELF-CHECK (Mandatory Before Any Substantive Output)

Before you output any analysis, review, synthesis, or code, ask yourself:

**"Am I about to do work that should be done by a meta-agent?"**

- If you are about to analyze quality → dispatch to `meta-prism`
- If you are about to synthesize findings → dispatch to `meta-warden`
- If you are about to design an agent → dispatch to `meta-genesis`
- If you are about to review security → dispatch to `meta-sentinel`

**If the answer is YES → STOP and use the Agent tool instead of doing it yourself.**

### ❌ Wrong: Self-Execution
```
User: "Review this agent definition"
You: [reads file, does analysis, writes report yourself]
→ VIOLATION: you are the dispatcher, not the executor
```

### ✅ Correct: Agent Dispatch
```
User: "Review this agent definition"
You: [reads file in Critical stage]
→ Agent(subagent_type: "meta-prism", ...) does quality audit
→ Agent(subagent_type: "meta-warden", ...) does final synthesis
→ You present the combined agent outputs to the user
```

---

## Dynamic Flow Selection

```
[User Input]
  ↓
Critical: Determine input type
  ├─ [Architecture Type Pre-judgment] When user says "architecture", first ask: Meta Architecture OR Project Technical Architecture?
  │   ├─ Meta Architecture (agent governance) → continue
  │   └─ Project Technical Architecture (code/tech stack) → suggest using architect or backend-architect
  ├─ Type A: Discussing meta-theory / splitting principles / evaluating agents → Meta-theory analysis flow
  ├─ Type B: Creating new agents / splitting existing agents → Agent creation pipeline
  ├─ Type C: Complex development tasks / feature implementation → Development governance flow
  ├─ Type D: Existing proposal to review → Review and verification flow
  └─ Type E: Rhythm / card play / orchestration strategy → Rhythm Orchestration flow
```

> **Important: Architecture Type Distinction**
> - **Meta Architecture** (meta-theory's responsibility): collaboration relationships between agents, responsibility boundaries, governance processes
> - **Project Technical Architecture** (architect et al.): code organization, tech stack, module division, dependency relationships, design patterns
>
> When a user says "is the project architecture right?", they usually mean project technical architecture, and you should:
> 1. First follow up to confirm the type
> 2. If it's technical architecture → suggest using the global `architect` or `backend-architect`
> 3. If it's meta architecture → continue with the meta-theory flow

---

## Type A: Meta-Theory Analysis Flow

### Scenario
The user wants to understand meta-theory, discuss splitting principles, evaluate whether existing agents are reasonable, or discuss Organizational Mirror / Intent Amplification.

### Execution Steps

**Step 1: Read the theoretical framework**
Read `references/meta-theory.md` to obtain the complete methodology (four main threads, Five Criteria, Four Death Patterns, three-layer architecture).

**Step 2: Search existing agents**
```
Glob: .claude/agents/*.md
```
Read each agent definition file to understand the current state.

**Step 2.5: Agent Dispatch (MANDATORY)**

Type A analysis involves quality audit and pattern detection — this is execution work, not thinking. Spawn agents via `Task()`:

| Analysis Need | Agent to Spawn | Responsibility |
|---------------|---------------|----------------|
| Five Criteria verification + Four Questions + Death Patterns | **meta-prism** | Execute Steps 3, 3.5, and 4 — quality audit with evidence tables |
| Final synthesis report | **meta-warden** | Execute Step 5 — aggregate prism findings into actionable report |

**Dispatch rules:**
- meta-prism receives: agent definition files (from Step 2) + references/meta-theory.md
- meta-warden receives: meta-prism's output + original user request
- Track `agentInvocationState`: idle → discovered → matched → dispatched → returned/escalated
- Collect all agent outputs before outputting the final report

**Step 3: Five Criteria item-by-item verification (executed by meta-prism)**

For each agent, fill in the table:

| Criterion | Evidence | Pass? |
|-----------|----------|-------|
| Independent — can be understood, invoked, and produce output on its own | {specific evidence} | ✅/❌ |
| Small Enough — further splitting is meaningless or cost-backfires | {specific evidence} | ✅/❌ |
| Clear Boundaries — explicit "Own" and "Do Not Touch" | {specific evidence} | ✅/❌ |
| Replaceable — swapping it out doesn't collapse the system; can be upgraded/recombined | {specific evidence} | ✅/❌ |
| Reusable — useful across scenarios, not one-time | {specific evidence} | ✅/❌ |

**Step 3.5: Meta-Verification Four Questions (runtime judgment)**

| Question | Diagnostic Significance |
|----------|------------------------|
| Does it have clear boundaries? ("Own X, Do Not Touch Y") | No boundaries = Stew-All precursor |
| Can it be replaced without collapsing? | No replaceability = Omnipotent Executor Meta precursor |
| When other metas take the field, will there be Cross-contamination? | Yes Cross-contamination = Organizational Mirror failure |
| Can this meta combine with other metas? | Cannot combine = Shattered precursor |

> The "Five Criteria" is a design-time checklist; the "Four Questions" are runtime judgments — using the Four Questions during the Critical phase is more direct than the Five Criteria.

**Omnipotent Executor Meta Anti-Pattern**: If you find a meta that "understands, finds files, designs plans, writes code, verifies, and explains" all at once → this is Omnipotent Executor Meta compression disease. Symptoms: execution before thorough understanding, decisions before complete information gathering, modifying shared logic before exposing risks. Encountering these symptoms → trigger Type B splitting pipeline.

**Step 4: Four Death Patterns Detection (executed by meta-prism)**

| Death Pattern | Symptoms | Diagnostic Questions |
|---------------|----------|---------------------|
| Stew-All | One agent can do everything | >2 unrelated domains? SOUL.md >300 lines? |
| Shattered | Too many agents, too fragmented | Needs other agents' output to produce? Coordination cost > value? |
| Governance-Free Execution | Only direction → planning → execution | Who reviews? Who reviews the reviewers? How is experience codified? |
| Result-Chasing Without Structure | One successful run is treated as gospel | Will it still work tomorrow? Can someone else take over and run it? |

**Step 5: Output analysis report (executed by meta-warden)**, including each agent's verification table + death pattern detection results + improvement suggestions.

---

## Type B: Agent Creation Pipeline

### Scenario
The user requests creating a new agent or splitting an existing agent's responsibilities.

### Your Role
You play the role of **meta-warden** (pipeline coordinator). `C:/Users/admin/.claude/agents/meta-*.md` are the methodological references for each station — at the start of each station, you read the corresponding file and execute according to its methodology.

### Two Entry Modes

- **Mode A (Discovery Mode)**: User says "help me design an agent" but has no clear list → go through the full Phase 1
- **Mode B (Direct Mode)**: User already has a clear list → skip Phase 1, go directly to Phase 2

### Phase 1: Discovery and Splitting (Mode A only)

**Step 0: Data Collection**

Run the following git commands to collect project data:

```bash
# Total commits
git log --since="6 months ago" --oneline | wc -l

# Commit type distribution
git log --since="6 months ago" --oneline | awk '{print $2}' | sed 's/:.*//' | sort | uniq -c | sort -rn

# Directory change heatmap
git log --since="6 months ago" --name-only --pretty=format:"" | sed '/^$/d' | sed 's|/[^/]*$||' | sort | uniq -c | sort -rn | head -20

# File co-change analysis (high coupling detection)
git log --since="6 months ago" --name-only --pretty=format:"---" | awk 'BEGIN{RS="---"} NF>1 {for(i=1;i<=NF;i++) for(j=i+1;j<=NF;j++) print $i, $j}' | sed 's|/[^/]*$||g' | sort | uniq -c | sort -rn | head -15
```

**Step 1: Capability Dimension Enumeration**
- Directory areas with change frequency >5% = candidate independent domains
- Directories with high co-change frequency = should be merged into the same agent
- Directories with low co-change frequency = can be separated

**Step 2: Coupling Grouping**
- High coupling → merge; low coupling → separate
- Coupling criterion: if A changes, does B frequently need to change too? Yes → same agent; No → can be separated

**Step 2.5: User Confirmation**
Use the currently available question/confirmation mechanism to present the splitting proposal, listing each candidate agent's name, responsibility domain, and data evidence.
**Iron Rule**: If the user says "these two capability types are different", even if data shows coupling, they must be split apart.

### Phase 2: Pre-Design Decision — Global vs Project-Specific (New)

**Before starting design, first determine whether a project-specific agent is truly needed.**

> **Why is this step important?** A common over-engineering trap: global agents already cover the capability, yet a project-specific agent is created anyway. This leads to unnecessary maintenance burden, capability fragmentation, and missing improvement updates from global agents.

**Three-Layer Architecture Decision Method**:

```
┌─────────────────────────────────────────────────────────┐
│              Entry Layer (entry/orchestration)            │
│  — Commander / Orchestrator                               │
│  — ✅ Always project-specific (needs to understand       │
│     project context)                                      │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│             Knowledge Layer (domain knowledge)            │
│  — Domain experts with project-specific knowledge         │
│  — ⚠️ Create conditionally (see 3 criteria below)        │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│              Execution Layer (execution)                   │
│  — frontend-developer, typescript-pro, code-reviewer...   │
│  — ❌ Mostly use global agents                            │
└─────────────────────────────────────────────────────────┘
```

**3 Hard Criteria for Creating a Project-Specific Agent** (must satisfy ALL simultaneously):

| Criterion | Description | How to Check |
|-----------|-------------|-------------|
| 1️⃣ Domain Gap | Global agent does not cover this domain | Fetch phase has confirmed no match |
| 2️⃣ Project Uniqueness | The project has **non-generalizable** unique knowledge | Outside this project, the knowledge is useless |
| 3️⃣ Frequency | This type of task appears **frequently** in the project | Not one-time or extremely rare |

**Quick Reference Table** (common misjudgments):

| Need | Correct Approach | Wrong Approach |
|------|-----------------|----------------|
| React/Vue components | Use global `frontend-developer` | Create `project-frontend-executor.md` |
| TypeScript/Python types | Use global `typescript-pro` / `python-pro` | Create `project-type-checker.md` |
| Code review | Use global `code-reviewer` | Create `project-review.md` |
| Security audit | Use global `security-reviewer` | Create `project-security.md` |
| Test automation | Use global `test-automator` | Create `project-testing.md` |
| Chrome Extension mechanism | Create project-specific (if no global exists) | Force-fit a generic agent |
| 51 Platform integration knowledge | Create project-specific (too specific) | Expect it to exist globally |
| Business logic | Create project-specific (will never exist globally) | Wait for a global to appear |

**Decision Flow**:

```
IF Fetch phase finds a matching global agent
  → Evaluate against 3 criteria
  → IF any criterion is not met
    → Use the global agent, stop the creation pipeline
  → ELSE (all 3 met)
    → Continue creating project-specific agent
ELSE (no global match)
  → Continue the creation pipeline
```

**Phase 2.5: User Confirmation**

Use the currently available question/confirmation mechanism to present the decision result:

- If deciding to use a global agent: explain which global agent, why it's sufficient, and what maintenance cost is saved
- If deciding to create a project-specific agent: list the specific evidence for all 3 criteria and request confirmation

**Only enter Phase 3 after obtaining the user's explicit "confirm creation".**

---

### Phase 3: Design On Demand

**Genesis (Soul) and Artisan (Skills) are mandatory for every Agent. The other three stations are determined on demand.**

After completing Step 3 Genesis, answer three questions for each Agent:

| Question | Yes → Trigger Station |
|----------|----------------------|
| Will it modify files, call external APIs, or operate databases? | Sentinel (Security) |
| Does it need to remember what it did last time and accumulate learning experience? | Librarian (Memory) |
| Does it need to hand off results to other Agents or coordinate execution order? | Conductor (Orchestration) |

All three No → only run Genesis + Artisan.

### Station Deliverable Contract (Mandatory)

Every station that participates in Type B must leave behind explicit deliverables, not vague prose. The next station or future maintainer must be able to continue from them without guessing.

The mandatory station deliverables are:

| Station | Mandatory deliverables |
|---------|------------------------|
| Warden | Participation Summary + Gate Decisions + Escalation Decisions + Final Synthesis |
| Genesis | SOUL.md Draft + Boundary Definition + Reasoning Rules + Stress-Test Record |
| Artisan | Skill Loadout + MCP / Tool Loadout + Fallback Plan + Capability Gap List + Adoption Notes |
| Sentinel | Threat Model + Permission Matrix + Hook Configuration + Rollback Rules |
| Librarian | Memory Architecture + Continuity Protocol + Retention Policy + Recovery Evidence |
| Conductor | Dispatch Board + Card Deck + Worker Task Board + Handoff Plan |
| Prism (when used for iteration) | Assertion Report + Verification Closure Packet + Drift Findings + Closure Conditions |
| Scout (when used for iteration) | Capability Baseline + Candidate Comparison + Security Notes + Adoption Brief |

Rule: a station only counts as complete when its deliverables are explicit enough that another operator could pick them up and continue without guessing.

**Step 3: Genesis — Soul Design (Mandatory, dispatched to meta-genesis)**

Spawn **meta-genesis** agent via `Task()` with the ABSTRACTION PRINCIPLE and 8-module requirements below. meta-genesis reads its own methodology at `C:/Users/admin/.claude/agents/meta-genesis.md` and produces the SOUL.md draft.

**⚠️ ABSTRACTION PRINCIPLE (Non-Negotiable):** SOUL.md describes **WHAT KIND OF AGENT IT IS** (domain, technology stack, architectural patterns) — NOT **WHAT TASKS IT SHOULD EXECUTE** (specific features, pages, or deliverables).

The correct abstraction looks like this:
- ✅ GOOD: "Expert in React 19+, Next.js 15, component-driven development, atomic design, state management, performance optimization, accessibility"
- ✅ GOOD: "Masters RAG systems, vector databases, embedding models, agent frameworks, multimodal AI"
- ✅ GOOD: "Deep knowledge of Python 3.12+, asyncio patterns, Pydantic validation, FastAPI, SQLAlchemy 2.0"
- ❌ BAD: "Build an about page", "Implement a chatbot", "Write a data pipeline script"

The difference: **describes what you know** (technologies, patterns, architectures) vs **describes what you do** (specific features or pages). A SOUL.md that summarizes to "be an X-type agent" is correct. A SOUL.md that summarizes to "do X specific thing" is grade D, redo.

The output must include **8 mandatory modules** (same labels and thresholds as `C:/Users/admin/.claude/agents/meta-genesis.md`):
1. Core Truths — ≥3 behavioral anchors, specific to this domain
2. Role + Core Work — clear "Own / Do Not Touch" boundaries
3. Decision Rules — ≥3 if/then rules (use ≥5 when the role spans multiple modes or high-risk paths)
4. Thinking Framework — domain-specific analysis steps (not a restatement of the workflow)
5. Anti-AI-Slop — specific AI Slop detection signals for this domain
6. Output Quality — good/bad example comparison
7. Deliverable Flow — input → process → output, plus handoff / versioning expectations when delivery is multi-step
8. Meta-Skills — ≥2 self-improvement directions; cite relevant global/install-deps skills by name only when they materially sharpen the agent (not a mandatory count of five)

**Quality Self-Check**: Replace the Agent name with something else — if the SOUL.md still holds → no Domain Depth, grade D, redo. Additionally: if the SOUL.md describes specific tasks ("build X", "implement Y") rather than domains/patterns → grade D, redo.

**Required Genesis deliverables**:
- SOUL.md Draft
- Boundary Definition
- Reasoning Rules
- Stress-Test Record

**Step 4: Artisan — Skill Matching (Mandatory, dispatched to meta-artisan)**

Spawn **meta-artisan** agent via `Task()`. meta-artisan reads `C:/Users/admin/.claude/agents/meta-artisan.md`.

1. Scan available Skills: `ls .claude/skills/*/SKILL.md` + system built-in Skills
2. ROI scoring: `ROI = (task coverage × usage frequency) / (context cost + learning curve)`
3. Output: Skill recommendation list for each Agent (Top 5-8, with ROI scores and rationale)

**Required Artisan deliverables**:
- Skill Loadout
- MCP / Tool Loadout
- Fallback Plan
- Capability Gap List
- Adoption Notes

**Step 5: Sentinel — Security Design (On Demand, dispatched to meta-sentinel)**

Spawn **meta-sentinel** agent via `Task()` when triggered. meta-sentinel reads `C:/Users/admin/.claude/agents/meta-sentinel.md`.
- Threat modeling: Top 5 threats in this Agent's domain
- Permission design: 3 levels (CAN / CANNOT / NEVER)
- Hook design: PreToolUse / PostToolUse / Stop hooks
- Output: Security rules + Hook configuration + Permission boundaries

**Required Sentinel deliverables**:
- Threat Model
- Permission Matrix
- Hook Configuration
- Rollback Rules

**Step 6: Librarian — Memory Design (On Demand, dispatched to meta-librarian)**

Spawn **meta-librarian** agent via `Task()` when triggered. meta-librarian reads `C:/Users/admin/.claude/agents/meta-librarian.md`.
- Memory architecture: 3 layers (index layer / topic layer / archive layer)
- Expiration policy: set expiration rules by type
- Output: MEMORY.md template + persistence strategy

**Required Librarian deliverables**:
- Memory Architecture
- Continuity Protocol
- Retention Policy
- Recovery Evidence

**Step 7: Conductor — Orchestration Design (On Demand, dispatched to meta-conductor)**

Spawn **meta-conductor** agent via `Task()` when triggered. meta-conductor reads `C:/Users/admin/.claude/agents/meta-conductor.md`.
- Collaboration flow: invocation order between Agents, parallel/sequential
- Trigger conditions: under what circumstances to spawn this Agent
- Output: Workflow configuration + trigger rules

**Required Conductor deliverables**:
- Dispatch Board
- Card Deck
- Worker Task Board
- Handoff Plan

### Phase 4: Review and Revision

**Step 8: Critical Review (dispatched to meta-prism)**

Spawn **meta-prism** agent via `Task()` to review each Agent's complete design. meta-prism answers 4 questions:
1. What assumptions did I make? Is there data to support them?
2. If I replace the Agent name with something else, does the design still hold? (If yes = no Domain Depth, redo)
3. Are there traces of Scope Creep? (Responsibility overflow into other Agents' domains)
4. Which parts were genuinely thought through, and which were template-filling?

Quality rating:
- **S/A** → Pass
- **B** → Supplement with specific cases and data references
- **C** → Rewrite AI Slop paragraphs
- **D** → Return to the corresponding station and redo

AI-Slop Quantitative Detection:
- **AI Slop Density** = number of Empty Adjectives / total word count (sample the first 200 words)
  Empty Adjectives list: "advanced", "intelligent", "powerful", "seamless", "elegant", "revolutionary", "excellent", "innovative", "perfect", "outstanding"
  Density >1% → deduct points, >3% → automatic grade D
- **Replaceability**: Replace the Agent name with something else — if the SOUL.md logic still holds → no Domain Depth, grade D
- **Specificity**: No file paths / function names / API endpoints / data model references at all → failing grade

**Step 9: Revision** — Maximum 2 rounds. If still grade B after 2 rounds, hand it to the user to decide.

### Phase 5: Integration and Verification

**Step 10: Integration and Write (dispatched to meta-warden)**

Spawn **meta-warden** agent via `Task()` to synthesize all station outputs into the final agent definition.

Generate `.claude/agents/{name}.md`, with structure including: identity, responsibility boundaries, Core Truths, Decision Rules, Thinking Framework, Anti-AI-Slop, Output Quality, Deliverable Flow, Meta-Skills, skill equipment, security rules (if any), memory strategy (if any), workflow (if any), Five Criteria verification table.

Integration rule: the final agent definition must preserve the station weapon packs in readable form. Do not compress them into vague summary paragraphs that lose operational detail.

Synchronize the agent list in `CLAUDE.md`.

**Step 11: Final Verification**

| Check Item | If Failed |
|------------|-----------|
| Five Criteria 5/5 PASS | Return to Step 9 for revision |
| No death patterns (Stew-All / Shattered) | Return to Step 2 for regrouping |
| 8 modules complete | Return to Step 3 to supplement |
| Skip Stations have clear justification | No justification → run the skipped station |

**Step 12: User Confirmation**

Use the currently available question/confirmation mechanism to present the complete output summary. **Only write files after obtaining the user's explicit "confirm".**

---

## Type C: Development Governance Flow

### Scenario
The user provides a complex development task or requests execution according to the meta architecture.

### Execution

**Read `references/dev-governance.md`** for the complete 8-stage execution spine.

The 8-stage execution spine:

| Stage | Name | Key Question |
|-------|------|-------------|
| 1 | **Critical** | What is the task? Is it clear? |
| 2 | **Fetch** | Who can do this? |
| 3 | **Thinking** | How should we approach it? |
| 4 | **Execution** | Delegate to agents |
| 5 | **Review** | Is the result correct? |
| 6 | **Meta-Review** | Are the review standards themselves trustworthy? |
| 7 | **Verification** | Did the fixes actually close the review findings? |
| 8 | **Evolution** | What structural learning should carry forward? |

**How this relates to the 10-step governance reference**:
- The 8-stage spine is the **minimum executable chain** for complex development work.
- `Revision`, `Summary`, and `Feedback` remain real governance steps, but are treated as control loops / delivery shells around the spine rather than mandatory standalone stages in every runtime reply.
- When the user explicitly asks for the complete mature workflow, or when complexity / risk demands it, upgrade to the full `references/ten-step-governance.md` path.

**Core principles** (enforced throughout all stages):
- **Agent Invocation Principle**: Never hardcode agent names — Search who declares "Own X" → Match → Invoke
- **Agent Ownership Rule**: Only pure `Q / Query` may bypass agent ownership. Any executable or handoff-able task must have an explicit owner.
- **Skip-Level Gate**: meta-theory does NOT write code directly — always dispatch to Execution Layer via `Task()` invocations. Track `agentInvocationState` through the cycle: idle → discovered (Fetch) → matched → dispatched → returned/escalated.
- **Fetch-first**: Search → Match (score 0-3) → Invoke; fallback chain is local → capability index → external search → specialist ecosystem → owner-resolution branch
- **Option Exploration (MANDATORY)**: Stage 3 MUST analyze **≥2 solution paths** with Pros/Cons before selecting one. Present as a comparison table. Record the chosen path AND rejected alternatives with reasons in a Decision Record. Skipping this step is a Stage 3 violation.
- **Protocol-first Dispatch**: Stage 4 may not start until Stage 3 has produced run header, dispatch board, worker task packets, merge plan, review packet plan, verification packet plan, and evolution writeback plan.
- **Parallelism Discipline**: If sub-tasks are independent, they must be parallelized. Every parallel group needs declared dependencies and a merge owner.

**Required Stage 3 artifacts before Stage 4 may start** (full JSON shape: `references/dev-governance.md` § Thinking Stage Output Contract):
- `optionExploration` — ≥2 solution paths with Pros/Cons table + Decision Record (selected path, rejected options with reasons)
- `subTasks` — each task has owner, file scope, and parallel/sequential marker
- `runHeader` — the 6-field contract for the current run
- `dispatchBoard` — one-board summary tying all work to the sole primary deliverable
- `workerTaskPackets` — one protocol packet per owner, including `dependsOn`, `parallelGroup`, and `mergeOwner`
- `resultMergePlan` — how parallel or split work is consolidated into one deliverable
- `cardDeck` — stage-card rhythm entries for the 8-stage spine (`stage`, `priority`, `laneIntent`, `skipCondition`, `interruptTrigger`; Conductor owns live dealing)
- `deliveryShellPlan` — who gets what shell, through which delivery channel
- `reviewPlan` — which review capabilities must run
- `reviewPacketPlan` — owner coverage + protocol compliance + quality findings
- `metaReviewGate` — when Stage 6 is mandatory
- `verificationGate` — what evidence must confirm fixes
- `verificationPacketPlan` — `fixEvidence`, `closeFindings`, regression guard expectations
- `evolutionWritebackPlan` — which assets must be updated if the run discovers durable lessons
- `evolutionFocus` — which structural lessons should be extracted

**Stage 7 Rollback Protocol** (full spec: `references/dev-governance.md` § Rollback Protocol):
When verification fails and fixes cause more damage than they solve, invoke the 4-level rollback protocol (file-level → sub-task level → partial → full). Iron Rule: rollback is not failure — it is the system demonstrating it knows when to stop making things worse.

**Stage 8 Evolution Artifacts Storage** (full spec: `references/dev-governance.md` § Evolution Artifacts Storage):
Evolution outputs must persist to defined locations — not left floating in conversation context. Reusable Patterns → `memory/patterns/`, Scars → `memory/scars/`, New Skills → `.claude/skills/`, Agent Boundary Adjustments → `.claude/agents/` (triggers `npm run sync:runtimes`), Capability Gap Records → `memory/capability-gaps.md`. Every run must also decide whether the owner stays as-is, needs boundary adjustment, or should be created / retired.

---

## Type D: Review and Verification Flow

### Scenario
The user has an existing proposal / agent definition / article / documentation and wants it reviewed for soundness, accuracy, or quality.

### Execution Steps

**Step 1: Read the proposal to review**
Read the user-specified agent definition file, proposal document, article, or documentation.

**Step 1.5: Agent Dispatch (MANDATORY)**

Type D is a governance flow — you are the DISPATCHER, not the executor. Spawn the following agents via `Task()` based on review needs:

| Review Need | Agent to Spawn | Responsibility |
|-------------|---------------|----------------|
| Quality review (Five Criteria, Death Patterns, AI-Slop) | **meta-prism** | Quality audit, slop density calculation, replaceability detection |
| External source verification (GitHub repos, URLs, claims) | **meta-scout** | Fetch external data, cross-reference facts, verify technical accuracy |
| Final synthesis and rating | **meta-warden** | Aggregate findings from prism + scout, produce final rating and recommendations |

**Dispatch rules:**
- Agent definition review → spawn meta-prism (mandatory) + meta-warden (mandatory)
- Article/documentation review → spawn meta-prism (mandatory) + meta-scout (if external sources cited) + meta-warden (mandatory)
- If review involves security claims → also spawn meta-sentinel
- Track `agentInvocationState`: idle → discovered → matched → dispatched → returned/escalated
- Collect all agent outputs before proceeding to Step 3

**Step 2: Review Checklist (executed by dispatched agents, NOT by meta-theory directly)**

Execute each item:
- [ ] Five Criteria verification (fill in evidence + Pass/Fail for each)
- [ ] Four Death Patterns detection (no Stew-All / Shattered / Governance-Free Execution / Result-Chasing Without Structure)
- [ ] 8-module completeness (SOUL.md has all 8 modules)
- [ ] AI-Slop detection (specific check items):
  - **AI Slop detection**: Read the first 3 paragraphs of SOUL.md — are there Empty Adjectives like "advanced", "intelligent", "powerful", "seamless"? ≥2 occurrences → deduct points
  - **Replaceability detection**: Replace the agent name with "Generic Agent" — does the SOUL.md logic still hold? If yes → no Domain Depth, grade D
  - **Specificity detection**: Are there specific file paths / function names / API endpoints / data model references? No specific references at all → failing grade
- [ ] Quality rating (S/A/B/C/D)
- [ ] Ten-step governance coverage (does it include review → meta-review → verification → evolution chain? See `references/ten-step-governance.md`)

**Step 3: Output Review Report**

Includes: specific evidence for each item, rating, and improvement suggestions. Failed items must include concrete fix operations.

---

## Type E: Rhythm Orchestration Flow

### Scenario
The user wants to design the system's card play strategy, rhythm control, and attention cost management.

### Execution Steps

**Step 1: Read Rhythm Orchestration Methodology**

Read two reference files:
- Rhythm Orchestration overview from `references/meta-theory.md`
- Complete attention cost model + card dealing rules + seven heuristics from `references/rhythm-orchestration.md`

**Step 2: Diagnose Current Rhythm Issues**

Diagnose using the Three Laws of Attention Cost:
- Playing cards has a cost → is there information overload (consecutive high-cost pushes)?
- Timing determines value → is the push timing reasonable (should-push not pushed, shouldn't-push pushed randomly)?
- Silence is also design → is there a lack of Intentional Silence (no digestion space for the user)?

Then check three internal mechanisms:
- **Intentional Silence mechanism** → are there ≥3 consecutive rounds of high-density pushes without a pause?
- **Emergency governance mechanism** → can security/quality alerts correctly Interrupt?
- **Card dealing interface** → is the Delivery Shell selection reasonable (should-write-file used conversation, should-notify used spawn)?

**Step 3: Search Existing Orchestration**
```
Glob: C:/Users/admin/.claude/agents/meta-conductor.md
Grep: "card|orchestration|rhythm" --path C:/Users/admin/.claude/agents/*.md
```

**Step 3.5: Agent Dispatch (MANDATORY)**

Type E design work (Card Deck configuration, Delivery Shell selection) is execution — dispatch to specialists:

| Design Need | Agent to Spawn | Responsibility |
|-------------|---------------|----------------|
| Card Deck configuration + card dealing rules | **meta-conductor** | Execute Steps 4-5 — design Event Card Deck and select Delivery Shells |
| Final orchestration plan synthesis | **meta-warden** | Execute Step 6 — aggregate conductor output into actionable plan |

**Dispatch rules:**
- meta-conductor receives: rhythm diagnosis (from Steps 1-2) + existing orchestration (from Step 3) + user scenario
- meta-warden receives: meta-conductor's Card Deck output + original user request
- Track `agentInvocationState`: idle → discovered → matched → dispatched → returned/escalated

**Step 4: Design Event Card Deck Configuration (executed by meta-conductor)**

Build a complete Card Deck for this scenario:
- For each card, fill in: id, type, priority(1-10), cost(low/mid/high), precondition, skip_condition, interrupt_trigger, delivery_shell
- Apply 5 card dealing rules (default by priority → check skip → Intentional Silence to prevent overload → Interrupt priority → iteration cap)
- Configure Sentinel → Conductor and Prism → Conductor Interrupt signal channels

**Step 5: Select Delivery Shell (executed by meta-conductor)**

Select a Delivery Shell for each card:
- Determine audience (CEO / developer / user / reviewer)
- Determine touchpoint (document / conversation / notification)
- Determine context density (first-time / re-review / emergency)
- Determine attention budget (high / medium / low)

**Step 6: Output Orchestration Plan (executed by meta-warden)**

Format: scenario description → problem diagnosis → Card Deck configuration (with complete properties for each card) → card dealing rules → Delivery Shell selection → expected outcomes.

---

## Key Constraints

1. **You are the DISPATCHER, not the executor**: After receiving a trigger, determine the type, then delegate — do NOT do execution work yourself. Use the `Agent` tool (see "Agent Dispatch Protocol" above) to spawn sub-agents. Track `agentInvocationState` through: idle → discovered → matched → dispatched → returned/escalated.
2. **Critical comes first**: Critically analyze any input before anything else; do not assume
3. **Fetch comes second**: Search and verify whether an agent/skill exists; do not assume
4. **Thinking before delegation** (Type C): Produce or validate Stage 3 artifacts before Stage 4 — no capability match → resolve ownership first (existing owner / Type B creation / temporary fallback owner), do NOT self-execute
5. **Execution = Agent() tool calls only**: Stage 4 means spawning sub-agents via the `Agent` tool with the correct `subagent_type`. If you find yourself about to write analysis, reviews, or code directly: STOP and ask "which meta-agent should handle this?"
6. **Review is mandatory before closure**: No output may be treated as complete before Review, and Review must also check owner coverage + protocol compliance; complex runs must pass Meta-Review + Verification as well
7. **Evolution closes the loop**: After task completion, must run the 5+1 evolution detection model (5 structural dimensions + scars codification overlay) and write back any durable change to agent / skill / contract assets
8. **Read references on demand**: Read `references/*.md` for deeper theoretical detail, but the core execution logic is in this file
9. **Attention Cost**: A mature system knows when saying less is the most valuable — don't dump everything at once

---

## Dependency Skills — Active Invocation Map

> These 9 skills (from `install-deps.sh`) are **actively invoked** at the corresponding workflow stage. They are NOT passive references.

| Skill | Core Capabilities | Primary Usage |
|-------|-------------------|---------------|
| `agent-teams-playbook` | 6-phase orchestration, Subagent/Agent Team selection | Fetch stage team formation |
| `findskill` | External skill discovery from Skills.sh ecosystem | Fetch stage fallback search |
| `hookprompt` | Auto prompt optimization Hook (Google prompt engineering + 5-task meta-prompt) | UserPromptSubmit hook for all stages |
| `superpowers` | brainstorming, verification, systematic-debugging | Critical (clarify), Thinking (explore), Review (verify) |
| `everything-claude-code` | 60+ specialized agents: code-reviewer, security-reviewer, architect, etc. | Execution + Review stage agents |
| `planning-with-files` | task_plan.md + findings.md + progress.md | Thinking stage (complex tasks) |
| `cli-anything` | CLI command generation and execution | Any phase needing shell commands |
| `gstack` | 29 specialist skills: /review, /qa, /browse, /ship, /cso, /retro, etc. | Execution + Review (PR review, QA, security audit) |
| `skill-creator` | Skill creation, test framework, assertion-based grading | Type B Phase 3 SOUL.md validation |

### Key Invocation Patterns

**Fetch Fallback Chain** (Type C Stage 2):
```
Local scan → capability index (refresh if missing/stale) → findskill search →
specialist ecosystems (`everything-claude-code`, `gstack`, global agents/skills) →
owner-resolution branch:
  recurring/project-specific gap → Type B create/compose owner
  one-off emergency gap → temporary `generalPurpose` owner with explicit justification
```

**Review Chain** (Type C Stage 5):
```
superpowers:verification → code quality agent → security agent → superpowers:verification (confirm fixes)
```

**SOUL.md Validation** (Type B Phase 3):
```
skill-creator:test-framework → eval prompts → assertion grading → redo if FAIL (max 2 rounds)
```

### Passive Reference Files

| File | When to Read | Purpose |
|------|-------------|---------|
| `references/dev-governance.md` | Type C execution | Complete 8-stage execution spine, Agent Invocation Principle, Event Card Deck |
| `references/meta-theory.md` | Type A/D analysis | Five Criteria, Four Death Patterns, Organizational Mirror |
| `references/rhythm-orchestration.md` | Type E design | Attention cost model, card dealing rules, Interrupt channels |
| `references/intent-amplification.md` | Type C Evolution | Intent Core + Delivery Shell model |
| `references/ten-step-governance.md` | Type C/D governance | Complete 10-step governance path |
| `references/create-agent.md` | Type B Phase 3-4 | Station templates, output file template |
| `C:/Users/admin/.claude/agents/meta-*.md` | Type B each station | Meta agent methodology |

---

## Test Verification

Use the following scenarios to verify skill effectiveness:

**Test 1: Meta-Theory Analysis (Type A)**
> "Help me check if there are issues with existing agents, whether they need to be split"
> Expected: Execute Five Criteria verification + Four Death Patterns detection, output analysis report

**Test 2: Create Agent (Type B)**
> "I need a data analysis agent"
> Expected: Go through Phase 1-4 pipeline, output complete agent definition file

**Test 3: Complex Development Task (Type C) — Dispatcher Verification**
> "I need to implement a user authentication system, including login, registration, token refresh, permission verification"
> Expected: Go through the 8-stage execution spine, Critical → Fetch (search agents) → Thinking (plan sub-tasks) → **Execution: Task() spawns agents** (NOT self-execution) → Review → Meta-Review + Verification → Evolution
>
> **PASS criteria**: Stage 4 must show explicit `Task()` invocations, every executable sub-task must have an owner, and Stage 3 must define protocol artifacts before dispatch. If the response shows direct code writing without any `Task()` calls or uses anonymous execution with no owner → FAIL, Grade D.

**Test 4: Review Proposal (Type D)**
> "Help me review whether this agent's definition is reasonable"
> Expected: Execute review checklist, output rating + improvement suggestions

**Test 5: Rhythm Orchestration (Type E)**
> "My system pushes too many messages and users are drowning — how do I design a card play strategy?"
> Expected: Analyze rhythm issues, design Event Card Deck configuration

**Test 6: Organizational Mirror (Type A variant)**
> "I have 5 agents but they frequently Cross-contaminate — how do I solve this with Organizational Mirror?"
> Expected: Analyze Cross-contamination root causes, design isolation solution using Organizational Mirror methodology
