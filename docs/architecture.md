# Architecture

The workspace is a TypeScript ESM monorepo orchestrated by pnpm. `@agentfx/contracts` owns normalized JSON state and the Effect Contract vocabulary. `@agentfx/diff` produces deterministic and explicitly projected semantic changes. `@agentfx/adapter-sdk` supplies scoped snapshots. `@agentfx/core` verifies preconditions, expected effects, invariants, postconditions, and unexpected writes. `@agentfx/testing` provides assertions and golden scenarios.

OpenAPI discovery creates inferred contracts from real operations. MCP discovery pins the modern `2026-07-28` protocol and creates inferred tool contracts; it does not infer side effects from names. PostgreSQL observation is transaction-visible and explicitly makes no durability claim. The registry is Git-backed until evidence supports a service.
