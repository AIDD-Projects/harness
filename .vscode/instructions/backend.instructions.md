---
applyTo: "src/**/*.ts,src/**/*.js"
---

# Backend Code Rules

## Required

- Follow the project's architecture patterns strictly:
  - Domain layer must not import from infrastructure.
  - Application layer accesses data only through domain interfaces.
  - Infrastructure implements domain interfaces.
  - Presentation handles routing and DTO conversion only. No business logic.
- Before calling any constructor, read the actual source file to verify parameters. Do not trust memory. (FP-002)

## Forbidden

- Importing infrastructure from domain (dependency inversion violation).
- `any` type usage — when unavoidable, add `// eslint-disable-next-line` with reason comment.
- Hardcoding environment variables in code. Use `process.env` with centralized config.
- `git add .` or `git add -A` — use explicit per-file staging.

## References

- failure-patterns.md FP-002: Type confusion
- failure-patterns.md FP-004: Unnecessary files committed
