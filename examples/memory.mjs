import { observe,expectEffects } from '@agentfx/testing';
import { createScenario } from './scenario.mjs';
const {adapter,action}=createScenario();const observed=await observe(adapter,action);
expectEffects(observed).toChange('/name');expectEffects(observed).not.toChange('/role');expectEffects(observed).toOnlyChange(['/name']);
console.log(JSON.stringify({status:'passed',changes:observed.changes},null,2));
