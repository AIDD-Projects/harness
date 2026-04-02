# Backend Code Rules

## Required

- Follow the project's architecture patterns strictly.
  <!-- TODO: Define your architecture layers. Examples:
  - Domain layer must not import from infrastructure.
  - Application layer accesses data only through domain interfaces.
  - Infrastructure implements domain interfaces.
  - Controllers/routes handle request/response only. No business logic.
  -->
- Before calling any constructor or factory, read the actual source file to verify parameters. Do not trust memory. (FP-002)

## Forbidden

- Violating the project's dependency direction (e.g. importing infrastructure from domain).
- Suppressing type safety without an explicit reason comment.
- Hardcoding environment variables or secrets in code. Use centralized config.
- `git add .` or `git add -A` — use explicit per-file staging.

## References

- docs/failure-patterns.md FP-002: Type confusion
- docs/failure-patterns.md FP-004: Unnecessary files committed
