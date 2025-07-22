import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import https from 'https';

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Proxy endpoint for all HTTP methods
app.all('/proxy', async (req, res) => {
  let targetUrl, method, headers, body;
  if (req.method === 'POST' && req.is('application/json')) {
    targetUrl = req.body.url;
    method = req.body.method || 'GET';
    headers = req.body.headers || {};
    body = req.body.body;
  } else {
    targetUrl = req.headers['x-target-url'];
    method = req.method;
    headers = { ...req.headers };
    delete headers.host;
    delete headers['x-target-url'];
    body = req.body;
  }
  if (!targetUrl) {
    return res.status(400).json({ error: 'Missing target url' });
  }
  // Normalize Authorization header
  if (!headers.Authorization && headers['x-authorization']) {
    headers['Authorization'] = headers['x-authorization'];
    delete headers['x-authorization'];
  }
  if (headers.authorization) {
    headers['Authorization'] = headers.authorization;
    delete headers.authorization;
  }
  try {
    // Allow self-signed certificates (for dev/testing only)
    const agent = new https.Agent({ rejectUnauthorized: false });
    const fetchOptions = {
      method,
      headers,
      body: ['GET', 'HEAD'].includes(method) ? undefined : body,
      redirect: 'follow',
      agent: targetUrl.startsWith('https') ? agent : undefined,
    };
    const response = await fetch(targetUrl, fetchOptions);
    const contentType = response.headers.get('content-type') || '';
    res.status(response.status);
    res.set('content-type', contentType);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: 'Proxy request failed', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend proxy server running on http://localhost:${PORT}`);
});
