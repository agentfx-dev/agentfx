# ADR 0002: Node, pnpm, and TypeScript

Status: accepted

Node 24 LTS and pnpm 11.25.0 are pinned. TypeScript 6.0.3 passed the workspace build and test checks on this alpha. If a future toolchain makes TypeScript 6 incompatible, pin TypeScript 5.9.x and record the migration before upgrading again. pnpm workspaces provide orchestration; Turborepo is intentionally deferred.
