import { readdir,mkdir,readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
await mkdir('artifacts',{recursive:true});
for(const name of await readdir('packages')){
 const cwd=resolve('packages',name);const pkg=JSON.parse(await readFile(`${cwd}/package.json`,'utf8'));
 if(!pkg.private)throw Error('npm ownership is unconfirmed: all packages must remain private');
 execFileSync('pnpm',['exec','publint','run',cwd,'--pack','false'],{stdio:'inherit'});
 execFileSync('pnpm',['pack','--pack-destination',resolve('artifacts')],{cwd,stdio:'inherit'});
}
for(const file of await readdir('artifacts'))if(file.endsWith('.tgz'))execFileSync('pnpm',['exec','attw',`artifacts/${file}`,'--profile','esm-only'],{stdio:'inherit'});
