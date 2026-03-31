# 开发治理流程 — 完整操作规范

> 本文件是 Type C (Development Governance Flow) 的详细操作规范。
> SKILL.md 中的 Type C 节只包含摘要入口，本文件包含完整操作步骤。
> Read this file when executing Type C — Development Governance Flow.

## 1. AGENT INVOCATION PRINCIPLE (Non-Negotiable)

**Skill is the orchestration layer — never hardcode specific agent names.** At every stage where an agent is needed, follow the Fetch-first pattern:

```
Need an agent for X → Search who declares "Own X" → Call the best match
```

**Invocation decision pattern** (applies to every agent call, every stage):

| Step | Action |
|------|--------|
| 1. Search | `Glob: .claude/agents/*.md` + read global-capabilities.json |
| 2. Match | Score each agent's "Own" boundary against needed capability (3=perfect / 1-2=partial / 0=none) |
| 3. Invoke | 3 → invoke directly / 1-2 → invoke + note gaps / 0 → capability gap detected |

**⚠️ Iron Rule**: Do NOT write `call code-reviewer` or `call meta-prism` as hardcoded steps. Describe the **capability needed**; let the executor discover **who provides it** at runtime via the Search-Match-Invoke pattern.

---

## 2. CORE 8-STAGE EXECUTION SPINE (Detailed)

| Stage | Name | Key Question |
|-------|------|-------------|
| 1 | **Critical** | What is the task? Is it clear? |
| 2 | **Fetch** | Who can do this? |
| 3 | **Thinking** | How should we approach it? |
| 4 | **Execution** | Delegate to agents |
| 5 | **Review** | Is the result correct? |
| 6 | **Meta-Review** | Are the review standards themselves sound? |
| 7 | **Verification** | Did the fixes actually solve the issues? |
| 8 | **Evolution** | What structural learning should carry forward? |

### Hidden Skeleton State Model

The 8-stage spine is the **human-readable orchestration surface**. Underneath it, Meta_Kim may maintain a **hidden state skeleton** so the run stays governable without turning the system into a visible bureaucracy:

| State Layer | Example Values | Primary Owner | Why it exists |
|-------------|----------------|---------------|---------------|
| `stageState` | `Critical -> Fetch -> Thinking -> Execution -> Review -> Meta-Review -> Verification -> Evolution` | Conductor | Canonical stage progression |
| `controlState` | `normal / skip / interrupt / intentional-silence / iteration` | Conductor | Modify stage dealing without inventing new pseudo-stages |
| `gateState` | `planning-open / planning-passed / review-open / verification-open / verification-closed / synthesis-ready` | Warden + Prism | Separate stage completion from gate clearance |
| `surfaceState` | `debug-surface / internal-ready / public-ready` | Warden | Prevent dirty runs from being presented as completed/public |
| `capabilityState` | `covered / partial / gap / escalated` | Scout + Artisan | Keep Fetch results explicit instead of hand-wavy |

**Rule**: this is an **invisible skeleton only**. The user-facing workflow still speaks in stage language and concrete deliverables. State labels exist to support gates, skips, interrupts, and evolution logging — not to become a second product interface.

---

## STAGE 1: Critical Analysis (Detailed)

### Task Classification Routing

| Category | Determination Criteria | Execution Path |
|----------|----------------------|----------------|
| **Q** Query | No code changes needed, just answer questions | Answer directly, skip subsequent stages |
| **A** Action | Clear, specific execution task (fix bug, add feature, deploy) | → Orchestration Layer decomposition → dispatch to Execution Layer |
| **P** Planning | Needs design plan before execution (new module, architecture adjustment) | → Plan first → decompose into multiple A-tasks → Dispatch one by one |
| **S** Strategic | Involves global decisions, cross-system impact, long-term direction | → Warden arbitration → may trigger Type B creation pipeline |

**Classification output field**: `taskClass: Q|A|P|S`

### Skip-Level Self-Reflection Gate

> Core question: **Should I be doing this, or should I dispatch it?**

Self-check list:
- [ ] Is the current role an "Execution Layer"? (Yes → Skip-Level suspicion, should dispatch to the corresponding execution agent)
- [ ] Does the task involve writing code / modifying files? (Yes → must delegate to Execution Layer; meta-theory does not execute directly)
- [ ] Am I "conveniently" making decisions for the Execution Layer? (Yes → only provide constraints; let the Execution Layer judge implementation details autonomously)
- [ ] Did the previous round also do a similar task? (Yes → check if a Skip-Level pattern is forming, record Scars)

