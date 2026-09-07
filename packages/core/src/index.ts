import { at, canonical, matchesSchema, type EffectContract, type Json } from '@agentfx/contracts';
import { containsPath, diff, type Change } from '@agentfx/diff';
import type { Adapter, Snapshot } from '@agentfx/adapter-sdk';
export interface VerificationResult {
  status: 'passed' | 'failed' | 'inconclusive'; violations: string[]; changes: Change[];
  before: Snapshot; after?: Snapshot; action: 'not-run' | 'completed' | 'failed';
  actionError?: string; contract: {id:string;version:string;trust:EffectContract['trust']};
}
export function verify(contract: EffectContract, before: Snapshot, after: Snapshot): VerificationResult {
  const changes = diff(before.state,after.state); const violations: string[] = [];
  const result: VerificationResult = {status:'inconclusive',violations,changes,before,after,action:'completed',contract:{id:contract.id,version:contract.version,trust:contract.trust}};
  if (!before.complete || !after.complete || before.scope !== after.scope || (contract.finality.kind === 'settled' && !after.settled)) return result;
  for (const schema of contract.preconditions) if (!matchesSchema(schema,before.state)) violations.push('Precondition failed');
  for (const e of contract.expectedEffects) {
    const a = at(before.state,e.path), b = at(after.state,e.path);
    const changed = canonical(a as unknown as Json) !== canonical(b as unknown as Json);
    if (!changed || (e.kind === 'add' && (a.exists || !b.exists)) || (e.kind === 'remove' && (!a.exists || b.exists)) || ('value' in e && (!b.exists || canonical(e.value) !== canonical(b.value)))) violations.push(`Expected ${e.kind}: ${e.path}`);
  }
  for (const path of contract.invariants) if (canonical(at(before.state,path)) !== canonical(at(after.state,path))) violations.push(`Invariant changed: ${path}`);
  for (const change of changes) if (!contract.writeSet.some(path => containsPath(path,change.path))) violations.push(`Unexpected write: ${change.path}`);
  for (const schema of contract.postconditions) if (!matchesSchema(schema,after.state)) violations.push('Postcondition failed');
  result.status = violations.length ? 'failed' : 'passed'; return result;
}
export async function execute(adapter: Adapter, contract: EffectContract, action: () => unknown | Promise<unknown>): Promise<VerificationResult> {
  const before = await adapter.snapshot();
  const base: VerificationResult = {status:'inconclusive',violations:[],changes:[],before,action:'not-run',contract:{id:contract.id,version:contract.version,trust:contract.trust}};
  if (!before.complete) return base;
  // Compile/evaluate every schema before allowing the effectful callback to run.
  for (const schema of contract.postconditions) matchesSchema(schema,before.state);
  if (!contract.preconditions.every(schema => matchesSchema(schema,before.state))) return {...base,status:'failed',violations:['Precondition failed; action was not run']};
  let actionError: string | undefined;
  try { await action(); } catch (error) { actionError = error instanceof Error ? error.message : String(error); }
  let after: Snapshot;
  try { after = await adapter.snapshot(); } catch (error) {
    return {...base,action:actionError === undefined ? 'completed':'failed',actionError:actionError ?? String(error),violations:['After snapshot unavailable; effects may have occurred']};
  }
  const result = verify(contract,before,after);
  if (actionError !== undefined) return {...result,status:'failed',action:'failed',actionError,violations:[...result.violations,'Action failed; effects may have occurred']};
  return result;
}
