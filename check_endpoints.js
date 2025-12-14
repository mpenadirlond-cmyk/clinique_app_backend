const http = require('http');

function fetch(path) {
  return new Promise((resolve) => {
    const req = http.get({ hostname: 'localhost', port: 3000, path, timeout: 3000 }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', (e) => resolve({ error: e.message }));
    req.on('timeout', () => { req.destroy(); resolve({ error: 'timeout' }); });
  });
}

(async () => {
  const health = await fetch('/health');
  console.log('# /health');
  console.log(JSON.stringify(health, null, 2));
  const tests = await fetch('/lab_tests');
  console.log('# /lab_tests');
  console.log(JSON.stringify(tests, null, 2));
})();
