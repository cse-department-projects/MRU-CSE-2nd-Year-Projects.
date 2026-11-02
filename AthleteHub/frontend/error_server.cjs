const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      console.log('--- ERROR RECEIVED ---');
      console.log(body);
      fs.writeFileSync('error_log.txt', body);
      res.writeHead(200, {
        'Access-Control-Allow-Origin': '*'
      });
      res.end('OK');
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(9999, () => {
  console.log('Error server listening on port 9999');
});
