import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const token = 'sbp_21864c219eddfc7141b3b8b1795b3126babc7551';
const url = "https://mcp.supabase.com/mcp?project_ref=numlrugovibpdnetmago&read_only=true";

async function run() {
  try {
    const transport = new StreamableHTTPClientTransport(
      new URL(url),
      {
        requestInit: {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json, text/event-stream"
          }
        }
      }
    );

    const client = new Client({ name: "test", version: "1.0" });
    await client.connect(transport);

    const sqlResult = await client.callTool({
      name: "execute_sql",
      arguments: {
        query: "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'registros_cartoes'"
      }
    });

    const parsed = JSON.parse(sqlResult.content[0].text);
    const match = parsed.result.match(/\[.*\]/s);
    if (match) {
        const rows = JSON.parse(match[0]);
        console.log('--- REGISTROS_CARTOES COLUMNS ---');
        for (let r of rows) {
            console.log(`- ${r.column_name} (${r.data_type})`);
        }
    } else {
        console.log('NO ARRAY FOUND. RAW:', parsed.result);
    }

    await client.close();
  } catch (err) {
    console.error('FETCH ERROR:', err.message);
  }
}

run();
