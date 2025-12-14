const http = require('http');
const url = require('url');

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  
  res.setHeader('Content-Type', 'application/json');
  
  if (pathname === '/health') {
    res.writeHead(200);
    res.end(JSON.stringify({ status: 'OK' }));
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

const port = 8000;
server.listen(port, '0.0.0.0', () => {
  console.log(`HTTP server listening on port ${port}`);
});
