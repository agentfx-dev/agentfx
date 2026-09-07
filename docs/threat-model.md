# Threat model

The main risks are false passes, incomplete snapshots, hidden collateral writes, untrusted schemas, malicious adapters, credential leakage, and supply-chain compromise. Mitigations include normalized plain JSON, deterministic diffs, explicit scope and completeness, strict JSON Schema compilation, least-privilege workflows, pinned actions, dependency review, CodeQL, Scorecard, SBOMs, and OIDC staged publishing.

An adapter is a trust boundary. Evidence describes what it observed; it does not automatically prove remote commit, rollback, or universal causality.
