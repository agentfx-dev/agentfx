import { assertPointer, at, canonical, normalize, type Json } from '@agentfx/contracts';
import { containsPath, diff, type Change } from '@agentfx/diff';
import type { Adapter, Snapshot } from '@agentfx/adapter-sdk';
export interface Observation { before: Snapshot; after: Snapshot; changes: Change[] }
export async function observe(adapter: Adapter, action: () => unknown | Promise<unknown>): Promise<Observation> {
  const before = await adapter.snapshot();
  if (!before.complete) throw new Error('Incomplete before snapshot; action was not run');
  await action(); const after = await adapter.snapshot();
  if (!after.complete || before.scope !== after.scope) throw new Error('Incomplete or incompatible after snapshot');
  return {before,after,changes:diff(before.state,after.state)};
}
export function expectEffects(observation: Observation) {
  function changed(path: string): boolean {
    assertPointer(path); return canonical(at(observation.before.state,path)) !== canonical(at(observation.after.state,path));
  }
  return {
    toChange(path: string) { if (!changed(path)) throw new Error(`Expected change: ${path}`); },
    not: {toChange(path: string) { if (changed(path)) throw new Error(`Unexpected change: ${path}`); }},
    toOnlyChange(paths: string[]) {
      paths.forEach(assertPointer);
      const unexpected = observation.changes.filter(c => !paths.some(p => containsPath(p,c.path)));
      if (unexpected.length) throw new Error(`Unexpected writes: ${unexpected.map(c => c.path).join(', ')}`);
    },
  };
}
export interface Golden { format:'agentfx-golden/0.1'; scope:string; before:Json; after:Json; changes:Change[] }
export function record(observation: Observation): Golden {
  return {format:'agentfx-golden/0.1',scope:observation.before.scope,before:normalize(observation.before.state),after:normalize(observation.after.state),changes:observation.changes};
}
export function testGolden(golden: Golden, observation: Observation): void {
  if (golden.format !== 'agentfx-golden/0.1' || golden.scope !== observation.before.scope) throw new Error('Incompatible golden scenario');
  if (canonical(golden.before) !== canonical(observation.before.state)) throw new Error('Golden baseline drift');
  if (canonical(golden.changes) !== canonical(observation.changes) || canonical(golden.after) !== canonical(observation.after.state)) throw new Error('Effect regression');
}
