# ADR 0001: Verification boundary

Status: accepted

AgentFX verifies observations supplied by provider adapters. It does not execute arbitrary recovery, promise universal rollback, or treat provider operation names as effect proofs. This keeps the runtime local-first and provider-agnostic while making evidence and limitations visible.
