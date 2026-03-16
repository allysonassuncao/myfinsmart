import('@modelcontextprotocol/sdk/client/streamableHttp.js')
  .then(m => {
     console.log('StreamableHTTPClientTransport CONSTRUCTOR:');
     console.log(m.StreamableHTTPClientTransport.toString().substring(0, 500));
  })
  .catch(console.error);
