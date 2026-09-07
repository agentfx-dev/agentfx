import { canonical, normalize, type Json } from '@agentfx/contracts';
export interface Change { path: string; kind: 'add' | 'remove' | 'change'; before?: Json; after?: Json }
const object = (v: Json): v is Record<string, Json> => v !== null && typeof v === 'object' && !Array.isArray(v);
const escape = (s: string) => s.replace(/~/gu, '~0').replace(/\//gu, '~1');
export function diff(before: Json, after: Json): Change[] {
  const changes: Change[] = [];
  function visit(a: Json, b: Json, path: string): void {
    if (canonical(a) === canonical(b)) return;
    if (object(a) && object(b)) {
      for (const key of [...new Set([...Object.keys(a), ...Object.keys(b)])].sort()) {
        const child = `${path}/${escape(key)}`;
        if (!Object.hasOwn(a, key)) changes.push({path:child,kind:'add',after:b[key]!});
        else if (!Object.hasOwn(b, key)) changes.push({path:child,kind:'remove',before:a[key]!});
        else visit(a[key]!, b[key]!, child);
      }
    } else changes.push({path,kind:'change',before:a,after:b});
  }
  visit(normalize(before), normalize(after), ''); return changes;
}
export const containsPath = (parent: string, child: string): boolean => parent === '' || child === parent || child.startsWith(`${parent}/`);
export interface SemanticDiff { deterministic: Change[]; semantic: Change[]; normalization: string }
export function semanticDiff(before: Json, after: Json, project: (value: Json) => Json, normalization: string): SemanticDiff {
  if (!normalization.trim()) throw new TypeError('Semantic projection requires a documented name');
  return {deterministic:diff(before,after),semantic:diff(project(normalize(before)),project(normalize(after))),normalization};
}
