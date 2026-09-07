import { it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
it.skipIf(!process.env.CI)('runs the two-minute customer demo',()=>{expect(execFileSync(process.execPath,['examples/memory.mjs'],{encoding:'utf8'})).toContain('passed');});
it.skipIf(!process.env.CI)('records and tests a real local scenario through the packed CLI entry',()=>{
 const directory=mkdtempSync(join(tmpdir(),'agentfx-'));const golden=join(directory,'golden.json');
 try{execFileSync(process.execPath,['packages/cli/dist/index.mjs','record','examples/scenario.mjs',golden]);expect(execFileSync(process.execPath,['packages/cli/dist/index.mjs','test','examples/scenario.mjs',golden],{encoding:'utf8'})).toContain('passed');}
 finally{rmSync(directory,{recursive:true,force:true});}
});
it.skipIf(!process.env.DATABASE_URL)('executes PostgreSQL safe writes and verifies savepoint recovery',()=>{
 expect(execFileSync(process.execPath,['examples/postgres.mjs'],{encoding:'utf8'})).toContain('savepoint rollback verified');
});
it.skipIf(!process.env.CI)('discovers tools from a real MCP 2026-07-28 server',()=>{
 expect(execFileSync(process.execPath,['examples/mcp.mjs'],{encoding:'utf8'})).toContain('update_customer');
});
