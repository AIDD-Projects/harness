---
name: {agent-name}
description: {One-line description of the agent}
---

# {Agent Name}

## Role
{Define this agent's responsibilities and authority in 2-3 sentences}

## Referenced Skills
- {skill-name-1}.md
- {skill-name-2}.md

## Referenced Files
- failure-patterns.md
- project-state.md

## Procedure

### Input
Information the user must provide:
- {input 1}
- {input 2}

### Steps
1. {Step 1}
2. {Step 2}
3. {Step 3}

### Output Format
{Define the expected output structure}

## Constraints
- {What this agent must NOT do}
- {Actions outside this agent's authority}

### 🧭 Navigation — After {Agent Name}

After this agent completes, always append a 🧭 block:

| Result | 🧭 Next Step |
|---|---|
| {Outcome 1} | `{next-skill}` — "{copy-paste prompt}" |
| {Outcome 2} | `{next-skill}` — "{copy-paste prompt}" |

Example 🧭 block:
```
---
🧭 Next Step
→ Next: `{next-skill or agent}`
→ Prompt: "{copy-paste ready prompt}"
→ Why: {one-sentence reason}
→ Pipeline: {🟢|🔵|🔴|🟡|🟣} Step {N}/{total}
---
```
