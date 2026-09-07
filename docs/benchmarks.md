# EFFECTBENCH

`bench/seed.json` is a hand-authored seed with positive, collateral-write, and no-op cases. The runner reports observed writes and unexpected writes. Compiler metrics are `null` until an inference implementation exists.

The planned measures are read/write-set precision and recall, postcondition correctness and completeness, recovery classification, and unexpected-write detection. Recall is prioritized because an omitted effect is more dangerous than a reviewable extra candidate.
