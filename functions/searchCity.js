export async function onRequest(context) {
    const { request } = context;
  
    // Create a response object with the request details
    const requestDetails = {
      method: request.method,
      url: request.url,
      headers: Object.fromEntries(request.headers),
      body: await request.text()
    };
  
    return new Response(JSON.stringify(requestDetails, null, 2), {
      headers: { "Content-Type": "application/json" },
    });
  }