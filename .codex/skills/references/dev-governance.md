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

## 2. COMPLETE 6-STAGE FLOW (Detailed)

| Stage | Name | Key Question |
|-------|------|-------------|
| 1 | **Critical** | What is the task? Is it clear? |
| 2 | **Fetch** | Who can do this? |
| 3 | **Thinking** | How should we approach it? |
| 4 | **Execution** | Delegate to agents |
| 5 | **Review** | Is the result correct? |
| 6 | **Evolution** | What did we learn? |

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
| 1 file, pure logic/style/comments | Simple | Execution → Review → Evolution |
| ≥2 files OR ≥2 modules | Medium | Full 6-stage flow |
| >5 files OR cross-layer | Complex | Full 6-stage + Meta-Review |

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

**Purpose**: Search for agents whose "Own" boundary matches the capability needed.

**⚠️ Execute all 3 steps — no skipping. Fallback chain (aligns with agent-teams-playbook):**

**Step 1 — Local agent scan**:
```
Glob: .claude/agents/*.md
Read each file, verify it has `name:` YAML frontmatter (valid = registered agent)
Extract each agent's "Own / Do Not Touch" boundaries
Score match: does "Own" cover the needed capability?
```

**Step 2 — Global capability search** (if no perfect local match):
```
Read .claude/capability-index/global-capabilities.json
Search for agents declaring the needed capability
Score match
```

**Step 3 — Generic fallback** (if no match found):
```
Mark capabilityGap: "no agent declares Own [capability]"
Invoke Task(subagent_type="general-purpose") with clear constraints
```

### Match Scoring

| Score | Meaning | Action |
|-------|---------|--------|
| 3 | Perfect match — "Own" covers exactly what is needed | Invoke directly |
| 2 | Partial match — covers most, some gaps | Invoke + note gaps |
| 1 | Weak match — tangentially related | Invoke + note significant gaps |
| 0 | No match | Capability gap detected → Step 3 fallback |

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
      "constraints": ["boundary1", "dependency1"]
    }
  ]
}
```

### Step 4: Decision Record

```json
{
  "selected": "A",
  "reason": "why this path was chosen over alternatives",
  "rejectedOptions": [{ "path": "B", "reason": "why not chosen" }],
  "risks": [{ "type": "shared-component", "mitigation": "notify user" }]
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

## STAGE 6: Evolution — Extract Learnings (Detailed)

6-dimension evolution detection (execute after every task):

| Dimension | What to Detect | Amplification Action |
|-----------|---------------|---------------------|
| Pattern reuse | Can this solution become a reusable pattern? | Extract as new skill/agent |
| Agent boundaries | Do boundaries need adjustment? | Trigger split/merge |
| Guidance optimization | Can interaction path be shorter? | Update card trigger conditions |
| Process bottlenecks | Which step is slowest/error-prone? | Adjust orchestration |
| Capability coverage | Any new gaps discovered? | Trigger Scout or Type B |
| **Scars codification** | Skip-Level/Boundary Violation/Process Gap? | Record structured Scar → prevention rule |

### Amplification Operations

| Dimension | Detection | Action |
|-----------|-----------|--------|
| Pattern reuse | Reusable pattern found | → Extract as skill/template → register |
| Agent boundaries | Boundaries unreasonable | → Trigger split/merge |
| Guidance optimization | Interaction path redundant | → Update card triggers |
| Process bottlenecks | Bottleneck found | → Adjust Card Deck priority |
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

---

## EVENT CARD DECK

| Card | Trigger Condition | Action |
|------|-------------------|--------|
| Scope Contraction Card | Environment state trigger: repository too large / multiple files with same name / historical implementation branching | First ask "which version to change this time", then execute |
| Guidance Card | Requirements vague | Follow-up Probe 2 rounds |
| Direction Card | Requirements clear | Record intent |
| Planning Card | High complexity | Task decomposition |
| Execution Card | Planning complete | Assign tasks |
| Review Card | Execution complete | Quality review |
| Meta-Review Card | Review complete | Boundary Violation detection |
| Risk Card | Involves shared components / auth logic / globally shared interfaces / high-frequency multi-person edit areas | Must surface; if necessary, risk governance meta Interrupts |
| Suggestion Card | User clearly hesitates or pauses, but interruption cost is high | Give a low-cost forward plan OR Intentional Silence without interruption |
| Silence Card | After ≥3 consecutive rounds of high-density pushes | Proactively pause, let the user digest |
| Skip Card | Attention cost > benefit | Simplify and skip |
| Interrupt Card | Emergency state | Prioritize |
| Iteration Card | Acceptance not passed < 3 rounds | Loop again |

---

## "WHAT IT IS NOT" GUARDRAILS

- Meta ≠ role naming: calling something "frontend agent" doesn't make it a meta; naming without clear boundaries is just packaging
- Meta ≠ Omnipotent Executor Meta: stuffing all responsibilities into one agent isn't strength; clear division of labor is maturity
- Organizational Mirror ≠ metadata/ORM: it's not a technical term — it's an architectural design method for collaboration relationships between metas, responsibility boundaries, and who takes the field first
- Meta ≠ framework complexity: simple scenarios don't need meta decomposition; direct execution is more efficient — meta is a governance tool, not decoration
- Meta ≠ once-and-for-all: meta boundaries need to be adjusted as the system evolves; they aren't defined once and never changed
