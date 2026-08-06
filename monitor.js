/**
 * Uptime / HTTP status monitor for aitoolsdash.com
 *
 * Reads sitemap.xml and checks every URL for 4xx/5xx errors.
 * Prints any failing URLs. Optionally sends a webhook alert.
 *
 * Usage:
 *   node monitor.js                        # full crawl of sitemap
 *   node monitor.js --url https://aitoolsdash.com/en/suno-ai.html
 *
 * Webhook (optional): set WEBHOOK_URL env var to a Slack/Discord/ntfy
 * webhook to receive alerts when new failures are found.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const SITEMAP = path.join(__dirname, 'sitemap.xml');
const STATE_FILE = path.join(__dirname, '.monitor-state.json');
const WEBHOOK_URL = process.env.WEBHOOK_URL || null;
const TIMEOUT = 15000;

function fetchStatus(url) {
  return new Promise((resolve) => {
    const req = https.get(url, { timeout: TIMEOUT, headers: { 'User-Agent': 'AIToolsDash-Monitor/1.0' } }, (res) => {
      res.resume();
      resolve(res.statusCode);
    });
    req.on('timeout', () => { req.destroy(); resolve('timeout'); });
    req.on('error', () => resolve('error'));
  });
}

function extractUrls() {
  if (!fs.existsSync(SITEMAP)) {
    console.error('sitemap.xml not found at ' + SITEMAP);
    process.exit(1);
  }
  const xml = fs.readFileSync(SITEMAP, 'utf8');
  const urls = [];
  const re = /<loc>([^<]+)<\/loc>/g;
  let m;
  while ((m = re.exec(xml)) !== null) urls.push(m[1]);
  return urls;
}

function loadState() {
  try { return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); } catch (e) { return {}; }
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
}

async function sendWebhook(message) {
  if (!WEBHOOK_URL) return;
  const payload = JSON.stringify({ text: message });
  await new Promise((resolve) => {
    const req = https.request(WEBHOOK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } }, (res) => {
      res.resume();
      res.on('end', resolve);
    });
    req.on('error', () => resolve());
    req.write(payload);
    req.end();
  });
}

async function main() {
  const args = process.argv.slice(2);
  let urls;
  if (args.includes('--url')) {
    const i = args.indexOf('--url');
    urls = [args[i + 1]];
  } else {
    urls = extractUrls();
  }

  const state = loadState();
  const failures = [];
  let checked = 0;

  for (const url of urls) {
    const code = await fetchStatus(url);
    checked++;
    if (code === 404 || code === 500 || code === 502 || code === 503 || code === 'timeout' || code === 'error') {
      failures.push({ url, code });
      process.stdout.write('!');
    } else {
      process.stdout.write('.');
    }
  }
  process.stdout.write('\n');

  console.log('Checked ' + checked + ' URLs. Failures: ' + failures.length);

  if (failures.length === 0) {
    saveState({});
    console.log('All URLs healthy.');
    return;
  }

  failures.forEach((f) => console.log('  FAIL ' + f.code + ' ' + f.url));

  // Only alert on NEW failures (not seen in previous run)
  const previous = new Set((state.failures || []).map((f) => f.url));
  const newFailures = failures.filter((f) => !previous.has(f.url));
  if (newFailures.length > 0) {
    const msg = 'AIToolsDash monitor: ' + newFailures.length + ' NEW failure(s):\n' +
      newFailures.map((f) => f.code + ' ' + f.url).join('\n');
    console.log('Sending alert for new failures...');
    await sendWebhook(msg);
  }

  saveState({ failures, at: new Date().toISOString() });
}

main();