Skip-Level determination:
```
IF self-check has ≥1 hit AND taskClass = A
  → Mark as "should-dispatch task"
  → Assemble task package (context + constraints + deliverables)
  → Hand to Conductor for orchestration → dispatch to Execution Layer
  → Record Scars (if Skip-Level indeed occurred)
```

### Escalation Signals (pre-emptive)

> Unlike Skip-Level detection (which catches violations after the fact), Escalation Signals let the **dispatched agent itself** recognize it cannot handle the task — before wasting effort.

When dispatching to an agent, include this instruction in the task package:

```
If you detect any of these signals, STOP and report back immediately:
- Task exceeds your declared "Own" boundary
- Multiple failed attempts (>2) on the same sub-problem
- Cross-system dependencies you cannot trace from your context
- Security-sensitive changes requiring specialized review
- Irreversible operations (database migrations, production deploys)
```

Agent escalation response format:
```json
{
  "escalation": true,
  "reason": "why this exceeds my capability",
  "suggestedCapability": "what kind of agent/skill is needed instead",
  "workCompletedSoFar": "what I did manage to do before hitting the wall"
}
```

On receiving an escalation signal: re-enter Fetch (Stage 2) to find a more capable agent.

### Clarity Gate

| State | Condition | Action |
|-------|-----------|--------|
| **Confirmed** | User specified file paths OR ≥2 deliverables OR said "just do this" | → Stage 2 |
| **Probed** | Needs scope or priority clarification | → Follow-up Probe (max 2 rounds) |
| **Assumed** | Still vague after 2 rounds | Record assumptions, mark `clarity: "assumed"`, → Stage 2 |

**Follow-up Probe Strategy**:
- Round 1: Ask about **scope** — "Which scenarios need support? Which can be deferred?"
- Round 2: Ask about **priorities** — "If time is tight, which parts can be cut?"
- Early Exit: Round 1 already specifies file paths OR ≥2 deliverables → skip Round 2

### Complexity Routing

| File Changes | Complexity | Flow |
|-------------|-----------|------|
| 1 file, pure logic/style/comments | Simple | Execution → Review → Verification → Evolution |
| ≥2 files OR ≥2 modules | Medium | Full 8-stage spine |
| >5 files OR cross-layer | Complex | Full 8-stage spine; allow business-workflow revision / summary / feedback / evolve phases when the run contract requires them |

### Critical Stage Output

```json
{
  "taskClass": "A",
  "skipLevel": "should-dispatch",
  "complexity": "medium",
  "clarity": "confirmed",
  "understanding": "one-sentence description of the task as understood",
  "scope": {
    "mustHave": ["item1", "item2"],
    "deferLater": ["item3"]
  }
}
```

---

## STAGE 2: Fetch — Discover Available Agents (Detailed)

**Purpose**: Search for agents / skills whose "Own" boundary matches the capability needed.

**⚠️ Execute all 5 steps in order — no skipping.**

**Step 1 — Local agent scan**:
```
Glob: .claude/agents/*.md
Read each file, verify it has `name:` YAML frontmatter (valid = registered agent)
Extract each agent's "Own / Do Not Touch" boundaries
Score match: does "Own" cover the needed capability?
```

**Step 2 — Capability index search** (if no perfect local match):
```
IF .claude/capability-index/global-capabilities.json is missing OR stale for the current machine
  → run npm run discover:global first

Read .claude/capability-index/global-capabilities.json
Search for agents declaring the needed capability
Score match
```

**Step 3 — External skill discovery** (if the local + indexed baseline still has no perfect match):
```
Invoke the available findskill / find-skills capability
Search the Skills.sh ecosystem for the missing capability
Record what was searched and what was found
```

**Step 4 — Specialist ecosystem fallback** (if the external search still finds no clean winner):
```
Search known specialist ecosystems already integrated by Meta_Kim:
- everything-claude-code agents
- gstack specialist skills
- other globally installed runtime-native agents / skills from the capability index
```

**Step 5 — Generic fallback** (if no match found):
```
Mark capabilityGap: "no agent declares Own [capability]"
Invoke Task(subagent_type="generalPurpose") with clear constraints
```

