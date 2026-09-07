import { defineConfig } from 'vitepress';
export default defineConfig({
  title: 'AgentFX',
  description: 'Verification infrastructure for autonomous work',
  base: '/agentfx/',
  themeConfig: { nav: [{text:'Guide',link:'/vision'},{text:'Architecture',link:'/architecture'},{text:'Schema',link:'/spec/effect-contract.schema.json'}], sidebar: [{text:'Project',items:[{text:'Vision',link:'/vision'},{text:'Architecture',link:'/architecture'},{text:'Roadmap',link:'/roadmap'},{text:'Threat model',link:'/threat-model'},{text:'Benchmarks',link:'/benchmarks'}]}] }
});
