const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51bWxydWdvdmlicGRuZXRtYWdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkzODQ3ODcsImV4cCI6MjA1NDk2MDc4N30.DxXmNdw7u2_zPzahZp4KocJpJ0Qm54HsUysKQLnrk-M';

fetch('https://numlrugovibpdnetmago.supabase.co/functions/v1/finance-chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  },
  body: JSON.stringify({ message: 'Qual o meu saldo?' })
})
.then(async r => {
  const text = await r.text();
  const obj = JSON.parse(text);
  console.log('--- ERROR MSG ---');
  console.log(obj.error);
  console.log('--- STACK TRACE ---');
  console.log(obj.stack);
})
.catch(e => console.error(e));