### Match Scoring

| Score | Meaning | Action |
|-------|---------|--------|
| 3 | Perfect match — "Own" covers exactly what is needed | Invoke directly |
| 2 | Partial match — covers most, some gaps | Invoke + note gaps |
| 1 | Weak match — tangentially related | Invoke + note significant gaps |
| 0 | No match | Capability gap detected → Step 5 fallback |

### Tier-Aware Routing

> Not all tasks need Opus-level agents. Match task complexity to agent weight to optimize context consumption and speed.

After scoring candidates, apply tier preference:

| Task Complexity | Preferred Tier | Rationale |
|----------------|---------------|-----------|
| Simple (1 file, pure logic) | Lightweight agent (e.g., `model: "haiku"`) | Fast, cheap, sufficient |
| Medium (2-5 files) | Standard agent (default model) | Balanced |
| Complex (>5 files, cross-layer) | Full-weight agent (e.g., `model: "opus"`) | Deep reasoning needed |

Tier selection rule:
```
IF complexity = "simple" AND candidate has lightweight variant
  → Prefer the lightweight variant (saves context, faster)
ELSE
  → Use the default agent as matched
```

This is a **preference**, not a hard rule — if the lightweight agent escalates (see Escalation Signals), re-dispatch to the full-weight version.

### Fetch Stage Output

```json
{
  "capabilityNeeded": "code quality review",
  "searchTrail": [
    "local-agents",
    "global-capability-index",
    "findskill",
    "specialist-ecosystem"
  ],
  "candidates": [
    { "name": "code-reviewer", "source": "global", "score": 3, "matchReason": "Own covers code quality review" }
  ],
  "selected": { "name": "code-reviewer", "score": 3 },
  "capabilityGap": null,
  "fallbackUsed": false
}
```

---

## STAGE 3: Thinking — Plan the Approach (Detailed)

**Purpose**: Explore solution paths, identify risks, decompose into sub-tasks. This stage bridges Fetch and Execution.

### Step 1: Option Exploration
Analyze at least 2 possible solution paths:

| Path | Approach | Pros | Cons |
|------|----------|------|------|
| A | [approach description] | [reasons] | [reasons] |
| B | [alternative approach] | [reasons] | [reasons] |

### Step 2: Risk Identification

| Signal | Type | Mitigation |
|--------|------|------------|
| Shared component modification | Risk Card | Notify user before proceeding |
| Auth/permission logic involved | Risk Card | Surface immediately |
| >3 files affected | Cross-contamination risk | Mark for Review |
| No matching agent found | Capability gap | Record + suggest Type B |

### Step 3: Task Decomposition

Break Stage 1's task into independent sub-tasks:

```json
{
  "subTasks": [
    {
      "id": 1,
      "description": "what specifically to do",
      "owner": "agent name from Stage 2",
      "parallel": true,
      "fileScope": ["file-or-module-a", "file-or-module-b"],
      "constraints": ["boundary1", "dependency1"]
    }
  ]
}
```

### Step 4: `cardDeck` (stage-card rhythm) + delivery plan

Thinking must translate the plan into a **`cardDeck`** — the canonical Stage 3 artifact for stage-card rhythm (sequencing / lanes — not legacy “Planning / Guidance / Direction” card names). Each entry is one **stage-card intent** (priority, lane, skip/interrupt hooks). Conductor owns concrete dealing on the dispatch board; Thinking outputs `cardDeck` constraints and decomposition only.

```json
{
  "cardDeck": [
    {
      "stage": "Thinking",
      "priority": 8,
      "laneIntent": "decompose-and-surface-risks",
      "skipCondition": "task is simple and already decomposed",
      "interruptTrigger": "security-risk or scope-drift"
    }
  ],
  "deliveryShellPlan": [
    {
      "audience": "user",
      "channel": "conversation",
      "shell": "structured-status"
    }
  ],
  "interruptChannels": [
    { "source": "sentinel", "severity": "critical", "action": "pause and front-load interrupt" },
    { "source": "prism", "severity": "high", "action": "insert before next execution stage" }
  ]
}
```

### Step 5: Decision Record

```json
{
  "selected": "A",
  "reason": "why this path was chosen over alternatives",
  "rejectedOptions": [{ "path": "B", "reason": "why not chosen" }],
  "risks": [{ "type": "shared-component", "mitigation": "notify user" }]
}
```

