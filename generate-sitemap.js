const fs = require('fs');
const path = require('path');

const SITE = 'https://aitoolsdash.com';
const TODAY = new Date().toISOString().slice(0, 10);

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const pages = [
  { loc: '/', en: '/en/', es: '/es/', freq: 'weekly', pri: '1.0', lastmod: '2026-06-09' },
  { loc: '/en/', en: '/en/', es: '/es/', freq: 'weekly', pri: '0.9', lastmod: '2026-06-09' },
  { loc: '/es/', en: '/en/', es: '/es/', freq: 'weekly', pri: '0.9', lastmod: '2026-06-09' },
  { loc: '/en/comparisons.html', en: '/en/comparisons.html', es: '/es/comparaciones.html', freq: 'monthly', pri: '0.8', lastmod: '2026-06-09' },
  { loc: '/es/comparaciones.html', en: '/en/comparisons.html', es: '/es/comparaciones.html', freq: 'monthly', pri: '0.8', lastmod: '2026-06-09' },
  { loc: '/es/404.html', en: '/404.html', es: '/es/404.html', freq: 'yearly', pri: '0.3', lastmod: '2026-05-31' }
];

const enData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'reviews-en.json'), 'utf8'));

const pairsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'admin', 'comparison-pairs.json'), 'utf8'));

const pairBlocks = pairsData.map(function (p) {
  const lastmod = TODAY;
  return `  <url>
    <loc>${SITE}/en/${p.file}</loc>
    <xhtml:link rel="alternate" hreflang="en" href="${SITE}/en/${p.file}"/>
    <xhtml:link rel="alternate" hreflang="es" href="${SITE}/es/${p.file}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}/"/>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${SITE}/es/${p.file}</loc>
    <xhtml:link rel="alternate" hreflang="en" href="${SITE}/en/${p.file}"/>
    <xhtml:link rel="alternate" hreflang="es" href="${SITE}/es/${p.file}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}/"/>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
}).join('\n');

function urlBlock(entry) {
  const loc = entry.loc;
  return `  <url>
    <loc>${SITE}${loc}</loc>
    <xhtml:link rel="alternate" hreflang="en" href="${SITE}${entry.en}"/>
    <xhtml:link rel="alternate" hreflang="es" href="${SITE}${entry.es}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}/"/>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.freq}</changefreq>
    <priority>${entry.pri}</priority>
  </url>`;
}

const toolBlocks = enData.map(function (t) {
  const lastmod = TODAY;
  return `  <url>
    <loc>${SITE}/en/${t.id}.html</loc>
    <xhtml:link rel="alternate" hreflang="en" href="${SITE}/en/${t.id}.html"/>
    <xhtml:link rel="alternate" hreflang="es" href="${SITE}/es/${t.id}.html"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}/"/>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${SITE}/es/${t.id}.html</loc>
    <xhtml:link rel="alternate" hreflang="en" href="${SITE}/en/${t.id}.html"/>
    <xhtml:link rel="alternate" hreflang="es" href="${SITE}/es/${t.id}.html"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}/"/>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
}).join('\n');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${pages.map(urlBlock).join('\n')}
${toolBlocks}
${pairBlocks}
</urlset>
`;

fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), sitemap, 'utf8');
console.log('sitemap.xml written with ' + (pages.length + enData.length * 2 + pairsData.length * 2) + ' URLs');
