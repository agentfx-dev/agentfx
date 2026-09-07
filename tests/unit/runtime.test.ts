import { describe, it, expect } from 'vitest';
import { normalize, canonical, at, draftContract } from '@agentfx/contracts';
import { diff, semanticDiff } from '@agentfx/diff';
import { MemoryAdapter } from '@agentfx/adapter-sdk';
import { execute } from '@agentfx/core';
import { observe, expectEffects, record, testGolden } from '@agentfx/testing';
import { discoverOpenApi } from '@agentfx/openapi';
describe('normalization and deterministic differences',()=>{
 it('sorts keys, detaches snapshots and rejects lossy JSON',()=>{
  expect(canonical({b:1,a:2})).toBe('{"a":2,"b":1}');
  for (const value of [undefined,NaN,Infinity,1n,new Date(),new Array(2),{get x(){return 1;}}]) expect(()=>normalize(value)).toThrow();
  const circular: Record<string,unknown> = {}; circular.self=circular; expect(()=>normalize(circular)).toThrow();
 });
 it('escapes pointers and distinguishes missing from null',()=>{
  expect(diff({'a/b':{'~':null}},{'a/b':{}})).toEqual([{path:'/a~1b/~0',kind:'remove',before:null}]);
  expect(at({'a/b':{'~':null}},'/a~1b/~0')).toEqual({exists:true,value:null});
  expect(at({},'/toString')).toEqual({exists:false}); expect(()=>at({},'/bad~2')).toThrow();
 });
 it('handles arrays atomically and preserves raw differences in semantic projection',()=>{
  expect(diff([1],[2])[0]?.path).toBe('');
  const result=semanticDiff({name:'A',time:1},{name:'A',time:2},v=>({name:(v as {name:string}).name}),'ignore observation timestamp');
  expect(result.deterministic).toHaveLength(1);expect(result.semantic).toEqual([]);
 });
});
describe('effect verification',()=>{
 const contract=()=>({...draftContract('customer','Update customer','test'),writeSet:['/name'],expectedEffects:[{path:'/name',kind:'change' as const,value:'Grace'}],invariants:['/role']});
 it('checks the intended change and catches collateral writes',async()=>{
  const state={name:'Ada',role:'user'}; const adapter=new MemoryAdapter(()=>state);
  expect((await execute(adapter,contract(),()=>{state.name='Grace';})).status).toBe('passed');
  state.name='Ada'; const result=await execute(adapter,contract(),()=>{state.name='Grace';state.role='admin';});
  expect(result.status).toBe('failed'); expect(result.violations).toContain('Unexpected write: /role');
 });
 it('blocks the action on failed preconditions',async()=>{
  let called=false;const c=contract();c.preconditions=[{type:'object',required:['missing']}];
  const result=await execute(new MemoryAdapter(()=>({name:'Ada'})),c,()=>{called=true;});
  expect(called).toBe(false);expect(result.action).toBe('not-run');expect(result.status).toBe('failed');
 });
 it('retains evidence of partial effects after action failure',async()=>{
  const state={name:'Ada',role:'user'};const result=await execute(new MemoryAdapter(()=>state),contract(),()=>{state.name='Grace';throw Error('transport broke');});
  expect(result.status).toBe('failed');expect(result.action).toBe('failed');expect(result.changes).toHaveLength(1);
 });
 it('does not pass an incomplete or unsettled observation',async()=>{
  let called=false; const adapter={snapshot:async()=>({state:{},complete:false,settled:false,scope:'test',evidence:[]})};
  expect((await execute(adapter,contract(),()=>{called=true;})).status).toBe('inconclusive');expect(called).toBe(false);
 });
 it('checks postconditions rather than trusting success responses',async()=>{
  const state={name:'Ada',role:'user'};const c=contract();c.postconditions=[{type:'object',properties:{role:{const:'admin'}},required:['role']}];
  expect((await execute(new MemoryAdapter(()=>state),c,()=>{state.name='Grace';})).violations).toContain('Postcondition failed');
 });
 it('does not treat a write-set as proof an expected effect occurred',async()=>{
  expect((await execute(new MemoryAdapter(()=>({name:'Ada',role:'user'})),contract(),()=>{})).status).toBe('failed');
 });
});
describe('assertions and goldens',()=>{
 it('supports positive, negative and exclusive assertions with detached before state',async()=>{
  const state={name:'Ada',role:'user'};const o=await observe(new MemoryAdapter(()=>state),()=>{state.name='Grace';});
  expectEffects(o).toChange('/name');expectEffects(o).not.toChange('/role');expectEffects(o).toOnlyChange(['/name']);
  expect(()=>expectEffects(o).not.toChange('/name')).toThrow();expect(()=>expectEffects(o).toOnlyChange(['/role'])).toThrow();
  testGolden(record(o),o);expect(()=>testGolden({...record(o),after:{}},o)).toThrow('regression');
 });
});
describe('OpenAPI ingestion',()=>{
 it('discovers real operations without converting HTTP verbs into verified effects',()=>{
  const operations=discoverOpenApi({openapi:'3.1.0',paths:{'/customers':{get:{operationId:'list'},post:{summary:'Create'}}}});
  expect(operations.map(o=>o.method)).toEqual(['GET','POST']);expect(operations[0]?.contract.trust).toBe('inferred');expect(operations[0]?.contract.confidence).toBe(0);
 });
 it('rejects unresolved path references and duplicate ids',()=>{
  expect(()=>discoverOpenApi({openapi:'3.1.0',paths:{'/x':{$ref:'#/components/x'}}})).toThrow();
  expect(()=>discoverOpenApi({openapi:'3.1.0',paths:{'/x':{get:{operationId:'x'},post:{operationId:'x'}}}})).toThrow();
 });
});
