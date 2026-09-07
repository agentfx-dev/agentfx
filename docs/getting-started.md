# Getting started

Use Node 24 LTS and pnpm 11.25.0:

```bash
corepack enable
corepack prepare pnpm@11.25.0 --activate
pnpm install
pnpm check
```

The memory demo is self-contained. The PostgreSQL demo needs a disposable database in `DATABASE_URL`; it runs inside a serializable transaction, detects a collateral write, and verifies a savepoint rollback. It does not claim durability after commit.

The MCP integration starts a local server that rejects legacy protocol traffic and verifies discovery against `2026-07-28`. The local sandbox may prevent binding a port; CI runs it on a GitHub-hosted runner.
