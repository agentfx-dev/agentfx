#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { record, observe, testGolden, type Golden } from '@agentfx/testing';
import { discoverOpenApi } from '@agentfx/openapi';
const [command, input, output] = process.argv.slice(2);
try {
  if (command === 'openapi' && input) console.log(JSON.stringify(discoverOpenApi(JSON.parse(await readFile(input,'utf8')),input),null,2));
  else if ((command === 'record' || command === 'test') && input && output) {
    // Explicit local code execution, never inferred from a contract or remote URL.
    const scenario = await import(pathToFileURL(resolve(input)).href);
    if (typeof scenario.createScenario !== 'function') throw new Error('Scenario must export createScenario()');
    const {adapter,action} = await scenario.createScenario();
    const observed = await observe(adapter,action);
    if (command === 'record') await writeFile(output,JSON.stringify(record(observed),null,2)+'\n',{flag:'wx',mode:0o600});
    else testGolden(JSON.parse(await readFile(output,'utf8')) as Golden,observed);
    console.log(command === 'record' ? 'Golden recorded' : 'Effect regression passed');
  } else { console.error('Usage: agentfx openapi <document.json> | record <trusted-local-scenario.mjs> <new-golden.json> | test <trusted-local-scenario.mjs> <golden.json>'); process.exitCode=2; }
} catch (error) { console.error(error instanceof Error ? error.message : String(error)); process.exitCode=1; }
export {};
