import { readFile,readdir } from 'node:fs/promises';
import { Ajv2020 } from 'ajv/dist/2020.js';
import assert from 'node:assert/strict';
const schema=JSON.parse(await readFile('spec/effect-contract.schema.json','utf8'));const ajv=new Ajv2020({strict:true,allowUnionTypes:true});const validate=ajv.compile(schema);
assert.equal(await readFile('spec/effect-contract.schema.json','utf8'),await readFile('docs/public/spec/effect-contract.schema.json','utf8'));
for(const name of await readdir('registry'))for(const file of await readdir(`registry/${name}`)){
 if(!file.endsWith('.json'))continue;const value=JSON.parse(await readFile(`registry/${name}/${file}`,'utf8'));
 assert(validate(value),JSON.stringify(validate.errors));for(const s of [...value.preconditions,...value.postconditions])ajv.compile(s);
 assert(!validate({...value,confidence:2}));assert(!validate({...value,specVersion:'0.2'}));assert(!validate({...value,recovery:{kind:'magic'}}));
}
console.log('Schema 2020-12 and registry fixtures validated');
