import type { EffectContract, Json } from '@agentfx/contracts';
/** Experimental boundary only. No inference implementation or reliability claim. */
export interface EffectCompiler {
 compile(input: {source:Json; provenance:string}): Promise<{candidates:EffectContract[];diagnostics:string[]}>;
}
