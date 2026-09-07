# Vision

Autonomous work needs a proof of outcome that sits between an action request and a success message. AgentFX describes that proof as an Effect Contract: expected reads and writes, invariants, postconditions, recovery classification, finality, evidence, and confidence.

The product primitive is an effect contract. The positioning is “types for side effects.” A contract can be inferred, verified, or trusted, but those labels are claims with different evidence requirements. The runtime never treats an incomplete observation as a pass.

## Non-goals

AgentFX is not generic observability, an MCP gateway, an identity provider, a workflow engine, a policy DSL, or a cloud dashboard. Those may integrate later only if the verification primitive proves a need.
