# Contributing

Use Node 24 LTS and pnpm 11.25.0. Install with `pnpm install`, then run `pnpm check`. Add unit coverage for contract semantics and an integration test for provider behavior. Keep network, database, and finality claims inside adapters and evidence.

Changes are reviewed through pull requests. A changeset is expected for publishable package behavior. Packages are private until npm scope ownership, trusted publisher configuration, and staged publishing have been verified by a maintainer.
