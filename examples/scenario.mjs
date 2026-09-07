import { MemoryAdapter } from '@agentfx/adapter-sdk';
export function createScenario(){const customer={name:'Ada',role:'user'};return {adapter:new MemoryAdapter(()=>customer,'customer:1'),action:()=>{customer.name='Grace';}};}
