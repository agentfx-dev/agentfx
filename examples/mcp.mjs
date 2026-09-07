import {createServer} from 'node:http';
import {McpServer,createMcpHandler} from '@modelcontextprotocol/server';
import {toNodeHandler} from '@modelcontextprotocol/node';
import {z} from 'zod';
import {discoverMcp,protocolVersion} from '@agentfx/mcp';
const handler=createMcpHandler(()=>{
 const server=new McpServer({name:'agentfx-demo',version:'0.1.0'});
 server.registerTool('update_customer',{description:'Update the local demo customer',inputSchema:z.object({name:z.string()})},async({name})=>({content:[{type:'text',text:JSON.stringify({name})}]}));
 return server;
},{legacy:'reject'});
const server=createServer(toNodeHandler(handler));
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
try{
 const contracts=await discoverMcp(new URL(`http://127.0.0.1:${server.address().port}/mcp`));
 if(contracts.length!==1||contracts[0].id!=='update_customer')throw Error('Discovery failed');
 console.log(JSON.stringify({protocolVersion,contracts},null,2));
}finally{await handler.close();server.closeAllConnections();await new Promise((resolve,reject)=>server.close(error=>error?reject(error):resolve()));}
