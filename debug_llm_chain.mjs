import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import 'dotenv/config'; // Loads from .env if present

const token = 'sbp_21864c219eddfc7141b3b8b1795b3126babc7551';
const url = "https://mcp.supabase.com/mcp?project_ref=numlrugovibpdnetmago&read_only=true";
const openRouterKey = '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';

async function callOpenRouter(messages, tools) {
  const body = {
    model: "google/gemini-2.5-flash",
    messages: messages,
    tools: tools.length > 0 ? tools : undefined,
    temperature: 0.5,
  };

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${openRouterKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return await res.json();
}

async function run() {
  try {
    const transport = new StreamableHTTPClientTransport(new URL(url), {
      requestInit: { headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json, text/event-stream" } }
    });

    const client = new Client({ name: "test", version: "1.0" });
    await client.connect(transport);

    const tablesCheck = await client.callTool({ name: "execute_sql", arguments: { query: "SELECT table_name, column_name FROM information_schema.columns WHERE table_schema = 'public'" } });
    const dbSchema = tablesCheck.content?.[0]?.text || "Vazio";

    const responseTools = await client.listTools();
    const mappedTools = responseTools.tools.map(t => ({
      type: "function",
      function: { name: t.name, description: t.description, parameters: t.inputSchema || { type: "object", properties: {} } }
    }));

    const messages = [
      { role: "system", content: `Você é um assistente financeiro. Estrutura do DB:\n${dbSchema}\nPara contas a pagar use 'calendarios'. O ID do usuário logado é: 'e5d8ea14-1e58-40cf-a78b-37d40dd5d21a'.` },
      { role: "user", content: "quais contas eu devo pagar essa semana?" }
    ];

    console.log('--- ENVIANDO AO OPENROUTER ---');
    let responseData = await callOpenRouter(messages, mappedTools);
    console.log('PRIMEIRA RESPOSTA:', JSON.stringify(responseData, null, 2).substring(0, 1000));

    let safety = 0;
    while (responseData.choices?.[0]?.message?.tool_calls && safety < 5) {
      safety++;
      const messageObj = responseData.choices[0].message;
      messages.push(messageObj);

      for (const call of messageObj.tool_calls) {
         console.log(`\n\n--- EXECUTANDO TOOL: ${call.function.name} ---`);
         console.log(`ARGUMENTOS:`, call.function.arguments);
         
         const toolResult = await client.callTool({
            name: call.function.name,
            arguments: JSON.parse(call.function.arguments)
         });
         console.log(`--- SEED RESULT ---`);
         console.log(JSON.stringify(toolResult.content, null, 2).substring(0, 1000));

         messages.push({
            role: "tool",
            tool_call_id: call.id,
            name: call.function.name,
            content: JSON.stringify(toolResult.content)
         });
      }

      responseData = await callOpenRouter(messages, mappedTools);
    }

    console.log('\n\n--- RESPOSTA FINAL DO LLM ---');
    console.log(responseData.choices?.[0]?.message?.content);

    await client.close();
  } catch (err) {
    console.error('ERROR CHAIN:', err);
  }
}

run();
