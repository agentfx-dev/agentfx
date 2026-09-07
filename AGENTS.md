# AgentFX contributor context

AgentFX is verification infrastructure for autonomous work. Preserve the product boundary: effect contracts, proof of outcome, adapters, and evidence. Do not turn the repository into generic observability, an MCP gateway, an identity provider, a workflow engine, a policy DSL, or a cloud dashboard.

Use Node 24 LTS and pnpm 11.25.0. TypeScript 6.0.3 is pinned after the full local check. Keep packages ESM and local-first/provider-agnostic. Treat `inferred` contracts as hypotheses; only evidence-backed execution may move trust to `verified` or `trusted`.

Before a change, read `docs/vision.md`, `docs/architecture.md`, and the relevant ADR. Run `pnpm check` when dependencies are available. Never publish packages directly from CI. npm staged publishing requires an existing package and human 2FA approval; until ownership is verified, packages stay private.
