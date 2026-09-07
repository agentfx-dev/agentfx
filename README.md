# AgentFX

Verification infrastructure for autonomous work.

AgentFX gives an action a typed, inspectable Effect Contract: what must already be true, what may change, what must remain invariant, what evidence was observed, and how recovery is classified. It is the “types for side effects” layer for agents and automation. It does not promise universal rollback.

## Two-minute aha

```bash
corepack enable
corepack prepare pnpm@11.25.0 --activate
pnpm install
pnpm build
pnpm demo
```

The memory demo changes only `/name`, asserts that `/role` is untouched, and prints the observed normalized diff. The same assertion API is available through `@agentfx/testing`:

```ts
const observation = await observe(adapter, () => customer.name = 'Grace');
expectEffects(observation).toChange('/name');
expectEffects(observation).not.toChange('/role');
expectEffects(observation).toOnlyChange(['/name']);
```

The runtime returns `passed`, `failed`, or `inconclusive`. An incomplete snapshot, incompatible scope, or unsettled finality is never treated as proof of success.

## Packages

The alpha workspace contains real implementations for contracts, normalized deterministic and semantic diffs, adapter SDK, core verification, effect-aware testing and goldens, OpenAPI discovery, MCP discovery pinned to `2026-07-28`, a PostgreSQL snapshot adapter, and the CLI. Packages remain private in the repository until the npm scope and package ownership are confirmed.

## Status and scope

This is v0.1-alpha. The Effect Compiler is an experimental interface only; no inference quality is claimed. `bench/seed.json` is a small gold fixture and reports no invented compiler metrics. The Git-backed registry contains manually authored contracts with evidence.

Non-goals are generic observability, an MCP gateway, an identity provider, a workflow engine, a policy DSL, and a cloud dashboard before the verification primitive is validated.

Read the [documentation](https://agentfx-dev.github.io/agentfx/), [Effect Contract schema](spec/effect-contract.schema.json), [contributing guide](CONTRIBUTING.md), and [security policy](SECURITY.md).

License: Apache-2.0.
