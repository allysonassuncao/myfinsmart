const token = 'sbp_21864c219eddfc7141b3b8b1795b3126babc7551';
const project_ref = 'numlrugovibpdnetmago';

const url = `https://mcp.supabase.com/mcp?project_ref=${project_ref}&read_only=true`;

fetch(url, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json, text/event-stream',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: { name: "MyFinSmartTest", version: "1.0" }
    }
  })
})
.then(async r => {
  const text = await r.text();
  console.log('TEST 5 Status:', r.status);
  console.log('--- HEADERS ---');
  for (let [k,v] of r.headers.entries()) {
    console.log(`${k}: ${v}`);
  }
})
.catch(console.error);
