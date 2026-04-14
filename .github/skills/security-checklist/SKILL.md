---
name: security-checklist
description: 'Security risk inspection before commits. Use when reviewing code for security issues.'
---

# Security Checklist

## Purpose

Inspect for security risks before committing code.
Prevents credential leaks and accidental commits of sensitive files. (FP-004)

## Invoked By

- **reviewer** agent — Step 4: Security risk inspection

## When to Apply

- Before running `git add` or committing
- When creating new files
- When modifying config or environment files
- When changing authentication/authorization code

## Procedure

1. **Check staging area**: Run `git diff --cached --name-only` to list files staged for commit
2. **Read docs/failure-patterns.md**: Check FP-004 status. If frequency > 0, apply extra scrutiny to all staged files and verify .gitignore coverage is comprehensive.
3. **Scan for forbidden files**: Check if .env, credentials, *.pem, *.key files are staged
4. **Scan for hardcoded secrets**: Search staged files for passwords, API keys, tokens
5. **Verify .gitignore**: Ensure new environment files are covered by .gitignore
6. **Check for temp files**: Verify tmp_*, debug_*, coverage_* files are not staged

## Checklist

- [ ] docs/failure-patterns.md reviewed for FP-004 history
- [ ] (FP-004) No .env, credentials, *.key files in staging area
- [ ] (FP-004) No hardcoded passwords, API keys, or tokens in code
- [ ] Sensitive file patterns are registered in .gitignore
- [ ] No temp files (tmp_*, debug_*, coverage_*) in staging area
- [ ] Recommended: Use explicit per-file staging unless your team allows `git add .` (per project-brief.md → Key Technical Decisions)

## Example

### Good
```bash
git add src/auth/login.ts tests/auth/login.test.ts
# Environment variable via config module
const dbPassword = process.env.DB_PASSWORD;
```

### Bad
```bash
git add .
# Hardcoded password
const dbPassword = "super_secret_123";
```

## State File Updates (mandatory)

After completing the security check:

- [ ] **docs/failure-patterns.md**: If a security issue was found (credentials staged, hardcoded secret), add a new FP-NNN entry or increment FP-004 Frequency.
- [ ] **docs/project-state.md**: If a security issue was found, add to Recent Changes: "⚠️ Security: [description of issue found/fixed]". This ensures the next session's Quick Summary includes the security context.

### 🧭 Navigation — After Security Check

Security-checklist is invoked BY `reviewer` (Step 4). After completion, control returns to the reviewer's flow.
If invoked directly by the user, append:

```
---
🧭 Next Step
→ Call: `reviewer`
→ Prompt example: "코드를 리뷰해줘"
→ Why: Security scan complete — proceed with full review
→ Pipeline: N/A (utility skill — invoked by reviewer Step 4)
---
```

## Related Failure Patterns

- FP-004: Dangerous file committed → Checklist items 2, 5 (no forbidden files, no temp files)