### Thinking Stage Output Contract

```json
{
  "subTasks": [],
  "cardDeck": [],
  "deliveryShellPlan": [],
  "interruptChannels": [],
  "reviewPlan": ["code-quality", "security"],
  "metaReviewGate": "complexity=complex OR abnormal review confidence",
  "verificationGate": "all failed assertions must be re-run with fresh evidence",
  "evolutionFocus": ["pattern reuse", "boundary drift", "process bottlenecks"]
}
```

---

## STAGE 4: Execution — Delegate to Agents (Detailed)

**⚠️ Core Rule: meta-theory does NOT write code directly.**

### Step 1: Invoke selected agents from Stage 2

For each sub-task from Stage 3, invoke the matched agent:
```
Task(
  subagent_type="<selected agent from Stage 2>",
  prompt="""
  Task: [sub-task description]
  Constraints: [boundaries from Stage 3]
  Deliverable: [expected output format]
  """
)
```

### Step 2: Parallel/Sequential Decision
- Sub-tasks' file sets do not overlap → **parallel** invocation
- File sets overlap → **sequential** invocation

### Step 2.5: Execute in stage order

Execution must respect the Stage 3 **`cardDeck`** (stage-card sequence / control interrupts — delegated to Conductor for actual dealing):
- Run stages in agreed order unless a control interrupt (silence / skip / risk) is active
- Insert intentional silence when the overload rule is hit
- Use the selected Delivery Shell when reporting progress or handing off results

### Step 3: Result Aggregation
- Which files were modified
- Any conflicts to resolve
- Any sub-task failures → handle via fault protocol

---

## STAGE 5: Review — Validate the Result (Detailed)

**Trigger**: Stage 4 produced code changes. If no code changes, skip to Stage 6.

**⚠️ The executor does not self-review. Follow the Agent Invocation Principle.**

### Step 1: Skip-Level Retrospective

Check: Did anyone (including myself) do work that should have been dispatched?
- [ ] Who wrote this round's code? (If meta-theory used Edit/Write directly → Skip-Level)
- [ ] Were required agents skipped?
- [ ] Was Stage 1's skip-level result respected?

Skip-Level handling:
```
IF Skip-Level detected → Record Scar → Assess impact → IF impact occurred → re-verify with agent
```

### Step 2: Quality Review (dynamic, Fetch-first)

Following the **Agent Invocation Principle** (Search → Match → Invoke):
```
→ Search: who declares "Own: code quality review"?
→ Match: score candidates
→ Invoke: selected agent
```

When invoking a code quality agent, specify these check dimensions:
- **Type safety**: any / implicit any / type assertions
- **Error handling**: try/catch coverage and fallback strategy
- **Permission boundaries**: which external APIs / file systems / network requests were called
- **Code reuse**: duplicate logic, DRY detection

### Step 3: Security Scan (dynamic, Fetch-first)

```
→ Search: who declares "Own: security analysis"?
→ Match: score candidates
→ Invoke: selected agent
```

When invoking a security agent, specify these check dimensions:
- **Hardcoded secrets**: API key / token / password
- **Unvalidated input**: parameter validation
- **Injection risks**: SQL injection / XSS

### Step 4: UX Review (for UI-related changes)

If files involve UI/components:
- Accessibility (keyboard navigation focus-visible, aria-label, aria-live)
- Loading states (skeleton screens vs pure spinners)
- Responsiveness (mobile breakpoints)

### Step 5: AI-Slop Detection (optional — for agent/system definitions)

```
→ Search: who declares "Own: quality forensics, AI-Slop detection"?
→ Invoke if found
```

### Review Stage Output

```json
{
  "skipLevelDetected": false,
  "skipLevelScar": null,
  "reviews": [
    { "type": "code-quality", "agent": "code-reviewer", "result": "PASS", "issues": [] },
    { "type": "security", "agent": "security-reviewer", "result": "FAIL", "issues": ["hardcoded API key in config.ts"] }
  ],
  "qualityGate": "FAIL",
  "revisionNeeded": true,
  "revisionRound": 1
}
```

**Quality Gate rules — Auto-Fix Loop**:

