addEventListener('fetch', event => {
       event.respondWith(handleRequest(event.request));
     });

     async function handleRequest(request) {
       const url = new URL(request.url);
       let path = url.pathname === '/' ? '/index.html' : url.pathname;

       // Serve static assets from KV
       const asset = await STATIC_ASSETS.get(path);
       if (asset) {
         const contentType = getContentType(path);
         return new Response(asset, {
           headers: { 'Content-Type': contentType }
         });
       }

       // Proxy Google Sheets API
       if (path === '/closure-api') {
         const apiKey = 'AIzaSyDPe8RLxF1IGKJp4S1tVdX2U3gU8xa4av4';
         const sheetId = '1tk8ASOFtc2M6rHsd8bU9GwIjBsuQ2uJb2ja_x-N_7oQ';
         const range = 'Sheet1!A2:C';
         const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;
         try {
           const response = await fetch(apiUrl);
           if (!response.ok) {
             return new Response('Error fetching data', { status: 500 });
           }
           const data = await response.json();
           return new Response(JSON.stringify(data), {
             headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
           });
         } catch (error) {
           return new Response('Internal server error', { status: 500 });
         }
       }

       // Return 404 for unknown paths
       return new Response('Not Found', { status: 404 });
     }

     function getContentType(path) {
       if (path.endsWith('.html')) return 'text/html';
       if (path.endsWith('.css')) return 'text/css';
       if (path.endsWith('.js')) return 'application/javascript';
       if (path.endsWith('.png')) return 'image/png';
       if (path.endsWith('.xml')) return 'application/xml';
       if (path.endsWith('.txt')) return 'text/plain';
       return 'text/plain';
     }