import type { PoolClient } from 'pg';
import { normalize } from '@agentfx/contracts';
import type { Adapter, Snapshot } from '@agentfx/adapter-sdk';
/** Observes a caller-defined SELECT within the caller's transaction. Never executes recovery. */
export class PostgresAdapter implements Adapter {
  constructor(private readonly client: PoolClient, private readonly query: string, private readonly parameters: unknown[], private readonly scope: string) {
    if (!/^\s*select\b/iu.test(query)) throw new TypeError('Snapshot query must be SELECT');
  }
  async snapshot(): Promise<Snapshot> {
    const result = await this.client.query(this.query,this.parameters);
    return {state:normalize(result.rows),complete:true,settled:false,scope:this.scope,evidence:[{source:'postgres:'+this.scope,description:'Transaction-visible query result; completeness is limited to the declared query; not proof of durable commit',observedAt:new Date().toISOString()}]};
  }
}