```
Round 1: Review agent reports issues
  → Auto-dispatch fix to the original execution agent (with issue list as constraints)
  → Re-run Review on the fixed output
Round 2: If still FAIL → auto-fix again with accumulated context
  → Re-run Review
Round 3: If still FAIL → STOP, notify user for manual decision
  → Include: all 3 rounds of issues, what was tried, what remains unfixed
```

Key difference from simple "max 2 rounds": the fix is **automatic** — the Review agent dispatches the fix back to the execution agent without waiting for user input. Only escalate to user after 3 failed auto-fix attempts.

---

## STAGE 6: Meta-Review — Review the Review Standards (Detailed)

**Trigger**: Complex tasks, abnormal pass rates, or when the user explicitly asks for stricter governance.

Meta-Review does **not** re-review the implementation itself. It reviews whether Stage 5's review criteria were strong enough:

| Check Dimension | Question | Fail Action |
|----------------|----------|-------------|
| Assertion coverage | Did the review cover all critical dimensions? | Add missing assertions and re-run review |
| Assertion strength | Could a clearly wrong result still pass? | Tighten weak assertions and re-run review |
| Criteria consistency | Did standards drift materially from comparable past runs? | Record drift and request Warden arbitration |

**Trigger heuristics**:
- Review pass rate > 0.9 but output still looks suspect
- Review pass rate < 0.3 but output looks materially sound
- Security-sensitive or cross-layer changes

---

## STAGE 7: Verification — Confirm the Fixes (Detailed)

**Trigger**: Stage 5 or Stage 6 produced revision work.

Verification is an independent re-check using fresh evidence, not a trust-based acknowledgment:

| Check | Method |
|------|--------|
| Issue closure | Re-run the assertion that originally failed |
| Regression guard | Confirm the fix did not break an adjacent path |
| Fresh evidence | Cite current files / outputs / logs, not memory of what changed |

**Verification output**:
```json
{
  "verified": true,
  "remainingIssues": [],
  "evidence": ["current file or runtime evidence"]
}
```

If verification fails, route back to Execution with the accumulated issue list.

### Rollback Protocol

When verification reveals that fixes caused more damage than they solved, or when risk exceeds the original task scope, invoke the rollback protocol:

| Rollback Level | Trigger | Action |
|---------------|---------|--------|
| **File-level** | Single file regression detected | Restore the specific file from last known good state (`git checkout HEAD~1 -- <file>`) |
| **Sub-task level** | One sub-task's changes broke adjacent paths | Revert only that sub-task's file set; re-run Review on remaining changes |
| **Full rollback** | Cross-contamination across >3 files; original task assumptions invalidated | `git stash` all uncommitted changes; return to Stage 1 Critical with a revised scope |
| **Partial rollback** | Some sub-tasks succeeded, others failed | Keep successful sub-tasks; rollback failed ones; re-enter Stage 3 Thinking to re-decompose the failed portion |

**Rollback Decision Flow**:
```
Verification FAIL
  → Count affected files
  → IF 1 file: File-level rollback → Re-run Stage 4 for that file only
  → IF 2-3 files in same sub-task: Sub-task level rollback
  → IF >3 files OR cross-module: Notify user → Full or Partial rollback (user decides)
```

**Iron Rule**: Rollback is not failure. Rollback is the system demonstrating it knows when to stop making things worse. A system without rollback capability is a system that can only move forward into disaster.

---

## STAGE 8: Evolution — Extract Learnings (Detailed)

Use the **5+1 evolution model** after every task: the canonical 5 structural dimensions, plus Scars codification as an always-on overlay.

| Dimension | What to Detect | Amplification Action |
|-----------|---------------|---------------------|
| Pattern reuse | Can this solution become a reusable pattern? | Extract as new skill/agent |
| Agent boundaries | Do boundaries need adjustment? | Trigger split/merge |
| Rhythm optimization | Can interaction path be shorter? | Tighten stage or control-card trigger conditions (Conductor-owned dealing) |
| Process bottlenecks | Which step is slowest/error-prone? | Adjust orchestration |
| Capability coverage | Any new gaps discovered? | Trigger Scout or Type B |
| **Scars codification** | Skip-Level/Boundary Violation/Process Gap? | Record structured Scar → prevention rule |

### Amplification Operations

