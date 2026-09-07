import pg from 'pg';
import { PostgresAdapter } from '@agentfx/adapter-postgres';
import { draftContract } from '@agentfx/contracts';
import { execute } from '@agentfx/core';
export async function runPostgresDemo(connectionString=process.env.DATABASE_URL){
 if(!connectionString)throw Error('Set DATABASE_URL to a disposable PostgreSQL database');
 const pool=new pg.Pool({connectionString});const client=await pool.connect();
 try{
  await client.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
  await client.query('CREATE TEMP TABLE agentfx_customers (id integer PRIMARY KEY, name text NOT NULL, role text NOT NULL) ON COMMIT DROP');
  await client.query("INSERT INTO agentfx_customers VALUES (1,'Ada','user'),(2,'Lin','user')");
  const adapter=new PostgresAdapter(client,'SELECT id, name, role FROM agentfx_customers ORDER BY id',[],'temp:agentfx_customers');
  const contract={...draftContract('postgres-update','Update one customer','examples/postgres.mjs'),writeSet:[''],expectedEffects:[{path:'/0/name',kind:'change',value:'Grace'}],invariants:['/0/id','/0/role','/1']};
  const good=await execute(adapter,contract,()=>client.query('UPDATE agentfx_customers SET name=$1 WHERE id=$2',['Grace',1]));
  if(good.status!=='passed')throw Error(JSON.stringify(good.violations));
  await client.query('SAVEPOINT before_unsafe');
  const bad=await execute(adapter,contract,()=>client.query("UPDATE agentfx_customers SET role='admin'"));
  if(bad.status!=='failed')throw Error('Expected collateral write detection');
  await client.query('ROLLBACK TO SAVEPOINT before_unsafe');
  const rows=await client.query('SELECT role FROM agentfx_customers ORDER BY id');
  if(rows.rows.some(r=>r.role!=='user'))throw Error('Savepoint recovery failed');
  await client.query('ROLLBACK');
  return {safeWrite:good.status,unsafeWrite:bad.status,recovery:'savepoint rollback verified',durability:'not claimed; entire demo rolled back'};
 }catch(error){await client.query('ROLLBACK');throw error;}finally{client.release();await pool.end();}
}
if(process.argv[1]?.endsWith('/postgres.mjs'))console.log(JSON.stringify(await runPostgresDemo(),null,2));
