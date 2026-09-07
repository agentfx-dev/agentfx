import { Ajv2020 } from 'ajv/dist/2020.js';
export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };
export type Recovery = 'reversible' | 'compensable' | 'reconcilable' | 'irreversible' | 'unknown';
export interface Evidence { source: string; description: string; observedAt: string; sha256?: string }
export interface EffectContract {
  specVersion: '0.1'; id: string; version: string; description: string;
  trust: 'inferred' | 'verified' | 'trusted'; confidence: number;
  preconditions: Json[]; expectedEffects: { path: string; kind: 'change' | 'add' | 'remove'; value?: Json }[];
  invariants: string[]; postconditions: Json[];
  finality: { kind: 'snapshot' | 'settled'; description: string };
  idempotency: { kind: 'idempotent' | 'non-idempotent' | 'unknown'; key?: string };
  recovery: { kind: Recovery; description: string };
  evidence: Evidence[]; readSet: string[]; writeSet: string[];
}
export function normalize(value: unknown, seen = new Set<object>()): Json {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number' && Number.isFinite(value)) return Object.is(value, -0) ? 0 : value;
  if (typeof value !== 'object' || value === null) throw new TypeError('State must contain only finite JSON values');
  if (seen.has(value)) throw new TypeError('Cyclic state is unsupported');
  seen.add(value);
  try {
    if (Array.isArray(value)) {
      if (Object.keys(value).length !== value.length) throw new TypeError('Sparse or decorated arrays are unsupported');
      return value.map(v => normalize(v, seen));
    }
    if (Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null) throw new TypeError('Only plain JSON objects are supported');
    if (Object.getOwnPropertySymbols(value).length) throw new TypeError('Symbol keys are unsupported');
    const out: { [key: string]: Json } = Object.create(null);
    for (const key of Object.keys(value).sort()) {
      const desc = Object.getOwnPropertyDescriptor(value, key)!;
      if (!('value' in desc)) throw new TypeError('State accessors are unsupported');
      out[key] = normalize(desc.value, seen);
    }
    return out;
  } finally { seen.delete(value); }
}
export const canonical = (value: unknown): string => JSON.stringify(normalize(value));
export function assertPointer(path: string): void {
  if (path !== '' && (!path.startsWith('/') || /~(?![01])/u.test(path))) throw new TypeError(`Invalid JSON pointer: ${path}`);
}
export function at(state: Json, path: string): { exists: boolean; value?: Json } {
  assertPointer(path); let value: Json = state;
  if (path === '') return { exists: true, value };
  for (const part of path.slice(1).split('/').map(p => p.replace(/~1/gu, '/').replace(/~0/gu, '~'))) {
    if (value === null || typeof value !== 'object' || !Object.hasOwn(value, part) || (Array.isArray(value) && !/^(0|[1-9][0-9]*)$/u.test(part))) return { exists: false };
    value = (value as Record<string, Json>)[part]!;
  }
  return { exists: true, value };
}
export function matchesSchema(schema: Json, value: Json): boolean {
  // Fresh instance avoids shared schema ids and prohibits external reference resolution.
  const ajv = new Ajv2020({strict: true, allowUnionTypes: true, allErrors: true, validateFormats: false});
  try {
    return Boolean(ajv.compile(schema as object | boolean)(value));
  } catch {
    return false;
  }
}
export function draftContract(id: string, description: string, source: string): EffectContract {
  return {specVersion:'0.1',id,version:'0.1.0',description,trust:'inferred',confidence:0,
    preconditions:[],expectedEffects:[],invariants:[],postconditions:[],finality:{kind:'snapshot',description:'Discovery does not establish finality'},
    idempotency:{kind:'unknown'},recovery:{kind:'unknown',description:'Manual review required'},
    evidence:[{source,description:'Discovery metadata only; no execution evidence',observedAt:new Date().toISOString()}],readSet:[],writeSet:[]};
}
