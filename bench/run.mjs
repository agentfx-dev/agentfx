import {readFile} from 'node:fs/promises';
import {diff} from '@agentfx/diff';
const seed=JSON.parse(await readFile('bench/seed.json','utf8'));
const results=seed.map(f=>({id:f.id,observedWrites:diff(f.before,f.after).map(c=>c.path),unexpectedWrites:diff(f.before,f.after).filter(c=>!f.goldWriteSet.includes(c.path)).map(c=>c.path)}));
console.log(JSON.stringify({method:'Manual gold fixture baseline; no compiler evaluated',fixtureCount:seed.length,results,inferenceMetrics:null},null,2));
