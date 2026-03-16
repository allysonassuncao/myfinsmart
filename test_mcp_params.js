const token = 'sbp_21864c219eddfc7141b3b8b1795b3126babc7551';
const project_ref = 'numlrugovibpdnetmago';

const urlRegular = `https://mcp.supabase.com/mcp?project_ref=${project_ref}&read_only=true`;

// Test 3: POST com Authorization Header
fetch(urlRegular, {
  method: 'POST', // POST !!
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    jsonrpc: "2.0",
    id: 1,
    method: "listTools"
  })
})
.then(async r => {
  const text = await r.text();
  console.log('TEST 3 (POST) Status:', r.status);
  console.log('TEST 3 Response:', text.substring(0, 500));
})
.catch(console.error);
