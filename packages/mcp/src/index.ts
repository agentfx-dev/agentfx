import { Client, StreamableHTTPClientTransport } from '@modelcontextprotocol/client';
import { draftContract, type EffectContract } from '@agentfx/contracts';
export const protocolVersion = '2026-07-28' as const;
export async function discoverMcp(url: URL): Promise<EffectContract[]> {
  if (!['http:','https:'].includes(url.protocol)) throw new TypeError('MCP discovery requires an HTTP(S) URL');
  const client = new Client({name:'agentfx',version:'0.1.0-alpha.1'},{versionNegotiation:{mode:{pin:protocolVersion}}});
  try {
    await client.connect(new StreamableHTTPClientTransport(url));
    const contracts: EffectContract[] = []; const seen = new Set<string>(); let cursor: string | undefined;
    do {
      const page = await client.listTools(cursor ? {cursor} : {});
      for (const tool of page.tools) contracts.push(draftContract(tool.name,tool.description ?? tool.name,url.toString()));
      cursor = page.nextCursor;
      if (cursor && seen.has(cursor)) throw new Error('Repeated MCP pagination cursor');
      if (cursor) seen.add(cursor);
      if (seen.size > 1000) throw new Error('MCP pagination limit exceeded');
    } while (cursor);
    return contracts;
  } finally { await client.close(); }
}
