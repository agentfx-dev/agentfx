import { normalize, type Evidence, type Json } from '@agentfx/contracts';
export interface Snapshot { state: Json; complete: boolean; settled: boolean; scope: string; evidence: Evidence[] }
export interface Adapter { snapshot(): Promise<Snapshot>; }
export class MemoryAdapter implements Adapter {
  constructor(private readonly read: () => unknown, private readonly scope = 'memory') {}
  async snapshot(): Promise<Snapshot> {
    return {state:normalize(this.read()),complete:true,settled:true,scope:this.scope,evidence:[{source:this.scope,description:'Synchronous local state capture',observedAt:new Date().toISOString()}]};
  }
}