| Dimension | Detection | Action |
|-----------|-----------|--------|
| Pattern reuse | Reusable pattern found | → Extract as skill/template → register |
| Agent boundaries | Boundaries unreasonable | → Trigger split/merge |
| Rhythm optimization | Interaction path redundant | → Update stage/control triggers (via Conductor) |
| Process bottlenecks | Bottleneck found | → Adjust stage-card priority / sequencing (Conductor) |
| Capability coverage | Gap discovered | → Scout or Type B |
| Scars | Issue detected | → Record Scar → update Critical checklist |

### Scars Structured Recording

```yaml
scar:
  id: "{date}-{type}-{short-desc}"
  type: overstep | boundary-violation | process-gap | false-positive
  triggered_by: "{context}"
  what_happened: "one sentence"
  root_cause: "why (not surface reason)"
  impact: none | degraded | recovered | critical
  prevention_rule: "specific rule for next time"
```

### Evolution Artifacts Storage

Evolution outputs must be persisted to specific locations — not left floating in conversation context:

| Artifact Type | Storage Location | Lifecycle |
|--------------|-----------------|-----------|
| **Reusable Patterns** | `memory/patterns/{pattern-name}.md` | Permanent; reviewed quarterly by Librarian |
| **Scars** | `memory/scars/{scar-id}.yaml` | Permanent; prevention rules feed back into Critical stage checklists |
| **New Skills** (extracted) | `.claude/skills/{skill-name}/SKILL.md` | Permanent; created via skill-creator, validated via Type D Review |
| **Agent Boundary Adjustments** | `.claude/agents/{agent}.md` (direct edit) | Immediate; triggers `npm run sync:runtimes` |
| **Rhythm Optimizations** | Recorded in `contracts/workflow-contract.json` or Conductor's card-deck defaults | Immediate; affects next run's dispatch board |
| **Capability Gap Records** | `memory/capability-gaps.md` | Until resolved; Scout monitors and closes when filled |

**Storage Rule**: If an evolution artifact has no defined storage location, it does not count as "captured". The 5+1 model's amplification actions are only complete when the artifact is written to disk and indexed.

---

## STAGE SPINE VS CONTROL CARDS

**8-stage spine** (always the backbone): Critical → Fetch → Thinking → Execution → Review → Meta-Review → Verification → Evolution. Business workflow **phase names** in `contracts/workflow-contract.json` (e.g. `direction`, `planning`, `execution`) are a separate vocabulary for department runs — do not relabel spine stages as “Guidance / Direction / Planning cards.”

**Control / overlay cards** (rhythm and safety — Conductor deals; not a second spine):

| Card | Trigger Condition | Action |
|------|-------------------|--------|
| Scope Contraction | Repository too large / duplicate filenames / branching history | Ask which target to change, then proceed |
| Risk | Shared components / auth / global interfaces / hot multi-editor areas | Surface; may trigger interrupt path |
| Suggestion | User hesitates; interruption costly | Low-cost forward plan or intentional silence |
| Silence | ≥3 consecutive high-density push rounds | Pause for digestion |
| Skip | Attention cost > benefit | Simplify or defer |
| Interrupt | Emergency or Sentinel-critical | Prioritize and reorder |
| Iteration | Acceptance not closed within agreed rounds | Loop with explicit gate |

Spine coverage reference (what each stage is for — not separate “card” names):

| Spine stage | Role |
|-------------|------|
| Critical | Clarity, classification, skip-level checks |
| Fetch | Capability discovery (Search–Match–Invoke) |
| Thinking | Options, risks, decomposition |
| Execution | Delegated work |
| Review | Result validation (Fetch-first reviewers) |
| Meta-Review | Review-of-review when triggered |
| Verification | Fresh-evidence re-check after revisions |
| Evolution | Learnings and scars |

---

## "WHAT IT IS NOT" GUARDRAILS

- Meta ≠ role naming: calling something "frontend agent" doesn't make it a meta; naming without clear boundaries is just packaging
- Meta ≠ Omnipotent Executor Meta: stuffing all responsibilities into one agent isn't strength; clear division of labor is maturity
- Organizational Mirror ≠ metadata/ORM: it's not a technical term — it's an architectural design method for collaboration relationships between metas, responsibility boundaries, and who takes the field first
- Meta ≠ framework complexity: simple scenarios don't need meta decomposition; direct execution is more efficient — meta is a governance tool, not decoration
- Meta ≠ once-and-for-all: meta boundaries need to be adjusted as the system evolves; they aren't defined once and never changed
