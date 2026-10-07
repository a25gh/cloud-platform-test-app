'use strict';

const http = require('http');
const os = require('os');

const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0';

function sendJson(res, statusCode, body) {
  const payload = JSON.stringify(body);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload),
  });
  res.end(payload);
}

const server = http.createServer((req, res) => {
  const url = req.url ? req.url.split('?')[0] : '/';

  if (req.method === 'GET' && url === '/') {
    return sendJson(res, 200, {
      message: 'Hello from Cloud Platform!',
      status: 'running',
      hostname: os.hostname(),
      timestamp: new Date().toISOString(),
    });
  }

  if (req.method === 'GET' && url === '/health') {
    return sendJson(res, 200, { status: 'ok' });
  }

  if (req.method === 'GET' && url === '/ready') {
    return sendJson(res, 200, { status: 'ready' });
  }

  return sendJson(res, 404, { error: 'not_found' });
});

server.listen(PORT, HOST, () => {
  console.log(`cloud-platform-test-app listening on http://${HOST}:${PORT}`);
});

function shutdown(signal) {
  console.log(`Received ${signal}, shutting down gracefully…`);
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
