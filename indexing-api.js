/**
 * Google Indexing API submitter for aitoolsdash.com
 *
 * Setup:
 * 1. Enable the Indexing API in Google Cloud Console
 *    https://console.cloud.google.com/apis/library/indexing.googleapis.com
 * 2. Create a service account key (JSON) and add it to Google Search Console
 *    as a "property owner" for https://aitoolsdash.com/
 * 3. Save the key as ./indexing-service-account.json
 * 4. Run: node indexing-api.js https://aitoolsdash.com/en/suno-ai.html
 *    Or with no args to submit all URLs from sitemap.xml
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');

const SITE = 'https://aitoolsdash.com';
const KEY_FILE = path.join(__dirname, 'indexing-service-account.json');
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const INDEXING_URL = 'https://indexing.googleapis.com/v3/urlNotifications:publish';

const SCOPE = 'https://www.googleapis.com/auth/indexing';

function loadKey() {
  if (!fs.existsSync(KEY_FILE)) {
    console.error('ERROR: ' + KEY_FILE + ' not found. Create a service account key first.');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(KEY_FILE, 'utf8'));
}

function signJwt(key) {
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    iss: key.client_email,
    scope: SCOPE,
    aud: TOKEN_URL,
    exp: now + 3600,
    iat: now
  })).toString('base64url');
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(header + '.' + payload);
  const signature = signer.sign(key.private_key).toString('base64url');
  return header + '.' + payload + '.' + signature;
}

function postJson(url, data, headers) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(data);
    const req = https.request(url, {
      method: 'POST',
      headers: Object.assign({ 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }, headers)
    }, (res) => {
      let chunks = '';
      res.on('data', (c) => { chunks += c; });
      res.on('end', () => {
        let parsed = null;
        try { parsed = JSON.parse(chunks); } catch (e) {}
        resolve({ status: res.statusCode, body: parsed || chunks });
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function getAccessToken(key) {
  const jwt = signJwt(key);
  const res = await postJson(TOKEN_URL, {
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion: jwt
  });
  if (res.status !== 200) {
    console.error('Token error:', res.status, JSON.stringify(res.body));
    process.exit(1);
  }
  return res.body.access_token;
}

function extractUrls() {
  const sitemap = fs.readFileSync(path.join(__dirname, 'sitemap.xml'), 'utf8');
  const urls = [];
  const re = /<loc>([^<]+)<\/loc>/g;
  let m;
  while ((m = re.exec(sitemap)) !== null) {
    urls.push(m[1]);
  }
  return urls;
}

async function submit(url, token) {
  const res = await postJson(INDEXING_URL, { url: url, type: 'URL_UPDATED' }, { Authorization: 'Bearer ' + token });
  if (res.status === 200) {
    console.log('OK   ' + url);
  } else if (res.status === 404 || res.status === 403) {
    console.log('FAIL ' + url + ' -> ' + res.status + ' ' + (res.body && res.body.error ? res.body.error.message : ''));
  } else {
    console.log('INFO ' + url + ' -> ' + res.status);
  }
}

async function main() {
  const key = loadKey();
  const token = await getAccessToken(key);
  const args = process.argv.slice(2);

  let urls;
  if (args.length > 0) {
    urls = args.map((a) => (a.startsWith('http') ? a : SITE + '/' + a.replace(/^\//, '')));
  } else {
    urls = extractUrls();
    console.log('Submitting ' + urls.length + ' URLs from sitemap.xml');
  }

  // Submit sequentially to respect quotas (Google recommends batching, max ~200 URLs/day)
  for (const url of urls) {
    await submit(url, token);
    await new Promise((r) => setTimeout(r, 500));
  }
  console.log('Done.');
}

main();
