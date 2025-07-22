




import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import fetchImport from 'node-fetch';
const fetchApi = fetchImport.default || fetchImport;
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// History log file
const HISTORY_FILE = path.join(__dirname, 'api-history.json');
function logApiHistory(entry) {
  let arr = [];
  try {
    arr = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
  } catch {}
  arr.unshift(entry); // newest first
  if (arr.length > 1000) arr = arr.slice(0, 1000); // limit size
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(arr, null, 2));
}





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
    const start = Date.now();
    const response = await fetchApi(targetUrl, fetchOptions);
    const contentType = response.headers.get('content-type') || '';
    res.status(response.status);
    res.set('content-type', contentType);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    let responseBody = '';
    try {
      responseBody = Buffer.from(arrayBuffer).toString('utf8');
    } catch (e) {
      responseBody = '<binary>';
    }
    // Log API call
    logApiHistory({
      timestamp: new Date().toISOString(),
      url: targetUrl,
      method,
      requestHeaders: headers,
      requestBody: body,
      status: response.status,
      responseHeaders: Object.fromEntries(response.headers.entries()),
      responseBody: responseBody.slice(0, 1000),
      duration: Date.now() - start,
      user: req.user || 'admin',
      result: response.ok ? 'Success' : 'Fail',
    });
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: 'Proxy request failed', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend proxy server running on http://localhost:${PORT}`);
});
