import { draftContract, type EffectContract } from '@agentfx/contracts';
export interface DiscoveredOperation { method:string; path:string; operationId:string; contract:EffectContract }
const obj = (v:unknown): v is Record<string,unknown> => v !== null && typeof v === 'object' && !Array.isArray(v);
export function discoverOpenApi(document: unknown, source = 'local:openapi'): DiscoveredOperation[] {
  if (!obj(document) || typeof document.openapi !== 'string' || !/^3\.[01]\./u.test(document.openapi) || !obj(document.paths)) throw new TypeError('Expected an OpenAPI 3.0/3.1 document with paths');
  const result:DiscoveredOperation[] = []; const ids = new Set<string>();
  for (const [path,item] of Object.entries(document.paths)) {
    if (!obj(item) || '$ref' in item) throw new TypeError('Path item references must be resolved by the caller');
    for (const method of ['get','put','post','delete','options','head','patch','trace']) {
      const operation = item[method]; if (operation === undefined) continue;
      if (!obj(operation)) throw new TypeError(`Invalid operation: ${method} ${path}`);
      const operationId = typeof operation.operationId === 'string' ? operation.operationId : `${method}:${path}`;
      if (ids.has(operationId)) throw new TypeError(`Duplicate operationId: ${operationId}`); ids.add(operationId);
      const description = typeof operation.summary === 'string' ? operation.summary : `${method.toUpperCase()} ${path}`;
      result.push({method:method.toUpperCase(),path,operationId,contract:draftContract(operationId,description,source)});
    }
  }
  return result;
}
