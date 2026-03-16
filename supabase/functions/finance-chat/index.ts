import { Client } from "npm:@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "npm:@modelcontextprotocol/sdk/client/streamableHttp.js";

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Auxiliar para chamar o OpenRouter
async function callOpenRouter(apiKey: string, messages: any[], tools: any[]) {
  const body: any = {
    model: "google/gemini-2.5-flash",
    messages: messages,
    tools: tools.length > 0 ? tools : undefined,
    temperature: 0.5,
  };

  return await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://myfinsmart.com",
      "X-Title": "MyFinSmart Chat"
    },
    body: JSON.stringify(body),
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  try {
    const payload = await req.json();
    let message = "";
    let chatId = null;
    let userId = payload.userId; // Captura o userId do payload

    if (payload.update_id && payload.message) {
      message = payload.message.text;
      chatId = payload.message.chat.id;
    } else {
      message = payload.message;
    }

    if (!message) {
      throw new Error("Mensagem não enviada");
    }

    const OPENROUTER_KEY = Deno.env.get("OPENROUTER_API_KEY");
    if (!OPENROUTER_KEY) {
      throw new Error("A variável de ambiente 'OPENROUTER_API_KEY' não está configurada.");
    }

    // 1. Iniciar conexão MCP do Supabase via StreamableHTTP (Padrão correto para o Supabase MCP)
    const transport = new StreamableHTTPClientTransport(
      new URL("https://mcp.supabase.com/mcp?project_ref=numlrugovibpdnetmago&read_only=false"),
      {
        requestInit: {
          headers: {
            "Authorization": `Bearer ${Deno.env.get("MCP_ACCESS_TOKEN")}`,
            "Accept": "application/json, text/event-stream"
          }
        }
      }
    );
    const mcpClient = new Client({ name: "MyFinSmartFinanceBot", version: "1.0" });
    await mcpClient.connect(transport);

    // 2. Coletar Ferramentas (Tools) do MCP
    const responseTools = await mcpClient.listTools();
    const tools = responseTools.tools || [];

    // --- OTIMIZAÇÃO: Pré-carrega o esquema completo das tabelas e colunas para dar contexto instantâneo ao LLM ---
    let dbSchemaResult = "Não foi possível carregar a estrutura do banco.";
    try {
      const schemaCheck = await mcpClient.callTool({
        name: "execute_sql",
        arguments: {
          query: "SELECT table_name, column_name FROM information_schema.columns WHERE table_schema = 'public' ORDER BY table_name"
        }
      });
      dbSchemaResult = schemaCheck.content?.[0]?.text || "Vazio";
    } catch (err) {
      console.error("Erro ao carregar colunas no carregamento otimista:", err);
    }

    const mappedTools = tools.map((t: any) => ({
      type: "function",
      function: {
        name: t.name,
        description: t.description,
        parameters: t.inputSchema || { type: "object", properties: {} }
      }
    }));

    const currentDate = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });

    // 3. Montar Histórico de Mensagens (Com Memória)
    const messages: any[] = [
      {
        role: "system",
        content: `Você é o "MyFinSmart Bot", um assistente financeiro pessoal.
Você tem acesso ao banco de dados pelo MCP para ler e analisar dados.
O ID do usuário com quem você está conversando é: ${userId || "Desconhecido"}. Em caso de dúvida sobre qual usuário é, use exatamente ESSA string para filtrar suas consultas.
A data/hora atual é: ${currentDate}.

--- ESTRUTURA DO BANCO DE DADOS (Tabelas e Colunas) ---
${dbSchemaResult}
------------------------------------------------------

Você TEM ferramentas (como 'execute_sql') para ler os dados das tabelas acima sozinho. NUNCA pergunte ao usuário quais tabelas existem; decida qual ler com base na estrutura acima.

IMPORTANTE SOBRE ERROS OU CORREÇÕES:
- Se você executar um SQL e retornar um erro (ex: coluna não encontrada), NÃO avise o usuário que houve erro e NÃO peça para ele aguardar. 
- CORRIJA seu SQL de forma silenciosa e faça um NOVO 'tool_call' (chamada de ferramenta) corrigindo a instrução até acertar.
- O usuário NUNCA deve ver termos como 'tabelas', 'colunas', 'SQL', nomes de arquivos ou mensagens de erro técnico do banco de dados.

MAPEAMENTO DE TABELAS ESPECÍFICAS:
- Para dúvidas sobre **contas a pagar em determinada data ou período**, você deve consultar preferencialmente os dados da tabela \`calendarios\`.
- **Regra Importante para \`calendarios\`**: Ela não possui uma coluna \`data\` (tipo date). O dia do vencimento está na coluna \`dia\` (numérica, de 1 a 31), que representa o dia do mês. Para responder sobre contas "desta semana" ou de um período, calcule os dias numéricos do período correspondente (com base na data atual) e filtre \`WHERE dia >= DIA_INICIO AND dia <= DIA_FIM\`.
- Para dúvidas sobre **contas parceladas** (como compras parceladas no cartão de crédito), você deve consultar os dados da tabela \`registros_cartoes\`.

BUSCAS POR TEXTO E ACENTOS:
- O banco de dados é sensível a acentos (Accent Sensitive).
- Para filtros de texto (como nomes de categorias ou pessoas), NÃO faça buscas diretas com '=' deduzindo o acento.
- PRIMEIRO faça um SELECT na tabela de suporte (ex: 'categorias') para descobrir os nomes EXATOS salvos no banco. Alternativamente, use 'ILIKE' com curingas '%' flexíveis para encontrar o termo (ex: '%alimentac%').

RESPOSTA:
- FORMATO DE RESPOSTA: Evite usar listas com asteriscos (*). Para listar receitas ou despesas, use marcadores de emojis (ex: 🟢 para receitas, 🔴 para despesas) combinados com negritos (**item**) e quebras de linha. Isso garante que a mensagem fique super legível sem parecer código bruto.
- Sempre que for rodar uma ferramenta de leitura (como 'execute_sql'), GARANTA que você filtre pelo 'user_id' do usuário com quem você está conversando para garantir que ele visualize apenas suas próprias finanças. Seja educado, prestativo e dê resumos visuais das finanças.`
      }
    ];

    // Se o frontend enviou o histórico completo, nós o repassamos para o LLM ter memória
    if (payload.messages && Array.isArray(payload.messages)) {
      for (const m of payload.messages) {
        // Ignora a mensagem inicial de boas-vindas do robô se preferir, ou repassa
        messages.push({
          role: m.sender === "user" ? "user" : "assistant",
          content: m.text
        });
      }
    } else {
      // Fallback para caso não venha histórico
      messages.push({ role: "user", content: message });
    }

    // 4. Primeiro Envio para o OpenRouter
    let response = await callOpenRouter(OPENROUTER_KEY, messages, mappedTools);
    let responseData = await response.json();

    // 5. Loop de Execução de Ferramentas (Tool Loop)
    let safetyCounter = 0;
    while (responseData.choices?.[0]?.message?.tool_calls && safetyCounter < 5) {
      safetyCounter++;
      const messageObj = responseData.choices[0].message;
      messages.push(messageObj);

      for (const call of messageObj.tool_calls) {
        let fn_args = {};
        try {
          fn_args = JSON.parse(call.function.arguments);
        } catch (e) {
          console.error("Erro ao fazer parse dos argumentos da tool:", call.function.arguments);
        }

        const toolResult = await mcpClient.callTool({
          name: call.function.name,
          arguments: fn_args
        });

        messages.push({
          role: "tool",
          tool_call_id: call.id,
          name: call.function.name,
          content: typeof toolResult.content === 'object' ? JSON.stringify(toolResult.content) : String(toolResult.content)
        });
      }

      response = await callOpenRouter(OPENROUTER_KEY, messages, mappedTools);
      responseData = await response.json();
    }

    const responseText = responseData.choices?.[0]?.message?.content || "Sem resposta.";

    if (chatId) {
      const TELEGRAM_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
      if (TELEGRAM_TOKEN) {
        await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: chatId, text: responseText })
        });
      }
    }

    return new Response(JSON.stringify({ response: responseText }), {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message, stack: error.stack }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
    });
  }
});
